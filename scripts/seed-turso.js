#!/usr/bin/env node
// ── Turso / libSQL 一次性 seed 腳本 ─────────────────────────────────────────
// 建 schema + 灌 languages 表 + 逐語別灌 vocabulary。詞庫來源＝repo 內既有的
// backend/seeds/（index.js 自動掃描 42 支 {lang_code}.js + languages.js），跟 DO 同一份。
//
// 用法：
//   本機測試（file: 本機 SQLite 檔）：
//     TURSO_DATABASE_URL=file:./.verceltest/hunter.db node scripts/seed-turso.js
//   遠端 Turso：
//     TURSO_DATABASE_URL=libsql://xxx.turso.io TURSO_AUTH_TOKEN=xxx node scripts/seed-turso.js
//
// 冪等：schema 用 CREATE IF NOT EXISTS；languages 用 upsert；vocabulary 逐語別「筆數=0 才灌」，
// 重跑不會重複灌已存在的語別（跟 server.js 的逐語別種子邏輯一致）。
//
// ⚠️ 資料範圍：repo 內 backend/seeds/ 目前收錄 42 個族語別、約 45,760 筆詞彙
//    （太魯閣語 trv 為主力，含小畫家 32 筆本地圖片覆蓋；其餘語別圖/音走 klokah 外部連結）。
//    此 seed 用的是 repo 現有資料，已是完整 42 語別；若日後 DO 正式 DB 有超出 repo 的
//    人工補充（例如後台上傳過但未回寫 seed 檔的圖片路徑），那部分需另由 DO 唯讀匯出補齊。

const { createClient } = require('@libsql/client');
const { SCHEMA_STATEMENTS } = require('../api/_lib/schema');
const { VOCAB: SEEDS, LANGUAGES: LANG_SEED } = require('../backend/seeds');

const DEFAULT_LANG = 'trv';

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.error('缺少 TURSO_DATABASE_URL。');
    console.error('  本機：TURSO_DATABASE_URL=file:./.verceltest/hunter.db node scripts/seed-turso.js');
    console.error('  遠端：TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/seed-turso.js');
    process.exit(1);
  }
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const db = createClient(authToken ? { url, authToken } : { url });

  console.log('→ 建立 schema ...');
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execute(stmt);
  }
  console.log(`  schema 完成（${SCHEMA_STATEMENTS.length} 條）`);

  // ── languages 表 upsert ──
  console.log('→ 灌 languages 表 ...');
  const langRows = LANG_SEED.map(l => ({
    lang_code: l.lang_code,
    dialect_id: l.dialect_id,
    name_zh: l.name_zh,
    name_native: l.name_native ?? null,
    active: l.active ? 1 : 0,
  }));
  // libSQL batch：一次送多筆交易，比逐筆 await 快很多。
  await db.batch(
    langRows.map(r => ({
      sql: `INSERT INTO languages (lang_code, dialect_id, name_zh, name_native, active)
            VALUES (:lang_code, :dialect_id, :name_zh, :name_native, :active)
            ON CONFLICT(lang_code) DO UPDATE SET
              dialect_id=excluded.dialect_id, name_zh=excluded.name_zh,
              name_native=excluded.name_native, active=excluded.active`,
      args: r,
    })),
    'write'
  );
  console.log(`  languages 完成（${langRows.length} 語別）`);

  // ── vocabulary 逐語別灌（筆數=0 才灌該語別）──
  console.log('→ 灌 vocabulary（逐語別，已存在的語別會跳過）...');
  let totalInserted = 0;
  for (const [lang, rows] of Object.entries(SEEDS)) {
    const cRes = await db.execute({
      sql: 'SELECT COUNT(*) AS c FROM vocabulary WHERE lang_code = ?',
      args: [lang],
    });
    const existing = Number(cRes.rows[0].c);
    if (existing > 0) {
      console.log(`  [skip] ${lang}: 已有 ${existing} 筆`);
      continue;
    }
    // 分批 batch（每批 500 筆），避免單一 batch 過大。
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      await db.batch(
        slice.map(r => ({
          sql: `INSERT INTO vocabulary
                  (word, chinese, english, category, level, emoji, hint, image_path, audio_path, lang_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          // seed 每列 9 欄 [word,chinese,english,category,level,emoji,hint,image_path,audio_path]；補 lang。
          args: [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7] ?? null, r[8] ?? null, lang],
        })),
        'write'
      );
    }
    totalInserted += rows.length;
    console.log(`  [seed] ${lang}: ${rows.length} 筆`);
  }
  console.log(`  vocabulary 完成（本次新增 ${totalInserted} 筆）`);

  // ── 驗證輸出 ──
  const vTotal = await db.execute('SELECT COUNT(*) AS c FROM vocabulary');
  const lTotal = await db.execute('SELECT COUNT(*) AS c FROM languages');
  const trvTotal = await db.execute({
    sql: 'SELECT COUNT(*) AS c FROM vocabulary WHERE lang_code = ?',
    args: [DEFAULT_LANG],
  });
  console.log('─────────────────────────────────');
  console.log(`languages 表：${Number(lTotal.rows[0].c)} 語別`);
  console.log(`vocabulary  ：${Number(vTotal.rows[0].c)} 筆（其中 ${DEFAULT_LANG}=${Number(trvTotal.rows[0].c)} 筆）`);
  console.log('seed 完成。');
}

main().catch(err => {
  console.error('seed 失敗：', err);
  process.exit(1);
});
