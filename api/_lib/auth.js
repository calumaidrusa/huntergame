// ── 身分驗證與共用 helper（Vercel serverless 版）───────────────────────────
// 邏輯完整對齊 DO 的 backend/server.js：bcryptjs 雜湊、jsonwebtoken、序列闖關解鎖、
// 白名單全解鎖、lang_code 驗證。差別只在 DB 呼叫改成 async/await（libSQL）。
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get } = require('./db');

const DEFAULT_LANG = 'trv';
const MAX_LEVEL = 5;

// 正式環境務必在 Vercel 專案設定 JWT_SECRET；本機測試沒設會用假預設值（僅供本機）。
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

// 帳號白名單：這些帳號永久解鎖全部關卡（admin 測試帳號），不受 scores 表過關紀錄限制。
// 跟 admins 表（後台管理員登入）是不同機制——這裡只是「這個玩家帳號永遠解鎖」。
const ADMIN_UNLOCK_ALL_USERNAMES = new Set(['asd8107']);

// 排行榜刪除權限帳號（對齊 server.js 的 LEADERBOARD_ADMIN_USERNAME）
const LEADERBOARD_ADMIN_USERNAME = 'asd8107';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function bearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// 驗證 lang_code：存在於 languages 表才採用，否則 fallback 'trv'（向下相容）。
async function resolveLang(raw) {
  if (!raw) return DEFAULT_LANG;
  const code = String(raw).trim();
  const row = await get('SELECT 1 FROM languages WHERE lang_code = ?', [code]);
  return row ? code : DEFAULT_LANG;
}

// 算出某玩家目前解鎖到第幾關：白名單直接 MAX_LEVEL；否則 cleared=1 的最高 level + 1。
async function getUnlockedLevel(playerId) {
  const player = await get('SELECT username FROM players WHERE id = ?', [playerId]);
  if (player && ADMIN_UNLOCK_ALL_USERNAMES.has(player.username)) return MAX_LEVEL;
  const row = await get(
    'SELECT COALESCE(MAX(level), 0) AS maxLevel FROM scores WHERE player_id = ? AND cleared = 1',
    [playerId]
  );
  const maxLevel = row && row.maxLevel != null ? Number(row.maxLevel) : 0;
  return Math.min(MAX_LEVEL, maxLevel + 1);
}

// 玩家身分驗證：成功回傳 player 物件，失敗直接寫回 res 並回傳 null（呼叫端要 return）。
async function requirePlayerAuth(req, res) {
  const token = bearer(req);
  if (!token) { res.status(401).json({ error: '請先登入' }); return null; }
  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    res.status(401).json({ error: '登入已過期，請重新登入' }); return null;
  }
  if (payload.role !== 'player') { res.status(403).json({ error: '權限不足' }); return null; }
  const player = await get('SELECT id, username, display_name FROM players WHERE id = ?', [payload.id]);
  if (!player) { res.status(401).json({ error: '帳號不存在' }); return null; }
  return player;
}

// 管理員身分驗證（同上模式）。
async function requireAdminAuth(req, res) {
  const token = bearer(req);
  if (!token) { res.status(401).json({ error: '請先登入管理員帳號' }); return null; }
  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    res.status(401).json({ error: '登入已過期，請重新登入' }); return null;
  }
  if (payload.role !== 'admin') { res.status(403).json({ error: '權限不足' }); return null; }
  const admin = await get('SELECT id, username FROM admins WHERE id = ?', [payload.id]);
  if (!admin) { res.status(401).json({ error: '帳號不存在' }); return null; }
  return admin;
}

// Vercel serverless 的 req.body 依 content-type 可能已是物件，也可能是字串/undefined。
// 統一解析成物件（對齊 express.json() 的行為）。
function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body); } catch (e) { return {}; }
}

module.exports = {
  DEFAULT_LANG, MAX_LEVEL, JWT_SECRET,
  ADMIN_UNLOCK_ALL_USERNAMES, LEADERBOARD_ADMIN_USERNAME,
  bcrypt, jwt,
  today, signToken, verifyToken, resolveLang, getUnlockedLevel,
  requirePlayerAuth, requireAdminAuth, parseBody,
};
