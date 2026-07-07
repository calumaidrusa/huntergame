// GET /api/leaderboard?limit=10&platform=mobile — 每「玩家×語別×平台」一列的累計分數。
// 完整對齊 server.js：內層各關 MAX、外層 SUM，逐語別逐平台獨立不跨組加總；只計有 player_id 者。
// libSQL 具名參數：SQL 用 :name，args 傳 { name: value }（不含冒號的 key）。
const { all } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const platformFilter = (req.query.platform === 'mobile' || req.query.platform === 'desktop')
      ? req.query.platform : null;

    const rows = await all(`
      SELECT p.display_name AS player,
             best.player_id AS player_id,
             SUM(best.score) AS score,
             COUNT(DISTINCT best.level) AS levels_played,
             best.lang_code AS lang_code,
             best.platform AS platform
      FROM (
        SELECT player_id, lang_code, platform, level, MAX(score) AS score
        FROM scores WHERE player_id IS NOT NULL
        GROUP BY player_id, lang_code, platform, level
      ) best
      JOIN players p ON p.id = best.player_id
      WHERE (:platform IS NULL OR best.platform = :platform)
      GROUP BY best.player_id, best.lang_code, best.platform
      ORDER BY score DESC
      LIMIT :limit
    `, { platform: platformFilter, limit });

    res.status(200).json({ data: rows });
  } catch (e) {
    console.error('leaderboard error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
