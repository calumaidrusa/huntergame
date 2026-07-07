// /api/vocabulary
//   GET  ?lang=trv&level=1&category=animal&active=1&hasImage=1&hasAudio=1  — 查詞彙（公開）
//   POST 新增詞彙（需管理員登入）
// 對齊 server.js 的兩支同路徑 handler，依 method 分流。
const { all, run } = require('../_lib/db');
const { requireAdminAuth, resolveLang, parseBody } = require('../_lib/auth');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') return await getVocab(req, res);
    if (req.method === 'POST') return await postVocab(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('vocabulary index error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

// GET — lang 未帶或無效時預設 'trv'（向下相容）。
async function getVocab(req, res) {
  const q = req.query || {};
  const lang = await resolveLang(q.lang);
  let sql = 'SELECT * FROM vocabulary WHERE lang_code = ?';
  const params = [lang];
  if (q.level)    { sql += ' AND level = ?';    params.push(parseInt(q.level)); }
  if (q.category) { sql += ' AND category = ?'; params.push(q.category); }
  if (q.hasImage) { sql += " AND image_path IS NOT NULL AND image_path <> ''"; }
  if (q.hasAudio) { sql += " AND audio_path IS NOT NULL AND audio_path <> ''"; }
  if (q.active !== 'all') { sql += ' AND active = 1'; }
  sql += ' ORDER BY level, id';
  const rows = await all(sql, params);
  res.status(200).json(rows);
}

// POST — 新增詞彙（需管理員；lang_code 選填，未帶預設 trv）。
async function postVocab(req, res) {
  const admin = await requireAdminAuth(req, res);
  if (!admin) return;
  const body = parseBody(req);
  const { word, chinese, english, category, level, emoji, hint } = body;
  if (!word || !level) return res.status(400).json({ error: '缺少 word / level' });
  const lang = await resolveLang(body.lang_code);
  const r = await run(`
    INSERT INTO vocabulary (word, chinese, english, category, level, emoji, hint, lang_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [word, chinese || '', english || '', category || 'general', level, emoji || '🎯', hint || word, lang]);
  res.status(200).json({ success: true, id: r.lastInsertRowid });
}
