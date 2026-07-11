// 智能文本解析模块 - 从语音/文本中提取物品信息

export interface ParsedItem {
  name: string;
  quantity: number;
  location: string;
  notes: string;
}

// 中文数字映射
const chineseNumMap: Record<string, number> = {
  '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '百': 100, '千': 1000,
};

// 中文量词（用于数量提取）
const quantityPatterns = [
  /(\d+)\s*(个|只|件|条|把|支|双|副|套|台|部|本|张|块|片|根|瓶|盒|袋|包|箱|卷|排|组|对|颗|粒|枚|台|架|辆|艘|台|部)[\s在]/,
  /(\d+)\s*(个|只|件|条|把|支|双|副|套|台|部|本|张|块|片|根|瓶|盒|袋|包|箱|卷|排|组|对|颗|粒|枚|台|架|辆|艘|台|部)/,
  /(\d+)\s*件/,
  /(\d+)\s*个/,
];

// 中文数量词提取（如"三个""两本书"）
const chineseQuantityPatterns = [
  /([一二两三四五六七八九十百千]+)\s*(个|只|件|条|把|支|双|副|套|台|部|本|张|块|片|根|瓶|盒|袋|包|箱|卷|排|组|对|颗|粒|枚|架|辆|艘)/,
  /([一二两三四五六七八九十]+)\s*(本书|本子|支笔|把伞|条毛巾|条裤子|件衣服|双鞋|双袜子|个杯子|个碗|个盘子|个手机|个充电器|个耳机|个键盘|个鼠标|个电脑|个平板|个包包|个箱子|个盒子|个袋子|个瓶子)/,
];

// 位置关键词模式
const locationPatterns = [
  /在(.+?)(?:里面|里|内|中|上|下|外|旁|边|处|那里|这里|这儿|那儿|$)/,
  /放在(.+?)(?:里面|里|内|中|上|下|外|旁|边|处|那里|这里|这儿|那儿|$)/,
  /存放在(.+?)(?:里面|里|内|中|上|下|外|旁|边|处|$)/,
  /收纳在(.+?)(?:里面|里|内|中|上|下|外|旁|边|处|$)/,
  /装在(.+?)(?:里面|里|内|中|上|下|外|旁|边|处|$)/,
];

// 容器/家具关键词（用于辅助识别位置）
const containerKeywords = [
  '箱', '盒子', '柜子', '抽屉', '柜', '架', '层', '袋子', '包', '篮子', '桶',
  '房间', '卧室', '客厅', '厨房', '卫生间', '书房', '阳台', '储藏室', '车库',
  '桌子', '桌', '床', '沙发', '椅子', '柜', '橱', '架', '台', '窗', '门',
];

// 解析中文数字
function parseChineseNumber(str: string): number {
  if (str.length === 1) {
    return chineseNumMap[str] ?? 1;
  }
  if (str === '十') return 10;
  if (str.length === 2) {
    if (str[0] === '十') {
      const ones = chineseNumMap[str[1]] ?? 0;
      return 10 + ones;
    }
    const tens = chineseNumMap[str[0]] ?? 0;
    const ones = chineseNumMap[str[1]] ?? 0;
    return tens * 10 + ones;
  }
  // 更复杂的数字直接返回1
  return 1;
}

// 从文本中提取数量
function extractQuantity(text: string): { quantity: number; remainingText: string } {
  // 尝试阿拉伯数字+量词
  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const qty = parseInt(match[1]);
      const remaining = text.replace(match[0], '').trim();
      return { quantity: qty, remainingText: remaining };
    }
  }

  // 尝试纯数字开头
  const pureNumMatch = text.match(/^(\d+)\s+(.+)/);
  if (pureNumMatch) {
    return {
      quantity: parseInt(pureNumMatch[1]),
      remainingText: pureNumMatch[2],
    };
  }

  // 尝试中文数字+量词
  for (const pattern of chineseQuantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const qty = parseChineseNumber(match[1]);
      const remaining = text.replace(match[0], '').trim();
      return { quantity: qty, remainingText: remaining };
    }
  }

  return { quantity: 1, remainingText: text };
}

// 从文本中提取位置
function extractLocation(text: string): { location: string; remainingText: string } {
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const loc = match[1].trim().replace(/[，。！？、]$/g, '');
      if (loc.length > 0 && loc.length <= 30) {
        const remaining = text.replace(match[0], '').trim();
        return { location: loc, remainingText: remaining };
      }
    }
  }
  return { location: '', remainingText: text };
}

// 清理文本中的冗余词
function cleanText(text: string): string {
  return text
    .replace(/^[，。、\s]+/, '')
    .replace(/[，。！？、\s]+$/, '')
    .replace(/^(我|请|帮我|想要|需要|记一下|记录|添加|录入)\s*/, '')
    .trim();
}

// 主解析函数
export function parseItemText(text: string, existingLocations: string[] = []): ParsedItem {
  const cleaned = cleanText(text);
  if (!cleaned) {
    return { name: '', quantity: 1, location: '', notes: '' };
  }

  // 第一步：提取位置
  const { location, remainingText: afterLocation } = extractLocation(cleaned);

  // 第二步：提取数量
  const { quantity, remainingText: afterQuantity } = extractQuantity(afterLocation);

  // 第三步：确定物品名称
  let name = afterQuantity;

  // 如果名称中包含容器关键词但位置已经提取出来了，可能名称混入了位置信息
  if (location && name.includes(location.substring(0, 2))) {
    name = name.replace(new RegExp(location.substring(0, 2)), '').trim();
  }

  // 清理名称
  name = name
    .replace(/^(把|那个|这个|一个|一件|一些)\s*/, '')
    .replace(/(放在|在|里|里面|内|中)$/g, '')
    .trim();

  // 如果解析后名称为空，但原文有内容，取原文作为名称
  if (!name && cleaned) {
    name = cleaned.replace(/在.+?(里面|里|内|中|上|下|外|旁|边|处|$)/, '').trim();
  }

  return {
    name,
    quantity,
    location,
    notes: '',
  };
}

// 尝试匹配已有位置（模糊匹配）
export function matchExistingLocation(
  parsedLocation: string,
  existingLocations: string[]
): number | undefined {
  if (!parsedLocation) return undefined;

  // 精确匹配
  const exactIdx = existingLocations.findIndex(l => l === parsedLocation);
  if (exactIdx !== -1) return exactIdx;

  // 包含匹配
  const containIdx = existingLocations.findIndex(
    l => l.includes(parsedLocation) || parsedLocation.includes(l)
  );
  if (containIdx !== -1) return containIdx;

  return undefined;
}
