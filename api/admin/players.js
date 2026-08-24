// GET /api/admin/players — 管理員查看註冊玩家資料。
const { all } = require('../_lib/db');
const { requireAdminAuth } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const admin = await requireAdminAuth(req, res);
    if (!admin) return;

    const rows = await all(`
      SELECT
        p.id,
        p.username,
        p.display_name,
        p.email,
        p.created_at,
        COALESCE(c.cleared_levels, 0) AS cleared_levels,
        COALESCE(t.total_score, 0) AS total_score
      FROM players p
      LEFT JOIN (
        SELECT player_id, COUNT(DISTINCT level) AS cleared_levels
        FROM scores
        WHERE cleared = 1 AND level BETWEEN 1 AND 4
        GROUP BY player_id
      ) c ON c.player_id = p.id
      LEFT JOIN (
        SELECT player_id, SUM(score) AS total_score
        FROM (
          SELECT player_id, level, MAX(score) AS score
          FROM scores
          WHERE level BETWEEN 1 AND 4
          GROUP BY player_id, level
        ) best
        GROUP BY player_id
      ) t ON t.player_id = p.id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 500
    `);

    res.status(200).json({ data: rows });
  } catch (e) {
    console.error('admin players error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
