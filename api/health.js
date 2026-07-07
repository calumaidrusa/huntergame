// GET /api/health — 對齊 server.js
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
};
