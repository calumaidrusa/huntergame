// GET /api/leaderboard/top3?level=1 — 某關前三名。對齊 server.js。
const { all } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const level = parseInt(req.query.level);
    if (!level) return res.status(400).json({ error: '請指定 level' });
    const rows = await all(
      'SELECT player, score, kills, accuracy, lang_code FROM scores WHERE level = ? ORDER BY score DESC LIMIT 3',
      [level]
    );
    res.status(200).json({ level, data: rows });
  } catch (e) {
    console.error('top3 error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
