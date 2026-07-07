// /api/vocabulary/:word/image
//   POST   上傳圖片（需管理員）
//   DELETE 清除圖片路徑（需管理員）
//
// ⚠️ Vercel serverless 檔案系統唯讀且短暫（ephemeral），無法像 DO 那樣把上傳檔寫進
//    /var/www/hunter/public/images 永久保存。因此「上傳」在此版不支援，回 501 並說明。
//    圖片素材上傳仍走 DO 正式站的 admin.html 工作流；Vercel 這份只做遊玩 + 帳號 + 排行榜。
//    DELETE（純清 DB 欄位）可正常運作，保留行為一致性。
const { get, run } = require('../../_lib/db');
const { requireAdminAuth, resolveLang } = require('../../_lib/auth');

module.exports = async (req, res) => {
  const word = req.query.word;
  try {
    if (req.method === 'POST') {
      const admin = await requireAdminAuth(req, res);
      if (!admin) return;
      return res.status(501).json({
        error: '此 Vercel 部署不支援圖片上傳（serverless 檔案系統唯讀）。請改用 DO 正式站的後台上傳圖片素材。'
      });
    }

    if (req.method === 'DELETE') {
      const admin = await requireAdminAuth(req, res);
      if (!admin) return;
      const lang = await resolveLang(req.query.lang);
      const row = await get('SELECT image_path FROM vocabulary WHERE word = ? AND lang_code = ?', [word, lang]);
      if (row && row.image_path) {
        // Vercel 無本地檔可刪，僅清 DB 欄位（DO 版會連同磁碟檔一起刪，這裡邏輯等價於「解除關聯」）。
        await run('UPDATE vocabulary SET image_path = NULL WHERE word = ? AND lang_code = ?', [word, lang]);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('vocabulary image error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
