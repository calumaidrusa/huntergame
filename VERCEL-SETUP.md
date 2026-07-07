# VERCEL-SETUP — 族語射手 Vercel 平行版部署指南

這份是「照著點」清單。目標：把這個遊戲**多開一份**跑在 Vercel 上，用**自己全新的雲端資料庫（Turso）**，
跟現有的 DigitalOcean 正式站（142.93.3.132）**完全獨立、資料不共用**。DO 那份不受任何影響。

- 前端靜態檔（`index.html` / `hunter-truku-v2.html` / `mobile.html` 等）：沿用同一份，零改動。
- 後端 API：從 DO 的 `backend/server.js` 等價搬成 Vercel serverless functions，放在 `api/` 目錄。
- 資料庫：Turso（libSQL，雲端 SQLite），schema 跟 DO 完全一致，但**是另一個空的新 DB**。
- 這份部署用的分支是 **`vercel-deploy`**。

---

## 需要準備的三個環境變數（最後會填進 Vercel）

| 變數 | 用途 | 從哪來 |
|------|------|--------|
| `TURSO_DATABASE_URL` | 資料庫連線位址 | Turso 建 DB 後給你（`libsql://xxx.turso.io`）|
| `TURSO_AUTH_TOKEN`   | 資料庫存取 token | Turso `db tokens create` 產生 |
| `JWT_SECRET`         | 登入 token 簽章密鑰 | 自己產一段長隨機字串（見步驟 3）|

---

## 步驟 1 — 註冊 Turso、建資料庫

Turso 是雲端版 SQLite（libSQL），有免費額度，這個遊戲的資料量綽綽有餘。

### 1a. 安裝 Turso CLI 並登入
- macOS / Linux：`curl -sSfL https://get.tur.so/install.sh | bash`
- Windows：可用 WSL 跑上面那行，或到 https://docs.turso.tech 看 Windows 安裝方式。
- 裝完執行 `turso auth signup`（或 `turso auth login`），用瀏覽器完成註冊/登入。

> 或者也可以純網頁操作：到 https://turso.tech → 註冊 → 在主控台（Dashboard）點「Create Database」。以下用 CLI 示範，網頁版找對應按鈕即可。

### 1b. 建立資料庫
```bash
turso db create truku-archer
```
建好後拿連線資訊：
```bash
turso db show truku-archer --url          # → 這就是 TURSO_DATABASE_URL
turso db tokens create truku-archer       # → 這就是 TURSO_AUTH_TOKEN
```
把這兩個值先記下來（等下步驟 4 與 Vercel 都要用）。

---

## 步驟 2 — 灌資料（建 schema + 42 語別 45,760 筆詞彙）

在**你本機**這個專案資料夾裡跑 seed 腳本，一次把 schema 跟詞彙灌進剛建好的 Turso DB。

```bash
# 先裝相依套件（只需一次）
npm install

# 用剛剛拿到的 Turso URL + token 跑 seed
TURSO_DATABASE_URL="libsql://truku-archer-xxxx.turso.io" \
TURSO_AUTH_TOKEN="你的-token" \
npm run seed
```
（Windows PowerShell 語法不同，可先 `$env:TURSO_DATABASE_URL="..."` 逐行設好再 `npm run seed`。）

跑完會看到：
```
languages 表：42 語別
vocabulary  ：45760 筆（其中 trv=1092 筆）
seed 完成。
```
> seed 是冪等的：重跑不會重複灌已存在的語別，安全。

### （選填）建管理員帳號
後台 `admin.html` 要登入才能改詞彙。要用的話建一個：
```bash
TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." \
npm run create-admin -- <管理員帳號> <密碼>
```

---

## 步驟 3 — 產生 JWT_SECRET

隨便產一段長的隨機字串當簽章密鑰（**不要**用範例值、不要跟 DO 共用）：
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
把輸出的那串記下來，等下填進 Vercel。

---

## 步驟 4 — 在 Vercel Import 這個分支

1. 到 https://vercel.com → 用 GitHub 登入。
2. 「Add New… → Project」→ 選這個 repo。
3. **重點：分支要選 `vercel-deploy`**（在 Import 設定頁的 Git Branch 選單，或 Import 後到
   Settings → Git 把 Production Branch 設成 `vercel-deploy`）。
4. Framework Preset 選 **Other**（本專案沒有前端框架 build，`vercel.json` 已設好靜態 + functions）。
5. Build/Output 設定**保持空白**（`vercel.json` 已經指定 `framework:null`、無 build command）。

---

## 步驟 5 — 在 Vercel 填三個環境變數

Import 那頁往下（或之後到 Settings → Environment Variables）填入這三個，Environment 勾 **Production**（也建議一起勾 Preview）：

| Name | Value |
|------|-------|
| `TURSO_DATABASE_URL` | 步驟 1b 的 URL |
| `TURSO_AUTH_TOKEN`   | 步驟 1b 的 token |
| `JWT_SECRET`         | 步驟 3 產生的隨機字串 |

填好按 Deploy（若已部署過，改完 env 要 Redeploy 才會生效）。

---

## 步驟 6 — 驗證

部署完成後 Vercel 會給你一個網址（`https://xxx.vercel.app`）。開瀏覽器打：

- `https://xxx.vercel.app/api/health` → 應回 `{"status":"ok",...}`
- `https://xxx.vercel.app/api/languages` → 應回 42 語別
- `https://xxx.vercel.app/` → 會依裝置自動分流到桌機版 / 手機版遊戲畫面
- 進遊戲：註冊一個帳號（可填 email）→ 登入 → 選語別玩一關 → 看排行榜有沒有出現你的分數

全部正常就成功了。這份跟 DO 的 142.93.3.132 是兩套完全獨立的系統，各自的玩家、分數、資料庫都不互通。

---

## 已知差異 / 注意事項

- **圖片/音檔上傳不支援**：Vercel serverless 檔案系統是唯讀的，`admin.html` 裡「上傳圖片/音檔」
  的按鈕在這份會回錯誤（501）。詞彙的圖/音大多是 klokah 外部連結，本來就正常顯示；要新增/替換
  本地圖片素材請在 DO 正式站後台做。改詞彙文字（新增/編輯/刪除詞彙、清除圖音關聯）在 Vercel 這份可正常運作。
- **資料獨立**：Vercel 這份的 Turso DB 是全新的，DO 正式站的真實玩家分數（Kacaw 等）**不會**、也**不該**被搬過來。
  兩邊各自累積各自的排行榜。
- **詞彙資料完整度**：seed 用的是 repo 內既有的 `backend/seeds/`（42 語別、45,760 筆，跟 DO 同一份來源）。
  若 DO 正式 DB 事後有人工在後台補過、但沒回寫進 seed 檔的內容（例如額外上傳的本地圖片路徑），
  那一小部分需要另外從 DO 的 DB 唯讀匯出補齊——但基本遊玩、42 語別詞庫都已完整，不影響上線。
