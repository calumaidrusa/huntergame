// DELETE /api/leaderboard/entry — 刪除某玩家×某語別的所有分數（後台清理用）。
// 權限鎖死：只有 LEADERBOARD_ADMIN_USERNAME（asd8107）能用，其他登入帳號 403。
// body: { player_id, lang_code }。⚠️ 破壞性：刪真實 scores，但這是刻意的後台清理功能。
// 完整對齊 server.js。
const { run } = require('../_lib/db');
const { requirePlayerAuth, LEADERBOARD_ADMIN_USERNAME, parseBody } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const player = await requirePlayerAuth(req, res);
    if (!player) return;
    if (player.username !== LEADERBOARD_ADMIN_USERNAME) {
      return res.status(403).json({ error: '權限不足（僅管理帳號可刪除排行）' });
    }
    const body = parseBody(req);
    const playerId = parseInt(body.player_id, 10);
    const langCode = body.lang_code;
    if (!playerId || !langCode) {
      return res.status(400).json({ error: '缺少 player_id 或 lang_code' });
    }
    const info = await run('DELETE FROM scores WHERE player_id = ? AND lang_code = ?', [playerId, langCode]);
    res.status(200).json({ success: true, deleted: info.changes });
  } catch (e) {
    console.error('leaderboard entry delete error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
