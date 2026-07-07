// POST /api/scores — 需登入。玩家名稱一律取自登入身分（display_name），不從 body 接受，避免冒名。
// 完整對齊 server.js：platform 標注、桌機序列闖關防呆、lang_code 標注、daily_stats、rank 計算。
const { get, run } = require('./_lib/db');
const { requirePlayerAuth, getUnlockedLevel, resolveLang, today, parseBody } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const player = await requirePlayerAuth(req, res);
    if (!player) return;

    const body = parseBody(req);
    const { level, score, kills, accuracy, combo, cleared } = body;
    if (!level || !score) return res.status(400).json({ error: '缺少必要欄位 level / score' });

    const lvl = parseInt(level);

    // 平台標注：只接受 'desktop'/'mobile'，其他值（含未帶）一律 fallback 'desktop'。
    const platform = body.platform === 'mobile' ? 'mobile' : 'desktop';

    // 防呆：桌機序列闖關才檢查——拒絕交比目前解鎖進度更高的關卡分數。手機 endless 跳過此檢查。
    if (platform === 'desktop') {
      const unlockedLevel = await getUnlockedLevel(player.id);
      if (lvl > unlockedLevel) {
        return res.status(403).json({ error: `LEVEL ${lvl} 尚未解鎖，目前只能玩到 LEVEL ${unlockedLevel}` });
      }
    }

    // 語別標注：前端帶當次選擇的 lang_code；對照 languages 驗證，未帶/無效 fallback 'trv'。
    const lang = await resolveLang(body.lang_code);

    const name = player.display_name.slice(0, 12);
    const result = await run(`
      INSERT INTO scores (player, level, score, kills, accuracy, combo, player_id, cleared, lang_code, platform)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, lvl, score, kills || 0, accuracy || 0, combo || 0, player.id, cleared ? 1 : 0, lang, platform]);

    await run(`
      INSERT INTO daily_stats (date, games) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET games = games + 1
    `, [today()]);

    const rankRow = await get('SELECT COUNT(*) as rank FROM scores WHERE level = ? AND score > ?', [lvl, score]);
    const unlockedLevel = await getUnlockedLevel(player.id);

    res.status(200).json({
      success: true,
      id: result.lastInsertRowid,
      rank: (rankRow ? Number(rankRow.rank) : 0) + 1,
      unlockedLevel,
    });
  } catch (e) {
    console.error('scores error', e);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
