import { useCategoryStore } from '@/store/useCategoryStore';
import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CategoryPickerProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  placeholder?: string;
}

export function CategoryPicker({ value, onChange, placeholder = '选择分类' }: CategoryPickerProps) {
  const { categories, getCategoryById } = useCategoryStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = getCategoryById(value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-left focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
      >
        <div className="flex items-center gap-2">
          {selected && (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selected.color }}
            />
          )}
          <span className={selected ? 'text-stone-800' : 'text-stone-400'}>
            {selected?.name || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-stone-100 py-2 z-50 max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(undefined); setOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-stone-500 hover:bg-stone-50 transition-colors flex items-center justify-between"
          >
            <span>无分类</span>
            {!value && <Check className="w-4 h-4 text-green-600" />}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => { onChange(category.id); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left hover:bg-stone-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-stone-700">{category.name}</span>
              </div>
              {value === category.id && <Check className="w-4 h-4 text-green-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
