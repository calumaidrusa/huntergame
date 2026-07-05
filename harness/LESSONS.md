# LESSONS.md — 踩坑紀錄簿（append-only）

> 寫入格式與規則見 [`F-knowledge-iteration.md`](F-knowledge-iteration.md) 第 2 節。
> **只能 append 新條目；不可刪改他人既有紀錄。** 超過 40 條 / 600 行時提請 User 精簡（見 F 第 3 節）。
> L-001~L-008 是 Fable 5 於 2026-07-03 從既有 agent 定義與診斷中萃取的種子坑；L-009 起是 promote 到主專案後、實際運作中踩出的新坑。

## 索引
- L-001 hint 欄位誤顯示內部代號
- L-002 種子資料只在 vocabulary 表為空時寫入
- L-003 better-sqlite3 必須用 .localtools 的 Node 20
- L-004 本機測試要先刪 .localtest DB 才會重種
- L-005 瀏覽器操作網頁生圖極慢且不穩
- L-006 v1/v2 兩套美術風格並存，勿混用
- L-007 部署絕不可動 scores 表
- L-008 DB 實為 5 表 + 帳號/JWT 解鎖系統（勿用過期 3 表 schema）
- L-009 Harness 沒 promote 到主專案 = 形同不存在，已實測驗證
- L-010 `<select>` 套 transform 會讓 Chromium 原生下拉「要按著才能選」
- L-011 過關解鎖不能只靠玩家手動送出，否則清關可能白清
- L-012 外部平台（如 chatgpt.com）的臨時檔案連結對外部工具無存取權限
- L-013 部署（scp）與 GitHub 同步（commit/push）是兩件事，只做前者會讓版控嚴重落後
- L-014 `index.html` 從「桌機複製檔」變成「裝置路由檔」後，部署清單要跟著改

---

### L-001 · hint 欄位是給玩家看的，不可放內部代號 · 2026-07-01
- 症狀：詞彙提示泡泡顯示成「(34-37)」，玩家看不懂
- 根因：誤把 CSV 內部編號當 hint 塞進去
- 正解：hint 語意上等於詞彙本身，只放詞彙，不放任何 debug/內部代號
- 通則：任何要顯示給玩家的欄位都不准夾帶內部識別碼
- 關聯：CLAUDE.md 🔒 DB schema 節

### L-002 · 種子資料只在 vocabulary 表為空時自動寫入 · 2026-07-01
- 症狀：改了 vocab_seed.js 後正式環境沒變化
- 根因：seed 只在 `vocabCount.c === 0` 時執行
- 正解：要讓新種子生效，先 `DELETE FROM vocabulary`（不是 DROP），其他表不動
- 通則：改種子後務必記得「清空該表才生效」這個前置條件
- 關聯：CLAUDE.md 🔒 DB schema / 部署安全節

### L-003 · better-sqlite3 必須用 .localtools 的 Node 20 · 2026-07-01
- 症狀：node 執行後端報原生模組版本不符 / 載入失敗
- 根因：系統 node 版本與預編譯的 better-sqlite3 不相容，Windows 無 build tools
- 正解：一律用 `.localtools/node-v20.18.1-win-x64/node.exe`
- 通則：本專案所有 node/原生模組指令都用 .localtools 那支
- 關聯：CLAUDE.md 🛠 工具鐵律表

### L-004 · 本機乾淨測試要先刪 .localtest DB · 2026-07-01
- 症狀：改了種子但本機測試看到舊資料
- 根因：DB 已存在就不會重種（同 L-002）
- 正解：測種子前先刪 `.localtest/db/hunter.db` 讓它重建
- 通則：本機驗證新種子 = 先刪本機 DB 再起服務
- 關聯：CLAUDE.md 🛠 工具鐵律表

### L-005 · 不要用瀏覽器操作 ChatGPT 網頁生圖 · 2026-07-01
- 症狀：單張測試卡近 9 分鐘、不穩定
- 根因：網頁生圖流程慢且易斷
- 正解：用 OpenAI Image API（gpt-image-1）+ gen_batch.py（含壓縮/命名/續跑）
- 通則：批量生成類工作優先走 API 腳本，不走瀏覽器 UI
- 關聯：小畫家 agent 職責 1 / CLAUDE.md 🛠 工具鐵律表

### L-006 · v1 扁平向量 與 v2 繪本/RPG 兩套風格並存，勿混用 · 2026-07-02
- 症狀：容易把詞彙插畫也跟著改成 v2 風格
- 根因：v2 只適用「遊戲介面素材」（背景/角色/UI 框架），詞彙插畫維持 v1/klokah 外連
- 正解：盤點/生成時嚴格區分兩類，詞彙插畫不套 v2
- 通則：涉及美術風格先確認「這是哪一類素材、適用哪一版風格」
- 關聯：小畫家 agent 職責 1、職責 3

### L-007 · 部署絕不可清空/覆蓋 scores 表 · 2026-07-02
- 症狀：（預防性）scores 有真實玩家紀錄（如 Kacaw），一旦洗掉無法復原
- 根因：種子/重置邏輯若誤及 scores 表會毀掉真實資料
- 正解：只 DELETE vocabulary；部署前必備份 hunter.db；部署後驗 scores 前後一致
- 通則：任何資料操作都要先確認「有沒有碰到不可逆的真實資料」——碰到就熔斷問人
- 關聯：CLAUDE.md 🔒 部署安全 / harness/D 表 3 熔斷

### L-008 · DB 實為 5 表 + 帳號/JWT/關卡解鎖系統，勿信過期的「3 表」schema · 2026-07-03
- 症狀：初版 CLAUDE.md 把 DB 寫成「3 張表」（scores/daily_stats/vocabulary），且漏了整個玩家帳號系統；對抗審查員實讀 backend/server.js 才抓出來
- 根因：撰寫 CLAUDE.md 時未讀 server.js 建表段，憑舊 agent 定義推斷 schema
- 正解：實際是 5 表——另有 players、admins；scores 經 migration 多了 player_id、cleared；vocabulary 多了 audio_path。有 bcrypt+JWT 帳號、getUnlockedLevel 以 scores.cleared 判解鎖
- 通則：改後端/DB 前，schema 一律以 server.js 建表段為準，不要信任何二手轉述；「唯一真相源」文件也可能過期，發現不符即依 F 第1節同步並記一條 lesson
- 關聯：CLAUDE.md 🔒 DB schema 節 / backend/server.js / [[L-007]]

### L-009 · Harness 沒 promote 到主專案 = 形同不存在，已實測驗證 · 2026-07-05
- 症狀：使用者問「Harness 也要運作進來喔」，實測主專案根目錄 `C:\Users\asd81\Documents\Claude\01-Game` 完全沒有 `CLAUDE.md`/`harness/`，只存在於某個 worktree 分支——建立這套制度後的兩天內，多個 session 完全沒讀過、沒用過它
- 根因：制度建好後只留在 worktree，沒有「複製/合併到主專案根目錄」這個收尾動作；G 交接信其實已經明講這是「整個交付最容易被忽略、後果最嚴重的一步」，但仍然被忽略了兩天
- 正解：本次已把 `CLAUDE.md` + `harness/*` 實際複製進主專案根目錄（本次 promote），並同步更新 CLAUDE.md 內容以反映當下現況（不是照抄 2026-07-03 的舊事實）
- 通則：任何「制度/規範/工作流」類文件，寫完後必須立刻確認它放在**未來 session 實際會開啟的目錄**，否則等於沒寫。新 session 開場應主動確認關鍵制度檔案是否在當前工作目錄可見，不要假設它存在
- 關聯：harness/G-handoff-letter.md 事① / CLAUDE.md

### L-010 · `<select>` 套 CSS transform 會讓 Chromium 原生下拉「要按著滑鼠才能選」 · 2026-07-05
- 症狀：使用者回報「語別沒辦法選，要一直用滑鼠按著」——原生 `<select>` 一放開滑鼠就收起下拉選單
- 根因：`.lang-select:hover { transform:translateY(-1px) }` 搭配 `transition:transform`。對原生 `<select>` 元素套用 transform（即使只有 1px），會干擾 Chromium 原生下拉選單的滑鼠互動，是瀏覽器層級的已知雷，不是邏輯 bug
- 正解：hover 回饋改用 `filter:brightness()` / `border-color` 等不影響版面與互動層的屬性，不對 `<select>`（或其祖先若會連動）使用 transform
- 通則：**原生表單控制項（`<select>`、`<input type=file>` 等）的 hover/active 視覺回饋，避免用 `transform`**，改用 filter/box-shadow/border-color；這類 bug 難以在無頭瀏覽器/沙盒環境重現（原生下拉是 OS 層渲染），修完要請使用者實機確認，不能只靠自動化測試判定過關
- 關聯：hunter-truku-v2.html `.lang-select`

### L-011 · 過關解鎖不能只靠玩家手動點「登錄成績」，否則清關可能白清 · 2026-07-05
- 症狀：使用者回報「Level4 破關了但是不能前進第五關」；實查正式站 `scores` 表，該玩家 L4 只有 1 筆 `cleared=0`、沒有任何 `cleared=1` 紀錄，最高過關卡停在 L3
- 根因：原設計是「過關 → 顯示結算畫面 → 玩家要手動點『登錄成績』按鈕 → 才送出 cleared=1 並解鎖下一關」。如果玩家清關後沒點那顆按鈕就離開（沒注意到、以為自動存、中途回首頁），這次清關就不會被記錄，下一關也不會解鎖，但玩家自己不會知道原因
- 正解：把「登錄成績」從「需要玩家手動觸發」改成「過關當下自動送出」（`stageClear()` 內自動呼叫 `submitAndNext()`），畫面上仍可以顯示成績/名次，但不要讓「解鎖」這種有後果的狀態依賴一個容易被忽略的手動按鈕
- 通則：任何「有進度後果（解鎖/存檔/記錄）」的動作，如果現在的設計是「玩家必須手動點一個按鈕才會生效」，要評估「玩家沒點會怎樣」——如果沒點會導致狀態不一致或使用者摸不著頭緒，優先改成該完成的當下自動觸發，把手動按鈕降級成單純的「查看/確認」而非「必要動作」
- 關聯：hunter-truku-v2.html `stageClear()` / `submitScore()` / backend `getUnlockedLevel()`

### L-012 · 外部平台（如 chatgpt.com）的臨時檔案連結，對外部工具沒有存取權限 · 2026-07-05
- 症狀：使用者貼了一個 `https://chatgpt.com/backend-api/estuary/content?id=...&sig=...` 的圖片連結，`curl` 下載回來只有 39 bytes，內容是 `{"detail":"File stream access denied."}`
- 根因：這類網址是綁定使用者自己 ChatGPT 登入 session 的簽名臨時連結，簽名/session 校驗只認得使用者瀏覽器內的那次登入態，外部程式（curl / 沒有那個 session 的請求）一律被拒
- 正解：不要嘗試用 curl/WebFetch 硬抓這類連結；直接請使用者把圖片貼進對話（跟其他圖一樣走聊天附件），或請使用者手動另存到本機路徑再把路徑給我
- 通則：看到網址網域是聊天/AI 平台自家的「backend-api」「estuary」「私有 CDN + 簽名參數」型態，先假設它是登入態綁定的臨時連結、大概率外部抓不到，別浪費一輪去試，直接請使用者換一種方式提供內容
- 關聯：（個案，工具限制）

### L-013 · 部署（scp）與 GitHub 同步（commit/push）是兩件不同的事，只做前者會讓版控嚴重落後 · 2026-07-05
- 症狀：使用者問「GitHub 上面也有同步更新嗎」，實查本機分支領先 origin、且工作區有 73 個檔案從未 commit，涵蓋這幾個月幾乎所有成果（五玩法/42 語別/手機版等），但正式站早就全部上線了
- 根因：這個專案的部署流程一直是「scp 檔案直接複製到 `/var/www/hunter/...`」，跟 git 完全脫鉤；只要沒有人主動額外做 `git add/commit/push`，GitHub 就會持續落後正式站，而且不會有任何提示或錯誤——兩邊看起來都「正常運作」，只是互相不知道對方進度
- 正解：部署完成後，若使用者要保持版控同步，主動問一次「要不要順手 commit + push」；已建立慣例：每次大批部署後緊接著做一次 git commit（先擴充 .gitignore 濾掉 `*.bak`/`__pycache__`/暫存產物）+ push
- 通則：**「部署上線」與「進版控」永遠要分開檢查，不要假設其中一個做了另一個就自動跟上**；在會用 scp/rsync 之類繞過 git 的部署流程裡，這條特別容易被忽略
- 關聯：CLAUDE.md 部署節

### L-014 · `index.html` 從「桌機複製檔」變成「裝置路由檔」後，部署清單要跟著改 · 2026-07-05
- 症狀：手機版上線後，`index.html` 的角色從「桌機 `hunter-truku-v2.html` 的複製品」改成「依裝置特徵判斷導向桌機或手機版的薄路由檔」。如果部署時沿用舊習慣把桌機 HTML 覆蓋到 `index.html`，會直接讓所有使用者（含手機）都看到桌機版，路由整個失效
- 根因：檔案角色變了，但「部署要傳哪些檔」這個心智模型如果沒跟著更新，很容易憑舊習慣操作
- 正解：桌機版更新只 scp `hunter-truku-v2.html`；手機版更新才動 `mobile.html`/`mobile.css`/`game-mobile.js`；`index.html`（路由邏輯）本身有變動才單獨傳，平常桌機/手機各自更新都不要碰它
- 通則：當一個檔案的「用途」被重新定義過，部署前先確認自己對這個檔案的假設是不是舊的；每次部署前列出「這次要傳哪幾個檔、各自為什麼」，不要憑記憶套用上一次的部署動作
- 關聯：CLAUDE.md 部署節 / 手機版路由
