import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PackageOpen } from 'lucide-react';
import { ItemCard } from '@/components/ItemCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterTags } from '@/components/FilterTags';
import { useItemStore } from '@/store/useItemStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useLocationStore } from '@/store/useLocationStore';

export default function ItemList() {
  const { items, loading, searchQuery, setSearchQuery, getFilteredItems } = useItemStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchLocations } = useLocationStore();
  const { fetchItems } = useItemStore();
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchLocations();
  }, []);

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            收纳管家
          </h1>
          <p className="text-stone-500 text-sm">共 {items.length} 件物品</p>
        </div>

        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <FilterTags
          showFilterPanel={showFilterPanel}
          onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)}
        />
      </div>

      <div className="max-w-lg mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-700 mb-1">
              {searchQuery ? '没有找到匹配的物品' : '还没有物品'}
            </h3>
            <p className="text-stone-500 text-sm mb-4">
              {searchQuery ? '试试其他关键词吧' : '点击右下角按钮添加第一件物品'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/item/new"
        className="fixed right-6 bottom-24 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform z-30"
        style={{ backgroundColor: '#E8956D' }}
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  );
}
