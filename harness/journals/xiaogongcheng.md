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

## 2026-07-07 · 排行榜改「闖完 5 關才進榜、用 5 關總分排名」＋各關分數帳號頁暫存

使用者要改計分/排行榜規則：排行榜改用「闖完 5 關的總分」排名、只有完成全部 5 關的玩家才進榜、榜面加說明文字、各關分數先暫存在玩家自己帳號頁、沒完成 5 關分數一律不送。我先把現況查清楚才動手——這是我這個角色一貫的順序（跟「Level4 上不了第五關」那次先查資料再改邏輯同一個紀律）：舊版是**每關過關即時 POST `/api/scores`**（`stageClear()` 自動呼叫 `submitAndNext`→`submitScore(true)`），排行榜 `GROUP BY player_id, lang_code, platform` 取各關 MAX 加總、沒有任何「完成度門檻」，所以單關玩一玩就上榜；帳號頁除了 `#welcomeMsg` 沒有各關分數的呈現。

設計上我踩到一個核心矛盾必須拍板：後端 `getUnlockedLevel()` 是靠 `scores` 表裡 `cleared=1` 的紀錄算序列解鎖的，如果照使用者「沒完成 5 關就不送」直接把每關 POST 拔掉，玩家過了 L1 後端不知道→L2 永遠鎖住。我選的解法是**前端 localStorage 暫存 + session 本地序列解鎖**（比照既有訪客模式那套本地解鎖），過關只暫存不送、5 關全過才一次把 5 筆分數 POST 上去；並在 `refreshAuthMe()`（登入/重整後）用本地暫存的已完成關卡把 `AUTH.unlockedLevel` 往上補（取 max，兩邊都不倒退），解決「過了 L1 重整後 L2 又鎖」的問題。這樣後端 `POST /api/scores` 完全不用改（送分時機全在前端控制），天然符合「沒完成不送」，也是使用者交辦裡就偏好的方向。後端只改 `GET /api/leaderboard` 加一道 `HAVING COUNT(DISTINCT CASE WHEN cleared=1 THEN level END) >= MAX_LEVEL` 當第二道防線（前端已擋、後端再擋一次）。

**既有 11 筆真實分數的處置**：一筆不動、不刪不改（部署鐵律）。它們是「單關即時送分」年代的舊資料，在新的 `HAVING >= 5 關 cleared=1` 門檻下，只要湊不齊 5 關就自動不出現在榜上——是「保留但不顯示」，不是刪除；若哪位舊玩家剛好湊得齊 5 關，仍會正常上榜（向下相容）。這點我在回報裡明確標出來讓主管/使用者拍板，沒自作主張。

前端新增一個暫存模組（`runProgressKey`/`loadRunProgress`/`saveRunLevelScore`/`clearRunProgress`/`clearedLevelCount`/`runProgressTotal`/`applyLocalUnlockFromProgress`/`submitFullRun`/`renderRunProgress`），暫存 key 綁 `username×lang_code`（跟排行榜逐語別一致，不同語別各自累積）、同關重玩只保留較高分；`submitScore` 改成過關暫存、死亡不記錄、5 關全過才 `submitFullRun` 送 5 筆；帳號頁進度塊掛在 `#titleScreen` 的 `#myProgress`（`showTitleScreen`/`onLangChange` 觸發重繪，DOM/文案基本、美化與版位交小排版）；排行榜 modal 加 `#lbNote` 說明文字。自我檢查：`server.js` `node --check` 過、抽主 JS 區塊 `--check` 過（抽取正則會被 CSS 註解裡字面 `<script>` 誤配，改用行邊界精準抽 line 3288~6557 那段主 JS 才對，這個坑記一下）、Python sqlite3 模擬排行榜 SQL（避 better-sqlite3 binding 缺失，沿用上次那招）5 項斷言全過（舊單關資料/只過3關不上榜、完整5關總分正確、逐語別不混算、scores 零刪改）、node 模擬前端暫存邏輯 4 情境全過（依序5關前4關不送/L5送5筆總分正確/死亡不記錄/未滿5關暫存不送/較低分不覆蓋）。

交棒：**這次只做 DO 版**（`hunter-truku-v2.html`＋`server.js`），Vercel 版（`api/`）跟手機版（`mobile.*` 獨立點字拼字、不走 5 關闖關）都沒碰，使用者說 Vercel 同步他之後自己處理。**沒部署**——使用者明講先不 scp、不 pm2 restart，他要用 8087 preview 驗證＋跟使用者確認後才部署。要部署時記得：`server.js` 有改，一定要 `pm2 restart hunter-api` 才生效（前端是靜態檔不用重啟，但這次前後端一起改）；備份 `hunter.db`、`scores` 表零刪改、部署後驗 `scores` 筆數前後一致＋排行榜 `/api/leaderboard` 回傳的都是完成 5 關的列。有一個待拍板點留給使用者：新規則下「未完成 5 關就不送分」，代表玩家要一次連過 5 關（可跨 session，因為暫存在 localStorage）才會上榜，門檻比舊版單關上榜高很多——這是使用者要的，但實際玩家體驗上要不要保留這麼硬，可能要看上線後反應。

## 2026-07-08 · L2/L3 UX 大包：可調比例答案提示 + 打散字母說明 + 進關卡前說明強化 + 答對出新詞 + 跳過鈕

使用者反映 L2/L3 對不熟族語的人太難，一開始要「可開關的答案提示（damay 示意：已打實色、未打淡灰 ghost）」，做的過程中協調員陸續追加四件事，最後併成一整包（全在 `hunter-truku-v2.html`，避免多 agent 搶改）。我先照慣例把現有機制查清楚才動手——關鍵發現是 L2/L3 早就有 `renderAnswerCells`（依答案長度排格、已打填 filled、未打留空、只露長度不露正解），所以 ghost 直接沿用這個骨架擴充，不用另做一套 UI；而「進關卡前說明」其實 `#modeInstructionOverlay`＋`modeGuideData()` 早就有海報式五模式說明，我只需把 L2 那張講清楚「字母被打散了」。

**① 答案提示（可調比例）**：本來做成 all/nothing 布林，使用者回饋「一次顯示全部很討厭、有人想練習」，我改成 `AnswerHint` 模組存**比例**（`ANSWER_HINT_LEVELS=[0,30,50,70,100]`，點鈕循環），localStorage key `ht_answer_hint_pct`（**預設 0%＝關**，這是安全底線——不主動改任何人的難度）；舊布林 `'1'` 遷移成 100%。露哪些字母：`answerRevealPositions()` 用**均勻分布**（沿用 `renderSyllableDots` 那條 `floor((j+1)*n/(count+1))` 公式），刻意不用「前 N 個」——前綴露出玩家只照抄前面然後卡住，均勻分布才是真的鷹架。L2/L3 把露出的字當淡灰 ghost 預填進未打的答案格（`.answer-cell.ghost`），L5 盲打走 `#inputDisplay` 幽靈字（露出位置露字母、未露位置放 `·` 佔位不洩漏、已打字元 typed-correct/typed-wrong 實色）。**L5 我決定讓它也能開**——盲打本意是無提示，但這是玩家自己 opt-in、預設 0% 仍是純盲打，不強加。鈕放 stage 右側中下（`#answerHintToggle`，`body.typing-active` 才顯示、選項關隱藏），新增 `vico-eye` mask icon（禁 emoji）。

**② 打散字母說明**：試玩者看不懂右邊那排字母。`#wordTarget.hint-letters::before` 原本只寫「字母提示」四個字，我改成兩行「這個詞的字母（順序已打散）／請照正確順序拼出來」（純 CSS content、不新增 DOM）。

**③ 進關卡前說明**：`modeGuideData('blank')` 跟 `modeHowto('blank')` 的文案都改成明確講「所有字母、順序被打散、參考中文提示重排」。L3 本來就講得清楚（聽發音→打整個詞），沒大動；其他關（L1/L4/L5）現有說明已足夠，沒硬塞。

**④ 答對出新詞、答錯才重複**（改 §1.5-A）：`buildLevelPoolAndQueue` 依 `ld.isChoice` 分流——**打字關**（L2/L3/L5）佇列改成「各不相同的詞、洗牌後每詞各一次、長度湊到 totalRounds」，`nextRound` 順序取用＝答對就一直看到新詞；**答錯的重複沿用既有機制**（打字關答錯是「留在原題重試」，逾時才 `requeuePrey` 插回近端再現，這條完全沒動）。相容性我特別確認過：過關門檻是我上一批加的 `hitAttempts ≥ ceil(totalRounds/2)=9`，distinct 佇列長 18 綽綽有餘（全對只需 9 題、逾時 requeue 還會延長佇列，不會提早耗盡）；詞不夠（離線 fallback/小語別）時 `need=min(uniq,total)`，湊不滿就用實際長度，真耗盡由 `nextRound` 既有的「`G.round>=preyQueue.length`→stageClear」收尾。**選項關 L1/L4 維持原 §1.5-A 重複展開不動**（誘答演算法依賴聚焦少量詞）。

**⑤ 跳過鈕**（`skipRound`）：換下一個新詞、**不 requeue 被跳過的詞**（他不會、再出很煩）、**不加 hitAttempts**（跳過不能幫忙達成過關門檻→天然防濫用）、**不動 totalAttempts**（跳過不是一次作答，不汙染準確率）、**不扣血**（門檻本就是答對半數、跳過已無好處，再扣血是雙重懲罰反而不敢用）、**不記 roundLog**（中性非事件、不列入單詞回顧），只重置 combo。鈕放 `#skipBtn`（`body.has-track` 遊戲中才顯示），**全關卡通用**（打字關＋選項關都給，選項關也可能有不會的詞）——唯一保留提醒：選項關佇列是重複展開的，跳過的詞後面仍可能再出現（打字關 distinct 佇列不會），這是可接受的取捨，主要目的「無懲罰往前」兩邊都達成。

自我檢查：抽主 `<script>` 用**行邊界**（3392–6842，別用正則會被 CSS 註解裡字面 `<script>` 誤配，這坑上次記過）`node --check` 過；三支 Node 邏輯測試全綠——ghost 渲染 15 項（含撇號家族比對、0% 與原行為逐字元完全一致不洩漏）、綜合 31 項（比例遷移/檔位/均勻分布個數、0% 答案格 == 原行為且無 ghost、100% 未打格全 ghost、打字關 distinct 佇列全不重複且長度封頂）、跳過 12 項（不動 hitAttempts/totalAttempts/hp、不 requeue、!active 無效、選項鎖防重入）。用 `.localtools` Node 20 跑（本機系統 Node 不相容 better-sqlite3，但這次純前端邏輯測試不碰 DB，用哪個都行）。**最關鍵的安全性質**——localStorage 沒 key 時 pct=0 → `answerRevealPositions` 回空集合 → 所有渲染回到原本行為，預設完全不改現有難度，這條測試明確涵蓋。

交棒：**只動 `hunter-truku-v2.html` 一支、沒碰 scores/後端/Vercel/手機版**、**沒部署**（使用者要自己 preview 驗＋請使用者實測後才部署）。跟小排版的介面：我新增的 `#answerHintToggle`（.on 狀態 class、`#answerHintState` 徽章文字）、`#skipBtn`、`.answer-cell.ghost`、`#inputDisplay .ghost`、`vico-eye`、`body.typing-active` 這些 id/class 我先給了「功能正確、樣式基本」版，木質精緻樣式跟版位微調（尤其兩顆 stage 右側鈕 bottom:330/285 的實際落點、窄螢幕會不會撞到答案面板）交小排版，別把 id/onclick 改掉就好。有一個待使用者拍板點：跳過鈕全關卡通用，但選項關（L1/L4）因佇列是重複展開、被跳過的詞後面仍可能再現——若使用者希望選項關跳過也「絕不再現」，要另外改 L1/L4 的佇列模型（目前刻意不動以免破壞誘答聚焦），這點留給他定案。

## 2026-07-08 · 桌機 L2/L3/L5 從「打字」大改成「點打散字母磚拼字」

使用者定案把桌機三個打字關全部改掉打字框，改成像手機版那樣「點一排打散的字母磚，照正確順序拼出族語詞」。這是核心玩法大改，我照慣例先把現有機制查透才動手——關鍵發現是判定/計時/HP/combo/答對出新詞/跳過/半數過關這一整套完全可以不動，因為我把**點磚做成「往 `#realInput.value` append 字母再 dispatch input 事件」**，等於沿用打字時代那條唯一輸入管線（`updateInputDisplay`→答案格、`normalizeAnswer`、`submitWord` 對 `variants` 比對），只是把「鍵盤打字」換成「點磚產生字元」。`#realInput` 留著當隱形接鍵盤層（承接 Enter 送出捷徑），送出鈕也保留當 fallback，但主要送出時機改成**拼滿（已點字母數＝答案字母數）自動 `submitWord()`**。答錯不換題、清磚重來（`resetLetterTiles`，比照打字關留在原題重試），還加了「退一格」鈕（`tileBackspace` 吐回最後一顆磚）。

資料模型：`G.hintScramble` 從「字串陣列」升級成 `[{ch, used, decoy}]`，`G.tileOrder` 記已點磚的 index 堆疊（供退格/重試歸位）。磚字母來源刻意用**主讀法 `variants[0]`（`tileAnswerSource`）而不是 `displayWordOf`**——後者可能含斜線多讀音（"supug / sabal"）或連字號，直接拆會冒出 `/` 這種非字母磚、還拼不出正解；答案格骨架、拼滿長度也全部改用同一個 source 對齊。多字詞（"laqi snaw"）另外處理：磚是去空白的字母，玩家拼出的 val 沒有字間空白，所以 `submitWord` 在點字關多一條「兩邊都去空白再比一次」的相容判定（純空白差異，不放寬拼字）。

三關難度靠「線索多寡」分（字母都露在磚上了）：**L2** 給中文提示卡 + 字母磚（最易，不播音會洩漏）；**L3** 靠聽發音自動播 + 字母磚、**清掉中文**（比 L2 難）；**L5** 線索最少——不給中文、不自動播音，且磚**混入誘答假字母**（`makeHintScramble` 對 blind 多灑約 40%、下限 2 上限 5 顆、優先挑答案沒用到的字母當干擾）＋整體再洗一次，玩家得從干擾裡挑對的、拼不出來就是錯，維持它最難的定位。我的設計取捨：L5 的干擾只是視覺辨別難度，判定仍是完整字串比對，點錯磚拼不出答案，不會誤放行。

跟剛加的「答案提示 % eye toggle」協調：字母全在磚上後，原本「露幾成答案字母當 ghost」對點字關是多餘且會直接洩漏正確順序（我在 `renderAnswerCells` 點字關一律清空 revealPos、不畫 ghost）。我把這顆鈕在點字關**改語意成「提示下一顆該點的磚」**——開啟時 `nextCorrectTileIdx()` 算出正確的下一顆磚、標 `.next-hint` 發光引導；徽章從百分比改成「開/關」，label 改「提示下一顆」。有代價的提示鈕（`useHint`→`hintRevealNextLetter`）在點字關也改成「自動幫玩家點下一顆正確磚」，走同一套點磚流程，避免跟舊那套「直接改 realInput.value」打架導致磚狀態/字數對不上。

一個非做不可的接線：L5 盲打原本沒有 `blank-active`/`listen-active` body class，中央 `#answerArea`（現在裝著答案格＋磚列）會 `display:none`。我加了 `body.tile-active`（`applyLevelMode` 依 `isTileMode` 開）統一控制答案面板/磚列顯示，並補了「只涵蓋 L5」的 `#answerArea` 定位（`:not(.blank-active):not(.listen-active)`）＋收掉 L5 底部深色輸入框。文案全套更新：進關卡海報（`modeGuideData`/`modeHowto`）、頂端任務列（`modeTaskText`）、答案格下方說明、L2 磚說明都改成「點字母磚照順序拼」；L3 音節點列不再露字母（原本 40% 在原序位露出＝洩漏拼字順序，點字關會破壞挑戰，改純點只留長度）。

自我檢查：抽主 `<script>` 用**行邊界**（3492–7159，別用正則會被 CSS 註解裡字面 `<script>` 誤配，這坑記過幾次了）`node --check` 過；三支 Node 邏輯測試共 48 項全綠——tile 核心 31 項（照序點→自動送出→caught、亂序→不 caught 且磚全歸位、退格、L5 decoy 數量/避開答案字母/仍能拼對、多字詞去空白相容、多讀音只取主讀法無斜線磚、下一顆磚提示、撇號折 `'` 磚、`isTileMode` 分類、自動送出只在滿長度才觸發不早送）、`renderLetterTiles` markup 11 項（磚數/退格鈕/data-idx/used disabled/decoy class/next-hint 開關/選項關 hidden 清空）、答案格骨架 6 項（多讀音只排主讀法格且格內容無斜線、多字詞 8 格＋gap、去空白 typed 跨 gap 填滿、點字關即使 AnswerHint=100 也不畫 ghost）。用 `.localtools` Node 20 跑（沙箱抽函式 + vm context，DOM 用 stub，不碰 better-sqlite3）。本機 8087/3001 preview 服務起得來、health OK、trv 詞庫 1092 筆全有音檔，served HTML 確認含所有新 hook。**沒能跑瀏覽器實機截圖**——這環境的 computer-use/chrome MCP 沒接上（工具沒載入），所以視覺是靠 48 項自動測試 + markup 斷言覆蓋，實機觀感（磚點感、版位、L5 面板落點）要靠 preview 人工看。

交棒：**只動 `hunter-truku-v2.html` 一支**、**L1/L4 選項關一行沒碰**（grep 確認 choice 流程零 tile 引用）、**沒碰 scores/後端/Vercel/手機版**、**沒部署**（照鐵律等使用者 preview＋實測拍板）。跟小排版的介面（都給了「功能正確、樣式基本」版，別改 id/onclick/data-idx）：新增 `#letterRack`（容器）、`.letter-tile`[`.used`|`.decoy`|`.next-hint`]、`#tileBackspace.tile-back`、`body.tile-active`（L5 顯示答案面板/磚列的關鍵 class）、`.mg-prev-tiles`（海報預覽磚）。木質精緻磚樣式、L2 詞卡現在只剩中文提示會顯得空（原本靠 `#wordBubble` 塞字母磚撐版，現在磚搬走了，版位要重配）、L5 中央面板落點/窄螢幕會不會撞獵人步道或右側詞卡——這些交小排版。舊的 `#wordTarget.hint-letters`/`.hint-letter` CSS 我標成停用但沒刪（保留避免動到別處），磚樣式一律改在 `.letter-tile` 上做。一個待使用者拍板的難度點：L3（listen）詞卡仍會顯示獵物插畫（pre-existing，我沒動），那張圖等於露了詞義、讓 L3 比預期好猜——要不要在 L3 也把插畫收掉讓它更純聽力，留給使用者定案（我沒自作主張改，因為那是既有行為、且動它是額外的難度調整不在這批範圍）。另外背景還開著一個 3001 本機 preview node，無害，使用者驗完可自行關。
