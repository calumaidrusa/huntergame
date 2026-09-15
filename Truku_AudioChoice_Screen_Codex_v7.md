# Truku Audio-Choice Screen Assets Codex — v7（L1 聽音選詞畫面改版）

**Version:** 7.0
**Target AI:** Codex / GPT image generation（`gpt-image-1`）
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 依使用者提供的 **L1「聽音選詞」（audio-choice）改版設計圖** 盤點素材。比對素材庫後，設計圖絕大多數元件靠**現有素材 + CSS** 即可完成；**真正需要新生的只有 2 項**：【A1】中央深色木雕答題面板框（必生）、【A2】沙漏計時元件（必生）。另列 1 項可選加分：【A3】選項木牌框變體。美術風格與文化安全規則**完全沿用 `Truku_Hunter_Game_Assets_Codex_v2.md`**，本文件不重新定義。

> 分工提醒：本文件只做**素材需求評估 + 生圖規格**。實際排版（深色遮罩、背景暗化、2×2 網格、ARCADE 降級標籤、資訊層級）皆為 **CSS/HTML 工作，交小排版**；動態切換／計時邏輯交小工程。小畫家不改 `hunter-truku-v2.html`、不自己呼叫生圖 API。

---

## 設計圖 10 點改版 × 素材需求對照表

| # | 設計圖改版點 | 對應現有素材 / 做法 | 判定 |
|---|---|---|---|
| 1 | 主標題「太魯閣語挑戰 / TRUKU LANGUAGE QUEST」突出、ARCADE 降為小「模式」標籤 | 標題可沿用 `v2-title-sign.png`／登入標題木牌；ARCADE 降級純 CSS 縮小成小 pill 標籤（現況 `.game-title-hud` 就是純文字） | ✅ 現有素材 + CSS |
| 2 | 生命❤3／SCORE／LEVEL 整齊一致 | HP 用 `v2-hp-bar-frame-hollow.png`、LEVEL 用 `v2-level-badge.png`、頭像用 `v2-avatar-frame.png`；排列一致是 CSS | ✅ 現有素材 + CSS |
| 3 | 中央面板：頂端一行小字 +「放大中文提示」+ 喇叭 | **無合適現成框**（見下方說明）→【A1】新生 | 🆕 需新素材【A1】 |
| 4 | 音訊操作直覺：喇叭按鈕明確 +「點擊重播」 | 現況 `#choicePlayBtn` 是 emoji 🔊 + CSS 光暈/脈動，已直覺可用；「點擊重播」純文字 | ✅ 現有（emoji）+ CSS |
| 5 | 右側沙漏元件「剩餘時間 08 秒」 | **無任何沙漏/計時器素材** →【A2】新生（現況只有純 CSS 細條 `#choiceTimerBar`） | 🆕 需新素材【A2】 |
| 6 | 反饋提示在角色附近短暫顯示（橘色「逃走了！」小泡泡） | **`ui-word-bubble.png`**（綠框尖角對話泡泡）正好可用；橘色/紅色狀態用 CSS `hue-rotate`/疊色或直接文字染色 | ✅ 現有素材（`ui-word-bubble.png`）+ CSS |
| 7 | 4 選項大小一致、2×2 網格、長詞分行 | 選項已用 `v2-button-green-trim.png`；一致寬高 + 2×2 grid + 長詞換行皆 CSS（現況 `.choice-opt` flex-wrap，改 grid 由小排版處理） | ✅ 現有素材 + CSS（可選升級見【A3】） |
| 8 | 中央答題區深色遮罩、背景暗化 | 深色遮罩 = CSS 半透明黑層；背景暗化 = CSS `filter:brightness()`/overlay。**遮罩本身不生圖**，但遮罩上承載提示的**木框面板**要生（=【A1】） | ✅ 遮罩 CSS ／ 🆕 面板框【A1】 |
| 9 | 角色與答題結果互動 | 已有多組獵人姿態 `v2-hunter-truku-idle/aim/release/h1/h2.png`，切換是小工程邏輯 | ✅ 現有素材 + 邏輯 |
| 10 | 留白平衡、移除多餘透明黑區塊 | 純排版調整 | ✅ CSS |

**結論：10 點裡只有第 3 點（中央面板框）、第 5 點（沙漏）需要新生素材；第 7 點可選升級。其餘全部現有素材 + CSS。**

---

## 為什麼中央面板框 / 沙漏不能沿用現有素材

- **`v2-word-card-frame.png`**：直式羊皮紙卡、**明亮米色**底。設計圖第 8 點明確要「**深色遮罩、視線聚焦**」的中央答題面板，需要**深色木底 + 橫式**、承載「一行小字提示 + 放大中文 + 喇叭」的橫向構圖。明度（亮 vs 暗）與長寬比（直 vs 橫）都不符，硬套會與「背景暗化聚焦」的設計意圖打架 → 需【A1】。
- **`v2-tip-banner.png`**：橫式木牌，但**太細長**（純橫條），塞不下「小字 + 大中文 + 喇叭」的多列內容，也沒有聚焦答題區的體量 → 不適合當中央面板。
- **沙漏**：素材庫遍查無任何沙漏／計時器造型素材，現況 L1 計時只有純 CSS 細長條 `#choiceTimerBar`。設計圖第 5 點指定「**沙漏元件**」視覺 → 需【A2】。
- **反饋泡泡**：**已有 `ui-word-bubble.png`**（綠框、底部尖角），造型正是「角色頭上對話泡泡」，可直接沿用；顏色狀態（答對綠／逃走橘／答錯紅）用 CSS 疊色即可，**不需新生**。

---

## System Role

You are the **Truku Hunter Game Art Director（v2 style, Audio-Choice Screen batch）**。細緻繪本/RPG 遊戲美術、木雕＋羊皮紙裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），不混用其他族群或泛部落意象——規範全部沿用 `Truku_Hunter_Game_Assets_Codex_v2.md`。

生成參數沿用既有方案：`gpt-image-1`、`quality: medium`、透明背景元件輸出 **PNG**。**生成前先把 prompt 列給使用者確認、確認額度夠再跑**，遇 `billing_hard_limit_reached` 立即停止回報、不重試。生成後用 Pillow 裁掉四周透明留白、確認 alpha 乾淨再交小排版。

---

## 素材生成佇列

### 【A1】中央深色木雕答題面板框 Center Dark Wooden Quiz Panel Frame — 🟢 中性木雕，無族群符號 ｜ ✅ 必生

**現況**：全新素材。設計圖中央是承載題目的核心面板，疊在「深色遮罩 / 背景暗化」之上以聚焦任務。面板**內部留空**（頂端小字提示、放大的中文詞彙、喇叭鈕都由前端 HTML/CSS 疊在框內，**不燒進圖**）。

🔍 **文化備註**：純木雕框裝飾（木質紋理 + 藤蔓/葉片邊角），採**中性森林／木工藝語彙**，不加入任何太魯閣族或其他族群的織紋、菱形紋、紋面（Ptasan）、祭儀符號。葉片藤蔓為通用自然裝飾，風險低。

✨ **視覺設定**：
- **橫式**圓角矩形木框面板，**深色木底**（比 `v2-word-card-frame` 的明亮羊皮紙暗，配合「深色遮罩聚焦」的設計意圖），內面板色偏深棕／墨綠、**半透明感**（讓底下暗化背景微微透出，強化聚焦）。
- 木框邊緣有雕刻厚度與立體光影，四角或上下緣有**少量葉片/藤蔓**點綴（呼應森林主題），中性不涉族群符號。
- **內部大面積留空**（供疊字），框內可有極淡的深色木紋/皮革質感，但**不畫任何文字、喇叭、圖示**。
- 頂緣中央可留一小塊略淺的橫向題頭區（供「聽聲音，選出正確的太魯閣語」那行小字疊放），非必要。
- 透明背景 PNG，橫式構圖（目標約 4:3～3:2 的橫向面板；`gpt-image-1` 用 `1024x1024` 或 `1536x1024` 生成後裁切，把面板置中、四周留透明）。

🎨 **Prompt**：
```
A horizontal rounded-rectangle wooden quiz panel frame, a UI element for a
language game's center question area. Dark carved wood border with visible
3D thickness, warm rim lighting and hand-painted illustration texture (rich
storybook RPG game art style, NOT flat vector, NOT a photograph). The inner
panel area is a large EMPTY dark surface (deep brown / dark mossy green,
slightly translucent look) reserved for text to be overlaid later — no text,
no icons, no speaker symbol inside. A few small green leaves and thin vines
decorate the outer corners and edges as neutral forest ornaments. The panel
is centered as a landscape-oriented plaque with fully transparent space
around its shape. Warm, cozy, focused mood. No text, no watermark, no
characters.
```
**Negative prompt**: `text, letters, numbers, speaker icon, buttons inside, bright parchment, light cream paper, vertical portrait card, tribal weaving patterns, diamond motifs, face tattoo, ethnic ceremonial symbols, flat vector icon, photorealistic photography, watermark`

📖 **備註**：面板**內部務必留空**（前端要疊「小字提示 + 放大中文 + 喇叭鈕」）。輸出 PNG、裁掉四周透明。命名建議 `v2-choice-panel-frame.png`。給小排版接線時，注意此框是疊在 CSS 深色遮罩層之上、選項按鈕群之下（或框內下半含選項區由排版決定）。

---

### 【A2】沙漏計時元件 Hourglass Timer Element — 🟢 通用計時意象 ｜ ✅ 必生

**現況**：全新素材。設計圖第 5 點右側指定「**沙漏元件**」顯示剩餘秒數。素材庫無任何沙漏。

🔍 **文化備註**：沙漏為**通用計時意象**，非任何族群符號，零文化風險。木質外框呼應遊戲木雕語彙即可。

✨ **視覺設定**：
- 單一**沙漏**主體，木質/黃銅框（呼應暖色木雕語彙），玻璃內金色沙粒，上下腔室清楚。
- 造型**直立、正面**、置中，**沙粒約落到中段**（半滿感，暗示倒數中；避免畫成全滿或全空，好讓靜態圖適用整段倒數）。
- **不畫任何數字/秒數**（「剩餘時間 08 秒」由前端疊字）。
- 可選：底部或框上有極輕微葉片點綴，維持森林調；保持乾淨，不要過度裝飾以免縮小後糊掉。
- 透明背景 PNG，接近正方構圖（`gpt-image-1` `1024x1024`，沙漏置中、四周留透明），縮到 UI 尺寸仍清晰。

🎨 **Prompt**：
```
A single upright hourglass timer, a game UI icon element. Warm wooden and
brass frame with two clear glass bulbs, glowing golden sand — the sand is
about half fallen into the lower bulb (mid-countdown look). Rich
storybook-illustrated RPG game art style, warm lighting, hand-painted
illustration texture (NOT flat vector, NOT a photograph). Front-facing,
centered composition, clean and readable when scaled down small. A couple of
tiny green leaves may decorate the wooden base as a neutral forest accent.
No numbers, no text, no watermark, transparent background around the
hourglass shape.
```
**Negative prompt**: `numbers, digits, text, clock face, digital timer, tribal patterns, ethnic motifs, face tattoo, flat vector icon, photorealistic photography, watermark, full sand, empty sand`

📖 **備註**：**不燒任何數字**（秒數前端疊）。沙粒畫半滿即可通用於整段倒數。輸出 PNG、裁掉透明。命名建議 `v2-hourglass-timer.png`。若之後小工程想做「沙量隨倒數變化」的進階效果，可再議是否補生滿/空兩個變體——本批先出半滿一張夠用。

---

### 【A3】選項木牌框變體 Choice Option Wooden Plaque（✅ 使用者 2026-07-05 已確認生成） — 🟢 中性木牌

**狀態**：**使用者已拍板生成**（讓選項與【A1】中央深色木雕面板調性一致）。取代現有 `v2-button-green-trim.png` 當 4 選項的按鈕框，2×2 一致排版由小排版 CSS 處理。答對綠光/答錯紅光回饋沿用現況 CSS `.choice-opt.correct/.wrong` 疊色。

🔍 **文化備註**：中性木牌，不加族群織紋/紋面/祭儀符號（原民風以「森林木工藝」中性語彙表達，非特定族群圖騰）。

✨ **視覺設定**：橫式圓角木牌按鈕，深木底 + 金邊，內部**大面積留空**供疊族語詞（長詞需分行，框內留足高度）；與【A1】面板同一木雕調性、明度相配；**單一顆**造型（4 顆由前端複用同一張），透明背景 PNG。

🎨 **Prompt**：
```
A single horizontal rounded wooden plaque button for a game UI, dark carved
wood with a golden rim and warm rim lighting, rich storybook-illustrated RPG
game art style (NOT flat vector, NOT a photograph). The inner surface is a
large EMPTY dark wood panel reserved for a word label overlaid later — no
text inside. Clean, readable, suitable to be tiled as identical answer-choice
buttons in a 2x2 grid. Neutral forest woodcraft look, maybe one tiny leaf
accent. Centered, transparent background around the plaque shape. No text,
no watermark.
```
**Negative prompt**: `text, letters, tribal weaving patterns, diamond motifs, face tattoo, ethnic ceremonial symbols, flat vector icon, photorealistic photography, watermark, bright green plastic button`

📖 **備註**：命名建議 `v2-choice-option-plaque.png`。生前先問使用者要不要（綠鈕已可用，這是純美化升級）。**答對綠光/答錯紅光**回饋沿用現況 CSS `.choice-opt.correct/.wrong` 疊色，不需另生。

---

## 已備齊免生成（❗不要重複生，直接接線）

設計圖上以下元素都有現成素材或純 CSS 可解，**本批一張都不用生**：

| 設計圖區塊 | 現有素材 / 做法 | 路徑 |
|---|---|---|
| 森林背景（暗化聚焦） | v2 遊戲主背景 + CSS `brightness()` 暗化 | `public/images/ui/v2-background-game.jpg` / `v2-background-game-cliff.jpg` |
| 獵人角色（與結果互動） | v2 獵人多姿態 | `public/images/ui/v2-hunter-truku-{idle,aim,release,h1,h2}.png` |
| 角色附近反饋泡泡（逃走/答對/答錯） | 綠框尖角對話泡泡（顏色狀態用 CSS 疊色） | `public/images/ui/ui-word-bubble.png` |
| 主標題木牌 | v2 標題木牌 | `public/images/ui/v2-title-sign.png` / 登入標題木牌 |
| HP / 生命 | v2 血條框（鏤空） | `public/images/ui/v2-hp-bar-frame-hollow.png` |
| LEVEL 標示 | v2 等級徽章 | `public/images/ui/v2-level-badge.png` |
| 玩家頭像框 | v2 頭像木框 | `public/images/ui/v2-avatar-frame.png` |
| 喇叭播放鈕 | emoji 🔊 + CSS 光暈脈動（現況 `#choicePlayBtn`） | — |
| 4 選項按鈕底 | v2 綠鈕（2×2 一致排版 = CSS） | `public/images/ui/v2-button-green-trim.png` |
| 深色遮罩 / 背景暗化 / ARCADE 降級小標籤 / 留白平衡 | 純 CSS，無素材 | — |

---

## 文化安全註記（太魯閣族紅線，務必遵守）

- 【A1】【A2】【A3】皆為**中性木雕/計時/自然裝飾**語彙，**不涉人物、服飾、器物、祭儀場景**，無族群符號挪用疑慮。
- 全批**絕不描繪紋面（Ptasan）**；**不混用**泰雅菱形紋/織紋、阿美紅黑配色/'alofo/八角星繡、排灣琉璃珠/貴族圖騰、美洲羽冠/圖騰柱等元素。
- 「原民風」以**森林木工藝的中性語彙**（木紋、藤蔓、葉片）表達，**不套用任何特定族群的圖騰或儀式符號**。
- 沿用中的獵人角色維持「米白苧麻族服的通用弓箭手造型、無紋面」（見 `Truku_Hunter_Character_Codex_v3.md`），本批不改角色。
- 📖 若素材日後用於正式出版/教學/對外公開，建議請太魯閣族文化工作者確認。

---

## 生成前檢查清單

- [ ] 【A1】【A2】【A3】三張全生（使用者已確認）？「已備齊免生成」清單一張都沒重生？
- [ ] 【A1】面板：**深色木底 + 橫式 + 內部留空**，明度/比例與 `v2-word-card-frame` 明確區隔（不是亮羊皮紙、不是直式）？
- [ ] 【A1】【A2】【A3】內部/表面**都沒有任何文字/數字**（提示文字、中文詞、秒數、族語詞全由前端疊）？
- [ ] 【A2】沙漏畫**半滿**、**無數字**、縮小後仍清晰？
- [ ] 全批**無紋面、無族群織紋/圖騰/祭儀符號**、無其他族群視覺元素？
- [ ] Prompt 皆含 v2 風格關鍵字（storybook-illustrated RPG game art）＋排除 flat vector icon / photorealistic photography？
- [ ] 輸出 **PNG 透明背景**、Pillow 裁掉四周透明留白、alpha 乾淨？
- [ ] 生成前先報 prompt 與張數給使用者確認（額度把關）？

---

## 使用方式提醒

把本文件整份交給生圖流程：**依編號處理【A1】【A2】【A3】三張全生**（A3 使用者 2026-07-05 已確認）。「已備齊」清單裡的素材（背景/獵人/反饋泡泡/HP/LEVEL/頭像/綠鈕等）**不要重生**。生完的接線組版（深色遮罩、2×2 網格、ARCADE 降級、資訊層級、面板疊字）交**小排版**；計時/角色互動/沙漏倒數邏輯交**小工程**。小畫家只出素材與本規格，不改 `hunter-truku-v2.html`、不動後端。
