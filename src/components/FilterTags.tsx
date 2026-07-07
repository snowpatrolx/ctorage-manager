import { useCategoryStore } from '@/store/useCategoryStore';
import { useItemStore } from '@/store/useItemStore';
import { useLocationStore } from '@/store/useLocationStore';
import { buildLocationTree } from '@/utils/location';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterTagsProps {
  showFilterPanel?: boolean;
  onToggleFilterPanel?: () => void;
}

export function FilterTags({ showFilterPanel, onToggleFilterPanel }: FilterTagsProps) {
  const { categories } = useCategoryStore();
  const { filterCategoryIds, toggleCategoryFilter, clearFilters } = useItemStore();
  const [activeTab, setActiveTab] = useState<'category' | 'location'>('category');

  const hasFilters = filterCategoryIds.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const isActive = filterCategoryIds.includes(category.id!);
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFilter(category.id!)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                  }`}
                  style={isActive ? { backgroundColor: category.color } : {}}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/80' : ''}`}
                    style={!isActive ? { backgroundColor: category.color } : {}}
                  />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={onToggleFilterPanel}
          className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
            hasFilters ? 'bg-green-500 text-white' : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {showFilterPanel && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-stone-800 text-sm">筛选条件</h4>
            <button
              onClick={clearFilters}
              className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除
            </button>
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-3">
            <button
              onClick={() => setActiveTab('category')}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'category'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500'
              }`}
            >
              按分类
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'location'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500'
              }`}
            >
              按位置
            </button>
          </div>
          {activeTab === 'category' ? (
            <CategoryFilterList />
          ) : (
            <LocationFilterList />
          )}
        </div>
      )}
    </div>
  );
}

function CategoryFilterList() {
  const { categories } = useCategoryStore();
  const { filterCategoryIds, toggleCategoryFilter } = useItemStore();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = filterCategoryIds.includes(category.id!);
        return (
          <button
            key={category.id}
            onClick={() => toggleCategoryFilter(category.id!)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              isActive
                ? 'text-white'
                : 'bg-stone-50 text-stone-600 border border-stone-200'
            }`}
            style={isActive ? { backgroundColor: category.color } : {}}
          >
            <span
              className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/80' : ''}`}
              style={!isActive ? { backgroundColor: category.color } : {}}
            />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

function LocationFilterList() {
  const { locations } = useLocationStore();
  const { filterLocationIds, toggleLocationFilter } = useItemStore();
  const tree = buildLocationTree(locations);

  const renderTree = (nodes: typeof tree, depth: number = 0) =>
    nodes.map((node) => {
      const isActive = filterLocationIds.includes(node.id!);
      return (
        <div key={node.id}>
          <button
            onClick={() => toggleLocationFilter(node.id!)}
            className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-green-500 text-white'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {node.name}
          </button>
          {node.children.length > 0 && renderTree(node.children, depth + 1)}
        </div>
      );
    });

  return <div className="space-y-1 max-h-48 overflow-y-auto">{renderTree(tree)}</div>;
}
