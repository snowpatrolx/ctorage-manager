// 本地模糊搜索工具 - 支持中文、拼音、首字母、模糊匹配
import { pinyin } from 'pinyin-pro';
import { Item } from '@/types';
import { getLocationPath } from '@/utils/location';
import { Location } from '@/types';

// 获取字符串的拼音全拼（无声调）
function getPinyinFull(text: string): string {
  return pinyin(text, { toneType: 'none', type: 'array' }).join('');
}

// 获取字符串的拼音首字母
function getPinyinInitials(text: string): string {
  return pinyin(text, { pattern: 'first', type: 'array' }).join('');
}

// 去除空格和标点
function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s,，。.!！?？、]/g, '');
}

// 判断是否匹配查询
function isMatch(query: string, target: string): boolean {
  if (!query || !target) return false;

  const q = normalize(query);
  const t = normalize(target);

  // 1. 直接包含
  if (t.includes(q)) return true;

  // 2. 拼音全拼匹配
  const pinyinFull = getPinyinFull(target);
  if (pinyinFull.includes(q)) return true;

  // 3. 拼音首字母匹配
  const initials = getPinyinInitials(target);
  if (initials.includes(q)) return true;

  // 4. 每个字符的拼音首字母分别匹配（如 "cdq" 匹配 "充电器"）
  // 已被首字母匹配覆盖

  return false;
}

export interface SearchResult {
  item: Item;
  matchedFields: string[];
}

// 模糊搜索物品
export function fuzzySearchItems(
  items: Item[],
  query: string,
  locations: Location[] = [],
  categories: { id?: number; name: string }[] = []
): Item[] {
  if (!query.trim()) return items;

  const results: SearchResult[] = [];

  for (const item of items) {
    const matchedFields: string[] = [];

    // 搜索物品名称
    if (isMatch(query, item.name)) {
      matchedFields.push('name');
    }

    // 搜索备注
    if (item.notes && isMatch(query, item.notes)) {
      matchedFields.push('notes');
    }

    // 搜索位置
    const locPath = getLocationPath(item.locationId, locations);
    if (locPath && isMatch(query, locPath)) {
      matchedFields.push('location');
    }

    // 搜索分类名称
    if (item.categoryId) {
      const cat = categories.find(c => c.id === item.categoryId);
      if (cat && isMatch(query, cat.name)) {
        matchedFields.push('category');
      }
    }

    if (matchedFields.length > 0) {
      results.push({ item, matchedFields });
    }
  }

  // 排序：名称匹配优先 > 位置匹配 > 备注匹配 > 分类匹配
  const fieldPriority: Record<string, number> = {
    name: 0,
    location: 1,
    notes: 2,
    category: 3,
  };

  results.sort((a, b) => {
    const aPriority = Math.min(...a.matchedFields.map(f => fieldPriority[f] ?? 99));
    const bPriority = Math.min(...b.matchedFields.map(f => fieldPriority[f] ?? 99));
    return aPriority - bPriority;
  });

  return results.map(r => r.item);
}
