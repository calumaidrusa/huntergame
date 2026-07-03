# Codex 素材盤點 · 壓縮 · 歸位對應表（v2 批次）

- 產出日期：2026-07-03
- 負責：小畫家
- 來源資料夾（原檔不動）：`C:/Users/asd81/Documents/Codex/02-game/public/images/ui/`
- 本階段只做「素材壓縮 / 歸位 / 對應表」，未改任何 `.html` / `.js` / `vocab_seed.js`

## 處理總計

| 類別 | 張數 | 目標路徑 | 格式 |
|---|---|---|---|
| v2 介面素材 | 15 | `public/images/ui/` | 14 張透明 PNG + 1 張背景 JPG |
| 詞彙插畫 | 30 | `public/images/` | JPEG（實心背景，非透明）|
| 獵物圖 | 10 | `public/images/ui/` | 透明 PNG |
| 其他 UI 素材 | 10 | `public/images/ui/` | 透明 PNG |
| **合計** | **65** | | |

- 對應失敗：0 筆（詳見詞彙表備註，其中 5 筆做了人工消歧義，1 筆檔名缺括號需人工比對，均已解決）
- 透明度驗證：34 張透明 PNG 壓縮後四角 alpha 仍為 0（通過）
- 文化審查：全部通過，無疑慮項目（詳見第 5 節）

---

## 1. v2 介面素材對應表

- 來源皆為 1.4–2.9MB 大檔，已壓縮。
- 透明素材縮到最長邊 1200px（背景 1536px），保留 RGBA alpha，存 PNG。
- 背景圖不透明，存 JPEG q85。
- 檔名維持 `v2-` 前綴，與現有 v1 檔名（`background-game.jpg` 等）並存不覆蓋。小排版套 UI 時把 HTML 的 v1 檔名改指向這批 v2 檔名。

| 來源檔 | 遊戲 UI 元素用途 | 佇列編號 | 壓縮後路徑 | 前→後大小 | 尺寸 | 透明度 |
|---|---|---|---|---|---|---|
| v2-background-game.png | 遊戲主背景（16:9 山林峽谷） | 【1】 | `public/images/ui/v2-background-game.jpg` | 2880→418KB | 1536×864 | 不透明(JPEG) |
| v2-hunter-character.png | 獵人角色（通用奇幻弓箭手） | 【2】 | `public/images/ui/v2-hunter-character.png` | 1625→474KB | 1200×800 | RGBA 保留 |
| v2-title-sign.png | 標題木牌 | 【3】 | `public/images/ui/v2-title-sign.png` | 1830→480KB | 1200×480 | RGBA 保留 |
| v2-level-badge.png | 關卡標籤木牌 | 【4】 | `public/images/ui/v2-level-badge.png` | 1643→602KB | 1200×800 | RGBA 保留 |
| v2-hp-bar-frame.png | HP 血條容器框（愛心+木框） | 【5】 | `public/images/ui/v2-hp-bar-frame.png` | 1436→277KB | 1200×400 | RGBA 保留 |
| v2-word-card-frame.png | 詞彙卡片框（羊皮紙卷軸，可重複使用） | 【6】 | `public/images/ui/v2-word-card-frame.png` | 2271→1090KB | 800×1200 | RGBA 保留 |
| v2-correct-banner.png | 答對提示綠色橫幅 | 【7】 | `public/images/ui/v2-correct-banner.png` | 1632→482KB | 1200×600 | RGBA 保留 |
| v2-target-board.png | 箭靶 | 【8】 | `public/images/ui/v2-target-board.png` | 1911→1000KB | 1200×1200 | RGBA 保留 |
| v2-score-sparkle.png | 得分金色光效 | 【9】 | `public/images/ui/v2-score-sparkle.png` | 1702→389KB | 1200×1200 | RGBA 保留 |
| v2-avatar-frame.png | 玩家圓形頭像框 | 【10】 | `public/images/ui/v2-avatar-frame.png` | 1831→791KB | 1200×1200 | RGBA 保留 |
| v2-combo-plaque.png | 連擊計數木牌 | 【11】 | `public/images/ui/v2-combo-plaque.png` | 1614→634KB | 1200×800 | RGBA 保留 |
| v2-input-field.png | 輸入框（深綠木框） | 【12】 | `public/images/ui/v2-input-field.png` | 1633→425KB | 1200×515 | RGBA 保留 |
| v2-shoot-button.png | 射箭按鈕（金色木框） | 【13】 | `public/images/ui/v2-shoot-button.png` | 2026→692KB | 1200×600 | RGBA 保留 |
| v2-function-buttons.png | 圓形木質功能鍵（書本=單字列表 / 齒輪=設定，合圖） | 【14】 | `public/images/ui/v2-function-buttons.png` | 2100→689KB | 1200×600 | RGBA 保留 |
| v2-tip-banner.png | 底部提示列（長木牌+燈泡） | 【15】 | `public/images/ui/v2-tip-banner.png` | 1435→240KB | 1200×400 | RGBA 保留 |

> 提醒小排版：`v2-function-buttons.png` 是「書本 + 齒輪」兩顆按鈕的合圖，套 UI 時需自行切圖或用 CSS 背景定位裁切。

---

## 2. 詞彙插畫對應表

- 來源為 `vocab-{太魯閣語詞}.png`，實心（洋紅）背景，非透明 → 壓成 JPEG q85、512×512。
- 命名沿用既有慣例：`code` 連字號換底線 + `.jpg`（與現有 `09_21.jpg` asu、`09_46.jpg` lihaw 一致）。
- 目標路徑一律 `public/images/{code底線}.jpg`。
- 對應狀態全部成功。多義詞（同 `word` 有多個 `code`）與檔名缺標點者已人工消歧義，決策見「備註」欄，**小工程更新 `vocab_seed.js` 前可再複核這幾筆是否選對編號**。

| 來源檔 | 太魯閣語詞 | 中文 | 分類 | 對應 code | 目標檔名 | 狀態 / 備註 |
|---|---|---|---|---|---|---|
| vocab-biyi-rudux.png | biyi rudux | 雞寮 | 建築 | 12-12 | `public/images/12_12.jpg` | OK |
| vocab-brikug.png | brikug | 女性飾品 | 織布服飾 | 18-06 | `public/images/18_06.jpg` | OK |
| vocab-dangar.png | dangar | 石壓陷阱 | 狩獵 | 16-09 | `public/images/16_09.jpg` | OK |
| vocab-durang.png | durang | 套頸陷阱 | 狩獵 | 16-10 | `public/images/16_10.jpg` | OK |
| vocab-empruq.png | empruq | 破洞 | 織布服飾 | 18-08 | `public/images/18_08.jpg` | OK |
| vocab-eru-lhang.png | eru lhang | 染布 | 織布服飾 | 18-13 | `public/images/18_13.jpg` | OK |
| vocab-gamil.png | gamil | 根 | 植物 | 08-28 | `public/images/08_28.jpg` | OK |
| vocab-gigan.png | gigan | 穀物乾燥簍 | 農耕 | 15-05 | `public/images/15_05.jpg` | OK |
| vocab-gsak.png | gsak | 剮麻具 | 織布服飾 | 18-32 | `public/images/18_32.jpg` | **消歧義**：另有 09-29（竹製刮麻具·物品），同一件器物；選織布服飾類 18-32 |
| vocab-habuk.png | habuk | 腰帶 | 織布服飾 | 18-11 | `public/images/18_11.jpg` | **消歧義**：另有 18-25（褌布）；圖為腰帶/布帶，選 18-11 腰帶 |
| vocab-mnkala-hidaw.png | mnkala hidaw | 日出 | 自然景觀 | 11-33 | `public/images/11_33.jpg` | OK |
| vocab-mqrig.png | mqrig | 熊鷹（動物） | 植物 | 08-50 | `public/images/08_50.jpg` | OK（json 分類原樣） |
| vocab-nuqaw.png | nuqaw | 芋頭 | 植物 | 08-35 | `public/images/08_35.jpg` | OK |
| vocab-nuqih.png | nuqih | 苧麻纖維 | 織布服飾 | 18-31 | `public/images/18_31.jpg` | OK |
| vocab-pala.png | pala | 傳統布裙 | 織布服飾 | 18-20 | `public/images/18_20.jpg` | OK |
| vocab-piri.png | piri | 挑織 | 織布服飾 | 18-14 | `public/images/18_14.jpg` | OK |
| vocab-pngpung-dgiyaq.png | pngpung dgiyaq | 小山頭 | 山脈地理 | 10-21 | `public/images/10_21.jpg` | OK |
| vocab-psakur.png | psakur | 犁田 | 農耕 | 15-02 | `public/images/15_02.jpg` | OK |
| vocab-pshada-pnegalang.png | pshada(pnegalang) | 催熟(果實) | 農耕 | 15-13 | `public/images/15_13.jpg` | **檔名缺括號**：json 記為 `pshada(pnegalang)`，已人工對應，圖為枝上果實=催熟果實 |
| vocab-qngqaya-pspingun.png | qngqaya pspingun | 測量工具 | 織布服飾 | 18-18 | `public/images/18_18.jpg` | OK |
| vocab-ququy-ddgiyaq.png | ququy ddgiyaq | 高山峻嶺 | 山脈地理 | 10-22 | `public/images/10_22.jpg` | OK |
| vocab-ribul.png | ribul | 褲子 | 織布服飾 | 18-07 | `public/images/18_07.jpg` | **消歧義**：另有 18-15（女性長褲）；選通用褲子 18-07 |
| vocab-sbal.png | sbal | 揹小孩的揹帶 | 織布服飾 | 18-22 | `public/images/18_22.jpg` | **消歧義**：另有 09-57（揹帶·物品）；選織布服飾類 18-22 |
| vocab-sla-sbiyaw.png | sla sbiyaw | 傳統上衣 | 織布服飾 | 18-19 | `public/images/18_19.jpg` | OK |
| vocab-tbabaw.png | tbabaw | 竿子陷阱 | 狩獵 | 16-12 | `public/images/16_12.jpg` | OK |
| vocab-towkan.png | towkan | 背網 | 織布服飾 | 18-26 | `public/images/18_26.jpg` | OK |
| vocab-towrah.png | towrah | 木臼 | 織布服飾 | 18-27 | `public/images/18_27.jpg` | OK |
| vocab-tragu.png | tragu | 女性飾品 | 織布服飾 | 18-05 | `public/images/18_05.jpg` | OK |
| vocab-uyung.png | uyung | 後院 | 建築 | 12-19 | `public/images/12_19.jpg` | OK |
| vocab-wahug.png | wahug | 頭帶/揹帶 | 織布服飾 | 18-30 | `public/images/18_30.jpg` | OK |

> 消歧義說明：同一個太魯閣語詞在資料庫出現在多個 code（多為「物品」與「織布服飾」重複收錄同一件器物）時，本表統一選用語意最貼近圖片內容的那一筆。小工程若要讓另一個 code 也共用同一張圖，可自行把兩個 code 的 `image_path` 都指向同一檔名，不需要重生成。

---

## 3. 獵物圖 + 其他 UI 清單

### 3a. 獵物圖（透明 PNG，512×512，路徑 `public/images/ui/`）

| 檔名 | 用途 | 新/舊 | 備註 |
|---|---|---|---|
| prey-bear.png | 熊（獵物） | 新 | — |
| prey-clouded-leopard.png | 雲豹（獵物） | 新 | — |
| prey-flying-squirrel.png | 飛鼠（獵物） | 新 | — |
| prey-hawk-eagle.png | 熊鷹（獵物） | 新 | — |
| prey-monkey.png | 猴子（獵物） | 新 | — |
| prey-muntjac.png | 山羌（獵物） | 新 | — |
| prey-boar.png | 山豬（獵物） | 舊(重出) | 與現有 v1 `prey-boar.jpg` 並存；此為透明 PNG 版 |
| prey-deer.png | 鹿（獵物） | 舊(重出) | 同上，PNG 版 |
| prey-pheasant.png | 雉雞（獵物） | 舊(重出) | 同上，PNG 版 |
| prey-serow.png | 長鬃山羊（獵物） | 舊(重出) | 同上，PNG 版 |

> 4 張舊獵物（boar/deer/pheasant/serow）來源是透明 PNG，故輸出為 `.png`，不會覆蓋既有的 v1 `.jpg`。小工程/小排版選用時請確認要用透明 PNG 版還是舊 JPG 版，避免同時載入兩套。

### 3b. 其他 UI 素材（透明 PNG，路徑 `public/images/ui/`）

| 檔名 | 用途 | 尺寸 | 大小 |
|---|---|---|---|
| ui-trophy.png | 獎盃（結算畫面） | 1024×1024 | 638KB |
| ui-medals.png | 獎牌組（結算/成就） | 1024×1024 | 596KB |
| ui-stat-card.png | 數據卡片框 | 1024×1024 | 583KB |
| ui-game-over.png | 遊戲結束畫面素材 | 1024×1024 | 562KB |
| ui-word-bubble.png | 詞彙對話泡泡 | 1024×1024 | 361KB |
| ui-combo-dots.png | 連擊圓點指示 | 1024×1024 | 243KB |
| ui-shoot-button-bg.png | 射擊按鈕背景 | 1024×1024 | 711KB |
| ui-hp-bar.png | HP 血條（舊風格 HUD 條） | 1024×302 | 223KB |
| ui-volume-on.png | 音量開圖示 | 410×410 | 204KB |
| ui-volume-off.png | 音量關圖示 | 410×410 | 198KB |

> 注意：`ui-hp-bar.png`、`ui-volume-on/off.png` 與現有 v1 同名 `.jpg` 是不同副檔名，並存不覆蓋。v2 已另有 `v2-hp-bar-frame.png`；小排版決定 HP 條要用哪一版時請留意這裡有三個相關檔（v1 `ui-hp-bar.jpg`、新 `ui-hp-bar.png`、v2 `v2-hp-bar-frame.png`）。

---

## 4. 略過清單（v1 舊版，已被 v2 取代，不歸位）

以下來源檔沒有 `v2-` 前綴，是已被 v2 版取代的 v1 舊素材，**未複製到專案**（避免與 v2 衝突）。專案內既有的同名 v1 `.jpg`（在 `public/images/ui/`）維持原樣不動，等小排版把 HTML 改指向 v2 檔名後即自然停用。

| 來源檔（未歸位） | 已被取代者 |
|---|---|
| background-game.png | v2-background-game.jpg |
| background-title.png | v2-background-game.jpg（標題頁沿用主背景）/ 若需要標題頁背景再議 |
| character-hunter.png | v2-hunter-character.png |
| difficulty-extreme.png | 【16】待重新規劃（v2 尚未生成難度圖示，暫沿用 v1 或 emoji） |
| difficulty-fern.png | 同上（【16】待規劃） |
| difficulty-jungle.png | 同上（【16】待規劃） |
| difficulty-mountain.png | 同上（【16】待規劃） |
| frame-game.png | v2-word-card-frame.png / v2 各框架素材 |
| icon-bow.png | v2-shoot-button.png（含箭矢圖示）|

> 提醒：4 張 `difficulty-*` 對應佇列【16】，Codex 文件標為「待重新規劃、尚未以 v2 風格生成」。目前 v2 批次沒有難度圖示，難度選單暫時仍需沿用 v1 難度圖或 emoji，等使用者確認核心 UI 風格後再統一補生成。這不影響本階段歸位。

---

## 5. 文化審查快速複核

依職責 5「畫物件本身、不編造紋樣」原則，逐一目視複核詞彙插畫中的文化敏感詞（服飾 / 狩獵器物 / 織布類）。**全部通過，無疑慮。**

| 詞彙 | 類型 | 複核結果 |
|---|---|---|
| pala（傳統布裙） | 服飾 | 純米色布裙 + 素綠色綁帶，無任何織紋圖案 / 菱形紋 / 其他族群配色。安全 |
| habuk（腰帶） | 服飾 | 素色布帶 + 綠邊，無編織人形紋 / 幾何族群紋。安全 |
| ribul / tragu / brikug / sla-sbiyaw / piri / wahug | 服飾 | 均為物件本體呈現，未套用泰雅菱形紋、阿美紅黑、排灣圖騰，無虛構紋樣。安全 |
| towkan（背網） | 器物 | 通用結繩網袋，無族群識別圖案。安全 |
| nuqih（苧麻纖維）/ gsak（剮麻具）/ qngqaya-pspingun（測量工具） | 織布器物 | 通用纖維 / 木石工具，與詞彙表苧麻文化事實一致，無編造。安全 |
| dangar（石壓陷阱）/ durang（套頸陷阱）/ tbabaw（竿子陷阱） | 狩獵器物 | 通用木 / 石 / 繩陷阱結構，無儀式符號 / 紋面 / 階級標記。安全 |

補充：
- 本批**無任何人物角色插畫**，故不涉及紋面（Ptasan）風險。
- v2 `v2-hunter-character.png`（獵人角色）已由 Codex 依 v2 文件生成為「通用奇幻弓箭手」造型（頭帶 / 護臂 / 背心 / 箭袋），未畫臉部紋樣，符合文化審查。使用者先前已初步確認品質；本階段僅壓縮歸位，未改動造型。
- 免責：以上 AI 生成圖為近似視覺語彙，非特定太魯閣族服制 / 器物的精確復刻。若用於正式出版、教學或對外公開，建議請太魯閣族文化工作者複核。

---

## 6. 交接給小工程 / 小排版

- **小工程**（更新 `vocab_seed.js` 的 `image_path`）：用第 2 節「詞彙插畫對應表」，把 30 個 code 的 `image_path` 設為 `/images/{code底線}.jpg`。標「消歧義 / 檔名缺括號」的 6 筆（gsak 18-32、habuk 18-11、ribul 18-07、sbal 18-22、pshada 15-13、以及若要讓重複 code 共用圖）請先複核編號選得對不對。
- **小排版**（套 v2 UI）：用第 1 節表把 HTML 內原 v1 檔名改指向 `v2-` 檔名；注意 `v2-function-buttons.png` 為兩鍵合圖需切圖，且 HP 條有 v1/新 PNG/v2 三個相關檔要擇一。
- 本階段未動任何程式碼、未動 `scores` 表、未部署。原始 Codex 檔案保持不動。

---

# ===== v2 批次 B（Codex 登入/角色/結算三份 md 產出）=====

- 產出日期：2026-07-03（第二批）
- 來源資料夾（原檔不動）：`C:/Users/asd81/Documents/Codex/02-game/public/images/ui/`
- 目標：`C:/Users/asd81/Documents/Claude/01-Game/public/images/ui/`
- 依三份 codex：`Truku_Login_Screen_Codex_v4.md`（L1~L8）、`Truku_Hunter_Character_Codex_v3.md`（3.1 射箭動作 sprite）、`Truku_Game_Screen_Codex_v5.md` + `Truku_GameOver_Codex_v6.md`（結算/背景）
- 處理方式：透明 PNG 縮最長邊 1200（外框 1400、背景 JPEG 1536），保留 alpha；細緻插畫類 PNG 另做 256 色 FASTOCTREE 量化（無 dither）壓縮，實測金色漸層/中文字/透明邊皆無可見劣化，體積約降 5–7 倍。**原始 Codex 檔案未動，只複製壓縮版。**
- 本階段只做素材處理，**未改任何 `.html` / `.js`**（套用交小排版；動畫/背景切換邏輯交小工程）。

## B1. 登入畫面素材（`Truku_Login_Screen_Codex_v4.md`）

| 來源檔 | codex 編號 | 用途 | 歸位檔名（`public/images/ui/`）| 尺寸 | 大小 | 透明度 |
|---|---|---|---|---|---|---|
| login-l1-ornate-frame.png | 【L1】 | 全畫面木質雕花外框（中央鏤空）| `login-frame.png` | 1400×788 | 60KB | RGBA，**中央真透明**（見驗證）|
| login-l2a-title-plaque.png | 【L2a】 | 標題木牌（含燒字「族語射手」）| `login-title-plaque.png` | 1200×640 | 159KB | RGBA |
| login-l3-tab-buttons.png | 【L3】 | 分頁鈕合圖 → **切 2** | `login-tab-active.png`（金/選中）+ `login-tab-inactive.png`（綠/未選）| 各約 925×850 | 139/104KB | RGBA |
| login-l4-parchment-card.png | 【L4】 | 羊皮紙登入卡（卡面全空）| `login-parchment-card.png` | 957×1200 | 208KB | RGBA |
| login-l5-icon-badges.png | 【L5】 | 圖示徽章合圖 → **切 3** | `login-icon-person.png`（獵人代號）/ `login-icon-lock.png`（通行密語）/ `login-icon-quill.png`（獵人名稱）| 各約 590–698×793 | 61–64KB | RGBA |
| login-l7-volume-buttons.png | 【L7】 | 音量圓鈕合圖 → **切 2** | `login-volume-on.png` + `login-volume-off.png` | 各約 940×836 | 各 115KB | RGBA |
| login-l8-guest-button.png | 【L8】 | 訪客模式橫式木牌鈕（左側人像、文字區留白）| `login-guest-button.png` | 1200×480 | 61KB | RGBA |

- **login-l6 / login-l6b 未歸位**：codex 標為「條件性重生」，先試沿用既有 `v2-input-field.png` / `v2-shoot-button.png`；來源資料夾雖有 `login-l6-input-field.png` / `login-l6b-enter-button.png`，但依 codex 決策先不採用，等小排版試套沿用素材不合再啟用（屆時再壓縮歸位）。
- **切圖對應提醒小排版**：分頁鈕選中態＝底圖互換（active/inactive）；三顆圖示徽章依序對應獵人代號 / 通行密語 / 獵人名稱三列；音量開/關擇一顯示。所有動態文字（分頁字、輸入標籤、「進入山林」、「訪客模式」）由 CSS 疊，圖內未燒。

## B2. 獵人射箭動作 sprite（`Truku_Hunter_Character_Codex_v3.md` 3.1）

| 來源檔 | 用途 | 歸位檔名 | 尺寸 | 大小 | 備註 |
|---|---|---|---|---|---|
| v2-hunter-truku-sprites.png | 三幀 sprite 合圖 → **切 3（等寬第三切）** | `v2-hunter-truku-idle.png`（幀A 待機/行走）/ `v2-hunter-truku-aim.png`（幀B 拉弓瞄準）/ `v2-hunter-truku-release.png`（幀C 放箭）| 各 627×836 | 82/93/85KB | 三幀同寬同高、**未各自 trim**，共用地面基準線，切圖互換不跳動 |

- **切法**：合圖 W=1881 於 x=627、1254 等分（幀 A/B 之間為全透明真空隙；幀 C 前伸的持弓臂在切線內未被裁到，已逐張目視確認）。
- **幀 B 命名為 `v2-hunter-truku-aim.png`（新檔，不覆蓋線上 `v2-hunter-truku-h2.png`）**：依 codex，線上獵人 `v2-hunter-truku-h2.png` 是否改用切圖版由**使用者決定**，小畫家不擅自替換已上線檔案。小工程/小排版預設仍可用 h2 當靜態獵人，動畫則用這三幀。
- 朝向：三幀與 h2 同為**側面朝右**（獵人向右靠近獵物），一致。若遊戲方向相反用 CSS `scaleX(-1)`（小排版），不重生。

## B3. 遊戲畫面背景變體（`Truku_Game_Screen_Codex_v5.md`【G2】）

| 來源檔 | 用途 | 歸位檔名 | 尺寸 | 大小 | 備註 |
|---|---|---|---|---|---|
| v2-background-game-cliff.jpg | 懸崖平台背景變體（左側草地平台給獵人站位）| `v2-background-game-cliff.jpg` | 1536×864 | 377KB | JPEG q85，**保留原 `v2-background-game.jpg` 不覆蓋**，供 A/B 或切換 |

> 註：`Truku_Game_Screen_Codex_v5.md`【G1】頂部標題橫幅本可用登入【L2a】木牌沿用（見 v5 省額度提示），本批未見獨立 G1 橫式嵌框素材，故不另歸位；標題一律用 `login-title-plaque.png`。

## B4. Game Over / Stage Clear 結算素材（`Truku_GameOver_Codex_v6.md`）

| 來源檔 | codex 編號 | 用途 | 歸位檔名 | 尺寸 | 大小 | 狀態 |
|---|---|---|---|---|---|---|
| v2-gameover-skull-badge.png | 【G1】 | Game Over 骷髏徽章（卡通風）| `v2-gameover-skull-badge.png` | 1200×1200 | 289KB | 主用 |
| v2-clear-trophy-badge.png | 【G2】 | Stage Clear 獎盃徽章（與骷髏共用外框）| `v2-clear-trophy-badge.png` | 1200×1200 | 366KB | 主用 |
| v2-result-panel-frame.png | 【G3】 | 結算面板框（**橫帶留空版·主方案**，Game Over/Clear 共用）| `v2-result-panel-frame.png` | 960×1200 | 264KB | **主用**（GAME OVER/STAGE CLEAR 由 CSS 疊字）|
| v2-result-panel-gameover.png | 【G4-a】 | 面板燒「GAME OVER」金字版 | `v2-result-panel-gameover.png` | 960×1200 | 294KB | **備選**（CSS 立體字不滿意時才用）|
| v2-result-panel-clear.png | 【G4-b】 | 面板燒「STAGE CLEAR」金字版 | `v2-result-panel-clear.png` | 960×1200 | 298KB | **備選** |
| v2-result-stat-card.png | 【G5】 | 數據卡框（一張共用 ×3，底部深綠橫帶留空）| `v2-result-stat-card.png` | 900×1200 | 174KB | 主用 |
| v2-button-green.png | 【G6】 | 深綠木框按鈕（回首頁）| `v2-button-green.png` | 1200×600 | 88KB | 主用；金色主鈕（記錄+重試）沿用 `v2-shoot-button.png` |

- 燒字版 `v2-result-panel-gameover.png` / `v2-result-panel-clear.png` 拼字經逐字檢查正確（GAME OVER / STAGE CLEAR），與主方案並存不覆蓋，**由小排版擇一**：優先用留空版 + CSS 立體字，CSS 效果不佳再改燒字版。
- 這批取代舊扁平風 `ui-game-over.png` / `ui-stat-card.png` / `ui-trophy.png` / `ui-medals.png`（舊檔先留著，等小排版改指向新素材後自然停用）。

## B5. 未歸位 / 判定過時的來源檔（不複製）

| 來源檔 | 判定 | 原因 |
|---|---|---|
| v2-game-over-screen.png | **過時整頁草稿，不歸位** | 是「已排版好的整頁 mockup」：燒入了動態分數（272 / 2 / 67%）、HP 條、按鈕中文（記錄+重試 / 回首頁）、「GAME OVER」等。違反「不把動態文字/數字烤進圖」原則，且無法當可複用元件；只作 Codex 的版面示意，不進專案。|
| v2-game-over-screen-old-title-button.png | **過時整頁草稿，不歸位** | 同上，且右下按鈕是舊文案「回標題」（現行為「回首頁」），更明確過時。不歸位。|
| login-l6-input-field.png / login-l6b-enter-button.png | 暫不歸位（條件性）| codex【L6】【L6b】為條件性重生，先試沿用 `v2-input-field.png` / `v2-shoot-button.png`；沿用不合再壓縮歸位。|

## B6. 本批驗收結果（回報重點）

- **login-frame（L1）中央透明驗證**：✅ **通過**。原檔中央 40% 區塊 alpha 全為 0（dead center RGBA=(0,0,0,0)），木框四邊 alpha=255；256 色量化壓縮後複驗中央 alpha 仍為 (0,0) 全透明、頂框 alpha=255。**未重蹈 v1 `frame-game` 中央不透明報廢覆轍。**
- **login-title-plaque（L2a）中文字檢查**：✅ **通過**。主木牌燒字為「族語射手」四字，逐字確認無錯字/缺筆/變字；金色橫幅「TRUKU WORD ARCHER」拼字正確；綠色橫幅「太魯閣語・TRUKU LANGUAGE」四個中文字正確。量化壓縮後字面仍清晰無崩壞。
- **獵人 sprite 三幀文化複核**：✅ **通過**。三張臉全部逐一檢視，**零紋面（Ptasan）/ 零臉部線條塗色**；主色為米白/苧麻本色素淨、紅色僅頭帶與衣襟簡約織帶點綴、無複雜幾何織紋、無泰雅菱形紋/阿美紅黑/排灣琉璃珠/美洲羽冠等跨族群元素；服裝與已上線 `v2-hunter-truku-h2.png` 一致（頭帶、紅織帶、腰際獵刀、背箭袋、綁腿、棕靴），三幀彼此服裝一致、朝向一致（朝右）。**免責：AI 生成之近似視覺語彙，非特定太魯閣族服制精確復刻；正式對外/教學前建議請太魯閣族文化工作者複核。**
- **結算徽章外框一致性**：✅ 骷髏徽章與獎盃徽章共用同一圓形木框（金圈+菱形鉚釘+兩側葉叢），只換中央圖案；骷髏為圓潤卡通風（額頭裂紋、無恐怖/血腥）。
- **透明度總驗**：本批 21 張透明 PNG 壓縮後四角 alpha 皆為 0（合圖切出的子件亦同）。
- **需重生/待決項**：無需重生項。**待使用者決策**：(1) 線上獵人 `v2-hunter-truku-h2.png` 是否改用 sprite 切圖版幀 B（`v2-hunter-truku-aim.png`）；(2) 結算面板用留空版+CSS 疊字或燒字備選版；(3) 背景是否改用/切換懸崖變體；(4)【L6/L6b】輸入框與進入鈕是否沿用既有素材（小排版試套後回報）。
