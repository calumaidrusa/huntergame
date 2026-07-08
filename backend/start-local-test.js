// 本機測試用啟動包裝：設定環境變數後載入正式的 server.js
// 不影響正式環境部署（正式環境直接執行 server.js，不會經過這個檔案）
const path = require('path');
const ROOT = path.join(__dirname, '..');

process.env.PORT = process.env.PORT || '3001';
process.env.DB_PATH = process.env.DB_PATH || path.join(ROOT, '.localtest', 'db', 'hunter.db');
process.env.IMG_DIR = process.env.IMG_DIR || path.join(ROOT, '.localtest', 'images');
process.env.AUDIO_DIR = process.env.AUDIO_DIR || path.join(ROOT, '.localtest', 'audio');
process.env.SERVE_STATIC = process.env.SERVE_STATIC || '1';

require('./server.js');
