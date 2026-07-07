// GET /api/languages — 回 active=1 的語別，給前端語別選擇畫面用（加語別不用改前端）。
// 對齊 server.js。
const { all } = require('./_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const rows = await all(
      'SELECT lang_code, dialect_id, name_zh, name_native FROM languages WHERE active = 1 ORDER BY dialect_id'
    );
    res.status(200).json({ data: rows });
  } catch (e) {
    console.error('languages error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
