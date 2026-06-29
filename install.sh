#!/bin/bash
# ================================================
#  山林獵人 · 一鍵安裝腳本
#  適用：Ubuntu 24.04 LTS
#  IP：142.93.3.132
# ================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "  🏹 山林獵人 · 部署開始"
echo "  ========================"
echo ""

# ── 1. 系統更新 ──────────────────────────────────
log "更新系統套件..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. 安裝 Node.js 20 ───────────────────────────
log "安裝 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - -qq
apt-get install -y nodejs -qq
node -v && npm -v

# ── 3. 安裝 Nginx ────────────────────────────────
log "安裝 Nginx..."
apt-get install -y nginx -qq
systemctl enable nginx

# ── 4. 安裝 PM2（Node.js 進程管理）──────────────
log "安裝 PM2..."
npm install -g pm2 -q

# ── 5. 建立目錄結構 ──────────────────────────────
log "建立網站目錄..."
mkdir -p /var/www/hunter/{public,backend}
mkdir -p /var/log/hunter

# ── 6. 部署後端 API ──────────────────────────────
log "部署後端 API..."
cp -r /root/hunter-deploy/backend/* /var/www/hunter/backend/
cd /var/www/hunter/backend
npm install --production -q
log "後端套件安裝完成"

# ── 7. 設定 Nginx ────────────────────────────────
log "設定 Nginx..."
cp /root/hunter-deploy/nginx/hunter.conf /etc/nginx/sites-available/hunter
ln -sf /etc/nginx/sites-available/hunter /etc/nginx/sites-enabled/hunter
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 8. 啟動後端服務 ──────────────────────────────
log "啟動後端 API..."
cd /var/www/hunter/backend
pm2 start server.js --name "hunter-api" --log /var/log/hunter/api.log
pm2 startup systemd -u root --hp /root
pm2 save

# ── 9. 防火牆設定 ────────────────────────────────
log "設定防火牆..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "  ✅ 安裝完成！"
echo "  ========================"
echo "  網站：http://142.93.3.132"
echo "  API： http://142.93.3.132/api"
echo ""
echo "  接下來：上傳遊戲 HTML 到 /var/www/hunter/public/"
echo "  指令：bash /root/hunter-deploy/upload-game.sh"
echo ""
