import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useItemStore } from '@/store/useItemStore';
import { PageHeader } from '@/components/PageHeader';

const PRESET_COLORS = [
  '#E8956D', '#7C9885', '#6B8E9E', '#B8A080', '#9CA38F',
  '#D4A574', '#9B8BB5', '#7FB069', '#E8B4B8', '#F4A460',
];

export default function Categories() {
  const { categories, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { items } = useItemStore();
  const { fetchItems } = useItemStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | undefined>();

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const getItemCount = (categoryId: number) => {
    return items.filter(item => item.categoryId === categoryId).length;
  };

  const openAddModal = () => {
    setEditingId(undefined);
    setName('');
    setColor(PRESET_COLORS[0]);
    setShowModal(true);
  };

  const openEditModal = (id: number, name: string, color: string) => {
    setEditingId(id);
    setName(name);
    setColor(color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editingId) {
      await updateCategory(editingId, { name: name.trim(), color });
    } else {
      await addCategory({ name: name.trim(), color });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    setDeleteConfirmId(undefined);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <PageHeader
        title="分类管理"
        rightAction={
          <button
            onClick={openAddModal}
            className="p-2 -mr-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`flex items-center gap-3 px-5 py-4 ${
                index < categories.length - 1 ? 'border-b border-stone-50' : ''
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: category.color + '20' }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800">{category.name}</p>
                <p className="text-xs text-stone-500">{getItemCount(category.id!)} 件物品</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(category.id!, category.name, category.color)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(category.id)}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800">
                {editingId ? '编辑分类' : '新增分类'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">分类名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入分类名称"
                  className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">分类颜色</label>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-transform ${
                        color === c ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: c,
                        boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                      }}
                    >
                      {color === c && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full mt-6 py-3.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E8956D' }}
            >
              {editingId ? '保存修改' : '添加分类'}
            </button>
          </div>
        </div>
      )}

      {deleteConfirmId !== undefined && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">确认删除</h3>
            <p className="text-stone-600 text-sm mb-5">
              删除后，该分类下的 {getItemCount(deleteConfirmId)} 件物品将变为未分类状态。确定要删除吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(undefined)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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
