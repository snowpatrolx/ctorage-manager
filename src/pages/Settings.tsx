import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, FileText, Info, ChevronRight, Check } from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useLocationStore } from '@/store/useLocationStore';
import { PageHeader } from '@/components/PageHeader';
import { exportToExcel, exportToCSV, importFromFile } from '@/utils/excel';

export default function Settings() {
  const { items, fetchItems } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { locations, fetchLocations } = useLocationStore();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = async () => {
    await exportToExcel(items, categories, locations);
  };

  const handleExportCSV = async () => {
    await exportToCSV(items, categories, locations);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importFromFile(file, importMode);
      setImportResult(result);
      await fetchItems();
      await fetchCategories();
      await fetchLocations();
    } catch (err) {
      alert('导入失败：' + (err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const startImport = () => {
    setImportResult(null);
    setShowImportModal(true);
  };

  const confirmImport = () => {
    fileInputRef.current?.click();
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <PageHeader title="设置" />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div>
          <p className="text-xs text-stone-500 px-1 mb-2">数据管理</p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors border-b border-stone-50"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-stone-800 text-sm">导出为 Excel</p>
                <p className="text-xs text-stone-500">导出 .xlsx 格式，包含所有物品信息</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300" />
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors border-b border-stone-50"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-stone-800 text-sm">导出为 CSV</p>
                <p className="text-xs text-stone-500">导出 .csv 格式，通用表格格式</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300" />
            </button>

            <button
              onClick={startImport}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-stone-800 text-sm">导入数据</p>
                <p className="text-xs text-stone-500">从 Excel 或 CSV 文件导入物品</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-stone-500 px-1 mb-2">统计信息</p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-50">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-stone-600">物品总数</p>
              </div>
              <p className="font-semibold text-stone-800">{items.length}</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-50">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-stone-600">分类数量</p>
              </div>
              <p className="font-semibold text-stone-800">{categories.length}</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-stone-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-stone-600">位置数量</p>
              </div>
              <p className="font-semibold text-stone-800">{locations.length}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-stone-500 px-1 mb-2">关于</p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Info className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-stone-800 text-sm">收纳管家</p>
                <p className="text-xs text-stone-500">版本 1.0.0</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 pt-4 pb-6">
          数据存储在本地，请定期导出备份
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">导入数据</h3>

            {importResult ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-stone-800 mb-1">导入成功</p>
                <p className="text-stone-500 text-sm">共导入 {importResult.count} 条物品数据</p>
                <button
                  onClick={closeImportModal}
                  className="mt-6 w-full py-3 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors"
                >
                  完成
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-600 mb-4">
                  选择导入方式：
                </p>

                <div className="space-y-2 mb-6">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    importMode === 'append'
                      ? 'border-green-500 bg-green-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      importMode === 'append' ? 'border-green-500' : 'border-stone-300'
                    }`}>
                      {importMode === 'append' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800 text-sm">追加导入</p>
                      <p className="text-xs text-stone-500">保留现有数据，新增导入的物品</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      importMode === 'replace' ? 'border-orange-500' : 'border-stone-300'
                    }`}>
                      {importMode === 'replace' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800 text-sm">覆盖导入</p>
                      <p className="text-xs text-stone-500">删除现有数据，替换为导入的数据</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeImportModal}
                    className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmImport}
                    disabled={importing}
                    className="flex-1 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#E8956D' }}
                  >
                    {importing ? '导入中...' : '选择文件'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
