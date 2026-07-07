import Dexie, { Table } from 'dexie';
import { Item, Category, Location } from '@/types';

export class AppDatabase extends Dexie {
  items!: Table<Item, number>;
  categories!: Table<Category, number>;
  locations!: Table<Location, number>;

  constructor() {
    super('storage-manager');
    this.version(1).stores({
      items: '++id, name, categoryId, locationId, createdAt, updatedAt',
      categories: '++id, &name, color, createdAt',
      locations: '++id, name, parentId, level, createdAt',
    });
  }
}

export const db = new AppDatabase();

let seeded = false;

export async function seedInitialData() {
  if (seeded) return;
  seeded = true;

  try {
    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
      const defaultCategories: Omit<Category, 'id'>[] = [
        { name: '衣物', color: '#E8956D', createdAt: new Date() },
        { name: '厨房用品', color: '#7C9885', createdAt: new Date() },
        { name: '电子设备', color: '#6B8E9E', createdAt: new Date() },
        { name: '文件证件', color: '#B8A080', createdAt: new Date() },
        { name: '日用品', color: '#9CA38F', createdAt: new Date() },
        { name: '其他', color: '#A0A0A0', createdAt: new Date() },
      ];
      await db.categories.bulkAdd(defaultCategories);
    }

    const locationCount = await db.locations.count();
    if (locationCount === 0) {
      const livingRoomId = await db.locations.add({
        name: '客厅',
        level: 1,
        createdAt: new Date(),
      });
      await db.locations.bulkAdd([
        { name: '电视柜', parentId: livingRoomId, level: 2, createdAt: new Date() },
        { name: '沙发', parentId: livingRoomId, level: 2, createdAt: new Date() },
      ]);

      const bedroomId = await db.locations.add({
        name: '卧室',
        level: 1,
        createdAt: new Date(),
      });
      const wardrobeId = await db.locations.add({
        name: '衣柜',
        parentId: bedroomId,
        level: 2,
        createdAt: new Date(),
      });
      await db.locations.bulkAdd([
        { name: '上层抽屉', parentId: wardrobeId, level: 3, createdAt: new Date() },
        { name: '床头柜', parentId: bedroomId, level: 2, createdAt: new Date() },
      ]);

      const kitchenId = await db.locations.add({
        name: '厨房',
        level: 1,
        createdAt: new Date(),
      });
      await db.locations.bulkAdd([
        { name: '橱柜', parentId: kitchenId, level: 2, createdAt: new Date() },
        { name: '冰箱', parentId: kitchenId, level: 2, createdAt: new Date() },
      ]);
    }
  } catch (e) {
    console.warn('Seed data skipped:', e);
  }
}
