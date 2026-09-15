# CLAUDE.md — 族語射手 TRUKU WORD ARCHER（路由中心）

> 這是專案主入口。**本檔只放「核心架構 + 鐵律 + 去哪找細節」，細節都在別的檔案。**
> 定位：路由中心，不是百科全書。需要展開的內容一律點連結過去，不在這裡複製。
> 本檔 2026-07-03 由 Fable 5 建立、2026-07-05 由主對話模型依當下現況全面重寫（原版寫的是單語別 4 難度舊狀態，已過期，見 [`harness/G2`](harness/G2-promotion-addendum-20260705.md)）。

**專案一句話**：台灣原住民族語詞彙學習遊戲（原名山林獵人 Hunter Typer，原僅太魯閣語，現擴充 42 族語方言）。玩家當獵人，依五種玩法（聽音選詞/填空/聽打/看圖選詞/盲打）學習+闖關。桌機版與獨立手機版並行，同一網址依裝置自動路由。正式站 http://142.93.3.132/

---

## 🚦 每個 Session 開場讀這個順序

1. 本檔（架構 + 鐵律，1 分鐘）。
2. [`harness/00-INDEX.md`](harness/00-INDEX.md) — 制度總目錄，決定你這次任務要翻哪幾份規則。
3. 依任務性質翻對應規則：派工看 [`harness/E`](harness/E-delegation-templates.md)、判斷停損/完成/熔斷看 [`harness/D`](harness/D-judgment-matrix.md)、要不要派 Subagent 看 [`harness/C`](harness/C-model-dispatch.md)。
4. 你是某個專責 agent（見下方角色表）→ 先看你自己的日誌 `harness/journals/<你自己>.md` 接上脈絡；工作完依 [`harness/H`](harness/H-agent-journals.md) 補一條。
5. 動手前，若涉及部署 / `scores` 表 / 品味決策 → **先看下面的 🔒 鐵律，多半要先問 User。**

---

## 🧭 核心架構（只列你必須先知道的）

| 項目 | 事實 |
|---|---|
| 桌機前端 | `hunter-truku-v2.html`（約 5500 行）—— HTML+CSS+JS **全部在同一檔**，無 build 流程，存檔即生效 |
| 手機前端 | `mobile.html` + `mobile.css` + `game-mobile.js` —— **獨立實作**、自帶遊戲迴圈，跟桌機零共用邏輯，直式「點字拼字」玩法。只共用靜態素材與 `/api/vocabulary` |
| 裝置路由 | `index.html` —— **薄路由檔，不是桌機複製品**！依 `pointer:coarse`/寬度/`?mode` 覆寫，導向桌機或手機版。⚠️部署時三者是三個獨立目標，別搞混（見 [`LESSONS.md`](harness/LESSONS.md) L-014） |
| 版面模型（桌機） | 固定 `540` 高設計座標（`#gameWrap`/`#stage`），`--game-scale = innerHeight/540` 等比縮放，大量 `position:absolute` + `z-index` 疊層，非文件流 |
| 後端 | `backend/server.js`（約 540 行）—— Node.js + Express + better-sqlite3 REST API，`MAX_LEVEL = 5` |
| 資料庫 | SQLite **6 張表**：`scores` / `daily_stats` / `vocabulary` / `players` / `admins` / `languages`（完整 schema 見下 🔒） |
| 帳號/解鎖 | bcrypt + JWT 玩家/管理員帳號；關卡解鎖以 `scores.cleared` 為準（`getUnlockedLevel()`，上限 `MAX_LEVEL=5`）；**訪客模式**不登入、不送分、不解鎖持久化（session 內記憶體解鎖） |
| 五種玩法（非難度階梯） | L1 音選詞(`audio-choice`,選點) / L2 填空(`blank`,打字+答案格) / L3 聽打(`listen`,打字+答案格+長度提示) / L4 看圖選詞(`choice`,選點) / L5 盲打(`blind`,打字無提示) —— 單字全難度混合出題，同詞關內重複＋錯題優先重現 |
| 語別 | **42 個族語方言**（16 族），`languages` 表 + `vocabulary.lang_code`/`scores.lang_code`（DEFAULT `'trv'` 太魯閣語，向下相容）。詞庫共 45,760+ 筆 |
| 詞彙種子 | `backend/seeds/`（44 檔：42 個 `{lang_code}.js` 詞庫檔 + `index.js` 自動掃描匯集 + `languages.js` 語別對照表）。加新語別＝丟一支檔進去，不用改 `server.js` |
| 素材 | 詞彙插畫 `public/images/{編號}.jpg` 或 klokah.tw 外連；UI 素材 `public/images/ui/*.png`（v2 細緻繪本風） |
| 角色分工 | 五個專責 agent，見下 👥 |

---

## 🔒 鐵律（單一真相源 —— 這裡是唯一正本，agent 檔若有出入以本節為準）

### 部署安全（最高優先權，任何 agent 任何時候都遵守）
1. 正式 DB 有**真實玩家分數**。**絕不清空 / 覆蓋 / 以任何方式改 `scores` 表。** 要重種某語別詞庫，只能 `DELETE FROM vocabulary WHERE lang_code='xxx'`（不 DROP、不動其他語別）。
2. **部署前一定先備份**：`cp hunter.db hunter.db.backup-$(date +%Y%m%d-%H%M%S)`（在伺服器 `/var/www/hunter/backend/` 下執行）。
3. 部署後驗證：外部 curl 200 + 頁面標記 + **`scores`/`players` 表筆數前後一致**（用 `node -e` 呼叫 `better-sqlite3` readonly 查，伺服器沒裝 `sqlite3` CLI）。
4. SSH：金鑰 `~/.ssh/hunter_deploy`，主機 `root@142.93.3.132`；伺服器路徑 HTML=`/var/www/hunter/public/`、DB/server.js=`/var/www/hunter/backend/`。
5. **部署、動 `scores` 表 = 熔斷級動作，先問 User**（見 [`harness/D`](harness/D-judgment-matrix.md) 熔斷表）。**auto-mode classifier 會擋 SSH 進正式站**，即使 User 上一輪同意過，下一輪也要當次明確重新授權才會放行——不要假設先前的同意延續到新的一輪。
6. **只傳有改的目標**：桌機改動只 scp `hunter-truku-v2.html`；手機改動只傳 `mobile.html`/`mobile.css`/`game-mobile.js`；改到路由邏輯才傳 `index.html`；動到後端才傳 `server.js`/`seeds/` 並 `pm2 restart hunter-api`。純前端改動免重啟。
7. **部署（scp）不等於 GitHub 同步**——部署完想保持版控一致，要另外 `git add/commit/push`（見 [`LESSONS.md`](harness/LESSONS.md) L-013）。

### DB schema（正本，對齊 `backend/server.js:79-133`——**6 張表**）
```sql
scores     (id, player, level, score, kills, accuracy, combo, created_at, player_id, cleared, lang_code)
daily_stats(date, games, players)
vocabulary (id, word, chinese, english, category, level, emoji, image_path, audio_path, hint, active, created_at, lang_code)
players    (id, username, password_hash, display_name, created_at)   -- 玩家帳號
admins     (id, username, password_hash, created_at)                 -- 管理員帳號
languages  (lang_code, dialect_id, name_zh, name_native, active)     -- 42 語別對照表
```
- `scores.player_id`/`cleared`/`lang_code`、`vocabulary.audio_path`/`lang_code` 都是靠 `ALTER TABLE` migration 補上的（`server.js:136-162`），schema 若看不到別以為不存在。
- **帳號 / 關卡解鎖系統**：bcrypt 密碼 + JWT（`JWT_SECRET` 環境變數）。`getUnlockedLevel()` 算某玩家 `cleared=1` 的最高 level + 1，上限 `MAX_LEVEL=5`。**單一事實來源就是 `scores` 表本身**——這是「絕不可動 scores 表」再多一層理由。
- **過關解鎖已改成自動送出**（`stageClear()` 內自動呼叫 `submitAndNext()`），不再只靠玩家手動點按鈕才記錄——見 [`LESSONS.md`](harness/LESSONS.md) L-011，改動前若又想依賴手動觸發，先想清楚後果。
- **訪客模式**：`AUTH.isGuest=true` 時 `submitScore()` 直接 return，完全不打 `/api/scores`，本地 session 記憶體序列解鎖，不寫 `scores` 表、不進排行榜。
- 種子邏輯：`languages` 表每次啟動 upsert；`vocabulary` 逐語別檢查，某 `lang_code` 筆數為 0 才種入該語別（其他語別已有資料不受影響）。改某語別種子檔後，要讓它生效得先清空**該語別**在 `vocabulary` 的資料。
- `hint` 欄位是**給玩家看的**（等於詞彙本身），**禁止**塞內部代號/debug。
- 前端有 `onerror` 圖片 fallback（失敗退回 emoji），**禁止移除**。

---

## 🛠 工具鐵律（照抄，不要即興；違反是最大宗的調用失敗來源）

| 情境 | 一定要這樣做 | 不要這樣做 |
|---|---|---|
| 執行 node / better-sqlite3（本機） | 用 `.localtools/node-v20.18.1-win-x64/node.exe` | ❌ 用系統 node（原生模組會編譯失敗）。⚠️曾發生 `better_sqlite3.node` binding 遺失需重裝，若本機後端跑不動，改用靜態伺服(`preview_start`) + 注入假狀態驗前端，或部署後用正式站真後端驗 |
| 本機預覽 | `preview_start` 用 `hunter-backend-local`（port 3001，`backend/start-local-test.js`，`SERVE_STATIC` 同源） | ❌ 自己起 http.server 當後端用、❌ 會 CORS 的設定 |
| Shell 語法 | PowerShell 是 primary；跨平台/POSIX 腳本才用 Bash 工具，兩者語法不同別混 | ❌ 在 PowerShell 用 `&&`/`/dev/null`、❌ 在 Bash 用 `$env:VAR` |
| 重跑乾淨測試 | 先刪 `.localtest/db/hunter.db` 讓它重建 | ❌ 拿正式 DB 做實驗 |
| SSH 進正式站唯讀查詢（scores 計數等） | `ssh ... 'cd /var/www/hunter/backend && node -e "const D=require(\"better-sqlite3\");..."'`（伺服器沒裝 `sqlite3` CLI） | ❌ 假設伺服器有 `sqlite3` 指令 |
| 抓聊天平台的臨時圖片連結 | 請 User 直接把圖貼進對話，或另存本機給路徑 | ❌ 對 `chatgpt.com/backend-api/...` 這類簽名臨時連結用 curl/WebFetch 硬抓（會被拒，見 [`LESSONS.md`](harness/LESSONS.md) L-012） |
| API Key / 密鑰 | 只從 `.env` 讀，**絕不印到 console 或寫進非 `.env` 檔** | ❌ echo、❌ 寫進其他檔、❌ 傳給外部服務 |

工具調用失敗 1 次 → **先回來核對本表**，不要盲目換引號重試（升降級規則見 [`harness/C`](harness/C-model-dispatch.md)）。

---

## 👥 角色 Agent 路由（大批量/專業工作派給對應 agent，別自己下場）

| Agent | 負責 | 定義檔 | 日誌 |
|---|---|---|---|
| 小畫家 | 生圖 / 缺圖盤點 / 素材清單 / 文化安全審查 | [`.claude/agents/xiaohuajia.md`](.claude/agents/xiaohuajia.md) | [`harness/journals/xiaohuajia.md`](harness/journals/xiaohuajia.md) |
| 小工程 | 遊戲邏輯 / 後端 API / DB / bug / 部署 | [`.claude/agents/xiaogongcheng.md`](.claude/agents/xiaogongcheng.md) | [`harness/journals/xiaogongcheng.md`](harness/journals/xiaogongcheng.md) |
| 小排版 | HTML/CSS 排版 / 元件尺寸定位 / RWD / 嵌素材（桌機為主） | [`.claude/agents/xiaopaiban.md`](.claude/agents/xiaopaiban.md) | [`harness/journals/xiaopaiban.md`](harness/journals/xiaopaiban.md) |
| 小歌手 | 音樂/音效方案、BGM/SFX、發音不被蓋過的把關 | [`.claude/agents/xiaogeshou.md`](.claude/agents/xiaogeshou.md) | [`harness/journals/xiaogeshou.md`](harness/journals/xiaogeshou.md) |
| 小蘋果 | 手機版（獨立點字拼字實作），桌機檔一字不動 | [`.claude/agents/xiaopingguo.md`](.claude/agents/xiaopingguo.md) | [`harness/journals/xiaopingguo.md`](harness/journals/xiaopingguo.md) |

> 派工怎麼寫（含驗收條件、回報格式）→ [`harness/E`](harness/E-delegation-templates.md)。指揮官不下場親自吞巨檔的原則 → [`harness/C`](harness/C-model-dispatch.md)。**手機/桌機同步鐵律**：兩邊共同關切的東西（資料層/語別/共享 bug/新功能/文化一致性）原則上要一起改，派工時記得問一句「手機版要不要也做」。

---

## 🧠 巨檔清單（主對話禁止主動全讀，一律派 Subagent 節錄）

`hunter-truku-v2.html`(~270KB/~5500行)、`backend/seeds/*.js`(42 個語別詞庫檔)、`vocab/*.json`(42 個中繼檔)、`reports/*.txt`(42 個特殊字元報表)。
需要其中內容時，派 Subagent 回報「路徑 + 關鍵行號 + 結論」，不要把整檔讀進主對話。理由見 [`harness/A`](harness/A-diagnosis.md) 痛點 #1。

---

## 📁 現行真相檔 vs 歷史/勿參考

- ✅ **現行真相**：`hunter-truku-v2.html`、`mobile.html`/`mobile.css`/`game-mobile.js`、`index.html`（路由）、`backend/server.js`、`backend/seeds/*`、`.claude/agents/*.md`、本 `CLAUDE.md`、`harness/*`。
- 🟡 **參考文件**：`製作歷程_DEVLOG.md`（人類可讀的里程碑敘事，隨開發更新）、`mobile_tap_to_spell_spec.md`（手機版權威規格）、各 `Truku_*_Codex_v*.md`（Codex 外部生圖規格）。
- ⛔ **勿當真相參考**：任何 `*.bak-*`/`*.backup-*`/`*.partial-cancelled-*` 檔（都已 `.gitignore`，是編輯過程備份，不是現行版本）。

---

## 📦 部署與 GitHub

- **正式站**：DigitalOcean droplet，Node 20 + PM2「hunter-api」+ Nginx + SQLite，http://142.93.3.132/
- **GitHub**：`calumaidrusa/huntergame`，工作分支 `feat/v2-overhaul-accounts-ui-vocab`，PR #2 open 等合併。部署與 push 是分開的兩件事（見上鐵律 7、[`LESSONS.md`](harness/LESSONS.md) L-013）。
- **本機測試**：`.claude/launch.json` 的 `hunter-backend-local`（port 3001）；本機 DB 資料在 `.localtest/`。
