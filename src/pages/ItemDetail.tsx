import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Package, Tag, MapPin, Hash, FileText, Calendar } from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useLocationStore } from '@/store/useLocationStore';
import { getLocationPath } from '@/utils/location';
import { Item } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItemById, deleteItem } = useItemStore();
  const { categories, fetchCategories, getCategoryById } = useCategoryStore();
  const { locations, fetchLocations } = useLocationStore();
  const [item, setItem] = useState<Item | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
    if (id) {
      getItemById(parseInt(id)).then(setItem);
    }
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const category = getCategoryById(item.categoryId);
  const locationPath = getLocationPath(item.locationId, locations);

  const handleDelete = async () => {
    if (item.id) {
      await deleteItem(item.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="relative">
        <div className="aspect-video bg-stone-200 relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: (category?.color || '#9CA3AF') + '30' }}>
              <Package className="w-16 h-16" style={{ color: category?.color || '#9CA3AF' }} />
            </div>
          )}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-700 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-bold text-stone-800 flex-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              {item.name}
            </h1>
            {category && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ml-3 flex-shrink-0"
                style={{ backgroundColor: category.color }}
              >
                <Tag className="w-3 h-3" />
                {category.name}
              </div>
            )}
          </div>
          {item.quantity > 1 && (
            <p className="text-stone-500 text-sm">共 {item.quantity} 件</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {locationPath && (
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-50">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-500 mb-0.5">存放位置</p>
                <p className="text-stone-800 text-sm">{locationPath}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-50">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Hash className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-stone-500 mb-0.5">数量</p>
              <p className="text-stone-800 text-sm">{item.quantity} 件</p>
            </div>
          </div>

          {item.notes && (
            <div className="flex items-start gap-3 px-5 py-4 border-b border-stone-50">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-500 mb-0.5">备注</p>
                <p className="text-stone-800 text-sm whitespace-pre-wrap">{item.notes}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-stone-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-stone-500 mb-0.5">创建时间</p>
              <p className="text-stone-800 text-sm">
                {format(item.createdAt, 'yyyy年M月d日 HH:mm', { locale: zhCN })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
          <Link
            to={`/item/${item.id}/edit`}
            className="flex-1 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E8956D' }}
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </Link>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">确认删除</h3>
            <p className="text-stone-600 text-sm mb-5">确定要删除「{item.name}」吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
