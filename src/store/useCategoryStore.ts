import { create } from 'zustand';
import { Category } from '@/types';
import { db } from '@/db';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<number>;
  updateCategory: (id: number, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number, moveToId?: number) => Promise<void>;
  getCategoryById: (id: number | undefined) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    const categories = await db.categories.orderBy('name').toArray();
    set({ categories, loading: false });
  },

  addCategory: async (category) => {
    const id = await db.categories.add({
      ...category,
      createdAt: new Date(),
    });
    await get().fetchCategories();
    return id;
  },

  updateCategory: async (id, updates) => {
    await db.categories.update(id, updates);
    await get().fetchCategories();
  },

  deleteCategory: async (id, moveToId) => {
    if (moveToId !== undefined) {
      await db.items.where('categoryId').equals(id).modify({ categoryId: moveToId });
    } else {
      await db.items.where('categoryId').equals(id).modify({ categoryId: undefined });
    }
    await db.categories.delete(id);
    await get().fetchCategories();
  },

  getCategoryById: (id) => {
    return get().categories.find(c => c.id === id);
  },
}));
