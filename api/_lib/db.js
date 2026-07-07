// ── libSQL / Turso 連線（Vercel serverless 版）──────────────────────────────
// DO 正式站用 better-sqlite3（同步、本機檔案）；Vercel 這份平行版改用 @libsql/client
// （非同步、連遠端 Turso）。連線資訊一律讀環境變數，不 hardcode：
//   TURSO_DATABASE_URL  例：libsql://xxx.turso.io（本機測試可用 file:./.verceltest/hunter.db）
//   TURSO_AUTH_TOKEN    Turso 資料庫 token（file: 本機連線時可省略）
//
// 重要：serverless function「不」在每次請求跑 migration/seed，那是 scripts/seed-turso.js
// 一次性建好的事（遠端 DB 建表很慢、也不該每次請求做）。這裡只負責給出一個 client。
const { createClient } = require('@libsql/client');

let _client = null;

// 單例：同一個 lambda 執行環境（warm instance）重用同一個 client，冷啟動才重建。
function getDb() {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error('缺少環境變數 TURSO_DATABASE_URL（本機測試可設 file:./.verceltest/hunter.db）');
  }
  const authToken = process.env.TURSO_AUTH_TOKEN; // file: 連線可為 undefined
  _client = createClient(authToken ? { url, authToken } : { url });
  return _client;
}

// ── 便利查詢包裝（把 better-sqlite3 的 .get()/.all()/.run() 心智模型搬過來）──
// libSQL 的 execute 回傳 { rows, columns, rowsAffected, lastInsertRowid }。
// 參數用具名物件（{ ':name': val }）或位置陣列皆可；這裡統一用「位置陣列 + ? 佔位」
// 與具名參數兩種，跟 server.js 既有 SQL 寫法對齊，遷移時 SQL 幾乎原封不動。

async function query(sql, args) {
  const db = getDb();
  const res = await db.execute(args === undefined ? sql : { sql, args });
  return res;
}

// 取單列（等價 better-sqlite3 stmt.get()）
async function get(sql, args) {
  const res = await query(sql, args);
  return res.rows.length ? res.rows[0] : undefined;
}

// 取多列（等價 stmt.all()）
async function all(sql, args) {
  const res = await query(sql, args);
  return res.rows;
}

// 執行寫入（等價 stmt.run()）；回傳 { lastInsertRowid, changes } 對齊 better-sqlite3
async function run(sql, args) {
  const res = await query(sql, args);
  return {
    lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : undefined,
    changes: res.rowsAffected,
  };
}

module.exports = { getDb, query, get, all, run };
