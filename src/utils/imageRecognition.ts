// 图像识别工具模块 - 使用 TensorFlow.js + MobileNet 进行本地图像识别
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model: mobilenet.MobileNet | null = null;
let loadingPromise: Promise<mobilenet.MobileNet> | null = null;

// 常见物品英文标签到中文的翻译映射
const labelTranslations: Record<string, string> = {
  // 容器类
  'water bottle': '水瓶', 'bottle': '瓶子', 'wine bottle': '酒瓶',
  'jug': '壶', 'vase': '花瓶', 'pitcher': '水壶', 'cauldron': '锅',
  'flask': '烧瓶', 'beaker': '烧杯',
  // 电子设备
  'iPod': '音乐播放器', 'modem': '调制解调器', 'hard disc': '硬盘',
  'CD player': 'CD播放器', 'cassette player': '磁带播放器',
  'speaker': '音箱', 'microphone': '麦克风', 'remote control': '遥控器',
  'mouse': '鼠标', 'keyboard': '键盘', 'monitor': '显示器',
  'screen': '屏幕', 'television': '电视', 'laptop': '笔记本电脑',
  'notebook': '笔记本', 'desktop computer': '台式电脑',
  'handheld computer': '掌上电脑', 'PDA': '掌上电脑',
  'cellular telephone': '手机', 'dial telephone': '电话机',
  'telephone': '电话', 'web site': '网站', 'digital clock': '数字时钟',
  'analog clock': '时钟', 'stopwatch': '秒表',
  // 家具
  'desk': '书桌', 'dining table': '餐桌', 'rocking chair': '摇椅',
  'folding chair': '折叠椅', 'throne': '椅子', 'chair': '椅子',
  'stool': '凳子', 'studio couch': '沙发', 'sofa': '沙发',
  'bookshop': '书架', 'bookcase': '书柜', 'wardrobe': '衣柜',
  'china cabinet': '橱柜', 'file': '文件柜', 'desk': '书桌',
  'four-poster': '床', 'sleeping bag': '睡袋',
  // 厨房用品
  'cup': '杯子', 'mug': '马克杯', 'eggnog': '蛋奶杯',
  'red wine': '红酒', 'espresso': '咖啡', 'coffee': '咖啡',
  'teapot': '茶壶', 'coffeepot': '咖啡壶', 'pitcher': '水壶',
  'mixing bowl': '搅拌碗', 'soup bowl': '汤碗', 'basin': '盆',
  'plate': '盘子', 'tray': '托盘', 'platter': '大浅盘',
  'spatula': '锅铲', 'ladle': '汤勺', 'whisk': '打蛋器',
  'corkscrew': '开瓶器', 'can opener': '开罐器',
  'frying pan': '煎锅', 'wok': '炒锅', 'potpie': '锅',
  'caldron': '大锅', 'rotisserie': '烤炉',
  'toaster': '烤面包机', 'microwave': '微波炉',
  'refrigerator': '冰箱', 'dishwasher': '洗碗机',
  'washer': '洗衣机', 'dryer': '烘干机',
  'iron': '熨斗', 'vacuum': '吸尘器',
  // 食物
  'banana': '香蕉', 'apple': '苹果', 'orange': '橙子',
  'lemon': '柠檬', 'pineapple': '菠萝', 'strawberry': '草莓',
  'fig': '无花果', 'custard apple': '番荔枝',
  'bottle cap': '瓶盖', 'can': '罐头',
  'bagel': '面包圈', 'pretzel': '椒盐脆饼', 'dough': '面团',
  'guacamole': '鳄梨酱', 'mashed potato': '土豆泥',
  'ice cream': '冰淇淋', 'ice lolly': '冰棍',
  'chocolate sauce': '巧克力酱', 'dough': '面团',
  'bread': '面包', 'toast': '吐司',
  // 服装
  'suit': '西装', 'bow tie': '领结', 'Windsor tie': '领带',
  'bolo tie': '波洛领带', 'cowboy hat': '牛仔帽',
  'bonnet': '女帽', 'sombrero': '墨西哥帽',
  'mitten': '手套', 'glove': '手套',
  'shoe': '鞋子', 'sandal': '凉鞋', 'loafer': '乐福鞋',
  'running shoe': '运动鞋', 'sneaker': '运动鞋',
  'clog': '木鞋', 'sock': '袜子',
  'jersey': '运动衫', 'sweatshirt': '卫衣',
  'fur coat': '皮草', 'trench coat': '风衣',
  'lab coat': '实验服', 'brassiere': '内衣',
  'stole': '披肩', 'poncho': '斗篷',
  'maillot': '泳衣', 'bikini': '比基尼',
  'jean': '牛仔裤', 'miniskirt': '迷你裙',
  // 书写工具
  'ballpoint': '圆珠笔', 'fountain pen': '钢笔',
  'pencil': '铅笔', 'pencil box': '铅笔盒',
  'pencil sharpener': '卷笔刀', 'eraser': '橡皮',
  'rule': '尺子', 'carbon paper': '复写纸',
  'envelope': '信封', 'menu': '菜单',
  'book jacket': '书皮', 'comic book': '漫画书',
  'crossword puzzle': '填字游戏', 'jigsaw puzzle': '拼图',
  'menu': '菜单', 'notebook': '笔记本',
  'binder': '文件夹', 'file': '文件',
  // 工具
  'hammer': '锤子', 'screwdriver': '螺丝刀',
  'wrench': '扳手', 'pliers': '钳子',
  'chain saw': '电锯', 'hatchet': '斧头',
  'shovel': '铲子', 'spatula': '铲子',
  'nail': '钉子', 'screw': '螺丝',
  'bolt': '螺栓', 'nut': '螺母',
  'padlock': '挂锁', 'chain': '链条',
  'combination lock': '密码锁',
  // 箱包
  'backpack': '背包', 'pack': '背包',
  'mailbag': '邮包', 'mail': '邮件',
  'wallet': '钱包', 'change purse': '零钱包',
  'coin': '硬币', 'money clip': '钱夹',
  // 其他常见物品
  'umbrella': '雨伞', 'parasol': '遮阳伞',
  'park bench': '公园长椅', 'bench': '长椅',
  'barbershop': '理发店', 'barber chair': '理发椅',
  'beach wagon': '旅行车', 'wagon': '手推车',
  'shopping cart': '购物车', 'shopping basket': '购物篮',
  'trolleybus': '无轨电车', 'minibus': '小巴',
  'convertible': '敞篷车', 'limousine': '豪华轿车',
  'sports car': '跑车', 'car wheel': '车轮',
  'bicycle-built-for-two': '双人自行车',
  'mountain bike': '山地车', 'bicycle': '自行车',
  'moped': '助力车', 'motor scooter': '踏板摩托',
  'motorcycle': '摩托车',
  'snowplow': '扫雪车', 'forklift': '叉车',
  'crane': '起重机', 'tractor': '拖拉机',
  'tank': '坦克', 'amphibian': '水陆两栖车',
  'airliner': '客机', 'warplane': '战机',
  'airship': '飞艇', 'spaceship': '飞船',
  'drone': '无人机',
  // 乐器
  'acoustic guitar': '木吉他', 'electric guitar': '电吉他',
  'banjo': '班卓琴', 'cello': '大提琴',
  'violin': '小提琴', 'harp': '竖琴',
  'piano': '钢琴', 'grand piano': '三角钢琴',
  'organ': '风琴', 'harpsichord': '大键琴',
  'accordion': '手风琴', 'drum': '鼓',
  'maraca': '沙锤', 'steel drum': '钢鼓',
  'French horn': '圆号', 'trombone': '长号',
  'saxophone': '萨克斯', 'flute': '长笛',
  // 玩具
  'teddy': '泰迪熊', 'toyshop': '玩具店',
  'toy terrier': '玩具犬', 'toy poodle': '玩具贵宾犬',
  // 自然
  'flowerpot': '花盆', 'flower': '花',
  'pot': '花盆', 'planter': '花盆',
  'daisy': '雏菊', 'coral fungus': '珊瑚菌',
  'mushroom': '蘑菇', 'acorn': '橡果',
  'ear': '玉米穗', 'cardoon': '朝鲜蓟',
  'artichoke': '朝鲜蓟', 'broccoli': '西兰花',
  'cauliflower': '花椰菜', 'zucchini': '西葫芦',
  'cucumber': '黄瓜', 'bell pepper': '甜椒',
  'cardoon': '朝鲜蓟', 'rapeseed': '油菜',
  'hay': '干草',
  // 灯具
  'lampshade': '灯罩', 'candle': '蜡烛',
  'torch': '火把', 'flashlight': '手电筒',
  'spotlight': '聚光灯', 'scoreboard': '记分牌',
  'traffic light': '红绿灯', 'street sign': '路标',
  // 体育用品
  'ping-pong ball': '乒乓球', 'golf ball': '高尔夫球',
  'golfcart': '高尔夫球车', 'rugby ball': '橄榄球',
  'soccer ball': '足球', 'basketball': '篮球',
  'volleyball': '排球', 'racket': '球拍',
  // 其他
  'pillow': '枕头', 'sleeping bag': '睡袋',
  'quilt': '被子', 'doona': '被子',
  'safety pin': '安全别针', 'pinwheel': '风车',
  'oscilloscope': '示波器',
  'abacus': '算盘', 'calculator': '计算器',
  'lens cap': '镜头盖', 'tripod': '三脚架',
  'reflex camera': '单反相机', 'camera': '相机',
  'binoculars': '双筒望远镜', 'telescope': '望远镜',
  'sunglasses': '太阳镜', 'sunglass': '太阳镜',
  'lens': '镜片', 'magnifying glass': '放大镜',
  'pier glass': '穿衣镜', 'mirror': '镜子',
  'balance beam': '天平', 'scale': '秤',
  'odometer': '里程表', 'meter': '仪表',
  'switch': '开关', 'electric fan': '电风扇',
  'space heater': '取暖器', 'radiator': ' radiator',
  'doormat': '门垫', 'bannister': '楼梯扶手',
  'picket fence': '栅栏', 'chainlink fence': '铁丝网',
  'stone wall': '石墙', 'worm fence': '蛇形栅栏',
  'suspension bridge': '吊桥', 'steel arch bridge': '钢拱桥',
  'pier': '码头', 'breakwater': '防波堤',
  'sandbar': '沙洲', 'seashore': '海岸',
  'valley': '山谷', 'alp': '高山',
  'volcano': '火山', 'mountain': '山',
  'lakeside': '湖边', 'dam': '大坝',
  'cliff': '悬崖', 'coral reef': '珊瑚礁',
  'promontory': '海角', 'sandbar': '沙洲',
  'bubble': '气泡',
};

// 加载模型
async function loadModel(): Promise<mobilenet.MobileNet> {
  if (model) return model;
  if (loadingPromise) return loadingPromise;

  loadingPromise = mobilenet.load({ version: 2, alpha: 1.0 });
  model = await loadingPromise;
  return model;
}

export function isImageRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 'tf' in window;
}

export interface RecognitionResult {
  label: string;
  labelZh: string;
  probability: number;
}

// 识别图片
export async function recognizeImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<RecognitionResult[]> {
  try {
    const mobilenetModel = await loadModel();
    const predictions = await mobilenetModel.classify(imageElement, 5);

    return predictions.map(p => {
      const label = p.className.split(',')[0].trim();
      const labelZh = translateLabel(label);
      return {
        label,
        labelZh,
        probability: p.probability,
      };
    });
  } catch (error) {
    console.error('图像识别失败:', error);
    throw new Error('图像识别失败，请重试');
  }
}

// 从 data URL 创建 Image 元素
export function createImageFromDataURL(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = dataURL;
  });
}

// 翻译英文标签为中文
function translateLabel(label: string): string {
  const lowerLabel = label.toLowerCase().trim();
  return labelTranslations[lowerLabel] || label;
}

// 预热模型（可以在应用启动时调用）
export async function warmUpModel(): Promise<void> {
  try {
    await loadModel();
  } catch {
    // 静默失败，不影响应用正常使用
  }
}
