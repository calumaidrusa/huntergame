const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// 多語別種子：VOCAB = { [lang_code]: rows[] }，LANGUAGES = 語別對照表
const { VOCAB: SEEDS, LANGUAGES: LANG_SEED } = require('./seeds');
const DEFAULT_LANG = 'trv';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || '/var/www/hunter/backend/hunter.db';
const IMG_DIR = process.env.IMG_DIR || '/var/www/hunter/public/images';
const AUDIO_DIR = process.env.AUDIO_DIR || '/var/www/hunter/public/audio';
// 正式環境務必在伺服器上設定 JWT_SECRET 環境變數；本機測試用假預設值即可
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const MAX_LEVEL = 5;

// 確保目錄存在
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

// ── Multer (圖片上傳) ────────────────────────────
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename: (req, file, cb) => {
    const word = req.params.word || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, word + ext);
  }
});
const upload = multer({
  storage: imgStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只接受圖片檔案'));
  }
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AUDIO_DIR),
  filename: (req, file, cb) => {
    const word = req.params.word || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    cb(null, word + ext);
  }
});
const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('只接受音檔'));
  }
});

// ── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json());

// 本機開發用：SERVE_STATIC=1 時額外提供靜態檔案（模擬 Nginx），正式環境不會設定此變數
if (process.env.SERVE_STATIC) {
  const PROJECT_ROOT = path.join(__dirname, '..');
  app.use('/images', express.static(path.join(PROJECT_ROOT, 'public', 'images'))); // repo 內既有圖片
  app.use('/images', express.static(IMG_DIR)); // 上傳測試用（可能與上面同一目錄）
  app.use('/audio', express.static(path.join(PROJECT_ROOT, 'public', 'audio')));
  app.use('/audio', express.static(AUDIO_DIR));
  app.use(express.static(path.join(PROJECT_ROOT, 'public'))); // admin.html 等
  app.use(express.static(PROJECT_ROOT)); // hunter-truku-v2.html（此 repo 版面放在專案根目錄）
}

// ── Database 初始化 ─────────────────────────────
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    player    TEXT    NOT NULL DEFAULT '獵人',
    level     INTEGER NOT NULL,
    score     INTEGER NOT NULL,
    kills     INTEGER NOT NULL DEFAULT 0,
    accuracy  INTEGER NOT NULL DEFAULT 0,
    combo     INTEGER NOT NULL DEFAULT 0,
    created_at TEXT   NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    date      TEXT PRIMARY KEY,
    games     INTEGER DEFAULT 0,
    players   INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    word       TEXT NOT NULL,
    chinese    TEXT,
    english    TEXT,
    category   TEXT DEFAULT 'general',
    level      INTEGER NOT NULL DEFAULT 1,
    emoji      TEXT DEFAULT '🎯',
    image_path TEXT,
    audio_path TEXT,
    hint       TEXT,
    active     INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS players (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS languages (
    lang_code   TEXT PRIMARY KEY,
    dialect_id  INTEGER NOT NULL,
    name_zh     TEXT NOT NULL,
    name_native TEXT,
    active      INTEGER DEFAULT 1
  );
`);

// 欄位 migration（舊 DB 補上新欄位；欄位已存在時 catch 掉錯誤即可，不影響既有資料）
try {
  db.exec('ALTER TABLE vocabulary ADD COLUMN audio_path TEXT');
} catch(e) { /* 欄位已存在，跳過 */ }

try {
  db.exec('ALTER TABLE scores ADD COLUMN player_id INTEGER');
} catch(e) { /* 欄位已存在，跳過 */ }

try {
  db.exec('ALTER TABLE scores ADD COLUMN cleared INTEGER DEFAULT 0');
} catch(e) { /* 欄位已存在，跳過 */ }

// ── 多語別 migration ──
// vocabulary.lang_code：DEFAULT 'trv' → 既有 1092 筆自動標注太魯閣語，零資料搬移。
try {
  db.exec(`ALTER TABLE vocabulary ADD COLUMN lang_code TEXT NOT NULL DEFAULT 'trv'`);
} catch(e) { /* 欄位已存在，跳過 */ }
// 複合索引：以 (lang_code, level, active) 篩選出題池
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_vocab_lang_level ON vocabulary(lang_code, level, active)');
} catch(e) { /* 已存在 */ }
// scores.lang_code：DEFAULT 'trv' → Kacaw 等既有紀錄自動標注太魯閣語，一筆不動。
// 只作標注，不參與解鎖/聚合，故不加索引。
try {
  db.exec(`ALTER TABLE scores ADD COLUMN lang_code TEXT NOT NULL DEFAULT 'trv'`);
} catch(e) { /* 欄位已存在，跳過 */ }

// ── languages 表 seed（逐筆 upsert；name/active 以 seed 為準，已存在則更新後設欄位）──
{
  const upLang = db.prepare(`
    INSERT INTO languages (lang_code, dialect_id, name_zh, name_native, active)
    VALUES (@lang_code, @dialect_id, @name_zh, @name_native, @active)
    ON CONFLICT(lang_code) DO UPDATE SET
      dialect_id=excluded.dialect_id, name_zh=excluded.name_zh,
      name_native=excluded.name_native, active=excluded.active
  `);
  const seedLangs = db.transaction((rows) => { for (const r of rows) upLang.run(r); });
  seedLangs(LANG_SEED.map(l => ({
    lang_code: l.lang_code, dialect_id: l.dialect_id, name_zh: l.name_zh,
    name_native: l.name_native ?? null, active: l.active ? 1 : 0
  })));
}

// 種入詞彙 —— 逐語別：某 lang_code 筆數=0 才種該語別（多帶 lang_code）。
// 好處：加新語別＝丟 seed 檔重啟，不碰既有語別資料；也保留「清單一語別重種」的彈性。
// 既有生產 DB（只有 trv 且已有資料）→ trv 筆數 >0 會跳過，一筆不動；其餘語別若尚未種則補入。
{
  const insert = db.prepare(`
    INSERT INTO vocabulary (word, chinese, english, category, level, emoji, hint, image_path, audio_path, lang_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const countByLang = db.prepare('SELECT COUNT(*) AS c FROM vocabulary WHERE lang_code = ?');
  const seedLang = db.transaction((lang, rows) => {
    for (const r of rows) insert.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], lang);
  });
  for (const [lang, rows] of Object.entries(SEEDS)) {
    const c = countByLang.get(lang).c;
    if (c === 0) seedLang(lang, rows);
  }
}

// ── Helper ──────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

// 驗證 lang_code：存在於 languages 表才採用，否則 fallback 'trv'（向下相容）。
// 未帶（undefined/空字串）也 fallback。
const langExists = db.prepare('SELECT 1 FROM languages WHERE lang_code = ?');
function resolveLang(raw) {
  if (!raw) return DEFAULT_LANG;
  const code = String(raw).trim();
  return langExists.get(code) ? code : DEFAULT_LANG;
}

// 算出某玩家目前解鎖到第幾關：該玩家 cleared=1 的最高 level + 1，上限鎖在 MAX_LEVEL，
// 沒有任何過關紀錄的新玩家從 1 開始。單一事實來源就是 scores 表本身，不額外存欄位。
function getUnlockedLevel(playerId) {
  const row = db.prepare(
    'SELECT COALESCE(MAX(level), 0) AS maxLevel FROM scores WHERE player_id = ? AND cleared = 1'
  ).get(playerId);
  return Math.min(MAX_LEVEL, (row.maxLevel || 0) + 1);
}

// ── 身分驗證 ────────────────────────────────────

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function requirePlayerAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: '請先登入' });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: '登入已過期，請重新登入' });
  }
  if (payload.role !== 'player') return res.status(403).json({ error: '權限不足' });
  const player = db.prepare('SELECT id, username, display_name FROM players WHERE id = ?').get(payload.id);
  if (!player) return res.status(401).json({ error: '帳號不存在' });
  req.player = player;
  next();
}

function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: '請先登入管理員帳號' });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: '登入已過期，請重新登入' });
  }
  if (payload.role !== 'admin') return res.status(403).json({ error: '權限不足' });
  const admin = db.prepare('SELECT id, username FROM admins WHERE id = ?').get(payload.id);
  if (!admin) return res.status(401).json({ error: '帳號不存在' });
  req.admin = admin;
  next();
}

// ── Routes ──────────────────────────────────────

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── 玩家帳號 API ────────────────────────────────

// POST /api/auth/register — { username, password, display_name }
app.post('/api/auth/register', (req, res) => {
  const { username, password, display_name } = req.body || {};
  if (!username || !password || !display_name) {
    return res.status(400).json({ error: '缺少帳號 / 密碼 / 顯示名稱' });
  }
  const uname = String(username).trim();
  const dname = String(display_name).trim().slice(0, 20);
  if (uname.length < 3) return res.status(400).json({ error: '帳號至少需要 3 個字元' });
  if (String(password).length < 4) return res.status(400).json({ error: '密碼至少需要 4 個字元' });
  if (!dname) return res.status(400).json({ error: '顯示名稱不可為空' });

  const existing = db.prepare('SELECT id FROM players WHERE username = ?').get(uname);
  if (existing) return res.status(409).json({ error: '這個帳號已經被使用了' });

  const hash = bcrypt.hashSync(String(password), 10);
  const result = db.prepare(
    'INSERT INTO players (username, password_hash, display_name) VALUES (?, ?, ?)'
  ).run(uname, hash, dname);

  const token = signToken({ id: result.lastInsertRowid, role: 'player' });
  res.json({ success: true, token });
});

// POST /api/auth/login — { username, password }
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: '缺少帳號 / 密碼' });
  const player = db.prepare('SELECT * FROM players WHERE username = ?').get(String(username).trim());
  if (!player || !bcrypt.compareSync(String(password), player.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const token = signToken({ id: player.id, role: 'player' });
  res.json({ success: true, token });
});

// GET /api/auth/me — 需登入
app.get('/api/auth/me', requirePlayerAuth, (req, res) => {
  const unlockedLevel = getUnlockedLevel(req.player.id);
  const totalRow = db.prepare(`
    SELECT COALESCE(SUM(best.score), 0) AS totalScore FROM (
      SELECT level, MAX(score) AS score FROM scores WHERE player_id = ? GROUP BY level
    ) best
  `).get(req.player.id);
  res.json({
    username: req.player.username,
    display_name: req.player.display_name,
    unlockedLevel,
    totalScore: totalRow.totalScore
  });
});

// ── 管理員 API ──────────────────────────────────

// POST /api/admin/login — { username, password }
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: '缺少帳號 / 密碼' });
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(String(username).trim());
  if (!admin || !bcrypt.compareSync(String(password), admin.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const token = signToken({ id: admin.id, role: 'admin' });
  res.json({ success: true, token });
});

// ── 詞彙 API ────────────────────────────────────

// GET /api/vocabulary?lang=trv&level=1&category=animal&active=1&hasImage=1&hasAudio=1
// 不帶 level 時回全難度混合池（五關五玩法改版：關卡=玩法，詞從混合池抽）。
// hasImage/hasAudio 供出題時過濾（看圖選詞只要有圖的詞、聽打只要有音檔的詞）。
// lang 未帶或無效時預設 'trv' → 舊前端/admin.html 不改也照常運作（向下相容）。
app.get('/api/vocabulary', (req, res) => {
  const lang = resolveLang(req.query.lang);
  let sql = 'SELECT * FROM vocabulary WHERE lang_code = ?';
  const params = [lang];
  if (req.query.level)    { sql += ' AND level = ?';    params.push(parseInt(req.query.level)); }
  if (req.query.category) { sql += ' AND category = ?'; params.push(req.query.category); }
  if (req.query.hasImage) { sql += " AND image_path IS NOT NULL AND image_path <> ''"; }
  if (req.query.hasAudio) { sql += " AND audio_path IS NOT NULL AND audio_path <> ''"; }
  if (req.query.active !== 'all') { sql += ' AND active = 1'; }
  sql += ' ORDER BY level, id';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/languages — 回 active=1 的語別，給前端語別選擇畫面用（加語別不用改前端）
app.get('/api/languages', (req, res) => {
  const rows = db.prepare(
    'SELECT lang_code, dialect_id, name_zh, name_native FROM languages WHERE active = 1 ORDER BY dialect_id'
  ).all();
  res.json({ data: rows });
});

// GET /api/vocabulary/:id
app.get('/api/vocabulary/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST /api/vocabulary — 新增詞彙（lang_code 選填，未帶預設 trv）
app.post('/api/vocabulary', requireAdminAuth, (req, res) => {
  const { word, chinese, english, category, level, emoji, hint } = req.body;
  if (!word || !level) return res.status(400).json({ error: '缺少 word / level' });
  const lang = resolveLang(req.body.lang_code);
  const r = db.prepare(`
    INSERT INTO vocabulary (word, chinese, english, category, level, emoji, hint, lang_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(word, chinese||'', english||'', category||'general', level, emoji||'🎯', hint||word, lang);
  res.json({ success: true, id: r.lastInsertRowid });
});

// PUT /api/vocabulary/:id — 更新詞彙
app.put('/api/vocabulary/:id', requireAdminAuth, (req, res) => {
  const { word, chinese, english, category, level, emoji, hint, active } = req.body;
  db.prepare(`
    UPDATE vocabulary SET
      word=COALESCE(?,word), chinese=COALESCE(?,chinese), english=COALESCE(?,english),
      category=COALESCE(?,category), level=COALESCE(?,level), emoji=COALESCE(?,emoji),
      hint=COALESCE(?,hint), active=COALESCE(?,active)
    WHERE id=?
  `).run(word, chinese, english, category, level, emoji, hint, active, req.params.id);
  res.json({ success: true });
});

// DELETE /api/vocabulary/:id
app.delete('/api/vocabulary/:id', requireAdminAuth, (req, res) => {
  db.prepare('DELETE FROM vocabulary WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 圖/音檔以 word 為 key，多語別下需加 lang_code 才不會誤更他語同拼詞。
// lang 由 query(?lang=) 或 body.lang_code 帶入，未帶預設 trv（向下相容 admin.html 現況）。
function reqLang(req) {
  return resolveLang(req.query.lang || (req.body && req.body.lang_code));
}

// POST /api/vocabulary/:word/image — 上傳圖片
app.post('/api/vocabulary/:word/image', requireAdminAuth, upload.single('image'), (req, res) => {
  const word = req.params.word;
  const lang = reqLang(req);
  if (!req.file) return res.status(400).json({ error: '請上傳圖片' });
  const imagePath = '/images/' + req.file.filename;
  db.prepare('UPDATE vocabulary SET image_path = ? WHERE word = ? AND lang_code = ?').run(imagePath, word, lang);
  res.json({ success: true, image_path: imagePath });
});

// POST /api/vocabulary/:word/audio — 上傳音檔
app.post('/api/vocabulary/:word/audio', requireAdminAuth, uploadAudio.single('audio'), (req, res) => {
  const word = req.params.word;
  const lang = reqLang(req);
  if (!req.file) return res.status(400).json({ error: '請上傳音檔' });
  const audioPath = '/audio/' + req.file.filename;
  db.prepare('UPDATE vocabulary SET audio_path = ? WHERE word = ? AND lang_code = ?').run(audioPath, word, lang);
  res.json({ success: true, audio_path: audioPath });
});

// DELETE /api/vocabulary/:word/image — 刪除圖片
app.delete('/api/vocabulary/:word/image', requireAdminAuth, (req, res) => {
  const lang = reqLang(req);
  const row = db.prepare('SELECT image_path FROM vocabulary WHERE word = ? AND lang_code = ?').get(req.params.word, lang);
  if (row?.image_path) {
    const file = path.join('/var/www/hunter/public', row.image_path);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    db.prepare('UPDATE vocabulary SET image_path = NULL WHERE word = ? AND lang_code = ?').run(req.params.word, lang);
  }
  res.json({ success: true });
});

// DELETE /api/vocabulary/:word/audio — 刪除音檔
app.delete('/api/vocabulary/:word/audio', requireAdminAuth, (req, res) => {
  const lang = reqLang(req);
  const row = db.prepare('SELECT audio_path FROM vocabulary WHERE word = ? AND lang_code = ?').get(req.params.word, lang);
  if (row?.audio_path) {
    const file = path.join('/var/www/hunter/public', row.audio_path);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    db.prepare('UPDATE vocabulary SET audio_path = NULL WHERE word = ? AND lang_code = ?').run(req.params.word, lang);
  }
  res.json({ success: true });
});

// ── 排行榜 API ───────────────────────────────────

// POST /api/scores — 需登入。玩家名稱一律取自登入身分（req.player.display_name），
// 不再從前端 body 接受 player 字串，避免冒名。
app.post('/api/scores', requirePlayerAuth, (req, res) => {
  const { level, score, kills, accuracy, combo, cleared } = req.body;
  if (!level || !score) return res.status(400).json({ error: '缺少必要欄位 level / score' });

  const lvl = parseInt(level);
  // 防呆：拒絕交比目前解鎖進度更高的關卡分數，避免有人繞過前端直接打 API 造假
  const unlockedLevel = getUnlockedLevel(req.player.id);
  if (lvl > unlockedLevel) {
    return res.status(403).json({ error: `LEVEL ${lvl} 尚未解鎖，目前只能玩到 LEVEL ${unlockedLevel}` });
  }

  // 語別標注：前端帶當次選擇的 lang_code；對照 languages 驗證，未帶/無效 fallback 'trv'。
  // 只作標注，不參與解鎖/聚合。
  const lang = resolveLang(req.body.lang_code);

  const name = req.player.display_name.slice(0, 12);
  const result = db.prepare(`
    INSERT INTO scores (player, level, score, kills, accuracy, combo, player_id, cleared, lang_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, lvl, score, kills||0, accuracy||0, combo||0, req.player.id, cleared ? 1 : 0, lang);
  db.prepare(`
    INSERT INTO daily_stats (date, games) VALUES (?, 1)
    ON CONFLICT(date) DO UPDATE SET games = games + 1
  `).run(today());
  const rank = db.prepare('SELECT COUNT(*) as rank FROM scores WHERE level = ? AND score > ?').get(lvl, score);
  res.json({
    success: true,
    id: result.lastInsertRowid,
    rank: rank.rank + 1,
    unlockedLevel: getUnlockedLevel(req.player.id)
  });
});

// GET /api/leaderboard?limit=10 — 排行榜：每「玩家×語別」一列的累計分數。
// = 每個玩家「在某一語別」各關最佳成績加總（不是把每次遊玩全加總，避免狂刷洗分）。
// ⚠️ 分數**逐語別獨立計算、不跨語別加總**（使用者要求）：同一玩家玩太魯閣語 500、
//    多納魯凱語 400 → 是兩筆各自上榜（Truku 500 / Rukai 400），不會被合成 900。
// 只計入有 player_id（登入身分）的分數，舊匿名分數不出現。
app.get('/api/leaderboard', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const rows = db.prepare(`
    SELECT p.display_name AS player,
           best.player_id AS player_id,
           SUM(best.score) AS score,
           COUNT(DISTINCT best.level) AS levels_played,
           best.lang_code AS lang_code
    FROM (
      SELECT player_id, lang_code, level, MAX(score) AS score
      FROM scores WHERE player_id IS NOT NULL
      GROUP BY player_id, lang_code, level
    ) best
    JOIN players p ON p.id = best.player_id
    GROUP BY best.player_id, best.lang_code
    ORDER BY score DESC
    LIMIT ?
  `).all(limit);
  res.json({ data: rows });
});

// DELETE /api/leaderboard/entry — 從前端刪除排行榜「一整列」（某玩家×某語別的所有分數）。
// 權限鎖死：只有指定管理帳號（LEADERBOARD_ADMIN_USERNAME）能用；其他登入帳號 403。
// body: { player_id, lang_code }。刪 scores WHERE player_id=? AND lang_code=?（該玩家該語別全刪）。
// ⚠️ 破壞性：刪真實 scores，但這是刻意的後台清理功能（清測試/垃圾帳號），非誤刪。
const LEADERBOARD_ADMIN_USERNAME = 'asd8107';
app.delete('/api/leaderboard/entry', requirePlayerAuth, (req, res) => {
  if (req.player.username !== LEADERBOARD_ADMIN_USERNAME) {
    return res.status(403).json({ error: '權限不足（僅管理帳號可刪除排行）' });
  }
  const playerId = parseInt(req.body.player_id, 10);
  const langCode = req.body.lang_code;
  if (!playerId || !langCode) {
    return res.status(400).json({ error: '缺少 player_id 或 lang_code' });
  }
  const info = db.prepare('DELETE FROM scores WHERE player_id = ? AND lang_code = ?').run(playerId, langCode);
  res.json({ success: true, deleted: info.changes });
});

// GET /api/leaderboard/top3?level=1
app.get('/api/leaderboard/top3', (req, res) => {
  const level = parseInt(req.query.level);
  if (!level) return res.status(400).json({ error: '請指定 level' });
  const rows = db.prepare('SELECT player, score, kills, accuracy, lang_code FROM scores WHERE level = ? ORDER BY score DESC LIMIT 3').all(level);
  res.json({ level, data: rows });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM scores').get();
  const today_stat = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(today());
  const best = db.prepare('SELECT player, score, level FROM scores ORDER BY score DESC LIMIT 1').get();
  res.json({ total_games: total.c, today_games: today_stat?.games || 0, best_score: best || null });
});

// ── 404 ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start ────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Hunter API running on port ${PORT}`);
  console.log(`DB: ${DB_PATH}`);
  console.log(`IMG_DIR: ${IMG_DIR}`);
});
