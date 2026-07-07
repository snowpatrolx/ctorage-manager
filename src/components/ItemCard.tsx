import { Link } from 'react-router-dom';
import { Item } from '@/types';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useLocationStore } from '@/store/useLocationStore';
import { getLocationPath } from '@/utils/location';
import { Package } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const { getCategoryById } = useCategoryStore();
  const { locations } = useLocationStore();
  const category = getCategoryById(item.categoryId);
  const locationPath = getLocationPath(item.locationId, locations);

  return (
    <Link
      to={`/item/${item.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: category?.color + '20' }}>
            <Package className="w-12 h-12" style={{ color: category?.color || '#9CA3AF' }} />
          </div>
        )}
        <div
          className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: category?.color || '#9CA3AF' }}
        />
        {item.quantity > 1 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium text-stone-700">
            ×{item.quantity}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-stone-800 text-sm truncate">{item.name}</h3>
        {locationPath && (
          <p className="text-xs text-stone-500 mt-1 truncate">{locationPath}</p>
        )}
      </div>
    </Link>
  );
}
