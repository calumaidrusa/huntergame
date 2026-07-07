// POST /api/auth/register — { username, password, display_name, email? }
// email 為選填（抽獎用）；有填才驗格式並存入，未填存 NULL。對齊 server.js。
const { get, run } = require('../_lib/db');
const { bcrypt, signToken, parseBody } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { username, password, display_name, email } = parseBody(req);
    if (!username || !password || !display_name) {
      return res.status(400).json({ error: '缺少帳號 / 密碼 / 顯示名稱' });
    }
    const uname = String(username).trim();
    const dname = String(display_name).trim().slice(0, 20);
    const mail  = email ? String(email).trim().slice(0, 120) : null;
    if (uname.length < 3) return res.status(400).json({ error: '帳號至少需要 3 個字元' });
    if (String(password).length < 4) return res.status(400).json({ error: '密碼至少需要 4 個字元' });
    if (!dname) return res.status(400).json({ error: '顯示名稱不可為空' });
    if (mail && !/^\S+@\S+\.\S+$/.test(mail)) return res.status(400).json({ error: 'Email 格式不正確' });

    const existing = await get('SELECT id FROM players WHERE username = ?', [uname]);
    if (existing) return res.status(409).json({ error: '這個帳號已經被使用了' });

    const hash = bcrypt.hashSync(String(password), 10);
    const result = await run(
      'INSERT INTO players (username, password_hash, display_name, email) VALUES (?, ?, ?, ?)',
      [uname, hash, dname, mail]
    );

    const token = signToken({ id: result.lastInsertRowid, role: 'player' });
    res.status(200).json({ success: true, token });
  } catch (e) {
    console.error('register error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
