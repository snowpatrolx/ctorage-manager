import { useState, useRef } from 'react';
import { X, Mic, MicOff, Sparkles } from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useLocationStore } from '@/store/useLocationStore';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '@/utils/speech';
import { parseItemText, matchExistingLocation, ParsedItem } from '@/utils/textParser';

interface QuickVoiceInputProps {
  open: boolean;
  onClose: () => void;
}

export function QuickVoiceInput({ open, onClose }: QuickVoiceInputProps) {
  const { addItem } = useItemStore();
  const { locations, addLocation, fetchLocations } = useLocationStore();
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<ParsedItem | null>(null);
  const [saved, setSaved] = useState(false);
  const [manualText, setManualText] = useState('');
  const stopRef = useRef<(() => void) | null>(null);

  if (!open) return null;

  const handleSave = async (parsed: ParsedItem) => {
    if (!parsed.name.trim()) return;

    let locId: number | undefined = undefined;

    if (parsed.location) {
      const locationNames = locations.map(l => l.name);
      const matchedIdx = matchExistingLocation(parsed.location, locationNames);
      if (matchedIdx !== undefined && locations[matchedIdx]) {
        locId = locations[matchedIdx].id;
      } else {
        try {
          const newId = await addLocation({ name: parsed.location, level: 1 });
          locId = newId;
          await fetchLocations();
        } catch {
          // ignore
        }
      }
    }

    await addItem({
      name: parsed.name.trim(),
      quantity: parsed.quantity,
      notes: parsed.notes || `语音: ${manualText || interimText}`,
      categoryId: undefined,
      locationId: locId,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setLastResult(null);
      setInterimText('');
      setManualText('');
    }, 1500);
  };

  const handleVoiceStart = () => {
    if (listening) {
      if (stopRef.current) stopRef.current();
      setListening(false);
      setInterimText('');
      return;
    }

    setError('');
    setInterimText('');
    setLastResult(null);
    setManualText('');
    setListening(true);

    const { stop } = startSpeechRecognition(
      (result) => {
        setListening(false);
        setInterimText('');
        setManualText(result.text);
        const parsed = parseItemText(result.text, locations.map(l => l.name));
        setLastResult(parsed);
      },
      (err) => {
        setListening(false);
        setInterimText('');
        setError(err);
      },
      (text) => {
        setInterimText(text);
      }
    );
    stopRef.current = stop;
  };

  const handleManualParse = () => {
    if (!manualText.trim()) return;
    const parsed = parseItemText(manualText, locations.map(l => l.name));
    setLastResult(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 弹窗 */}
      <div className="relative w-full max-w-lg bg-stone-50 rounded-t-3xl shadow-2xl animate-slide-up">
        {/* 拖拽指示条 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* 标题 */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: '#E8956D' }} />
            <h2 className="font-semibold text-lg text-stone-800">快速录入</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-8">
          {/* 语音按钮 */}
          {isSpeechRecognitionSupported() && (
            <div className="flex flex-col items-center mb-5">
              <button
                onClick={handleVoiceStart}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  listening
                    ? 'bg-red-500 text-white scale-110 animate-pulse'
                    : 'bg-white text-stone-600 hover:scale-105 border-2 border-stone-200'
                }`}
              >
                {listening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
              <p className="mt-3 text-sm text-stone-500">
                {listening ? '正在聆听...' : '点击麦克风开始说话'}
              </p>
            </div>
          )}

          {/* 识别中 */}
          {interimText && (
            <div className="mb-4 px-4 py-3 bg-green-50 rounded-xl text-sm text-green-700">
              识别中：{interimText}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 手动输入/编辑 */}
          <div className="mb-4">
            <textarea
              value={manualText || interimText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="也可以直接输入文字，如：电池在诺西贝箱里"
              rows={2}
              className="w-full px-4 py-3 bg-white rounded-xl border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm resize-none"
            />
            {manualText && !lastResult && (
              <button
                onClick={handleManualParse}
                className="mt-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ backgroundColor: '#7C9885' }}
              >
                解析并录入
              </button>
            )}
          </div>

          {/* 解析结果预览 */}
          {lastResult && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                <p className="text-xs font-medium text-stone-500">解析结果</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 w-12">名称</span>
                  <span className="text-sm font-medium text-stone-800">{lastResult.name || '未识别'}</span>
                </div>
                {lastResult.quantity > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 w-12">数量</span>
                    <span className="text-sm text-stone-700">{lastResult.quantity}</span>
                  </div>
                )}
                {lastResult.location && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 w-12">位置</span>
                    <span className="text-sm text-stone-700">{lastResult.location}</span>
                  </div>
                )}
              </div>
              <div className="px-4 py-3">
                <button
                  onClick={() => handleSave(lastResult)}
                  disabled={saved || !lastResult.name}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    saved
                      ? 'bg-green-100 text-green-700'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={!saved ? { backgroundColor: '#E8956D' } : undefined}
                >
                  {saved ? (
                    <>
                      <span className="text-lg">✓</span>
                      已保存
                    </>
                  ) : (
                    '确认保存'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 使用提示 */}
          {!listening && !interimText && !lastResult && (
            <div className="text-center text-xs text-stone-400 space-y-1">
              <p>支持的说法示例：</p>
              <p className="text-stone-500">"电池在诺西贝箱里"</p>
              <p className="text-stone-500">"三个充电器放在卧室抽屉"</p>
              <p className="text-stone-500">"身份证在钱包里"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
