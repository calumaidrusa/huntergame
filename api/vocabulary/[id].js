// /api/vocabulary/:id
//   GET    取單筆（公開）
//   PUT    更新（需管理員）
//   DELETE 刪除（需管理員）
// 對齊 server.js 的三支同路徑 handler，依 method 分流。
const { get, run } = require('../_lib/db');
const { requireAdminAuth, parseBody } = require('../_lib/auth');

module.exports = async (req, res) => {
  const id = req.query.id;
  try {
    if (req.method === 'GET') {
      const row = await get('SELECT * FROM vocabulary WHERE id = ?', [id]);
      if (!row) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(row);
    }

    if (req.method === 'PUT') {
      const admin = await requireAdminAuth(req, res);
      if (!admin) return;
      const { word, chinese, english, category, level, emoji, hint, active } = parseBody(req);
      await run(`
        UPDATE vocabulary SET
          word=COALESCE(?,word), chinese=COALESCE(?,chinese), english=COALESCE(?,english),
          category=COALESCE(?,category), level=COALESCE(?,level), emoji=COALESCE(?,emoji),
          hint=COALESCE(?,hint), active=COALESCE(?,active)
        WHERE id=?
      `, [word ?? null, chinese ?? null, english ?? null, category ?? null,
          level ?? null, emoji ?? null, hint ?? null, active ?? null, id]);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const admin = await requireAdminAuth(req, res);
      if (!admin) return;
      await run('DELETE FROM vocabulary WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('vocabulary [id] error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
