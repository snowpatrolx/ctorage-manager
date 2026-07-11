// 语音识别工具模块 - 使用浏览器原生 Web Speech API

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
}

type SpeechRecognitionCallback = (result: SpeechRecognitionResult) => void;
type SpeechErrorCallback = (error: string) => void;

// 浏览器兼容性检测
export function isSpeechRecognitionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// 创建语音识别实例
function createRecognition(): SpeechRecognition {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

// 开始语音识别
export function startSpeechRecognition(
  onResult: SpeechRecognitionCallback,
  onError: SpeechErrorCallback,
  onInterim?: (text: string) => void
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    onError('您的浏览器不支持语音识别，请使用 Chrome 或 Safari 浏览器');
    return { stop: () => {} };
  }

  const recognition = createRecognition();
  let stopped = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    if (stopped) return;
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript;
    const confidence = result[0].confidence;

    if (result.isFinal) {
      onResult({ text, confidence });
    } else if (onInterim) {
      onInterim(text);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (stopped) return;
    switch (event.error) {
      case 'not-allowed':
        onError('请允许麦克风权限');
        break;
      case 'no-speech':
        onError('没有检测到语音，请重试');
        break;
      case 'network':
        onError('网络连接失败，请检查网络');
        break;
      default:
        onError('语音识别出错：' + event.error);
    }
  };

  recognition.onend = () => {
    // 如果没有手动停止且没有最终结果，可能是超时
  };

  try {
    recognition.start();
  } catch {
    onError('无法启动语音识别');
  }

  return {
    stop: () => {
      stopped = true;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}
