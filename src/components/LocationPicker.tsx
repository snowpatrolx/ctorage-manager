import { useLocationStore } from '@/store/useLocationStore';
import { ChevronDown, Check, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { buildLocationTree } from '@/utils/location';
import { LocationWithChildren } from '@/types';

interface LocationPickerProps {
  value?: number;
  onChange: (locationId: number | undefined) => void;
  placeholder?: string;
}

export function LocationPicker({ value, onChange, placeholder = '选择位置' }: LocationPickerProps) {
  const { locations, getLocationById } = useLocationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = getLocationById(value);
  const tree = buildLocationTree(locations);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getLocationFullPath = (locId?: number): string => {
    if (!locId) return '';
    const parts: string[] = [];
    let current = locations.find(l => l.id === locId);
    while (current) {
      parts.unshift(current.name);
      current = current.parentId ? locations.find(l => l.id === current!.parentId) : undefined;
    }
    return parts.join(' / ');
  };

  const renderTreeNode = (node: LocationWithChildren, depth: number = 0) => (
    <div key={node.id}>
      <button
        type="button"
        onClick={() => { onChange(node.id); setOpen(false); }}
        className="w-full px-4 py-2.5 text-left hover:bg-stone-50 transition-colors flex items-center justify-between"
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <div className="flex items-center gap-2">
          {node.children.length > 0 && (
            <ChevronRight className="w-3 h-3 text-stone-400" />
          )}
          <span className="text-stone-700">{node.name}</span>
        </div>
        {value === node.id && <Check className="w-4 h-4 text-green-600" />}
      </button>
      {node.children.map(child => renderTreeNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-left focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
      >
        <span className={selected ? 'text-stone-800 text-sm' : 'text-stone-400 text-sm'}>
          {selected ? getLocationFullPath(value) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-stone-100 py-2 z-50 max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(undefined); setOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-stone-500 hover:bg-stone-50 transition-colors flex items-center justify-between"
          >
            <span>无位置</span>
            {!value && <Check className="w-4 h-4 text-green-600" />}
          </button>
          {tree.map(node => renderTreeNode(node))}
        </div>
      )}
    </div>
  );
}
