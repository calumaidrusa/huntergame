// /api/vocabulary/:word/audio
//   POST   上傳音檔（需管理員）
//   DELETE 清除音檔路徑（需管理員）
//
// ⚠️ 同 image.js：Vercel serverless 檔案系統唯讀且短暫，音檔上傳不支援，回 501。
//    DELETE（純清 DB 欄位）可正常運作。音檔素材上傳走 DO 正式站後台。
const { get, run } = require('../../_lib/db');
const { requireAdminAuth, resolveLang } = require('../../_lib/auth');

module.exports = async (req, res) => {
  const word = req.query.word;
  try {
    if (req.method === 'POST') {
      const admin = await requireAdminAuth(req, res);
      if (!admin) return;
      return res.status(501).json({
        error: '此 Vercel 部署不支援音檔上傳（serverless 檔案系統唯讀）。請改用 DO 正式站的後台上傳音檔素材。'
      });
    }

    if (req.method === 'DELETE') {
      const admin = await requireAdminAuth(req, res);
      if (!admin) return;
      const lang = await resolveLang(req.query.lang);
      const row = await get('SELECT audio_path FROM vocabulary WHERE word = ? AND lang_code = ?', [word, lang]);
      if (row && row.audio_path) {
        await run('UPDATE vocabulary SET audio_path = NULL WHERE word = ? AND lang_code = ?', [word, lang]);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('vocabulary audio error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
