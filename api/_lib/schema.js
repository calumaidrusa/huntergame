// ── Schema 定義（單一事實來源）───────────────────────────────────────────────
// 對齊 DO backend/server.js 的建表段 + 所有 migration 後的最終欄位狀態。
// libSQL/Turso 底層就是 SQLite，語法與 better-sqlite3 完全相同。
// 這裡把「建表 + 既有 DB 才需要的 ALTER migration」合併成「一次到位的完整 CREATE」，
// 因為 Turso 是全新空 DB，不存在舊欄位問題，直接建齊即可。
//
// scores 表最終欄位（含所有 server.js migration 後補的欄位）：
//   player_id, cleared, lang_code(DEFAULT 'trv'), platform(DEFAULT 'desktop')
// vocabulary 最終欄位：audio_path, lang_code(DEFAULT 'trv')
// players 最終欄位：email

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    player     TEXT    NOT NULL DEFAULT '獵人',
    level      INTEGER NOT NULL,
    score      INTEGER NOT NULL,
    kills      INTEGER NOT NULL DEFAULT 0,
    accuracy   INTEGER NOT NULL DEFAULT 0,
    combo      INTEGER NOT NULL DEFAULT 0,
    player_id  INTEGER,
    cleared    INTEGER DEFAULT 0,
    lang_code  TEXT    NOT NULL DEFAULT 'trv',
    platform   TEXT    NOT NULL DEFAULT 'desktop',
    created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS daily_stats (
    date      TEXT PRIMARY KEY,
    games     INTEGER DEFAULT 0,
    players   INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS vocabulary (
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
    lang_code  TEXT NOT NULL DEFAULT 'trv',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS players (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    email         TEXT,
    created_at    TEXT DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS languages (
    lang_code   TEXT PRIMARY KEY,
    dialect_id  INTEGER NOT NULL,
    name_zh     TEXT NOT NULL,
    name_native TEXT,
    active      INTEGER DEFAULT 1
  )`,

  // 複合索引：以 (lang_code, level, active) 篩選出題池（對齊 server.js）
  `CREATE INDEX IF NOT EXISTS idx_vocab_lang_level ON vocabulary(lang_code, level, active)`,
];

module.exports = { SCHEMA_STATEMENTS };
