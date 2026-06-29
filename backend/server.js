const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = '/var/www/hunter/backend/hunter.db';

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
`);

// ── Helper ──────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Routes ──────────────────────────────────────

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// POST /api/scores — 提交分數
app.post('/api/scores', (req, res) => {
  const { player, level, score, kills, accuracy, combo } = req.body;

  if (!level || !score) {
    return res.status(400).json({ error: '缺少必要欄位 level / score' });
  }

  const name = (player || '匿名獵人').slice(0, 12); // 最多12字

  const insert = db.prepare(`
    INSERT INTO scores (player, level, score, kills, accuracy, combo)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = insert.run(name, level, score, kills || 0, accuracy || 0, combo || 0);

  // 更新每日統計
  db.prepare(`
    INSERT INTO daily_stats (date, games) VALUES (?, 1)
    ON CONFLICT(date) DO UPDATE SET games = games + 1
  `).run(today());

  // 查詢這筆分數的排名
  const rank = db.prepare(`
    SELECT COUNT(*) as rank FROM scores
    WHERE level = ? AND score > ?
  `).get(level, score);

  res.json({
    success: true,
    id: result.lastInsertRowid,
    rank: rank.rank + 1
  });
});

// GET /api/leaderboard?level=1&limit=10 — 排行榜
app.get('/api/leaderboard', (req, res) => {
  const level = parseInt(req.query.level) || null;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  let rows;
  if (level) {
    rows = db.prepare(`
      SELECT player, level, score, kills, accuracy, combo, created_at
      FROM scores
      WHERE level = ?
      ORDER BY score DESC
      LIMIT ?
    `).all(level, limit);
  } else {
    // 全關卡總分排行（取每位玩家最高分）
    rows = db.prepare(`
      SELECT player, MAX(score) as score, level, kills, accuracy, combo, created_at
      FROM scores
      GROUP BY player
      ORDER BY score DESC
      LIMIT ?
    `).all(limit);
  }

  res.json({ level: level || 'all', data: rows });
});

// GET /api/leaderboard/top3?level=1 — 前三名（給遊戲結束畫面用）
app.get('/api/leaderboard/top3', (req, res) => {
  const level = parseInt(req.query.level);
  if (!level) return res.status(400).json({ error: '請指定 level' });

  const rows = db.prepare(`
    SELECT player, score, kills, accuracy
    FROM scores WHERE level = ?
    ORDER BY score DESC LIMIT 3
  `).all(level);

  res.json({ level, data: rows });
});

// GET /api/stats — 統計資訊
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM scores').get();
  const today_stat = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(today());
  const best = db.prepare('SELECT player, score, level FROM scores ORDER BY score DESC LIMIT 1').get();

  res.json({
    total_games: total.c,
    today_games: today_stat?.games || 0,
    best_score: best || null
  });
});

// ── 404 ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start ────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🏹 Hunter API running on port ${PORT}`);
  console.log(`   DB: ${DB_PATH}`);
});
