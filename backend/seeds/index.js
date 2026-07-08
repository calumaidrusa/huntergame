// 多語別種子匯集。自動掃描本目錄下所有 {lang_code}.js 詞庫檔（languages.js/index.js 除外），
// 每檔 module.exports 一個 9 欄陣列 [word, chinese, english, category, level, emoji, hint, image_path, audio_path]。
// 匯出：
//   VOCAB   : { [lang_code]: rows[] }   ——各語別詞庫
//   LANGUAGES: [{ lang_code, dialect_id, name_zh, name_native, active }]  ——語別對照表
//
// 加新語別＝丟一支 {lang_code}.js 進本目錄 + 在 languages.js 加一列，無需改 server.js。
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SKIP = new Set(['index.js', 'languages.js']);

const VOCAB = {};
for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith('.js') || SKIP.has(file)) continue;
  const lang = file.slice(0, -3); // 去掉 .js
  const rows = require(path.join(DIR, file));
  if (!Array.isArray(rows)) {
    throw new Error(`seeds/${file} 應 module.exports 一個陣列`);
  }
  VOCAB[lang] = rows;
}

const LANGUAGES = require('./languages');

module.exports = { VOCAB, LANGUAGES };
