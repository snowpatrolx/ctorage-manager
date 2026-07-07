import * as XLSX from 'xlsx';
import { Item, Category, Location, ExportItem } from '@/types';
import { db } from '@/db';

export async function exportToExcel(items: Item[], categories: Category[], locations: Location[]): Promise<void> {
  const categoryMap = new Map(categories.map(c => [c.id!, c.name]));
  const locationMap = new Map(locations.map(l => [l.id!, l.name]));

  const getLocationPath = (locId?: number): string => {
    if (!locId) return '';
    const parts: string[] = [];
    let current = locations.find(l => l.id === locId);
    while (current) {
      parts.unshift(current.name);
      current = current.parentId ? locations.find(l => l.id === current!.parentId) : undefined;
    }
    return parts.join(' / ');
  };

  const exportData: ExportItem[] = items.map(item => ({
    名称: item.name,
    分类: categoryMap.get(item.categoryId!) || '',
    位置: getLocationPath(item.locationId),
    数量: item.quantity,
    备注: item.notes,
    创建时间: item.createdAt.toLocaleString('zh-CN'),
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '物品清单');

  ws['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 30 },
    { wch: 8 },
    { wch: 40 },
    { wch: 20 },
  ];

  XLSX.writeFile(wb, `收纳清单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`);
}

export async function exportToCSV(items: Item[], categories: Category[], locations: Location[]): Promise<void> {
  const categoryMap = new Map(categories.map(c => [c.id!, c.name]));
  const locationMap = new Map(locations.map(l => [l.id!, l.name]));

  const getLocationPath = (locId?: number): string => {
    if (!locId) return '';
    const parts: string[] = [];
    let current = locations.find(l => l.id === locId);
    while (current) {
      parts.unshift(current.name);
      current = current.parentId ? locations.find(l => l.id === current!.parentId) : undefined;
    }
    return parts.join(' / ');
  };

  const headers = ['名称', '分类', '位置', '数量', '备注', '创建时间'];
  const rows = items.map(item => [
    item.name,
    categoryMap.get(item.categoryId!) || '',
    getLocationPath(item.locationId),
    String(item.quantity),
    item.notes,
    item.createdAt.toLocaleString('zh-CN'),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `收纳清单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File, mode: 'append' | 'replace' = 'append'): Promise<{ count: number }> {
  const text = await file.text();
  let data: any[];

  if (file.name.endsWith('.csv')) {
    const BOM = '\uFEFF';
    const cleanedText = text.startsWith(BOM) ? text.slice(1) : text;
    const lines = cleanedText.split('\n').filter(l => l.trim());
    const headers = parseCSVLine(lines[0]);
    data = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  } else {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(ws);
  }

  const categories = await db.categories.toArray();
  const locations = await db.locations.toArray();
  const categoryMap = new Map(categories.map(c => [c.name, c.id!]));
  const locationMap = new Map<string, number>();
  const buildLocationPathMap = (locs: Location[], parentId?: number, path: string = '') => {
    locs.filter(l => l.parentId === parentId).forEach(loc => {
      const currentPath = path ? `${path} / ${loc.name}` : loc.name;
      locationMap.set(currentPath, loc.id!);
      buildLocationPathMap(locs, loc.id, currentPath);
    });
  };
  buildLocationPathMap(locations);

  const items: Omit<Item, 'id'>[] = data.map(row => {
    const categoryName = row['分类'] || row['category'] || '';
    const locationPath = row['位置'] || row['location'] || '';
    const quantity = parseInt(row['数量'] || row['quantity'] || '1', 1);

    let categoryId = categoryMap.get(categoryName);
    if (!categoryId && categoryName) {
      categoryId = categories.find(c => c.name === categoryName)?.id;
    }

    let locationId = locationMap.get(locationPath);
    if (!locationId && locationPath) {
      const parts = locationPath.split(/[\/\\]/).map(p => p.trim()).filter(Boolean);
      let parentId: number | undefined;
      let currentPath = '';
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath} / ${part}` : part;
        const found = locationMap.get(currentPath);
        if (found) {
          locationId = found;
          parentId = found;
        }
      }
    }

    return {
      name: row['名称'] || row['name'] || '未命名物品',
      categoryId,
      locationId,
      quantity: isNaN(quantity) ? 1 : quantity,
      notes: row['备注'] || row['notes'] || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  if (mode === 'replace') {
    await db.items.clear();
  }

  const count = await db.items.bulkAdd(items);
  return { count: typeof count === 'number' ? count : items.length };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
