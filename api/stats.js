// GET /api/stats — 總遊玩數 / 今日遊玩數 / 最高分。對齊 server.js。
const { get } = require('./_lib/db');
const { today } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const total = await get('SELECT COUNT(*) as c FROM scores');
    const todayStat = await get('SELECT * FROM daily_stats WHERE date = ?', [today()]);
    const best = await get('SELECT player, score, level FROM scores ORDER BY score DESC LIMIT 1');
    res.status(200).json({
      total_games: total ? Number(total.c) : 0,
      today_games: todayStat ? Number(todayStat.games) : 0,
      best_score: best || null,
    });
  } catch (e) {
    console.error('stats error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
