// POST /api/auth/login — { username, password }。對齊 server.js。
const { get } = require('../_lib/db');
const { bcrypt, signToken, parseBody } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { username, password } = parseBody(req);
    if (!username || !password) return res.status(400).json({ error: '缺少帳號 / 密碼' });
    const player = await get('SELECT * FROM players WHERE username = ?', [String(username).trim()]);
    if (!player || !bcrypt.compareSync(String(password), player.password_hash)) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    const token = signToken({ id: player.id, role: 'player' });
    res.status(200).json({ success: true, token });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
