# 小工程的工作日誌

> 第一人稱，格式見 [`../H-agent-journals.md`](../H-agent-journals.md)。這份是 2026-07-05 promote 時，
> 依當時的 memory / DEVLOG 回溯補寫的歷史紀錄，之後的新條目由我（下一個接手小工程的自己）繼續往下寫。

---

## 2026-07-01～02 · 帳號系統與部署鐵律建立

我把裸的分數表加上了完整的玩家帳號系統：bcrypt 密碼雜湊 + JWT、序列式闖關解鎖（`getUnlockedLevel()` 算某玩家 `cleared=1` 的最高關卡+1）、累計排行榜。這段時間我也把部署這件事的紀律定死：正式 DB 有真實玩家分數（記得第一個真實玩家是 Kacaw），每次部署前一定先備份 `hunter.db`，絕對不清空或覆蓋 `scores` 表，要重種詞彙只能 `DELETE FROM vocabulary`。這條後來變成整個團隊共同遵守的最高優先鐵律，我自己也在 `LESSONS.md` 補過一條——早期我曾以為 DB 只有 3 張表，後來對照 `server.js` 建表段才發現漏算了 `players`/`admins`，那次的教訓是：schema 永遠以 `server.js` 建表段為準，不要憑舊文件轉述。

## 2026-07-04 · 五玩法關卡改版（後端 Phase A + 前端完整實作）

使用者定案把關卡從「難度階梯」改成「玩法階梯」：L1 音選詞、L2 填空、L3 聽打、L4 看圖選詞、L5 盲打，單字全難度混合出題，同一詞在關內重複出現、答錯優先重現。後端這邊很單純：`MAX_LEVEL` 4→5、`/api/vocabulary` 加 `?hasImage`/`?hasAudio` 過濾，`scores`/解鎖/排行榜邏輯完全沒動。前端是大工程：`LEVEL_CONFIG` 加 `mode`/`cue`/`isChoice`/`filter`/`picK` 欄位、`nextRound()` 依 `isChoice` 分流成打字流程跟點選流程、`buildChoiceOptions()` 用 Levenshtein 距離挑相似詞當誘答選項、`G.roundLog` 記錄每題對錯做結算回顧。做完自己先跑了一輪自動測試才交出去。

## 2026-07-05 · 多語別後端管線——42 個族語一次到位

使用者休息時開口「可以的話製作所有語別」，我做了整條自動化管線：`fetch_vocab.py` 打 klokah 的 XML 端點抓詞表（帶 `--dialect-id`/`--lang-code`/`--all`）、`gen_languages.py` 產語別對照表、`backend/seeds/` 存放 42 個 `{lang_code}.js` 詞庫檔（`index.js` 自動掃描匯集，加新語別不用改 `server.js`）。`server.js` 加了 `languages` 表、`vocabulary`/`scores` 的 `lang_code` 欄位（都 `DEFAULT 'trv'`，既有的太魯閣語資料跟 Kacaw 的分數一筆不動、自動標注）、逐語別種子邏輯（某語別筆數為 0 才種，不會動到已有資料的語別）。做完我自己先在 `.localtest` 驗證過：42 語別、45,760 筆、既有 `scores` 欄位完整、跨語別拼字都正確，才敢說可以交出去給小排版接前端。

同一批我也修了答案比對：撇號（`ʼ`/`'`/`'`）視為同一個字元、詞用 `/` 拆多重答案任一對即中（順便修掉了太魯閣語既有的一個斜線 bug）。

## 2026-07-05 · 排行榜逐語別計分修正

使用者發現一個問題：同一玩家如果玩了多個語別，排行榜會把不同語別的分數加總在一起，這樣「好看的人」練太魯閣語跟練多納魯凱語的分數混在一起排名，完全沒有意義。我把 `/api/leaderboard` 的 SQL 改成內層先 `GROUP BY player_id, lang_code, level`、外層再 `GROUP BY player_id, lang_code`，讓每個「玩家 × 語別」組合各自獨立加總、獨立排名。部署後驗證：那位玩家的兩個語別紀錄確實分開顯示了。

## 2026-07-05 · 「Level4 破關卻不能前進第五關」——查出真因是自動化不足，不是邏輯錯

使用者回報這個 bug，我沒有先猜，而是直接 SSH 唯讀查了正式站的 `scores` 表——發現那位玩家的 L4 只有一筆 `cleared=0`，完全沒有任何 `cleared=1` 的紀錄，最高過關卡停在 L3。可是我逐行檢查過前端流程跟後端 `getUnlockedLevel()` 邏輯，兩邊都是對的。真正的問題是設計上的一個洞：過關結算畫面要玩家**手動點「登錄成績」按鈕**才會真的送出 `cleared=1` 並解鎖下一關，如果玩家清關後沒點那顆按鈕（急著回首頁、或以為自動存了），這次清關就白清了，而玩家完全不會知道原因。我把它改成 `stageClear()` 觸發時**自動**呼叫 `submitAndNext()`，讓「過關」這件事本身就自動完成登錄跟解鎖，不再依賴一個容易被忽略的手動動作。這條我也寫進了 `LESSONS.md`（L-011），因為這種「有後果的動作卻要玩家手動觸發」的設計，換成別的功能也可能踩到同樣的坑。

交棒：已經卡在 L4 的那位玩家，資料庫裡是真實的 `cleared=0`，我沒有手動去改（那是動 `scores` 表，違反鐵律），他要重玩一次真的清掉 L4，系統才會自動記錄解鎖。

## 2026-07-05 · 訪客模式接線、可點特殊字元列、L3 答案格接上

訪客模式那邊，我在 `submitScore()` 開頭加了 `if (AUTH.isGuest)` 分流，直接 return 一個 `{guest:true}`，完全不打 `/api/scores`；過關時改成本地 `AUTH.unlockedLevel = G.level+1`（session 記憶體裡序列解鎖，效果比照後端邏輯，但不落地）。

可點特殊字元列是為了解決喉塞音（ʼ）這類字元玩家打不出來、又不知道其實打 `'` 就會判定成功的問題——我寫了偵測邏輯，掃當前語別詞庫抓出真正需要的拉丁擴充字元跟撇號家族，排除掉某些語別 `word` 欄裡混進去的中文註記雜訊，做成按鈕列插入輸入框。

L3 聽打原本被排除在答案格機制外（`if (G.mode==='blind' || G.listenMode)` 那條擋掉了），小畫家評估完 L3 改版後指出這個關鍵點，我把 L3 接上了 L2 已經有的動態答案格（`#answerCells`，依單字實際長度動態生格，不是寫死幾格），並補了一排音節/長度示意點。這個功能本質上是「降低聽打難度換取更友善的提示」，我請使用者拍板了「可以露長度當提示」才做，不是我自己決定的。

## 2026-07-06 · asd8107 全關解鎖白名單 + 訪客全 5 關開放 + 關卡步道進度條的邏輯計算部分

這次補寫是回溯性的——commit `6c99ade` 當時混了排版跟邏輯一起交，我事後只挑屬於自己職責的部分記錄。

後端 `server.js` 加了 `ADMIN_UNLOCK_ALL_USERNAMES`（目前只有 `asd8107`，使用者本人的玩家帳號）：`getUnlockedLevel()` 一開始先查這個玩家的 `username` 是否在白名單裡，是的話直接回傳 `MAX_LEVEL`，完全繞過原本「查 `scores` 表裡 `cleared=1` 的最高關卡+1」那套判斷。這跟 `admins` 表（後台管理員登入）是兩回事，我特地在程式碼註解裡寫清楚，避免以後誰把這兩種「admin」搞混。用途是讓使用者自己測試時不用每次真的破關才能往後面關卡走，純粹是白名單特例，不影響其他玩家的序列闖關邏輯。

前端訪客模式那邊，`onGuestBtnClick()` 裡把 `AUTH.unlockedLevel` 從原本的 `1`（訪客也要序列闖關，只是不落地存檔）改成 `MAX_LEVEL`（訪客直接五關全開）——這是使用者定案的產品決策，不是我自己判斷要放寬，訪客本來就不進排行榜、不影響 `scores` 表，改這個沒有資料風險。

同一個 commit 也加了「關卡步道」這個新的進度顯示方式（獵人在底部步道上跑、跑到第幾個節點代表第幾題），畫面本身（木步道底圖、跑姿獵人 sprite、終點旗）是小畫家出圖、小排版接版面，但我另外寫了兩個算數邏輯的 JS 函式，這兩個我認定屬於我的範圍，因為做的是「算出獵人現在該站在哪」而不是切 CSS class：
- `renderProgressNodes(total, cur)`：依總題數建立等距節點（只有數量變了才重建 DOM，避免每題都整組重繪），然後依目前第幾題把節點標成 `done`（已過）/`current`（正在做，脈動效果用既有的 CSS animation，不是我加的樣式本體）/未到。
- `positionHunterAsProgress()`：讀 `LEVELS[G.level].totalRounds` 跟 `G.round` 算出目前是第幾題，再用 `getBoundingClientRect()` 換算步道在畫面上的實際寬度跟起點，算出獵人 sprite 該貼在哪個 x 座標（節點等距公式 `(cur-0.5)/total`），順便更新「第 X / Y 題」文字。
- `moveHunterTowardPrey()` 裡加了一條分流：`if (G.mode === 'blank') { positionHunterAsProgress(); return; }`——L2 填空關獵人不再走「逼近獵物」那套原本的邏輯，改成呼叫步道定位。這個 if 分流本身是行為邏輯（哪個關卡用哪套獵人移動規則），我判斷這條算我的，不是純視覺調整。

`applyLevelMode()` 裡多了一行依 `G.mode === 'blank'` 切換 `#hunter` 的 `src`（換成跑姿 sprite），這行嚴格說只是換圖檔路徑，但因為判斷條件是遊戲模式邏輯（不是螢幕寬度那種排版斷點），我也算進來一起記，方便以後查「獵人圖什麼時候會變成跑步姿勢」。

至於同一個 commit 裡 L2 填空的版面重排（答案格放大、提示卡靠右、底部輸入框收掉、面板 CSS 位置）以及後續 `15dd8c3`（選項關線索置中、沙漏改絕對定位）、`097fb44`（L3 收底部輸入框）——我看過這三處的 diff，全部是 CSS 規則（`left`/`grid-template-columns`/`display:none` 掛在 `body.xxx-active` class 選擇器上）跟既有 class 開關的視覺呈現，沒有新的 JS 判斷邏輯、沒有動 `server.js`，判斷屬於小排版的範圍，我這邊不重複記錄。

交棒：白名單目前只有 `asd8107` 一筆，之後如果要加其他測試帳號，直接在 `ADMIN_UNLOCK_ALL_USERNAMES` 這個 `Set` 裡加 username 字串即可，不用碰 DB schema。

## 2026-07-07 · scores 表加 platform 欄位，桌機/手機分數分開聚合（只做後端這一半）

使用者拍板了小蘋果的建議：手機 endless 模式跟桌機固定回合制分數不是同一量級，絕不能混榜，要在 `scores` 表加 `platform` 欄位分開聚合。我完全比照兩天前 `lang_code` 那次 migration 的手法做——`ALTER TABLE scores ADD COLUMN platform TEXT NOT NULL DEFAULT 'desktop'`，放在既有 `lang_code` migration 區塊正下方；既有資料一筆不動、自動標成 `desktop`，跟當初 `lang_code` 讓 Kacaw 的舊紀錄自動標成 `trv` 是同一套零搬移邏輯。`POST /api/scores` 加一個 `platform` 欄位的合法性檢查：`req.body.platform === 'mobile' ? 'mobile' : 'desktop'`，其他亂傳的字串一律 fallback `desktop`，桌機現有前端完全不用改。`GET /api/leaderboard` 的分組鍵從 `player_id, lang_code` 擴成 `player_id, lang_code, platform`（內層 MAX 聚合、外層 SUM 聚合都要一起加，這個是我當初做 lang_code 逐語別排行榜時就抓熟的手法，這次直接複用），另外加了 `?platform=mobile/desktop` 這個選填 filter，用 SQL 裡 `WHERE (@platform IS NULL OR best.platform = @platform)` 這個「傳 null 就等於不過濾」的寫法，跟 `resolveLang` 那套「未帶就不限制」的精神一致。

這次卡了一個環境問題：本機 `.localtools` Node 20 起服務時，`better-sqlite3` 原生 binding 直接報 `Could not locate the bindings file`（本機沒裝 build tools，之前 L-003 記過這個雷，但這次連現成的預編譯 binding 都不在了，可能是上次驗證後環境有變動）。因為之前拿真實資料重跑一次 migration 太冒險（雖然邏輯上不會，但沒法用真的 better-sqlite3 驗證），我改用使用者交辦時已經預告的備案：寫一個獨立的 Python `sqlite3` 腳本，把同一套 `ALTER TABLE`／`INSERT`／排行榜分組 SQL 原樣搬過去跑（Python 內建 sqlite3 底層引擎跟 better-sqlite3 是同一套 SQLite，SQL 語法邏輯完全等價，只有具名參數符號 `@` vs `:` 不同，無關邏輯本身），模擬「Kacaw 已有 2 筆舊紀錄 → migration → 新增桌機/手機各幾筆 → 查排行榜」全流程，五個斷言全部 PASS：migration 前後筆數不變、既有資料全部落在 `platform='desktop'`、`platform` 合法性 fallback 六種輸入全對、同一玩家 desktop/mobile 分數在排行榜是兩個獨立列不會加總在一起、`?platform=` filter 正確只回對應平台。`node --check` 也過。程式碼只動了 `backend/server.js` 三處（migration 區塊、`POST /api/scores`、`GET /api/leaderboard`），`git diff --stat` 確認沒有波及其他檔案。

交棒：這次**只做後端**，`hunter-truku-v2.html`／`mobile.html`／`game-mobile.js` 完全沒動，手機前端要接上 `platform:'mobile'` 這個 body 欄位是小蘋果的工作。部署前我沒有自己上正式站——這是使用者在交辦裡明講的熔斥級動作，要先回報給他確認時機才能動手；部署步驟照鐵律：先備份 `hunter.db`、只能加欄位不能動 `scores` 既有列、部署後驗 `scores`/`players` 表筆數前後一致、記得 `pm2 restart hunter-api`（這次動了 server.js，不是純靜態檔，一定要重啟才會生效）。另外這次順便發現本機 better-sqlite3 binding 環境比 L-003 記錄的還要更缺（原本以為只是「版本不相容」，這次是「完全找不到 binding 檔」），如果下次要跑真實本機服務驗證，可能得先重新 `npm rebuild` 或補裝預編譯檔，這條我還沒去深究根因，先记录起来，之後如果本機測試又卡在同樣的錯誤，直接查這條、不用重新從頭排查。

## 2026-07-07 · Vercel 平行版——後端整套搬成 serverless + Turso，DO 一根寒毛都沒動

使用者要「多開一份」跑在 Vercel 上，用自己全新的雲端 DB，跟 DO 正式站完全獨立、資料不共用，在獨立 worktree 做、commit 到新分支 `vercel-deploy`，不准 push、不准真的部署。

**第一個判斷（重要，差點踩坑）**：交辦是在一個舊 worktree（HEAD 停在 `e816f6f`）裡起的，那份 `server.js` 是裸的三張表版本，根本沒有 `players`/`languages`/`admins`、沒有 auth 端點——跟交辦描述（含 email 註冊、JWT、42 語別）對不上。我沒有照那份舊碼搬，先查了 `git branch -a` / `git worktree list`，確認真正最新、有帳號系統跟 42 語別的碼在 `feat/v2-overhaul-accounts-ui-vocab`（`2fc3d17`）。所以我是從**那個分支**開 `vercel-deploy`，搬的是真正的現行 601 行 `server.js`。這條記起來：以後接到「搬/改後端」的任務，先確認手上這份 `server.js` 是不是最新的（比對有沒有 `players`/`languages` 表、`getUnlockedLevel`、`platform` 欄位），別憑 worktree 當下的 HEAD 就開工。

**搬法**：DO 的 `backend/server.js`（Express + 同步 better-sqlite3）我一根寒毛都沒動（`git diff --stat backend/server.js` 空的），Vercel 版是全新的 `api/` 目錄檔案。每個端點等價搬成一支 serverless function，DB 呼叫全部改 async/await 走 `@libsql/client`（Turso）。共用邏輯抽成 `api/_lib/`：`db.js`（libSQL client 單例 + `get/all/run` 三個包裝，刻意做成跟 better-sqlite3 的 `.get()/.all()/.run()` 同心智模型，搬 SQL 時幾乎原封不動）、`auth.js`（bcryptjs 雜湊、JWT、`resolveLang`、`getUnlockedLevel`、白名單、`requirePlayerAuth`/`requireAdminAuth` 都完整照搬）、`schema.js`（把 server.js 建表段 + 所有 migration 後的最終欄位狀態合併成「一次到位的 CREATE」，因為 Turso 是全新空 DB 不存在舊欄位問題）。端點清單：health、auth/{register含email,login,me}、admin/login、languages、vocabulary（GET filter/POST/[id] GET-PUT-DELETE/[word]/image·audio）、scores、leaderboard（index GET / entry DELETE / top3）、stats。

**幾個關鍵決策**：
1. **bcrypt→bcryptjs 其實不用改**——現行碼早就用 `bcryptjs`（純 JS）了，雜湊格式相容，Vercel 上不會有原生模組爆掉的問題，我沿用。
2. **JWT_SECRET 不 hardcode**——讀 `process.env.JWT_SECRET`，本機測試 fallback 一個 `dev-only-insecure` 假值（跟 DO server.js 同一個慣例），正式值使用者在 Vercel env 填。
3. **圖片/音檔上傳回 501**——Vercel serverless 檔案系統唯讀且短暫，沒法像 DO 那樣把上傳檔寫進 `/var/www/.../images` 永久保存。我查過這兩支端點只有 `admin.html` 在用、遊戲本身不呼叫，所以 POST 上傳回 501 並寫清楚原因（素材上傳走 DO 後台），但 DELETE（純清 DB 欄位）照常能用，保持行為一致。
4. **serverless 不在每次請求跑 migration/seed**——那是 `scripts/seed-turso.js` 一次性建好的事（遠端 DB 建表很慢、也不該每次請求做），function 只負責給 client + 查詢。這跟 DO 的 server.js 每次啟動跑 migration 不同，是 serverless 該有的分工。
5. **前端零改動**——查過 `API_BASE=''`（同源相對路徑 `/api/...`），Vercel 靜態前端跟 serverless API 同網域，相對路徑直接通、沒有 CORS 問題，`index.html`/`hunter-truku-v2.html`/`mobile.*` 一個字都不用改。

**seed**：`scripts/seed-turso.js` 直接吃 repo 內既有的 `backend/seeds/`（index.js 自動掃 42 支 `{lang_code}.js` + languages.js，跟 DO 同一份來源），建 schema + upsert languages + 逐語別灌 vocabulary（筆數=0 才灌，冪等）。本機用 `file:./.verceltest/hunter.db` 實跑過：42 語別、45,760 筆、trv=1092，跟預期完全吻合。**seed 資料是完整的，不需要 DO 匯出**——唯一的例外是若 DO 後台有人工補過、但沒回寫進 seed 檔的本地圖片路徑，那一小撮才需要另從 DO 唯讀匯出，但不影響基本遊玩跟 42 語別詞庫，這點我在 VERCEL-SETUP.md 跟回報裡都標了。

**本機測試**：這次環境問題比上次好——`@libsql/client` 是預編譯平台 binary、不用 build tools，用 `.localtools` Node 20 `npm install` 一次就過（不像 better-sqlite3 那樣找不到 binding）。我寫了兩支 e2e（直接 mock req/res 呼叫 handler，跑本機 file: DB）：主流程 32 個斷言全 PASS（register含email→login→me→送分含桌機解鎖防呆/手機endless略過→leaderboard 驗證 desktop 500 與 mobile 400 是兩筆獨立列不會被合成 900→vocabulary filter/fallback/by-id→languages/top3/stats）；admin 路徑 7 個斷言全 PASS（admin login→帶 token 增改刪詞彙→未登入 401→玩家 token 操作 admin 端點 403）。`node --check` 全部 api/scripts 檔都過，也掃過確認新檔沒有殘留 `better-sqlite3` import（只有註解提到）、沒有 hardcode 142.93 或密鑰。

**設定檔**：`vercel.json`（framework:null、`/api/**` 當 functions、`/` rewrite 到 index.html、api 不快取靜態資源快取 7 天）、根 `package.json`（`@libsql/client`/`bcryptjs`/`jsonwebtoken` + seed/create-admin script）、`.env.example`、`.gitignore` 補上 `.verceltest/`/`.vercel/`/`.env.local`。另外補了 `scripts/create-admin-turso.js`（對齊 DO 的 create-admin.js，給後台管理員帳號用）跟 `VERCEL-SETUP.md`（使用者照著點：註冊 Turso→建 DB→跑 seed→Vercel import `vercel-deploy` 分支→設三個 env→驗證）。

交棒：commit 在 `vercel-deploy`（從 `feat/v2-overhaul-accounts-ui-vocab` 開），**沒有 push、沒有碰 Vercel**（需要使用者帳號，交辦明講不做）。`backend/server.js` 完全沒動、DO 部署路徑零影響。使用者要上線就照 `VERCEL-SETUP.md` 走。本機測試產物 `.verceltest/` 跟 `node_modules/` 都在 .gitignore 裡、沒進版控（已驗證 staged 清單無洩漏）。若之後要把 DO 現有的真實詞彙/圖片微調同步到 Turso，那是「唯讀匯出 DO DB」的獨立任務，不在這包裡。
