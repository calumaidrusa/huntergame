// GET /api/auth/me — 需登入。回傳 username / display_name / unlockedLevel / totalScore。
// 對齊 server.js（totalScore = 各關最佳成績加總，不跨語別分？— 注意：server.js 這支
// 沿用原本「各 level MAX」的總分，未依 lang_code 分，這裡完整照搬同樣行為）。
const { get } = require('../_lib/db');
const { requirePlayerAuth, getUnlockedLevel } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const player = await requirePlayerAuth(req, res);
    if (!player) return; // requirePlayerAuth 已寫回錯誤

    const unlockedLevel = await getUnlockedLevel(player.id);
    const totalRow = await get(`
      SELECT COALESCE(SUM(best.score), 0) AS totalScore FROM (
        SELECT level, MAX(score) AS score FROM scores WHERE player_id = ? GROUP BY level
      ) best
    `, [player.id]);

    res.status(200).json({
      username: player.username,
      display_name: player.display_name,
      unlockedLevel,
      totalScore: totalRow ? Number(totalRow.totalScore) : 0,
    });
  } catch (e) {
    console.error('me error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
