#!/usr/bin/env node
// 一次性腳本：在 Turso/libSQL DB 建立管理員帳號（對齊 DO 的 backend/create-admin.js）。
// 用法：
//   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/create-admin-turso.js <username> <password>
//   本機：TURSO_DATABASE_URL=file:./.verceltest/hunter.db node scripts/create-admin-turso.js admin test1234
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const [,, username, password] = process.argv;

if (!username || !password) {
  console.error('用法: node scripts/create-admin-turso.js <username> <password>');
  process.exit(1);
}
if (password.length < 4) {
  console.error('密碼至少需要 4 個字元');
  process.exit(1);
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) { console.error('缺少 TURSO_DATABASE_URL'); process.exit(1); }
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const db = createClient(authToken ? { url, authToken } : { url });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now','localtime'))
    )
  `);

  const existing = await db.execute({ sql: 'SELECT id FROM admins WHERE username = ?', args: [username] });
  if (existing.rows.length) {
    console.error(`管理員帳號 "${username}" 已存在，若要改密碼請先手動刪除該筆再重建。`);
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = await db.execute({
    sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
    args: [username, hash],
  });
  console.log(`管理員帳號建立成功：username=${username}, id=${Number(result.lastInsertRowid)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
