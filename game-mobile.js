/* ===================================================================
   族語射手 TRUKU WORD ARCHER — 手機直式「點字拼字」版遊戲引擎
   -------------------------------------------------------------------
   完全獨立於桌機 hunter-truku-v2.html：自帶遊戲迴圈、判定、難度、版面。
   不呼叫任何桌機函式。只共用「靜態素材(引用同路徑)」與「單字資料(同一支 API)」。

   縱向軸：獵人固定底部朝上 → 敵人由畫面頂部往下逼近 → 拼完字往上射箭擊中。
=================================================================== */
(() => {
'use strict';

// ─────────────────────────────────────────────────────────────
// 可調參數（手機獨立維護，調這裡不影響桌機）
// ─────────────────────────────────────────────────────────────
const CFG = {
  START_HP: 5,                 // 初始血量（是否扣血：DANGER 越線才扣，見 update）
  DANGER_LINE_FROM_BOTTOM: 150,// 危險線離底部(獵人前方)的距離(px, 內部座標)，留手感距離
  PREY_START_Y_RATIO: -0.06,   // 敵人生成 y（畫面高比例，負值=從頂部外進場）
  PREY_FALL_SPEED: 26,         // 敵人下降速度(px/秒, 內部座標)基準值
  PREY_SPEED_PER_COMBO: 0.6,   // combo 每 +1 敵人加速一點（時間壓力）
  PREY_SPEED_MAX: 70,          // 下降速度上限
  TILE_MIN: 3,                 // 拿來出題的單字最短長度
  TILE_MAX: 8,                 // 最長長度（磚太多手機塞不下）
  WRONG_DEDUCT_HP: false,      // 點錯是否扣血（規格第一版：false，只給視覺+震動）
  ARROW_SPEED: 1400,           // 箭上飛速度(px/秒)
  BASE_SCORE: 100,             // 每字基礎分
  COMBO_BONUS: 20,             // 每層 combo 加分
  VIBRATE_WRONG: 40,           // 點錯震動(ms)
  VIBRATE_HIT: [0,30,40,30],   // 擊中震動 pattern

  // ── 第一關「半透明拼字提示」鷹架（初學者用；照桌機「刷透明」概念：先給看、慢慢淡） ──
  HINT_ENABLED: true,          // 總開關（false = 完全不給提示）
  HINT_FIRST_N_WORDS: 5,       // 只在「開局前 N 題」（近似第一關）出現提示；之後不給
  HINT_START_OPACITY: 0.55,    // 提示初始透明度（0~1，越高越明顯）
  HINT_FADE_MS: 4000,          // 從初始透明度淡到 HINT_MIN_OPACITY 所需時間(ms)
  HINT_MIN_OPACITY: 0.0,       // 淡出到的最低透明度（0=完全消失；可設小值保留微量殘影）
  HINT_FADE_DELAY_MS: 700,     // 出題後先完整顯示這段時間再開始淡出（讓初學者來得及看）

  // ── 關卡里程碑（累積擊殺數分段；只是 HUD 顯示+輕量反饋，不影響 endless 遊戲迴圈本身） ──
  // 0-9→LEVEL1、10-19→LEVEL2、20-29→LEVEL3、30-39→LEVEL4、40+→LEVEL5（上限，不再往上）
  MILESTONE_KILLS_PER_LEVEL: 10,
  MILESTONE_MAX_LEVEL: 5,
  LEVEL_UP_TOAST_MS: 1400,      // 跨門檻提示條顯示時長(ms)

  // ── 選項點選關（音選詞/看圖選詞）：一次給幾個族語詞選項（正解 + N-1 誘答） ──
  CHOICE_OPTION_COUNT: 4,      // 4 顆 2×2 網格；每顆 ≥44px 觸控目標
  CHOICE_WRONG_DEDUCT_HP: false,// 點錯選項是否扣血（第一版：否，只給視覺+震動，與拼字關一致）
};

// ─────────────────────────────────────────────────────────────
// 玩法模式（把桌機 5 玩法挑「最適合觸控」的 4 種搬過來，各自獨立實作、不呼叫桌機函式）
//   選 4 種的理由：涵蓋「點選項」與「點字母磚」兩大觸控範式各 2 關；盲打(L5)在觸控上
//   與聽打(L3)完全同構（都是點字母磚全拼、只差給不給提示），且手機已有 hintRow 鷹架，
//   故落選，改留視覺線索更具體、更適合小螢幕的「看圖選詞」。
//   - 'spell-listen' 聽打：聽發音 → 點字母磚照序拼完整詞（＝原手機核心玩法）。
//   - 'choice-audio' 音選詞：聽發音 → 從 4 個族語詞選項點正確的（不顯示中文，靠聽）。
//   - 'blank'        填空：露出部分字母、缺 1~2 格 → 點字母磚補上缺的字母。
//   - 'choice-image' 看圖選詞：看詞彙插畫 → 從 4 個族語詞選項點正確的（需 hasImage）。
// interaction：'tiles'（點字母磚）| 'choice'（點選項）——決定底部渲染哪一套 UI。
// filter：抓詞時帶給 /api/vocabulary 的過濾（hasAudio/hasImage），與桌機同一支 API。
const MODES = {
  'spell-listen': { key:'spell-listen', label:'聽打',     labelEn:'DICTATION', interaction:'tiles',  filter:'hasAudio', showZh:true,  playAudio:true,  desc:'聽發音，點字母磚拼出整個族語詞',
    howtoTitle:'怎麼玩 · 聽打', howto:['聽發音、看上方中文提示，知道要拼哪個詞。','點下方的<b>字母磚</b>，照正確順序拼出整個族語詞。','拼完整個字，獵人自動<b>往上射箭</b>擊中敵人得分。','別讓敵人越過底部的<b>危險線</b>，越線會扣血。'] },
  'choice-audio': { key:'choice-audio', label:'音選詞',   labelEn:'LISTEN',    interaction:'choice', filter:'hasAudio', showZh:false, playAudio:true,  desc:'聽發音，從四個族語詞選正確的',
    howtoTitle:'怎麼玩 · 音選詞', howto:['先<b>聽發音</b>（可點喇叭再聽一次），不顯示中文。','從下方<b>四個族語詞</b>選項中，點出你聽到的那個。','選對了，獵人自動<b>往上射箭</b>擊中敵人得分。','別讓敵人越過底部的<b>危險線</b>，越線會扣血。'] },
  'blank':        { key:'blank',        label:'填空',     labelEn:'FILL',      interaction:'tiles',  filter:null,       showZh:true,  playAudio:false, desc:'詞缺幾格，點字母磚把缺的補上',
    howtoTitle:'怎麼玩 · 填空', howto:['看上方中文提示，下方進度格會露出<b>部分字母</b>。','缺的格用<b>字母磚</b>補上，照正確順序點。','補齊整個詞，獵人自動<b>往上射箭</b>擊中敵人得分。','別讓敵人越過底部的<b>危險線</b>，越線會扣血。'] },
  'choice-image': { key:'choice-image', label:'看圖選詞', labelEn:'PICTURE',   interaction:'choice', filter:'hasImage', showZh:false, playAudio:false, desc:'看圖片，從四個族語詞選正確的',
    howtoTitle:'怎麼玩 · 看圖選詞', howto:['看畫面上方的<b>詞彙圖片</b>，想想那是什麼。','從下方<b>四個族語詞</b>選項中，點出正確的那個。','選對了，獵人自動<b>往上射箭</b>擊中敵人得分。','別讓敵人越過底部的<b>危險線</b>，越線會扣血。'] },
};
const MODE_ORDER = ['spell-listen','choice-audio','blank','choice-image'];
const DEFAULT_MODE = 'spell-listen';

// 內部座標系：以「設計高度」為基準畫，再等比縮放貼到實際 canvas，維持長寬比不變形。
const VW = 400;   // 設計寬
const VH = 700;   // 設計高（直式）

// ─────────────────────────────────────────────────────────────
// DOM
// ─────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const deviceGate = $('deviceGate'), gateForce = $('gateForce');
const rotateHint = $('rotateHint');
const app = $('app');
const canvas = $('game'), ctx = canvas.getContext('2d');
const hpFill = $('hpFill'), hpNum = $('hpNum');
const scoreNum = $('scoreNum'), comboNum = $('comboNum'), levelNum = $('levelNum');
const levelUpToast = $('levelUpToast');
const wordMeaning = $('wordMeaning'), wmZh = $('wmZh'), wmCat = $('wmCat');
const audioBtn = $('audioBtn');
const progressRow = $('progressRow'), tileRow = $('tileRow');
const hintRow = $('hintRow');   // 第一關半透明拼字提示（鷹架）
const clearBtn = $('clearBtn');
// 選項點選關（音選詞/看圖選詞）：底部選項網格；圖片線索卡（看圖選詞用）
const choiceRow = $('choiceRow');
const cueImageWrap = $('cueImageWrap'), cueImage = $('cueImage');
// 模式選擇器（開始畫面 4 顆）＋ HUD 當前模式徽章
const modePicker = $('modePicker'), modeBadge = $('modeBadge');
const overlay = $('overlay'), ovTitle = $('ovTitle'), ovSub = $('ovSub'),
      ovStats = $('ovStats'), startBtn = $('startBtn');
const howto = $('howto');   // 玩法說明卡「怎麼玩」：開始畫面顯示、結算畫面隱藏
const howtoTitleText = $('howtoTitleText'), howtoSteps = $('howtoSteps');   // 依模式動態換內容
// 語別選擇相關
const langSelect = $('langSelect'), langError = $('langError');
const langBar = $('langBar'), langBarName = $('langBarName'), langBarNative = $('langBarNative');
// 帳號 / 排行榜相關（輕量登入，訪客路徑不受影響）
const acctBar = $('acctBar'), acctBarLabel = $('acctBarLabel'),
      acctBarLoginBtn = $('acctBarLoginBtn'), acctBarBoardBtn = $('acctBarBoardBtn');
const ovAcctRow = $('ovAcctRow'), ovAcctLabel = $('ovAcctLabel'), ovLoginLink = $('ovLoginLink'),
      ovBoardBtn = $('ovBoardBtn');
const authOverlay = $('authOverlay'), authTabLoginM = $('authTabLoginM'), authTabRegisterM = $('authTabRegisterM'),
      authUserM = $('authUserM'), authPassM = $('authPassM'),
      authDisplayRow = $('authDisplayRow'), authDisplayM = $('authDisplayM'),
      authErrorM = $('authErrorM'), authSubmitM = $('authSubmitM'), authCancelM = $('authCancelM');
const boardOverlay = $('boardOverlay'), boardList = $('boardList'), boardCloseBtn = $('boardCloseBtn');

// ─────────────────────────────────────────────────────────────
// 素材（引用桌機同一份路徑，不複製）
// ─────────────────────────────────────────────────────────────
const IMG = {};
function loadImg(key, src){ const i=new Image(); i.src=src; IMG[key]=i; }
loadImg('hunter', '/images/ui/v2-hunter-truku-aim.png');   // 朝右瞄準，直式時 canvas 內旋轉朝上
loadImg('arrow',  null); // 箭用向量畫，不需圖
// 獵物 sprite 池（透明背景 PNG，沿用桌機同一批）
const PREY_SPRITES = [
  'prey-boar.png','prey-deer.png','prey-bear.png','prey-muntjac.png',
  'prey-serow.png','prey-pheasant.png','prey-monkey.png','prey-flying-squirrel.png',
  'prey-hawk-eagle.png','prey-clouded-leopard.png'
].map(f => { const i=new Image(); i.src='/images/ui/'+f; return i; });

// ─────────────────────────────────────────────────────────────
// 遊戲狀態
// ─────────────────────────────────────────────────────────────
let pool = [];            // 可用單字池（已過濾，依當前模式的 filter）
let allPool = [];         // 全池（不過濾，供選項關生誘答用）
let currentMode = DEFAULT_MODE;   // 當前玩法模式（見 MODES）
let state = 'menu';       // menu | playing | over
let hp, score, combo, kills, correctTaps, totalTaps;
let milestoneLevel = 1;   // 本局目前里程碑等級（依累積 kills 分段，見 CFG.MILESTONE_*），只是 HUD/反饋層
let current = null;       // 目前題目 { letters:[], word, zh, cat, audio, spriteIdx }
let progress = 0;         // 已拼到第幾格
let tileState = [];       // 每個磚：{ch, used:bool, el}
let prey = null;          // { y, spriteIdx }
let arrows = [];          // 飛行中的箭 { x,y,target }
let lastT = 0, rafId = 0;
let audioEl = null;
let wordsSeen = 0;        // 本局已出過幾題（用來判定是否還在「第一關」鷹架範圍）
let hintFadeRaf = 0;      // 提示淡出動畫的 rAF id（獨立於主迴圈，換題時取消）

// 內部座標 → 螢幕縮放
let scale = 1, offX = 0, offY = 0;

// ─────────────────────────────────────────────────────────────
// 裝置分流
// ─────────────────────────────────────────────────────────────
function query(name){
  return new URLSearchParams(location.search).get(name);
}
function isMobileLike(){
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth <= 820;
  return coarse || narrow;
}
function decideEntry(){
  const mode = query('mode');
  if (mode === 'mobile') return show();          // 強制手機版
  if (mode === 'desktop'){ /* 保留：日後 router 用；本輪不轉址 */ }
  if (isMobileLike()) return show();
  // 桌機/寬螢幕：顯示提示，不自動轉址（避免動到部署入口）
  deviceGate.hidden = false;
}
gateForce.addEventListener('click', () => { deviceGate.hidden = true; show(); });
function show(){
  deviceGate.hidden = true;
  app.hidden = false;
  setAppHeight();          // 先鎖穩定高度，再量 canvas（避免第一次量到還沒定高的過渡值）
  applyCanvasSize();       // 首次直接同步套用一次（不走 rAF 節流，確保開場即正確）
  checkOrientation();
}

// ─────────────────────────────────────────────────────────────
// 方向 / 尺寸
// ─────────────────────────────────────────────────────────────
function checkOrientation(){
  // 只有在「手機寬度且橫向」時提示轉直式；平板/桌機不強制
  const landscape = window.innerWidth > window.innerHeight;
  const smallHeight = window.innerHeight < 480;
  rotateHint.hidden = !(landscape && smallHeight);
}

// 螢幕(CSS px)尺寸：縱向軸直接用螢幕座標，獵人永遠貼可視底部、危險線恆在其前方固定距離，
// 不會因裝置長寬比不同而被裁切。水平方向以 VW 為基準等比縮放，維持磚/獵人比例一致。
let playW = VW, playH = VH;
let _lastCanvasW = 0, _lastCanvasH = 0;   // 上次實際套用的 canvas 尺寸（CSS px×dpr）
let _resizeRaf = 0;                        // resize 節流用的 rAF id

// 把「穩定的可視高度」寫進 CSS 變數 --app-h，讓 #app 用固定高度鎖版面。
// 用 visualViewport.height（若有）比 innerHeight 更貼近實際可視高，且在網址列收合的
// 過程中我們用「四捨五入 + 只在明顯變化時才更新」避免每個中間值都寫進去造成抖動。
let _lastAppH = 0;
function setAppHeight(){
  const vv = window.visualViewport;
  const h = Math.round(vv ? vv.height : window.innerHeight);
  // 只有變化超過 2px 才更新（濾掉網址列漸進收合過程的每一個亞像素中間值）
  if (Math.abs(h - _lastAppH) < 2) return false;
  _lastAppH = h;
  document.documentElement.style.setProperty('--app-h', h + 'px');
  return true;
}

// 真正重算 canvas 尺寸與縮放係數。只在「像素尺寸實際變了」時才重設 canvas 寬高
// （重設 canvas.width 會清空畫布並觸發昂貴的重配置），避免捲動時反覆清畫布造成閃爍/抖動。
function applyCanvasSize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
  playW = w; playH = h;
  scale = Math.min(1.6, Math.max(0.7, w / VW));   // 元素縮放係數，夾在合理範圍
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (cw === _lastCanvasW && ch === _lastCanvasH) return;   // 尺寸沒變 → 不動 canvas，避免清畫布
  _lastCanvasW = cw; _lastCanvasH = ch;
  canvas.width = cw;
  canvas.height = ch;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// resize：先更新 --app-h（穩定高度），再用 rAF 節流重算 canvas，避免高頻連續觸發。
function resize(){
  setAppHeight();
  if (_resizeRaf) return;                 // 已排程一次，合併這一輪的多次呼叫
  _resizeRaf = requestAnimationFrame(() => {
    _resizeRaf = 0;
    applyCanvasSize();
  });
}
// 尺寸縮放（給 sprite/線寬等固定尺寸物件用）
const S = v => v * scale;
// 水平置中：x 以 VW 為基準，置中對映到實際寬
const SX = x => (playW - VW * scale) / 2 + x * scale;
// 垂直：直接螢幕座標（0=頂部, playH=底部）
const SY = y => y;

// ─────────────────────────────────────────────────────────────
// 語別（多語別；與桌機共用 localStorage key 'hunter_lang'）
// /api/languages 回 { data:[{lang_code,dialect_id,name_zh,name_native}] }
// /api/vocabulary?lang=<code> 回該語別詞彙；不帶 lang 後端預設 trv。
// ─────────────────────────────────────────────────────────────
const LANG_STORAGE_KEY = 'hunter_lang';               // 跟桌機同一把 key，跨端一致
const DEFAULT_LANG = { code:'trv', nameZh:'太魯閣語', nameNative:'Truku' };
let LANGUAGES = [];          // /api/languages data
let langByCode = {};         // code → 語別物件
let currentLang = { ...DEFAULT_LANG };

// 讀 localStorage（隱私模式/停用時可能丟例外，包起來）
function readSavedLang(){
  try { return localStorage.getItem(LANG_STORAGE_KEY); } catch(e){ return null; }
}
function saveLang(code){
  try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch(e){}
}

// 抓 42 語別；失敗只保底 trv（向下相容、保底可玩）
async function fetchLanguages(){
  try {
    const res = await fetch('/api/languages');
    if (!res.ok) throw new Error('languages api');
    const json = await res.json();
    LANGUAGES = (json && Array.isArray(json.data)) ? json.data : [];
  } catch(e){
    console.warn('[mobile] 語別 API 無法連線，僅提供太魯閣語', e.message);
    LANGUAGES = [];
  }
  if (!LANGUAGES.length){
    LANGUAGES = [{ lang_code:'trv', dialect_id:0, name_zh:'太魯閣語', name_native:'Truku' }];
  }
  langByCode = {};
  LANGUAGES.forEach(l => { langByCode[l.lang_code] = l; });
}

// 由 code 建語別狀態物件（查無 → 退回 trv）
function langObjFromCode(code){
  const l = langByCode[code];
  if (!l) return { ...DEFAULT_LANG };
  return { code:l.lang_code, nameZh:l.name_zh, nameNative:l.name_native || '' };
}

// 填語別下拉，顯示 name_zh + name_native，選中 currentLang
function populateLangSelect(){
  if (!langSelect) return;
  langSelect.innerHTML = LANGUAGES.map(l => {
    const native = l.name_native ? ` (${l.name_native})` : '';
    return `<option value="${l.lang_code}">${l.name_zh}${native}</option>`;
  }).join('');
  langSelect.value = currentLang.code;
}

// 更新「目前語別條」文案（HUD 下方）
function refreshLangBar(){
  if (langBarName) langBarName.textContent = currentLang.nameZh;
  if (langBarNative){
    langBarNative.textContent = currentLang.nameNative || '';
    langBarNative.style.display = currentLang.nameNative ? '' : 'none';
  }
}

// 初始化語別：抓清單 → 用 localStorage 記住的上次選擇當預設（查無退回 trv）→ 填 UI
async function initLang(){
  await fetchLanguages();
  const saved = readSavedLang();
  const code = (saved && langByCode[saved]) ? saved : DEFAULT_LANG.code;
  currentLang = langObjFromCode(code);
  populateLangSelect();
  refreshLangBar();
}

// ─────────────────────────────────────────────────────────────
// 單字資料（同一支 API；不抽桌機、不複製資料檔）
//   帶 ?lang=<currentLang.code> 取該語別詞彙。
// ─────────────────────────────────────────────────────────────
// 撇號家族（族語聲門音）：判定「純字母」時視為合法，磚上照顯示。
const APOSTROPHE_RE = /[ʼ'’ʻˈː]/g;

// 單字清洗：各語別共用同一套規則，確保點字拼字可玩。
//  - 去掉多詞片語(空格)、含括號/斜線/連字號/省略號等標記的殘詞
//  - 只保留「Unicode 字母 + 撇號家族」，擋掉 ^ … ； 數字 漢字等非字母符號
//  - 長度 3~8（碼位計，Array.from 對擴充字母 ʉ ɨ ṟ é ē 與撇號 ʼ 都正確）
function isPlayableWord(word){
  if (!word) return false;
  if (/[\s()\/\-…；;^\.,]/.test(word)) return false;      // 明確排除的標記/多詞
  const base = word.replace(APOSTROPHE_RE, '');            // 撇號視為合法、暫移除再驗
  if (!base) return false;                                 // 只有撇號不算詞
  let allLetters = true;
  try { allLetters = /^\p{L}+$/u.test(base); }             // Unicode 字母（含擴充拉丁）
  catch(e){ allLetters = /^[A-Za-zÀ-ɏḀ-ỿ]+$/.test(base); } // 舊瀏覽器保底
  if (!allLetters) return false;
  const len = Array.from(word).length;                     // 碼位安全計長
  return len >= CFG.TILE_MIN && len <= CFG.TILE_MAX;
}

// 把一列 API 資料清成內部單字物件（含 image，選項關/看圖關要用）。
function mapRow(r){
  return {
    word: (r.word || '').trim(),
    zh: r.chinese || r.word,
    cat: r.category || '',
    audio: r.audio_path || null,
    image: r.image_path || null,
  };
}

// 從 /api/vocabulary 抓一批（可帶 filter=hasAudio/hasImage），清洗成可玩詞陣列。
async function fetchPool(code, filter){
  const params = ['lang=' + encodeURIComponent(code)];
  if (filter === 'hasAudio') params.push('hasAudio=1');
  else if (filter === 'hasImage') params.push('hasImage=1');
  const res = await fetch('/api/vocabulary?' + params.join('&'));
  if (!res.ok) throw new Error('api ' + res.status);
  const rows = await res.json();
  return rows.map(mapRow).filter(r => isPlayableWord(r.word));
}

// 載入「當前模式所需」詞池 + 全池（供選項關生誘答）。回傳 { ok, reason }。
//   pool    ＝ 依 currentMode.filter 過濾後的出題池。
//   allPool ＝ 不過濾的全池（誘答庫越大越好；聽/看關的答案仍從 pool 出）。
async function loadPool(){
  const code = currentLang.code;
  const mode = MODES[currentMode] || MODES[DEFAULT_MODE];
  try {
    // 先抓全池（供誘答）；再抓模式過濾池。全池抓失敗就用過濾池自己當誘答庫。
    let all = [];
    try { all = await fetchPool(code, null); } catch(e){ all = []; }
    const cleaned = mode.filter ? await fetchPool(code, mode.filter) : all.slice();
    if (!cleaned.length) throw new Error('empty');
    pool = cleaned;
    allPool = all.length ? all : cleaned.slice();
    return { ok:true };
  } catch(e){
    console.warn('[mobile] 詞彙載入失敗 lang=' + code + ' mode=' + currentMode, e.message);
    // 只有太魯閣語才退回內建備援；其他語別不可用太魯閣詞冒充 → 清空 + 提示。
    if (code === 'trv'){
      // 備援池依模式 filter 再篩一次（看圖選詞需要圖 → 備援沒圖時退回無過濾，至少可玩）
      let fb = FALLBACK.slice();
      if (mode.filter === 'hasImage') fb = fb.filter(r => r.image);
      if (mode.filter === 'hasAudio') fb = fb.filter(r => r.audio);
      if (!fb.length) fb = FALLBACK.slice();   // 備援太少就不強求過濾，保證可玩
      pool = fb;
      allPool = FALLBACK.slice();
      return { ok:true, fallback:true };
    }
    pool = []; allPool = [];
    return { ok:false, reason:e.message };
  }
}
// 離線備援（含重複字母、含特殊字元示範）。image/audio 皆 null（離線無素材），
// 選項關/看圖關在備援下仍可跑（看圖關無圖時退化為只顯示中文線索，見 buildCue）。
const FALLBACK = [
  {word:'kumay', zh:'黑熊', cat:'動物', audio:null, image:null},
  {word:'bowyak', zh:'山豬', cat:'動物', audio:null, image:null},
  {word:'mirit', zh:'山羊', cat:'動物', audio:null, image:null},
  {word:'rqnux', zh:'水鹿', cat:'動物', audio:null, image:null},
  {word:'pada', zh:'山羌', cat:'動物', audio:null, image:null},
  {word:'kingal', zh:'一', cat:'數字', audio:null, image:null},
  {word:'mataru', zh:'六', cat:'數字', audio:null, image:null},
  {word:'maxal', zh:'十', cat:'數字', audio:null, image:null},
  {word:'hidaw', zh:'太陽', cat:'自然', audio:null, image:null},
  {word:'idas', zh:'月亮', cat:'自然', audio:null, image:null},
];

// ─────────────────────────────────────────────────────────────
// 帳號（輕量登入；沿用桌機同一組 /api/auth/* API，但 token 分開存）
//   - 訪客模式維持最短路徑：不呼叫 /api/auth/*、不呼叫 POST /api/scores、成績純本機。
//   - token key 特意跟桌機的 'hunter_auth_token' 分開存，兩邊各自獨立登入狀態。
// ─────────────────────────────────────────────────────────────
const MOBILE_AUTH_TOKEN_KEY = 'hunter_mobile_token';
let AUTH = { token:null, username:null, displayName:null, unlockedLevel:1, isGuest:true };
let _authTabMode = 'login';   // 'login' | 'register'

function mobileAuthHeaders(){
  return AUTH.token ? { 'Authorization': 'Bearer ' + AUTH.token } : {};
}
function readSavedMobileToken(){
  try { return localStorage.getItem(MOBILE_AUTH_TOKEN_KEY); } catch(e){ return null; }
}
function saveMobileToken(token){
  try { localStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token); } catch(e){}
}
function clearMobileToken(){
  try { localStorage.removeItem(MOBILE_AUTH_TOKEN_KEY); } catch(e){}
}

// 驗證已存 token 是否仍有效，同步 displayName / unlockedLevel。失效則清掉、退回訪客。
async function refreshMobileAuthMe(){
  if (!AUTH.token) return false;
  try {
    const res = await fetch('/api/auth/me', { headers: mobileAuthHeaders() });
    if (!res.ok) throw new Error('me api ' + res.status);
    const data = await res.json();
    AUTH.username = data.username;
    AUTH.displayName = data.display_name;
    AUTH.unlockedLevel = data.unlockedLevel || 1;
    AUTH.isGuest = false;
    return true;
  } catch(e){
    AUTH = { token:null, username:null, displayName:null, unlockedLevel:1, isGuest:true };
    clearMobileToken();
    return false;
  }
}

// 更新帳號狀態相關 UI（HUD 帳號條 + 開始畫面帳號列）
function refreshAcctUI(){
  const label = AUTH.isGuest ? '訪客模式' : ('已登入：' + (AUTH.displayName || AUTH.username));
  if (acctBarLabel) acctBarLabel.textContent = label;
  if (acctBarLoginBtn) acctBarLoginBtn.hidden = !AUTH.isGuest;
  if (ovAcctLabel) ovAcctLabel.textContent = AUTH.isGuest ? '訪客模式（成績不記錄）' : ('已登入：' + (AUTH.displayName || AUTH.username) + '（成績會記錄）');
  if (ovLoginLink) ovLoginLink.hidden = !AUTH.isGuest;
}

function openAuthOverlay(){
  if (authErrorM){ authErrorM.hidden = true; authErrorM.textContent = ''; }
  if (authOverlay) authOverlay.hidden = false;
}
function closeAuthOverlay(){
  if (authOverlay) authOverlay.hidden = true;
}
function switchAuthTabM(mode){
  _authTabMode = mode;
  const isRegister = mode === 'register';
  if (authTabLoginM) authTabLoginM.classList.toggle('active', !isRegister);
  if (authTabRegisterM) authTabRegisterM.classList.toggle('active', isRegister);
  if (authDisplayRow) authDisplayRow.hidden = !isRegister;
  if (authSubmitM) authSubmitM.textContent = isRegister ? '註冊' : '登入';
  if (authErrorM){ authErrorM.hidden = true; authErrorM.textContent = ''; }
}

async function submitAuthM(){
  const username = (authUserM && authUserM.value || '').trim();
  const password = (authPassM && authPassM.value) || '';
  const displayName = (authDisplayM && authDisplayM.value || '').trim();
  if (!authErrorM) return;
  authErrorM.hidden = true; authErrorM.textContent = '';

  if (!username || !password){ authErrorM.textContent = '請輸入帳號與密碼'; authErrorM.hidden = false; return; }
  if (_authTabMode === 'register' && !displayName){ authErrorM.textContent = '請輸入顯示名稱'; authErrorM.hidden = false; return; }

  authSubmitM.disabled = true;
  const original = authSubmitM.textContent;
  authSubmitM.textContent = '處理中…';
  try {
    const url = _authTabMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = _authTabMode === 'register'
      ? { username, password, display_name: displayName }
      : { username, password };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok){
      authErrorM.textContent = data.error || '發生錯誤，請再試一次';
      authErrorM.hidden = false;
      return;
    }
    AUTH.token = data.token;
    saveMobileToken(data.token);
    const ok = await refreshMobileAuthMe();
    if (ok){
      refreshAcctUI();
      closeAuthOverlay();
    } else {
      authErrorM.textContent = '登入成功但讀取資料失敗，請重新整理頁面';
      authErrorM.hidden = false;
    }
  } catch(e){
    authErrorM.textContent = '無法連線到伺服器';
    authErrorM.hidden = false;
  } finally {
    authSubmitM.disabled = false;
    authSubmitM.textContent = original;
  }
}

if (authTabLoginM) authTabLoginM.addEventListener('click', () => switchAuthTabM('login'));
if (authTabRegisterM) authTabRegisterM.addEventListener('click', () => switchAuthTabM('register'));
if (authSubmitM) authSubmitM.addEventListener('click', submitAuthM);
if (authCancelM) authCancelM.addEventListener('click', closeAuthOverlay);
if (acctBarLoginBtn) acctBarLoginBtn.addEventListener('click', openAuthOverlay);
if (ovLoginLink) ovLoginLink.addEventListener('click', openAuthOverlay);

// ─────────────────────────────────────────────────────────────
// 排行榜（GET /api/leaderboard?platform=mobile；簡潔清單，跟桌機羊皮紙風格分開）
// ─────────────────────────────────────────────────────────────
async function loadLeaderboardM(){
  if (!boardList) return;
  boardList.innerHTML = '<div class="board-empty">載入中…</div>';
  try {
    const res = await fetch('/api/leaderboard?platform=mobile&limit=20');
    if (!res.ok) throw new Error('leaderboard api ' + res.status);
    const json = await res.json();
    const rows = (json && Array.isArray(json.data)) ? json.data : [];
    if (!rows.length){
      boardList.innerHTML = '<div class="board-empty">目前還沒有手機版排行榜紀錄</div>';
      return;
    }
    boardList.innerHTML = rows.map((r, i) => {
      const langLabel = (langByCode[r.lang_code] && langByCode[r.lang_code].name_zh) || r.lang_code || '';
      return `<div class="board-row">
        <span class="board-rank">${i+1}</span>
        <span class="board-name">${escapeHtmlM(r.player)}</span>
        <span class="board-lang">${escapeHtmlM(langLabel)}</span>
        <span class="board-score">${r.score}</span>
      </div>`;
    }).join('');
  } catch(e){
    boardList.innerHTML = '<div class="board-empty">排行榜載入失敗，請稍後再試</div>';
  }
}
// 排行榜資料含玩家自訂顯示名稱，做基本 HTML escape 避免 innerHTML 注入。
function escapeHtmlM(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
}
function openBoardOverlay(){
  if (boardOverlay) boardOverlay.hidden = false;
  loadLeaderboardM();
}
function closeBoardOverlay(){
  if (boardOverlay) boardOverlay.hidden = true;
}
if (acctBarBoardBtn) acctBarBoardBtn.addEventListener('click', openBoardOverlay);
if (ovBoardBtn) ovBoardBtn.addEventListener('click', openBoardOverlay);
if (boardCloseBtn) boardCloseBtn.addEventListener('click', closeBoardOverlay);

// ─────────────────────────────────────────────────────────────
// 出題
// ─────────────────────────────────────────────────────────────
function pick(){
  return pool[Math.floor(Math.random() * pool.length)];
}
function shuffle(a){
  const arr = a.slice();
  for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

// 每種模式共用同一套「敵人下落 / 射箭 / 扣血」框架，只換底部「答題互動」層。
// nextWord 依 currentMode 分支：'tiles'（點字母磚）走 setupTilesRound，
// 'choice'（點選項）走 setupChoiceRound。完成條件都收斂到 completeWord()。
function nextWord(){
  const mode = MODES[currentMode] || MODES[DEFAULT_MODE];
  const v = pick();
  const letters = Array.from(v.word);   // 碼位安全，保留大小寫與特殊字元
  current = {
    word: v.word,
    letters,                            // 正確順序
    zh: v.zh, cat: v.cat, audio: v.audio, image: v.image,
    prey: v,                            // 保留原詞物件（選項關生誘答/比對用）
    mode: mode.key,
    _locked: false,
  };
  progress = 0;
  // 敵人由頂部生成（螢幕座標：負值=從畫面上緣外進場）
  prey = { y: playH * CFG.PREY_START_Y_RATIO - 60, spriteIdx: Math.floor(Math.random()*PREY_SPRITES.length) };

  // 線索（詞義卡/音檔/圖片）依模式決定顯不顯示族語詞、放不放音、露不露圖
  buildCue(mode, v);

  // 底部互動層：點字母磚 or 點選項
  if (mode.interaction === 'choice'){
    setupChoiceRound(mode, v);
  } else {
    setupTilesRound(mode, letters);
  }

  wordsSeen++;                   // 這一題已出（影響下一題是否還在鷹架範圍）

  // 測試鉤子：?debug=1 時把目前題目暴露到 window，供自動化驗證用（不影響遊玩邏輯）
  if (query('debug') === '1'){
    window.__mobileDebug = {
      get mode(){ return currentMode; },
      get interaction(){ return (MODES[currentMode]||{}).interaction; },
      get word(){ return current ? current.word : null; },
      get letters(){ return current ? current.letters.slice() : []; },
      get progress(){ return progress; },
      get needCh(){ return current ? nextNeededIndex()>=0 ? current.letters[nextNeededIndex()] : null : null; },
      score(){ return score; }, combo(){ return combo; }, hp(){ return hp; },
      // 鷹架提示狀態（驗證用）
      get wordsSeen(){ return wordsSeen; },
      get hintActive(){ return hintRow ? !hintRow.hidden : false; },
      get hintText(){ return hintRow ? hintRow.textContent : ''; },
      get hintOpacity(){ return hintRow ? parseFloat(hintRow.style.opacity || '0') : 0; },
      // 語別狀態（多語別驗證用）
      get lang(){ return currentLang.code; },
      get langName(){ return currentLang.nameZh; },
      get poolSize(){ return pool.length; },
      get tileChars(){ return tileState.map(t => t.ch); },
      // 選項關（音選詞/看圖選詞）驗證用
      get choiceCount(){ return choiceRow ? choiceRow.children.length : 0; },
      get correctChoiceIdx(){ return _choiceState.correctIdx; },
      tapChoice(i){ const b = choiceRow && choiceRow.children[i]; if (b) b.click(); },
    };
  }
}

// 目前「下一個需要點的字母」在 current.letters 的索引（填空關會跳過預填格）。
// 回 -1 表示全部已填（拼完）。
function nextNeededIndex(){
  if (!current) return -1;
  for (let i=0;i<current.letters.length;i++){
    if (!current.filled || !current.filled[i]) return i;
  }
  return -1;
}

// ── 線索：依模式顯示中文詞義卡 / 音檔鈕 / 圖片線索 ──
function buildCue(mode, v){
  // 中文詞義卡：拼字關/填空關顯示（幫助知道要拼哪個詞）；選詞關不顯示中文（靠聽/靠圖）
  if (mode.showZh){
    wmZh.textContent = v.zh;
    wmCat.textContent = v.cat || '';
    wordMeaning.hidden = false;
  } else {
    wordMeaning.hidden = true;
  }
  // 音檔鈕：模式要放音且該詞有音檔才顯示
  if (mode.playAudio && v.audio){
    audioBtn.hidden = false;
    audioEl = new Audio(v.audio);
    audioEl.play().catch(()=>{});    // 自動放一次（使用者已互動過 startBtn）
  } else {
    audioBtn.hidden = true; audioEl = null;
  }
  // 圖片線索卡（看圖選詞）：疊在遊戲區中央上方；無圖時退化為顯示中文（至少可作答）
  if (cueImageWrap){
    if (mode.key === 'choice-image'){
      if (v.image){
        cueImage.src = v.image;
        cueImage.hidden = false;
        cueImageWrap.classList.remove('cue-fallback-zh');
        cueImageWrap.querySelector('.cue-fallback')?.remove();
        cueImageWrap.hidden = false;
      } else {
        // 無圖備援：顯示中文，避免看圖關無圖無法作答
        cueImage.hidden = true;
        cueImageWrap.classList.add('cue-fallback-zh');
        let fb = cueImageWrap.querySelector('.cue-fallback');
        if (!fb){ fb = document.createElement('div'); fb.className = 'cue-fallback'; cueImageWrap.appendChild(fb); }
        fb.textContent = v.zh;
        cueImageWrap.hidden = false;
      }
    } else {
      cueImageWrap.hidden = true;
    }
  }
}

// ── tiles 互動關（聽打 / 填空）：建進度格 + 字母磚 ──
function setupTilesRound(mode, letters){
  // 顯示底部拼字 UI，隱藏選項 UI
  if (progressRow) progressRow.hidden = false;
  if (tileRow) tileRow.hidden = false;
  if (clearBtn) clearBtn.parentElement && (clearBtn.parentElement.hidden = false);
  if (choiceRow) choiceRow.hidden = true;

  // 填空關：預填一部分字母（露出 word 的部分），玩家只補「缺的格」。
  //  - givenMask[i]=true：第 i 格是「預先露出」的字母（不可被 clear 清掉、不上磚）。
  //  - filled[i]=true：第 i 格目前已有字母（含 given 與玩家補上的），拼完＝全 true。
  // 聽打關 givenMask 全 false（整詞都要拼）。
  current.givenMask = new Array(letters.length).fill(false);
  if (mode.key === 'blank'){
    const blanks = pickBlankPositions(letters.length);
    for (let i=0;i<letters.length;i++){ if (!blanks.has(i)) current.givenMask[i] = true; }
  }
  current.filled = current.givenMask.slice();   // 起始已填＝預先露出的格

  buildProgress(letters);
  buildTiles(mode, letters);
  // 半透明全拼鷹架只給「聽打」關的開局前幾題（填空本身已露字母、選項關不拼字，故不給）
  if (mode.key === 'spell-listen') buildHint(letters);
  else { cancelAnimationFrame(hintFadeRaf); if (hintRow){ hintRow.hidden = true; hintRow.style.opacity='0'; } }
}

// 填空缺格位置：詞長 <5 缺 1 格、>=5 缺 2 格；不缺首格（首格當定位錨）；避免相鄰重疊。
function pickBlankPositions(n){
  const set = new Set();
  const want = n >= 5 ? 2 : 1;
  const candidates = [];
  for (let i=1;i<n;i++) candidates.push(i);   // 從第 2 格起（保留首格露出）
  const sh = shuffle(candidates);
  for (const i of sh){ if (set.size >= want) break; if (set.has(i-1)||set.has(i+1)) continue; set.add(i); }
  if (!set.size && n>1) set.add(n-1);          // 保底至少缺 1 格
  return set;
}

// ── 第一關半透明拼字提示：顯示正確拼字（族語，含特殊字元），隨時間淡出 ──
// 只在「開局前 N 題」出現，作為初學鷹架；不影響點磚判定（純視覺覆蓋層）。
function buildHint(letters){
  cancelAnimationFrame(hintFadeRaf);
  if (!hintRow) return;
  // 是否還在第一關鷹架範圍：wordsSeen 為「已出題數」，本題序號 = wordsSeen（0-based）
  const withinFirstStage = CFG.HINT_ENABLED && wordsSeen < CFG.HINT_FIRST_N_WORDS;
  if (!withinFirstStage){
    hintRow.hidden = true;
    hintRow.textContent = '';
    hintRow.style.opacity = '0';
    return;
  }
  // 顯示完整正確拼字（Array.from 保留碼位順序，太魯閣語特殊字元如 ʼ 正確顯示）
  hintRow.textContent = letters.join('');
  hintRow.hidden = false;
  hintRow.style.opacity = String(CFG.HINT_START_OPACITY);

  const start = performance.now();
  const from = CFG.HINT_START_OPACITY, to = CFG.HINT_MIN_OPACITY;
  const delay = CFG.HINT_FADE_DELAY_MS, dur = Math.max(1, CFG.HINT_FADE_MS);
  function tick(now){
    // 換題 / 遊戲結束時停止（buildHint 會 cancel，這裡再保險一次）
    if (state !== 'playing'){ return; }
    const elapsed = now - start - delay;
    if (elapsed <= 0){
      hintRow.style.opacity = String(from);
    } else {
      const p = Math.min(1, elapsed / dur);
      hintRow.style.opacity = String(from + (to - from) * p);
      if (p >= 1){
        if (to <= 0) hintRow.hidden = true;   // 完全淡出就隱藏，省繪製
        return;                                // 淡出完成，停止動畫
      }
    }
    hintFadeRaf = requestAnimationFrame(tick);
  }
  hintFadeRaf = requestAnimationFrame(tick);
}

// 建字母磚。聽打：整個詞打散上磚。填空：只把「缺格」的字母打散上磚（缺幾個字母就幾顆磚）。
function buildTiles(mode, letters){
  tileRow.innerHTML = '';
  tileState = [];
  // 需要玩家點的字母＝未預填的格（filled[i]===false）。填空關只上這些；聽打關全部。
  const need = [];
  for (let i=0;i<letters.length;i++){ if (!current.filled || !current.filled[i]) need.push(letters[i]); }
  const order = shuffle(need.map((ch,i)=>({ch, srcIdx:i})));
  order.forEach(item => {
    const el = document.createElement('button');
    el.className = 'tile';
    el.type = 'button';
    el.textContent = item.ch;
    el.setAttribute('aria-label', '字母 ' + item.ch);
    const rec = { ch:item.ch, used:false, el };
    el.addEventListener('click', () => onTapTile(rec));
    tileRow.appendChild(el);
    tileState.push(rec);
  });
}

// 建拼字進度格。預填格（填空關露出的字母）直接顯示字母並標 filled；缺格顯示底線待補。
function buildProgress(letters){
  progressRow.innerHTML = '';
  for (let i=0;i<letters.length;i++){
    const s = document.createElement('div');
    s.className = 'slot';
    if (current.filled && current.filled[i]){
      s.textContent = letters[i];
      s.classList.add('given');           // 預先露出的字母（填空關），淡金色、非玩家所填
    } else {
      s.textContent = '';
    }
    progressRow.appendChild(s);
  }
}

// ─────────────────────────────────────────────────────────────
// 點磚判定（重複字母以「進度位置」判定，不只比字元）
// ─────────────────────────────────────────────────────────────
function onTapTile(rec){
  if (state !== 'playing' || !current || current._locked) return;
  if (rec.used) return;
  const idx = nextNeededIndex();               // 下一個要補的格（跳過填空預填格）
  if (idx < 0) return;
  const needCh = current.letters[idx];         // 該格需要的字母

  if (rec.ch === needCh){
    // 正確：即使字串相同的磚有很多顆，任一顆對的字元都可鎖定「這一格」，
    // 判定依「位置」前進，不會因為點到另一顆相同字母的磚而算錯（重複字母判定）。
    rec.used = true;
    rec.el.classList.remove('wrong');
    rec.el.classList.add('selected');
    setTimeout(()=>{ rec.el.classList.remove('selected'); rec.el.classList.add('locked'); }, 140);
    // 填進度格
    const slot = progressRow.children[idx];
    if (slot){ slot.textContent = rec.ch; slot.classList.add('filled'); }
    current.filled[idx] = true;
    progress++;
    correctTaps++; totalTaps++;
    if (nextNeededIndex() < 0){                 // 全部格都填好 → 完成
      completeWord();
    }
  } else {
    // 錯：不扣血(預設)，視覺 + 震動
    totalTaps++;
    rec.el.classList.remove('wrong'); void rec.el.offsetWidth; // reflow 重觸動畫
    rec.el.classList.add('wrong');
    setTimeout(()=>rec.el.classList.remove('wrong'), 340);
    if (navigator.vibrate) navigator.vibrate(CFG.VIBRATE_WRONG);
    if (CFG.WRONG_DEDUCT_HP){ hp--; updateHUD(); if (hp<=0) gameOver(); }
  }
}

// ─────────────────────────────────────────────────────────────
// 選項點選關（音選詞 / 看圖選詞）：4 個族語詞選項，點正確的射箭；點錯不扣血只回饋。
//   誘答用 Levenshtein 相似度從全池挑（與桌機同概念、獨立實作，不呼叫桌機函式）。
// ─────────────────────────────────────────────────────────────
let _choiceState = { correctIdx:-1, locked:false };

// 編輯距離（Levenshtein）：越小越像，用來挑「像的」誘答。
function levenshtein(a, b){
  a = a || ''; b = b || '';
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = new Array(n+1);
  for (let j=0;j<=n;j++) prev[j] = j;
  for (let i=1;i<=m;i++){
    let cur = [i];
    for (let j=1;j<=n;j++){
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+cost);
    }
    prev = cur;
  }
  return prev[n];
}

// 產生 N 個選項 = 正解 + (N-1) 個相似誘答（去同義、去重複詞）。
function buildChoiceOptions(correct){
  const N = CFG.CHOICE_OPTION_COUNT;
  const correctWord = correct.word;
  const correctLc = correctWord.toLowerCase();
  const correctZh = (correct.zh || '').trim();
  const src = (allPool && allPool.length) ? allPool : pool;
  // 排除正解本身與同義（同族語詞或同中文）
  const candidates = src.filter(p => {
    if (p.word === correctWord) return false;
    if ((p.zh||'').trim() && (p.zh||'').trim() === correctZh) return false;
    return true;
  });
  const startCh = correctLc[0] || '';
  const scored = candidates.map(p => {
    const w = p.word.toLowerCase();
    let s = levenshtein(correctLc, w);
    if (w[0] === startCh) s -= 3;
    s += Math.abs(w.length - correctLc.length);
    if (p.cat && correct.cat && p.cat === correct.cat) s -= 2;
    return { p, s };
  });
  scored.sort((a,b)=>a.s-b.s);
  const picked = [];
  const usedWords = new Set([correctWord]);
  for (const { p } of scored){
    if (picked.length >= N-1) break;
    if (usedWords.has(p.word)) continue;
    usedWords.add(p.word); picked.push(p);
  }
  // 池太小補不足 → 隨機補
  if (picked.length < N-1){
    for (const p of shuffle(candidates)){
      if (picked.length >= N-1) break;
      if (usedWords.has(p.word)) continue;
      usedWords.add(p.word); picked.push(p);
    }
  }
  const opts = [{ prey:correct, word:correctWord, isCorrect:true }]
    .concat(picked.map(p => ({ prey:p, word:p.word, isCorrect:false })));
  return shuffle(opts);
}

// 建選項關 UI：隱藏拼字磚/進度格，顯示 2×2 選項網格。
function setupChoiceRound(mode, v){
  if (progressRow) progressRow.hidden = true;
  if (tileRow) tileRow.hidden = true;
  if (clearBtn && clearBtn.parentElement) clearBtn.parentElement.hidden = true;
  cancelAnimationFrame(hintFadeRaf);
  if (hintRow){ hintRow.hidden = true; hintRow.style.opacity = '0'; }
  if (!choiceRow) return;
  choiceRow.hidden = false;
  choiceRow.innerHTML = '';
  _choiceState = { correctIdx:-1, locked:false };
  const opts = buildChoiceOptions(v);
  opts.forEach((opt, i) => {
    if (opt.isCorrect) _choiceState.correctIdx = i;
    const b = document.createElement('button');
    b.className = 'choice-opt';
    b.type = 'button';
    b.textContent = opt.word;      // Array.from 不需要：textContent 直接吃碼位，特殊字元正確顯示
    b.setAttribute('aria-label', '選項 ' + opt.word);
    b.addEventListener('click', () => onTapChoice(opt, b));
    choiceRow.appendChild(b);
  });
}

// 點選項判定：對 → 完成射箭；錯 → 標紅+震動、不扣血（第一版與拼字關一致）。
function onTapChoice(opt, btn){
  if (state !== 'playing' || !current || current._locked || _choiceState.locked) return;
  totalTaps++;
  if (opt.isCorrect){
    correctTaps++;
    _choiceState.locked = true;
    btn.classList.add('correct');
    completeWord();
  } else {
    btn.classList.remove('wrong'); void btn.offsetWidth;
    btn.classList.add('wrong');
    btn.disabled = true;           // 點錯的選項禁用，避免重複點
    setTimeout(()=>btn.classList.remove('wrong'), 340);
    if (navigator.vibrate) navigator.vibrate(CFG.VIBRATE_WRONG);
    if (CFG.CHOICE_WRONG_DEDUCT_HP){ hp--; updateHUD(); if (hp<=0) gameOver(); }
  }
}

// clear：清除當前拼字，磚全部復位
// clear：清除玩家「已補的字母」讓磚復位；保留填空關預先露出的字母（given 格不清）。
function clearSpelling(){
  if (state!=='playing' || !current || current._locked) return;
  if (current.mode && MODES[current.mode] && MODES[current.mode].interaction === 'choice') return; // 選項關無 clear
  progress = 0;
  tileState.forEach(r => { r.used=false; r.el.classList.remove('locked','selected','wrong'); });
  const letters = current.letters;
  [...progressRow.children].forEach((s, i) => {
    if (current.givenMask && current.givenMask[i]){
      // 預填格：保留露出的字母、維持 filled=true
      s.textContent = letters[i]; s.classList.remove('filled');
      current.filled[i] = true;
    } else {
      s.textContent=''; s.classList.remove('filled');
      current.filled[i] = false;
    }
  });
}
clearBtn.addEventListener('click', clearSpelling);

// ─────────────────────────────────────────────────────────────
// 單字完成 → 往上射箭 → 擊中 → 加分/combo
// ─────────────────────────────────────────────────────────────
// 依累積擊殺數算里程碑等級（0-9→1、10-19→2…40+→5，上限 MILESTONE_MAX_LEVEL）。
// 純函式，跟 HP/endless/出題節奏無關，只用來驅動 HUD 顯示與跨關輕量反饋。
function computeMilestoneLevel(killCount){
  const lvl = Math.floor(killCount / CFG.MILESTONE_KILLS_PER_LEVEL) + 1;
  return Math.min(CFG.MILESTONE_MAX_LEVEL, lvl);
}

// 跨門檻時的輕量反饋：短暫提示條 + 震動，不中斷遊戲迴圈、不跳 modal。
function showLevelUpToast(){
  if (!levelUpToast) return;
  levelUpToast.hidden = false;
  levelUpToast.textContent = 'LEVEL ' + milestoneLevel + '!';
  // 觸發 CSS transition：先移除再強制 reflow 再加回，確保每次都重新播放
  levelUpToast.classList.remove('show'); void levelUpToast.offsetWidth;
  levelUpToast.classList.add('show');
  if (navigator.vibrate) navigator.vibrate([0,25,60,25]);
  clearTimeout(showLevelUpToast._t);
  showLevelUpToast._t = setTimeout(() => { levelUpToast.classList.remove('show'); }, CFG.LEVEL_UP_TOAST_MS);
}

function completeWord(){
  combo++;
  const gained = CFG.BASE_SCORE + (combo-1)*CFG.COMBO_BONUS;
  score += gained;
  kills++;
  const newMilestone = computeMilestoneLevel(kills);
  if (newMilestone > milestoneLevel){
    milestoneLevel = newMilestone;
    showLevelUpToast();
  }
  updateHUD();
  if (navigator.vibrate) navigator.vibrate(CFG.VIBRATE_HIT);
  // 射箭：從獵人(底部中央)往上飛向 prey（螢幕座標）
  const hunterX = VW/2, hunterY = playH - hunterFootOffset() - S(60);
  arrows.push({ x:hunterX, y:hunterY, tgtY: prey ? prey.y + S(60) : 0, done:false });
  // 鎖住輸入直到箭命中（在 update 內處理 prey 消失、下一題）
  current._locked = true;
  wordMeaning.hidden = true;
  audioBtn.hidden = true;
  if (cueImageWrap) cueImageWrap.hidden = true;   // 收圖片線索卡
  // 拼完即收提示（避免淡出動畫殘留到射箭動畫期間）
  cancelAnimationFrame(hintFadeRaf);
  if (hintRow){ hintRow.hidden = true; hintRow.style.opacity = '0'; }
}

// ─────────────────────────────────────────────────────────────
// HUD
// ─────────────────────────────────────────────────────────────
function updateHUD(){
  hpNum.textContent = hp;
  hpFill.style.width = Math.max(0, (hp / CFG.START_HP) * 100) + '%';
  scoreNum.textContent = score;
  comboNum.textContent = combo;
  comboNum.classList.toggle('hot', combo >= 3);
  if (levelNum) levelNum.textContent = milestoneLevel;
}

// ─────────────────────────────────────────────────────────────
// 主迴圈
// ─────────────────────────────────────────────────────────────
function loop(t){
  if (state !== 'playing'){ return; }
  const dt = Math.min(0.05, (t - lastT)/1000 || 0);
  lastT = t;
  update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}

// 危險線 y（螢幕座標）＆獵人腳部離底距離：全部以可視高度 playH 為準，永不裁切。
function dangerY(){ return playH - S(CFG.DANGER_LINE_FROM_BOTTOM); }
function hunterFootOffset(){ return S(8); }   // 獵人腳底離畫面底的距離

function update(dt){
  // 敵人下降（速度隨 combo 增加，製造時間壓力）
  if (prey && !(current && current._locked)){
    let spd = S(Math.min(CFG.PREY_SPEED_MAX, CFG.PREY_FALL_SPEED + combo*CFG.PREY_SPEED_PER_COMBO));
    if (window.__mobileFastFall) spd *= window.__mobileFastFall;   // 測試用快轉，正常玩不觸發
    prey.y += spd * dt;
    if (prey.y >= dangerY()){
      // 越過危險線：扣血、combo 歸零、換題
      hp--; combo = 0; updateHUD();
      prey = null;
      if (hp <= 0){ gameOver(); return; }
      nextWord();
    }
  }
  // 箭上飛
  for (const a of arrows){
    a.y -= CFG.ARROW_SPEED * dt;
    if (!a.done && a.y <= a.tgtY){
      a.done = true;
      // 命中：prey 消失，換下一題
      prey = null;
      setTimeout(()=>{ if (state==='playing') nextWord(); }, 120);
    }
  }
  arrows = arrows.filter(a => a.y > -40 && !a.done || (a.done && a.y > a.tgtY-60));
  if (arrows.every(a=>a.done)) arrows = arrows.filter(a=>!a.done);
}

// ─────────────────────────────────────────────────────────────
// 繪製：縱向軸走螢幕座標(SY=identity)，水平以 VW 置中(SX)，尺寸用 S。
// 獵人恆貼可視底部、危險線恆在其前方，任何長寬比都不裁切。
// ─────────────────────────────────────────────────────────────
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const footY = playH - hunterFootOffset();   // 獵人腳底(螢幕座標)

  // 地面（獵人腳下漸層），貼可視底部
  ctx.save();
  const groundY = footY - S(40);
  const g = ctx.createLinearGradient(0, groundY, 0, playH);
  g.addColorStop(0, 'rgba(20,60,10,0.0)');
  g.addColorStop(1, 'rgba(10,40,6,0.85)');
  ctx.fillStyle = g;
  ctx.fillRect(0, groundY, playW, playH - groundY);
  ctx.restore();

  // 危險線（獵人前方固定距離）
  const dy = dangerY();
  ctx.save();
  ctx.strokeStyle = 'rgba(214,69,69,0.75)';
  ctx.lineWidth = Math.max(2, S(3));
  ctx.setLineDash([S(14), S(10)]);
  ctx.beginPath(); ctx.moveTo(0, dy); ctx.lineTo(playW, dy); ctx.stroke();
  ctx.restore();

  // 敵人（由上而下）
  if (prey){
    const img = PREY_SPRITES[prey.spriteIdx];
    const pw = S(120), ph = S(120);
    const px = SX(VW/2) - pw/2, py = prey.y;
    if (img && img.complete && img.naturalWidth){
      ctx.drawImage(img, px, py, pw, ph);
    } else {
      ctx.fillStyle = '#7a4a20'; ctx.beginPath();
      ctx.arc(SX(VW/2), py+ph/2, pw/2, 0, Math.PI*2); ctx.fill();
    }
  }

  // 箭（向上）
  for (const a of arrows){
    if (a.done) continue;
    const ax = SX(a.x);
    ctx.save();
    ctx.strokeStyle = '#e8d8a0'; ctx.lineWidth = Math.max(2, S(4));
    ctx.beginPath(); ctx.moveTo(ax, a.y); ctx.lineTo(ax, a.y+S(34)); ctx.stroke();
    ctx.fillStyle = '#cfae6a'; ctx.beginPath();
    ctx.moveTo(ax, a.y-S(2));
    ctx.lineTo(ax-S(7), a.y+S(10));
    ctx.lineTo(ax+S(7), a.y+S(10));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // 獵人（底部中央，站姿瞄準）。現有 sprite 為側身朝右瞄準；
  // 直接旋轉會讓身體倒下，改為站姿微幅上仰，用「箭往上飛」表達向上射擊。
  const hImg = IMG.hunter;
  const hw = S(150), hh = S(150);
  const hx = SX(VW/2), hy = footY;
  if (hImg && hImg.complete && hImg.naturalWidth){
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-0.30);                     // 小幅上仰
    ctx.drawImage(hImg, -hw/2, -hh, hw, hh);
    ctx.restore();
  } else {
    ctx.fillStyle = '#c8a06a';
    ctx.beginPath(); ctx.arc(hx, hy-S(20), S(30), 0, Math.PI*2); ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────────
// 模式選擇
// ─────────────────────────────────────────────────────────────
const MODE_STORAGE_KEY = 'hunter_mobile_mode';
function readSavedMode(){ try { return localStorage.getItem(MODE_STORAGE_KEY); } catch(e){ return null; } }
function saveMode(k){ try { localStorage.setItem(MODE_STORAGE_KEY, k); } catch(e){} }

// 建開始畫面的 4 顆模式選擇器（≥44px、直式、jungle 風、無 emoji）。選中高亮。
function buildModePicker(){
  if (!modePicker) return;
  modePicker.innerHTML = '';
  MODE_ORDER.forEach((key, i) => {
    const m = MODES[key];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mode-opt' + (key === currentMode ? ' active' : '');
    b.dataset.mode = key;
    b.innerHTML =
      `<span class="mode-opt-no">${i+1}</span>` +
      `<span class="mode-opt-body"><span class="mode-opt-name">${escapeHtmlM(m.label)}</span>` +
      `<span class="mode-opt-desc">${escapeHtmlM(m.desc)}</span></span>`;
    b.setAttribute('aria-label', m.label + '：' + m.desc);
    b.addEventListener('click', () => selectMode(key));
    modePicker.appendChild(b);
  });
}
function refreshModePickerActive(){
  if (!modePicker) return;
  [...modePicker.children].forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode));
}
// HUD 當前模式徽章
function refreshModeBadge(){
  if (!modeBadge) return;
  const m = MODES[currentMode] || MODES[DEFAULT_MODE];
  modeBadge.textContent = m.label;
}
// 開始畫面「怎麼玩」說明卡：依當前模式換標題與步驟（各模式互動不同，說明要對應）。
function refreshHowto(){
  const m = MODES[currentMode] || MODES[DEFAULT_MODE];
  if (howtoTitleText) howtoTitleText.textContent = m.howtoTitle || ('怎麼玩 · ' + m.label);
  if (howtoSteps && Array.isArray(m.howto)){
    howtoSteps.innerHTML = m.howto.map(s => '<li><span class="howto-txt">' + s + '</span></li>').join('');
  }
}

// 選模式：更新狀態 + localStorage + UI，重載該模式所需詞池（不同 filter 才實際重抓）。
async function selectMode(key){
  if (!MODES[key]) return;
  currentMode = key;
  saveMode(key);
  refreshModePickerActive();
  refreshModeBadge();
  refreshHowto();
  clearLangError();
  startBtn.textContent = '載入中…'; startBtn.disabled = true;
  const r = await loadPool();
  startBtn.disabled = false;
  if (!r.ok){
    showLangError(currentLang.nameZh + ' 的「' + MODES[key].label + '」詞彙載入失敗，請換模式或語別再試。');
    startBtn.textContent = '重試';
  } else {
    startBtn.textContent = state === 'over' ? '再玩一次' : '開始遊戲';
  }
}

// ─────────────────────────────────────────────────────────────
// 遊戲流程
// ─────────────────────────────────────────────────────────────
function startGame(){
  hp = CFG.START_HP; score = 0; combo = 0; kills = 0;
  correctTaps = 0; totalTaps = 0;
  arrows = []; prey = null;
  milestoneLevel = 1;                  // 每局重新從里程碑 LEVEL1 開始
  wordsSeen = 0;                       // 重置鷹架計數：每局重新從第一關開始給提示
  cancelAnimationFrame(hintFadeRaf);
  refreshModeBadge();
  updateHUD();
  overlay.classList.add('hidden'); overlay.hidden = true;
  state = 'playing';
  nextWord();
  lastT = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

// 送分（只有已登入呼叫；訪客完全不打這支 API）。只送「這局最高里程碑等級」一筆，
// 不會每跨一個門檻就送一筆（那個邏輯在 completeWord 的 showLevelUpToast，純視覺不送分）。
//
// ⚠️ 已知風險（前端無法自行解決，如實送出、不偽造資料）：/api/scores 會拒絕
// level 高於 getUnlockedLevel() 的請求（該函式以 scores 表 cleared=1 的最高
// level+1 計算，新帳號從 1 開始）。手機 endless 模式沒有「過關」概念，若某局
// 一路衝到里程碑 LEVEL3 但帳號還沒解鎖到 3，這裡如實送 level:milestoneLevel、
// cleared:false（endless 沒有「過關」這件事，不謊報 cleared 去騙後端解鎖），
// 後端可能回 403、這筆分數就送不進去。這是 endless 模式硬塞進「回合制解鎖」
// API 的真實摩擦，不是前端能私自修的東西——已在方案提案中向主管說明過，
// 這裡選擇「如實送出、失敗就放棄」而非「偽造 cleared 騙過驗證」，避免寫入
// 不實的過關紀錄污染 scores 表。403 會被下面的 catch/res.ok 檢查吃掉，不擋結算畫面。
async function submitMobileScore(){
  if (AUTH.isGuest) return;   // 訪客：不送分、不進榜
  const acc = totalTaps ? Math.round(correctTaps/totalTaps*100) : 0;
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...mobileAuthHeaders() },
      body: JSON.stringify({
        level: milestoneLevel,
        score,
        kills,
        accuracy: acc,
        combo,
        cleared: false,
        lang_code: currentLang.code,
        platform: 'mobile',
      })
    });
    const data = await res.json();
    if (res.ok && typeof data.unlockedLevel === 'number') AUTH.unlockedLevel = data.unlockedLevel;
    if (!res.ok) console.warn('[mobile] 送分失敗（可能是里程碑等級尚未解鎖）', data && data.error);
  } catch(e){
    // 網路失敗靜默處理，不擋結算畫面
  }
}

function gameOver(){
  state = 'over';
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(hintFadeRaf);
  if (hintRow){ hintRow.hidden = true; hintRow.style.opacity = '0'; }
  wordMeaning.hidden = true; audioBtn.hidden = true;
  if (cueImageWrap) cueImageWrap.hidden = true;
  ovTitle.textContent = '遊戲結束';
  const m = MODES[currentMode] || MODES[DEFAULT_MODE];
  ovSub.textContent = '模式：' + m.label;
  if (howto) howto.hidden = true;            // 結算畫面不顯示玩法說明，讓位給成績
  const acc = totalTaps ? Math.round(correctTaps/totalTaps*100) : 0;
  ovStats.hidden = false;
  ovStats.innerHTML = `
    <div class="ov-stat"><span class="k">SCORE</span><span class="v">${score}</span></div>
    <div class="ov-stat"><span class="k">KILLS</span><span class="v">${kills}</span></div>
    <div class="ov-stat"><span class="k">ACCURACY</span><span class="v">${acc}%</span></div>
    <div class="ov-stat"><span class="k">MAX COMBO</span><span class="v">${combo}</span></div>`;
  startBtn.textContent = '再玩一次';
  overlay.hidden = false; overlay.classList.remove('hidden');
  submitMobileScore();          // HP 歸零那刻恰好送這一筆；訪客在函式內直接 return 不送
}

startBtn.addEventListener('click', async () => {
  if (!pool.length){
    // 詞池空（多半是非 trv 語別載入失敗）：不硬開局，就地重試載入該語別。
    await applyLang(currentLang.code);
    return;
  }
  clearLangError();
  startGame();
});
audioBtn.addEventListener('click', () => { if (audioEl){ audioEl.currentTime=0; audioEl.play().catch(()=>{}); } });

// ─────────────────────────────────────────────────────────────
// 語別切換
// ─────────────────────────────────────────────────────────────
function showLangError(msg){
  if (!langError) return;
  langError.textContent = msg;
  langError.hidden = false;
}
function clearLangError(){
  if (!langError) return;
  langError.hidden = true;
  langError.textContent = '';
}

// 套用一個語別：更新狀態＋localStorage＋UI，重載該語別詞彙。
// 回開始畫面（不自動開局），讓玩家確認後再開始。
async function applyLang(code){
  currentLang = langObjFromCode(code);
  saveLang(currentLang.code);
  if (langSelect) langSelect.value = currentLang.code;
  refreshLangBar();
  clearLangError();
  startBtn.textContent = '載入中…';
  startBtn.disabled = true;
  const r = await loadPool();
  startBtn.disabled = false;
  if (!r.ok){
    // 非 trv 載入失敗：清空詞池、提示；不誤用太魯閣 fallback 詞。
    showLangError(currentLang.nameZh + ' 詞彙載入失敗，請換一個語別或稍後再試。');
    startBtn.textContent = '重試';
  } else {
    startBtn.textContent = state === 'over' ? '再玩一次' : '開始遊戲';
  }
}

// 開始畫面下拉切換語別
if (langSelect){
  langSelect.addEventListener('change', () => { applyLang(langSelect.value); });
}
// HUD 語別條：遊戲中點擊 → 停局、回開始畫面換語別（維持獨立練習，不送分）
if (langBar){
  langBar.addEventListener('click', () => {
    if (state === 'playing'){
      state = 'menu';
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(hintFadeRaf);
      if (hintRow){ hintRow.hidden = true; hintRow.style.opacity = '0'; }
      wordMeaning.hidden = true; audioBtn.hidden = true;
      prey = null; arrows = [];
    }
    // 顯示開始畫面（保留當前 title/sub，不覆蓋結算畫面數字）
    ovStats.hidden = true;
    if (howto) howto.hidden = false;         // 回開始畫面就再顯示玩法說明
    if (cueImageWrap) cueImageWrap.hidden = true;
    refreshModePickerActive();               // 回選單同步模式高亮
    refreshHowto();
    ovTitle.textContent = '族語射手';
    ovSub.textContent = '點字拼字 · 直式手機版';
    startBtn.textContent = '開始遊戲';
    overlay.hidden = false; overlay.classList.remove('hidden');
  });
}

// ─────────────────────────────────────────────────────────────
// 事件
// ─────────────────────────────────────────────────────────────
window.addEventListener('resize', () => { resize(); checkOrientation(); });
window.addEventListener('orientationchange', () => { setTimeout(()=>{ resize(); checkOrientation(); }, 250); });
// visualViewport：手機瀏覽器位址列收合 / 鍵盤造成的高度變動。
// 只走 resize()（內含 setAppHeight 的 2px 門檻 + rAF 節流），不再每次事件都清重畫布，
// 避免捲動時網址列漸進收合造成畫面忽大忽小。scroll 也綁上：部分瀏覽器收合網址列只發 scroll。
if (window.visualViewport){
  window.visualViewport.addEventListener('resize', resize);
  window.visualViewport.addEventListener('scroll', setAppHeight);
}

// ─────────────────────────────────────────────────────────────
// 啟動
// ─────────────────────────────────────────────────────────────
(async function init(){
  decideEntry();
  // 帳號：有存 token 才驗證（訪客完全不打 /api/auth/*，維持零呼叫）
  const savedToken = readSavedMobileToken();
  if (savedToken){
    AUTH.token = savedToken;
    await refreshMobileAuthMe();
  }
  refreshAcctUI();
  // 玩法模式：localStorage 記住上次選的；?play=<modekey> 可覆寫（測試用）。
  const savedMode = readSavedMode();
  if (savedMode && MODES[savedMode]) currentMode = savedMode;
  const forcedMode = query('play');
  if (forcedMode && MODES[forcedMode]){ currentMode = forcedMode; saveMode(forcedMode); }
  buildModePicker();
  refreshModeBadge();
  refreshHowto();
  // 網址參數 ?lang=<code> 可覆寫（測試用），優先於 localStorage
  await initLang();
  const forced = query('lang');
  if (forced && langByCode[forced]){
    currentLang = langObjFromCode(forced);
    saveLang(currentLang.code);
    if (langSelect) langSelect.value = currentLang.code;
    refreshLangBar();
  }
  const r = await loadPool();
  if (!r.ok){
    showLangError(currentLang.nameZh + ' 詞彙載入失敗，請換一個語別或稍後再試。');
    startBtn.textContent = '重試';
  } else if (state === 'menu'){
    startBtn.textContent = '開始遊戲';
  }
  // 測試便利：?autostart=1 載入後自動開局（僅省去手動點開始，不改任何遊戲邏輯）
  if (query('autostart') === '1' && !app.hidden && pool.length) startGame();
})();

})();
