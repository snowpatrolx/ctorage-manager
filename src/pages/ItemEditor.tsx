import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X, Save } from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useLocationStore } from '@/store/useLocationStore';
import { CategoryPicker } from '@/components/CategoryPicker';
import { LocationPicker } from '@/components/LocationPicker';
import { Item } from '@/types';

export default function ItemEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const { addItem, updateItem, getItemById } = useItemStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchLocations } = useLocationStore();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [locationId, setLocationId] = useState<number | undefined>();
  const [image, setImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
    if (isEdit && id) {
      getItemById(parseInt(id)).then((item?: Item) => {
        if (item) {
          setName(item.name);
          setQuantity(item.quantity);
          setNotes(item.notes);
          setCategoryId(item.categoryId);
          setLocationId(item.locationId);
          setImage(item.image);
        }
      });
    }
  }, [id, isEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入物品名称');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateItem(parseInt(id), {
          name: name.trim(),
          quantity,
          notes,
          categoryId,
          locationId,
          image,
        });
      } else {
        await addItem({
          name: name.trim(),
          quantity,
          notes,
          categoryId,
          locationId,
          image,
        });
      }
      navigate(-1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg text-stone-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            {isEdit ? '编辑物品' : '添加物品'}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="p-2 -mr-2 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <div className="mb-5">
          <label className="block text-sm font-medium text-stone-700 mb-2">物品图片</label>
          <div className="relative">
            <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 flex items-center justify-center">
              {image ? (
                <>
                  <img src={image} alt="物品图片" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-stone-500">
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">点击添加图片</span>
                </label>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            {!image && (
              <label htmlFor="image-upload" className="absolute inset-0 cursor-pointer" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-50">
            <label className="block text-sm font-medium text-stone-700 mb-2">物品名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入物品名称"
              className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm"
            />
          </div>

          <div className="px-5 py-4 border-b border-stone-50">
            <label className="block text-sm font-medium text-stone-700 mb-2">分类</label>
            <CategoryPicker value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="px-5 py-4 border-b border-stone-50">
            <label className="block text-sm font-medium text-stone-700 mb-2">存放位置</label>
            <LocationPicker value={locationId} onChange={setLocationId} />
          </div>

          <div className="px-5 py-4 border-b border-stone-50">
            <label className="block text-sm font-medium text-stone-700 mb-2">数量</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors text-xl font-medium"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors text-xl font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div className="px-5 py-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加备注信息（可选）"
              rows={3}
              className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E8956D' }}
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : isEdit ? '保存修改' : '添加物品'}
          </button>
        </div>
      </div>
    </div>
  );
}
