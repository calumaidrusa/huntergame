const { get, all } = require('../_lib/db');
const { bcrypt, signToken, parseBody, requireAdminAuth } = require('../_lib/auth');

module.exports = async (req, res) => {
  const { action } = req.query || {};
  try {
    if (action === 'login') return await handleLogin(req, res);
    if (action === 'players') return await handlePlayers(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (e) {
    console.error('admin api error', e);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
};

async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = parseBody(req);
  if (!username || !password) return res.status(400).json({ error: '缺少帳號 / 密碼' });

  const admin = await get('SELECT * FROM admins WHERE username = ?', [String(username).trim()]);
  if (!admin || !bcrypt.compareSync(String(password), admin.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }

  const token = signToken({ id: admin.id, role: 'admin' });
  return res.status(200).json({ success: true, token });
}

async function handlePlayers(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
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

  return res.status(200).json({ data: rows });
}
