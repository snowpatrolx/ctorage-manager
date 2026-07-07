import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, ChevronRight, MapPin } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';
import { useItemStore } from '@/store/useItemStore';
import { PageHeader } from '@/components/PageHeader';
import { buildLocationTree, getLocationDescendants } from '@/utils/location';
import { LocationWithChildren } from '@/types';
import { db } from '@/db';

export default function Locations() {
  const { locations, fetchLocations, addLocation, updateLocation, deleteLocation } = useLocationStore();
  const { items } = useItemStore();
  const { fetchItems } = useItemStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [parentId, setParentId] = useState<number | undefined>();
  const [name, setName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | undefined>();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchLocations();
    fetchItems();
  }, []);

  const tree = buildLocationTree(locations);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getItemCountForLocation = async (locId: number): Promise<number> => {
    const descendantIds = await getLocationDescendants(locId);
    return items.filter(item => item.locationId && descendantIds.includes(item.locationId)).length;
  };

  const openAddModal = (parent?: number) => {
    setEditingId(undefined);
    setParentId(parent);
    setName('');
    setShowModal(true);
  };

  const openEditModal = (id: number, locName: string) => {
    setEditingId(id);
    setName(locName);
    setParentId(locations.find(l => l.id === id)?.parentId);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const level = parentId
      ? (locations.find(l => l.id === parentId)?.level || 1) + 1
      : 1;
    if (editingId) {
      await updateLocation(editingId, { name: name.trim() });
    } else {
      await addLocation({ name: name.trim(), parentId, level });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    await deleteLocation(id);
    setDeleteConfirmId(undefined);
  };

  const renderTreeNode = (node: LocationWithChildren, depth: number = 0) => {
    const isExpanded = expandedIds.has(node.id!);
    const hasChildren = node.children.length > 0;
    const itemCount = items.filter(i => i.locationId === node.id).length;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-4 py-3 ${
            depth > 0 ? 'pl-4' : ''
          }`}
          style={{ paddingLeft: `${16 + depth * 20}px` }}
        >
          <button
            onClick={() => hasChildren && toggleExpand(node.id!)}
            className={`p-1 text-stone-400 ${hasChildren ? 'cursor-pointer hover:text-stone-600' : 'invisible'}`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-800 text-sm">{node.name}</p>
            <p className="text-xs text-stone-500">{itemCount} 件物品</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => openAddModal(node.id)}
              className="p-1.5 text-stone-400 hover:text-green-600 transition-colors"
              title="添加子位置"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEditModal(node.id!, node.name)}
              className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteConfirmId(node.id)}
              className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <PageHeader
        title="位置管理"
        rightAction={
          <button
            onClick={() => openAddModal()}
            className="p-2 -mr-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-lg mx-auto px-4 pt-4">
          <p className="text-sm text-stone-500 mb-3 px-1">
            点击 + 可以在位置下添加子位置（如：房间 → 柜子 → 抽屉）
          </p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {tree.length === 0 ? (
              <div className="py-12 text-center">
                <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">还没有位置，点击右上角添加</p>
              </div>
            ) : (
              tree.map(node => renderTreeNode(node))
            )}
          </div>
        </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800">
                {editingId ? '编辑位置' : '新增位置'}
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
                <label className="block text-sm font-medium text-stone-700 mb-2">位置名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入位置名称"
                  className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm"
                  autoFocus
                />
              </div>
              {parentId && (
                <p className="text-sm text-stone-500">
                  父级位置：{locations.find(l => l.id === parentId)?.name}
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full mt-6 py-3.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E8956D' }}
            >
              {editingId ? '保存修改' : '添加位置'}
            </button>
          </div>
        </div>
      )}

      {deleteConfirmId !== undefined && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">确认删除</h3>
            <p className="text-stone-600 text-sm mb-5">
              删除后，该位置及其所有子位置下的物品将变为未定位状态。确定要删除吗？
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
