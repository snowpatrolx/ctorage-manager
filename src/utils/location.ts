import { Location, LocationWithChildren } from '@/types';
import { db } from '@/db';

export function buildLocationTree(locations: Location[]): LocationWithChildren[] {
  const map = new Map<number, LocationWithChildren>();
  const roots: LocationWithChildren[] = [];

  locations.forEach(loc => {
    map.set(loc.id!, { ...loc, children: [] });
  });

  locations.forEach(loc => {
    const node = map.get(loc.id!)!;
    if (loc.parentId && map.has(loc.parentId)) {
      map.get(loc.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function getLocationPath(locationId: number | undefined, locations: Location[]): string {
  if (!locationId) return '';
  const parts: string[] = [];
  let current = locations.find(l => l.id === locationId);
  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? locations.find(l => l.id === current!.parentId) : undefined;
  }
  return parts.join(' / ');
}

export async function getLocationDescendants(parentId: number): Promise<number[]> {
  const locations = await db.locations.toArray();
  const result: number[] = [parentId];
  let currentParentIds = [parentId];

  while (currentParentIds.length > 0) {
    const children = locations.filter(l => currentParentIds.includes(l.parentId!)).map(l => l.id!);
    result.push(...children);
    currentParentIds = children;
  }

  return result;
}
