// 一次性腳本：建立管理員帳號（不開放公開註冊管理員，避免被亂用）
// 用法：node create-admin.js <username> <password>
//
// 環境變數（跟 server.js 相同慣例）：
//   DB_PATH  資料庫路徑，預設 /var/www/hunter/backend/hunter.db
//
// 本機測試範例：
//   DB_PATH=./.localtest/db/hunter.db node create-admin.js admin test1234
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || '/var/www/hunter/backend/hunter.db';

const [,, username, password] = process.argv;

if (!username || !password) {
  console.error('用法: node create-admin.js <username> <password>');
  process.exit(1);
}

if (password.length < 4) {
  console.error('密碼至少需要 4 個字元');
  process.exit(1);
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now','localtime'))
  );
`);

const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
if (existing) {
  console.error(`管理員帳號 "${username}" 已經存在，若要改密碼請先手動刪除該筆再重建（或另外寫更新腳本）。`);
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const result = db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);

console.log(`管理員帳號建立成功：username=${username}, id=${result.lastInsertRowid}`);
db.close();
