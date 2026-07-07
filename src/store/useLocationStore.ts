import { create } from 'zustand';
import { Location } from '@/types';
import { db } from '@/db';
import { getLocationDescendants } from '@/utils/location';

interface LocationState {
  locations: Location[];
  loading: boolean;
  fetchLocations: () => Promise<void>;
  addLocation: (location: Omit<Location, 'id' | 'createdAt'>) => Promise<number>;
  updateLocation: (id: number, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: number) => Promise<void>;
  getLocationById: (id: number | undefined) => Location | undefined;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  loading: false,

  fetchLocations: async () => {
    set({ loading: true });
    const locations = await db.locations.toArray();
    set({ locations, loading: false });
  },

  addLocation: async (location) => {
    const id = await db.locations.add({
      ...location,
      createdAt: new Date(),
    });
    await get().fetchLocations();
    return id;
  },

  updateLocation: async (id, updates) => {
    await db.locations.update(id, updates);
    await get().fetchLocations();
  },

  deleteLocation: async (id) => {
    const descendantIds = await getLocationDescendants(id);
    for (const locId of descendantIds) {
      await db.items.where('locationId').equals(locId).modify({ locationId: undefined });
    }
    await db.locations.bulkDelete(descendantIds);
    await get().fetchLocations();
  },

  getLocationById: (id) => {
    return get().locations.find(l => l.id === id);
  },
}));
