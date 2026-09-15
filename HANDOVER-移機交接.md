# 族語射手 TRUKU WORD ARCHER — 移機 / 工程交接文件

> 更新：2026-07-06　正式站：http://142.93.3.132/

## 0. 一分鐘總覽（TL;DR）
- **架構**：DigitalOcean droplet（Ubuntu 24.04）＋ Node 20 ＋ PM2 ＋ Nginx ＋ SQLite。
- **前端**：純靜態 HTML/CSS/JS，**沒有 build step**（改完直接上）。
- **後端**：單一 `server.js`（Express），跑在 PM2 上、監聽 `127.0.0.1:3000`，Nginx 反代 `/api/`。
- **資料**：全在一個 SQLite 檔 `hunter.db`。
- **部署**：把檔案 `scp` 到 `/var/www/hunter/public/` 即可（純前端免重啟）。
- **鐵律**：部署前備份 `hunter.db`、**絕不動 `scores` 表**、部署後驗證分數筆數不變。

---

## 1. 存取與原始碼
- **SSH**：`ssh -i <金鑰> root@142.93.3.132`（金鑰目前在開發者本機 `~/.ssh/hunter_deploy`，**交接時要一併轉交或重新產生**）。
- **GitHub**：`calumaidrusa/huntergame`，主要分支 `feat/v2-overhaul-accounts-ui-vocab`。
- ⚠️ **部署是手動 `scp`，不是 `git pull`**：正式站版本 = 開發者本機工作目錄的檔案。**交接前務必把本機改動 `git commit` + `push`**，否則接手的人 clone 下來會是舊版（目前正式站桌機檔對得上本機最新版）。

## 2. 目錄結構（`/var/www/hunter`）
```
public/                    ← Nginx root（前端 + 靜態資源）
  hunter-truku-v2.html     桌機遊戲主檔
  index.html               同一份的複本（首頁）
  mobile.html / game-mobile.js / mobile.css   手機版（直式點字拼字，獨立實作）
  admin.html               後台管理頁
  images/                  UI 素材 + 詞彙插圖 + 獵物插圖
  audio/                   音效（sfx.js）
backend/
  server.js                唯一後端進程（Express API）
  hunter.db                SQLite 資料庫（~9.4MB，唯一真資料）
  seeds/ + vocab_seed.js   詞彙種子資料
  create-admin.js          建立管理員帳號腳本
  package.json             相依：express, better-sqlite3, cors, jsonwebtoken, bcrypt…
  hunter.db.backup-*       DB 備份（目前 38 份，同機）
```

## 3. 執行方式
- **PM2**：process 名 `hunter-api`（fork mode）。
  - 看狀態 `pm2 list`／看 log `pm2 logs hunter-api`／改後端後 `pm2 restart hunter-api`。
  - **確認開機自啟**：`pm2 startup` + `pm2 save`（移機後必做）。
- **Nginx**：設定檔 `/etc/nginx/sites-enabled/hunter`
  - `listen 80`，`root /var/www/hunter/public`
  - `/api/` → `proxy_pass http://127.0.0.1:3000`
  - `*.html` → `Cache-Control: no-cache`（解決「部署後看到舊 HTML」的快取問題）
  - 改設定後 `nginx -t && systemctl reload nginx`

## 4. 環境變數（`server.js` 用 `process.env.X || 預設`）
| 變數 | 預設 | 說明 |
|---|---|---|
| `PORT` | `3000` | API 埠 |
| `DB_PATH` | `/var/www/hunter/backend/hunter.db` | DB 路徑 |
| `IMG_DIR` / `AUDIO_DIR` | `/var/www/hunter/public/{images,audio}` | 靜態資源 |
| `JWT_SECRET` | `dev-only-insecure-secret-change-me` | **登入 token 簽章密鑰** |

⚠️ **正式站上目前沒有 `.env` 檔** → 這些值若沒在 PM2 env 設定就是吃預設。
**JWT_SECRET 若還是預設值＝不安全（token 可被偽造）。** 查法：`pm2 env 0 | grep JWT_SECRET`；沒有就代表在用預設，**必須換掉**（見第 8 節安全清單）。

## 5. 部署流程（現行）
**純前端（html/css/js）：**
1. 備份 DB：`cp hunter.db hunter.db.backup-$(date +%Y%m%d-%H%M%S)`
2. 記錄目前 `scores` 筆數（現為 **11**）
3. `scp` 檔案 → `public/`（桌機檔要**同時**傳成 `hunter-truku-v2.html` 與 `index.html`）
4. 驗證 `scores` 筆數不變、且 server 檔 md5 = 本機 md5
5. **純前端免重啟 PM2**

**改 `server.js`：** `scp server.js` → `backend/` 後 `pm2 restart hunter-api`。

**換詞彙：** `DELETE FROM vocabulary`（不要 `DROP`）→ server.js 遇空表會重 seed；或直接跑 `seeds/`。

## 6. 部署鐵律（務必遵守）
- **先備份 `hunter.db`。**
- **絕不動 `scores` 表**（真實玩家分數，含玩家 Kacaw，目前 11 筆）。
- 部署後**驗證 `scores` 筆數不變**。
- **curl 送中文寫入 DB 會亂碼**（發生過）→ 要寫中文走瀏覽器路徑或 node `String.fromCodePoint`。

## 7. 資料庫內容（SQLite `hunter.db`）
- `vocabulary`：**45,760 筆**（42 語別 × ~1,092 詞）
- `languages`：**42**（原住民族語別）
- `scores`：**11**（玩家累計分數 / 排行榜）
- 帳號表：密碼 bcrypt 雜湊、JWT 登入
- **圖 / 音來源＝klokah（外部直連）**：圖 `klokah.tw/competition/vocabulary/picture/{code}.jpg`、音 `web.klokah.tw/vocabulary/audio/word/{dialectId}/{code}.wav`（太魯閣 dialectId=33）。正式教學用途前建議取得族語E樂園授權。

## 8. 交接 / 正式化 安全清單（重要）
- [ ] **設真正的 `JWT_SECRET`**（現在很可能是預設不安全值）
- [ ] **換後台密碼**（`admin.html` 後台目前 `admin / 1234`，弱密碼）
- [ ] **上 HTTPS**（現在只有 http:80）：建議綁域名 + `certbot`
- [ ] `cors` 目前全開（`app.use(cors())`），視需要收斂來源
- [ ] **DB 異地備份**（現只有同機 `hunter.db.backup-*`；建議定期下載/上雲）
- [ ] **SSH 金鑰交接**（目前只在開發者本機）
- [ ] **本機改動 commit + push 到 GitHub**（部署走 scp，repo 可能落後）

## 9. 移機步驟（搬到新機）
1. 開新 droplet（Ubuntu 22/24 LTS）。
2. 裝 **Node 20** + `npm i -g pm2` + **Nginx**。
3. 複製整個 `/var/www/hunter`（含 `public/` + `backend/` + `hunter.db`）。
   - `backend/node_modules`：**better-sqlite3 有原生編譯**，建議在新機重裝：`cd backend && npm install`（別直接搬 node_modules）。
4. **設 `JWT_SECRET`**（別用預設！）＋其他 env：建 `.env` 或用 pm2 ecosystem 檔。
5. 複製 Nginx 設定，把 `server_name` 改成新 IP/域名 → `nginx -t && systemctl reload nginx`。
6. `pm2 start server.js --name hunter-api && pm2 save && pm2 startup`。
7. **驗證**：`curl 新機:80/api/languages` 應回 42 語別；開網站測登入 + 玩一關 + 看排行榜。
8. 切 DNS / 對外 IP。

## 10. 本機開發 / 測試
- `.claude/launch.json` 的 `hunter-backend-local`（免安裝 Node 在 `.localtools/`，資料在 `.localtest/`，port 3001）。
- 換種子先刪 `.localtest/db/hunter.db`。

---
*有任何一步不清楚，找原開發者或看專案 `.claude/` 內的工作紀錄。*
