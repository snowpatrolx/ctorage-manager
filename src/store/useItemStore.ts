import { create } from 'zustand';
import { Item } from '@/types';
import { db } from '@/db';
import { fuzzySearchItems } from '@/utils/fuzzySearch';
import { useLocationStore } from '@/store/useLocationStore';
import { useCategoryStore } from '@/store/useCategoryStore';

interface ItemState {
  items: Item[];
  loading: boolean;
  searchQuery: string;
  filterCategoryIds: number[];
  filterLocationIds: number[];
  fetchItems: () => Promise<void>;
  getItemById: (id: number) => Promise<Item | undefined>;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateItem: (id: number, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleCategoryFilter: (categoryId: number) => void;
  toggleLocationFilter: (locationId: number) => void;
  clearFilters: () => void;
  getFilteredItems: () => Item[];
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  loading: false,
  searchQuery: '',
  filterCategoryIds: [],
  filterLocationIds: [],

  fetchItems: async () => {
    set({ loading: true });
    const items = await db.items.orderBy('updatedAt').reverse().toArray();
    set({ items, loading: false });
  },

  getItemById: async (id) => {
    return await db.items.get(id);
  },

  addItem: async (item) => {
    const now = new Date();
    const id = await db.items.add({
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    await get().fetchItems();
    return id;
  },

  updateItem: async (id, updates) => {
    await db.items.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
    await get().fetchItems();
  },

  deleteItem: async (id) => {
    await db.items.delete(id);
    await get().fetchItems();
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleCategoryFilter: (categoryId) => {
    const current = get().filterCategoryIds;
    if (current.includes(categoryId)) {
      set({ filterCategoryIds: current.filter(id => id !== categoryId) });
    } else {
      set({ filterCategoryIds: [...current, categoryId] });
    }
  },

  toggleLocationFilter: (locationId) => {
    const current = get().filterLocationIds;
    if (current.includes(locationId)) {
      set({ filterLocationIds: current.filter(id => id !== locationId) });
    } else {
      set({ filterLocationIds: [...current, locationId] });
    }
  },

  clearFilters: () => {
    set({ filterCategoryIds: [], filterLocationIds: [], searchQuery: '' });
  },

  getFilteredItems: () => {
    const { items, searchQuery, filterCategoryIds, filterLocationIds } = get();
    let filtered = items;

    // 使用模糊搜索（支持拼音、首字母、模糊匹配）
    if (searchQuery.trim()) {
      const { locations } = useLocationStore.getState();
      const { categories } = useCategoryStore.getState();
      filtered = fuzzySearchItems(filtered, searchQuery, locations, categories);
    }

    if (filterCategoryIds.length > 0) {
      filtered = filtered.filter(
        item => item.categoryId && filterCategoryIds.includes(item.categoryId)
      );
    }

    if (filterLocationIds.length > 0) {
      filtered = filtered.filter(
        item => item.locationId && filterLocationIds.includes(item.locationId)
      );
    }

    return filtered;
  },
}));
