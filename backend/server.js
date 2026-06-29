const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_PATH = '/var/www/hunter/backend/hunter.db';
const IMG_DIR = '/var/www/hunter/public/images';

// 確保圖片目錄存在
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// ── Multer (圖片上傳) ────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename: (req, file, cb) => {
    const word = req.params.word || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, word + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只接受圖片檔案'));
  }
});

// ── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json());

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
    hint       TEXT,
    active     INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// 種入預設詞彙（只在空表時執行）
const vocabCount = db.prepare('SELECT COUNT(*) as c FROM vocabulary').get();
if (vocabCount.c === 0) {
  const insert = db.prepare(`
    INSERT INTO vocabulary (word, chinese, english, category, level, emoji, hint)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const seed = db.transaction((rows) => {
    for (const r of rows) insert.run(...r);
  });
  seed([
    // Level 1 — 自然
    ['qhuni',  '樹',   'tree',       'nature', 1, '🌲', 'qhuni'],
    ['bgihur', '風',   'wind',       'nature', 1, '💨', 'bgihur'],
    ['quyux',  '雨',   'rain',       'nature', 1, '🌧️', 'quyux'],
    ['spriq',  '草',   'grass',      'nature', 1, '🌿', 'spriq'],
    ['tahut',  '火',   'fire',       'nature', 1, '🔥', 'tahut'],
    ['hidaw',  '太陽', 'sun',        'nature', 1, '☀️', 'hidaw'],
    ['idas',   '月亮', 'moon',       'nature', 1, '🌙', 'idas'],
    ['rulung', '雲',   'cloud',      'nature', 1, '☁️', 'rulung'],
    ['rnaaw',  '山林', 'forest',     'nature', 1, '🏔️', 'rnaaw'],
    ['elug',   '道路', 'road',       'nature', 1, '🛤️', 'elug'],
    // Level 2 — 動物
    ['rapit',  '飛鼠',   'flying squirrel', 'animal', 2, '🐿️', 'rapit'],
    ['rqnux',  '水鹿',   'sambar deer',     'animal', 2, '🦌', 'rqnux'],
    ['pada',   '山羌',   'muntjac',         'animal', 2, '🦌', 'pada'],
    ['arung',  '穿山甲', 'pangolin',        'animal', 2, '🦔', 'arung'],
    ['brihut', '松鼠',   'squirrel',        'animal', 2, '🐿️', 'brihut'],
    ['rungay', '猴子',   'monkey',          'animal', 2, '🐒', 'rungay'],
    ['walu',   '蜜蜂',   'bee',             'animal', 2, '🐝', 'walu'],
    ['klaway', '蝴蝶',   'butterfly',       'animal', 2, '🦋', 'klaway'],
    ['kjiraw', '老鷹',   'eagle',           'animal', 2, '🦅', 'kjiraw'],
    // Level 3 — 獵場
    ['bowyak', '山豬',   'wild boar',  'hunting', 3, '🐗', 'bowyak'],
    ['kumay',  '熊',     'bear',       'hunting', 3, '🐻', 'kumay'],
    ['ngiyaw', '雲豹',   'clouded leopard', 'hunting', 3, '🐆', 'ngiyaw'],
    ['samat',  '獵物',   'prey',       'hunting', 3, '🎯', 'samat'],
    ['bhniq',  '弓',     'bow',        'hunting', 3, '🏹', 'bhniq'],
    ['tasil',  '岩石',   'rock',       'hunting', 3, '🪨', 'tasil'],
  ]);
}

// ── Helper ──────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Routes ──────────────────────────────────────

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── 詞彙 API ────────────────────────────────────

// GET /api/vocabulary?level=1&category=animal&active=1
app.get('/api/vocabulary', (req, res) => {
  let sql = 'SELECT * FROM vocabulary WHERE 1=1';
  const params = [];
  if (req.query.level)    { sql += ' AND level = ?';    params.push(parseInt(req.query.level)); }
  if (req.query.category) { sql += ' AND category = ?'; params.push(req.query.category); }
  if (req.query.active !== 'all') { sql += ' AND active = 1'; }
  sql += ' ORDER BY level, id';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/vocabulary/:id
app.get('/api/vocabulary/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST /api/vocabulary — 新增詞彙
app.post('/api/vocabulary', (req, res) => {
  const { word, chinese, english, category, level, emoji, hint } = req.body;
  if (!word || !level) return res.status(400).json({ error: '缺少 word / level' });
  const r = db.prepare(`
    INSERT INTO vocabulary (word, chinese, english, category, level, emoji, hint)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(word, chinese||'', english||'', category||'general', level, emoji||'🎯', hint||word);
  res.json({ success: true, id: r.lastInsertRowid });
});

// PUT /api/vocabulary/:id — 更新詞彙
app.put('/api/vocabulary/:id', (req, res) => {
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
app.delete('/api/vocabulary/:id', (req, res) => {
  db.prepare('DELETE FROM vocabulary WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST /api/vocabulary/:word/image — 上傳圖片（用族語單字當檔名）
app.post('/api/vocabulary/:word/image', upload.single('image'), (req, res) => {
  const word = req.params.word;
  if (!req.file) return res.status(400).json({ error: '請上傳圖片' });
  const imagePath = '/images/' + req.file.filename;
  db.prepare('UPDATE vocabulary SET image_path = ? WHERE word = ?').run(imagePath, word);
  res.json({ success: true, image_path: imagePath });
});

// ── 排行榜 API ───────────────────────────────────

// POST /api/scores
app.post('/api/scores', (req, res) => {
  const { player, level, score, kills, accuracy, combo } = req.body;
  if (!level || !score) return res.status(400).json({ error: '缺少必要欄位 level / score' });
  const name = (player || '匿名獵人').slice(0, 12);
  const result = db.prepare(`
    INSERT INTO scores (player, level, score, kills, accuracy, combo)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, level, score, kills||0, accuracy||0, combo||0);
  db.prepare(`
    INSERT INTO daily_stats (date, games) VALUES (?, 1)
    ON CONFLICT(date) DO UPDATE SET games = games + 1
  `).run(today());
  const rank = db.prepare('SELECT COUNT(*) as rank FROM scores WHERE level = ? AND score > ?').get(level, score);
  res.json({ success: true, id: result.lastInsertRowid, rank: rank.rank + 1 });
});

// GET /api/leaderboard?level=1&limit=10
app.get('/api/leaderboard', (req, res) => {
  const level = parseInt(req.query.level) || null;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  let rows;
  if (level) {
    rows = db.prepare('SELECT player, level, score, kills, accuracy, combo, created_at FROM scores WHERE level = ? ORDER BY score DESC LIMIT ?').all(level, limit);
  } else {
    rows = db.prepare('SELECT player, MAX(score) as score, level, kills, accuracy, combo, created_at FROM scores GROUP BY player ORDER BY score DESC LIMIT ?').all(limit);
  }
  res.json({ level: level || 'all', data: rows });
});

// GET /api/leaderboard/top3?level=1
app.get('/api/leaderboard/top3', (req, res) => {
  const level = parseInt(req.query.level);
  if (!level) return res.status(400).json({ error: '請指定 level' });
  const rows = db.prepare('SELECT player, score, kills, accuracy FROM scores WHERE level = ? ORDER BY score DESC LIMIT 3').all(level);
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
