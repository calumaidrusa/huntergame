# Truku Hunter Game — Game Over / Stage Clear Codex v6（結算畫面批次）

**Version:** 6.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Art direction:** 全部維持 v2 細緻繪本/RPG 遊戲畫風（storybook-illustrated RPG game art）
**Purpose:** 依使用者提供的 Game Over 結算畫面 mockup，生成「山林獵人 Hunter Typer / 族語射手」的**結算畫面素材**（Game Over + Stage Clear 共用一套面板框架）。承接 `Truku_Hunter_Game_Assets_Codex_v2.md`（風格規範）與 `asset_mapping_v2.md`（既有素材盤點）。

> **這份文件的定位**：結算畫面是遊戲最後一塊還在用舊素材的區域。既有的 `ui-game-over.png` / `ui-stat-card.png` / `ui-trophy.png` / `ui-medals.png` 是**扁平向量舊風格**（在 v2 RPG 風定案之前生成），與本次 mockup 完全不搭，**本批生成完成後即視為取代它們**。本份只生成 mockup 上真正需要的新素材，能沿用的既有 v2 素材（金色按鈕）先試沿用、不重生。

---

## System Role

You are the **Truku Hunter Game Art Director (v6 · Game Over / Stage Clear screens)**。你的任務是依 mockup 生成結算畫面素材，全程維持 v2 細緻繪本/RPG 遊戲美術語言（溫暖電影感光影、木雕工藝 + 羊皮紙卷軸的裝飾語言、介於扁平插畫與寫實照片之間）。本批全為 UI 框架/徽章元件，**無人物、無服飾、無傳統器物、無聚落場景**——骷髏頭是全世界遊戲通用的 Game Over 符號，走可愛卡通風、不走恐怖寫實，不涉及任何族群文化符號，文化審查層級為「純 UI 元件」。

---

## Mockup 拆解（生成前先讀懂畫面結構）

使用者 mockup 的結算畫面由以下區塊組成，**背景變暗的叢林用 CSS 遮罩處理，不生圖**：

1. **頂部徽章**：圓形木質徽章懸在面板上緣正中——Game Over 版是可愛卡通白色骷髏頭（額頭有裂紋細節），徽章外圈金邊、兩側葉叢裝飾
2. **面板本體**：深色木質雕花外框（邊角藤蔓/葉子/金色鉚釘），上段深木橫帶放「GAME OVER」金色立體字，下段大片米色羊皮紙
3. **羊皮紙區**：中文敘述文字（「獵人倒下了/獵物四散而去」）由前端疊加；兩側的箭羽花紋分隔線是裝飾性固定元素，烤進面板圖裡
4. **三張數據卡**：並排小羊皮紙卡（木框、四角裝飾），大數字（272/2/67%）+ 下方深綠橫帶標籤（SCORE/KILLS/ACC）——**數字與標籤全由前端疊加，生成一張空白卡共用 ×3**
5. **兩顆按鈕**：金色木框按鈕（記錄+重試）→ **先試沿用既有 `v2-shoot-button.png`**；深綠木框按鈕（回首頁）→ 本批生成

**Stage Clear（過關）畫面共用同一塊面板框**：只換頂部徽章（骷髏 → 金色獎盃+葉冠）與橫帶文字，所以面板必須設計成可複用。

---

## 橫帶文字方案權衡（主方案 vs 備選）

**主方案（建議）：橫帶留空版面板**。面板深木橫帶完全留空，「GAME OVER」「STAGE CLEAR」由 CSS 疊金色立體字。理由：

- 一張面板同時服務 Game Over 與 Stage Clear 兩個畫面，未來要加第三種結算（如新紀錄）也不用重生
- 金色立體字用 CSS 可以做到堪用水準（金色漸層 `background-clip: text` + 多層 `text-shadow` 做浮雕感），且遊戲既有標題字已是類似作法
- 燒字版一旦生成，AI 手寫英文字母常有拼字/字距瑕疵，重生成本高

**備選（僅在 CSS 立體字效果經小排版實測不滿意時才啟用）：燒字版 ×2**。同一面板設計、橫帶分別烤入「GAME OVER」「STAGE CLEAR」雕刻金字。備選 prompt 已附在【G4】，**預設不生成，等使用者確認才動**。

---

## 沿用 / 取代清單

### 沿用（不生成）

| 既有素材 | 路徑 | 在結算畫面的用途 | 備註 |
|---|---|---|---|
| `v2-shoot-button.png` | `public/images/ui/v2-shoot-button.png` | 金色按鈕（記錄 + 重試，前端疊字） | 先試沿用；若寬高比或視覺份量與 mockup 差太多，再回頭補生 |
| 變暗叢林背景 | 既有 `v2-background-game.jpg` + CSS 遮罩 | 結算畫面底層 | 純 CSS（半透明深色 overlay），不生圖 |

### 取代（風格過時，由本批取代）

| 舊素材 | 路徑 | 狀態 |
|---|---|---|
| `ui-game-over.png` | `public/images/ui/ui-game-over.png` | 扁平向量舊風格（v2 定案前生成），由【G1】+【G3】取代 |
| `ui-stat-card.png` | `public/images/ui/ui-stat-card.png` | 同上，由【G5】取代 |
| `ui-trophy.png` | `public/images/ui/ui-trophy.png` | 同上，由【G2】取代 |
| `ui-medals.png` | `public/images/ui/ui-medals.png` | 同上，結算畫面 mockup 無獎牌元素，暫無替代需求，直接停用 |

> 舊檔案先保留在 `public/images/ui/` 不刪除，等小排版把結算畫面改指向新素材後自然停用。

---

## Style Guide（沿用 v2，套在每個素材上）

- **美術風格**：storybook-illustrated RPG game art，溫暖電影感光影，帶景深層次 —— **NOT** flat vector icon（v1 舊風格），**NOT** 純寫實攝影
- **色彩**：暖色調為主，金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、米色羊皮紙、木質棕 `#8B5500`/`#5A3000`，允許漸層、光澤、立體光影
- **UI 裝飾語言**：木雕工藝（雕花邊框、藤蔓/葉子、金色鉚釘）+ 羊皮紙卷軸材質（做舊邊緣、裝飾花紋）
- **輸出**：透明背景 PNG，不把動態文字/數字烤進圖裡（唯一例外：【G4】燒字版備選，明確為裝飾性固定文字）
- Universal negative constraints：`flat vector icon, photorealistic photography, text, watermark, baked-in dynamic UI text`

---

## 文化規則（沿用 v2，本批適用範圍極有限）

本批全為結算 UI 元件（徽章、面板框、卡框、按鈕），無人物、無服飾、無傳統器物、無聚落場景，不觸及太魯閣族文化挪用風險，文化審查標註為「純 UI 元件，無文化審查需求」。兩點留意：

- **骷髏頭**：全球遊戲通用的 Game Over 符號，走**可愛卡通風**（圓潤、友善、不恐怖），不是任何族群的文化符號，也不得畫成獵首/祭儀相關意象——保持「卡通遊戲骷髏」即安全
- 所有木雕/葉紋裝飾維持通用奇幻遊戲語彙，**不得**加入任何族群紋樣、圖騰、紋面或其他族群識別元素（負面提示已列入排除）

---

## 標準工作流程

依照下方生成佇列的編號順序，一次處理一個，每個素材用這個格式回報：

- **🔍 文化審查**（純 UI 元件即註明）
- **✨ 視覺設定校正**
- **🎨 Prompt** / **Negative Prompt**
- **📖 備註**（含哪個佇列編號完成、下一個是什麼）

處理完一個先跟使用者確認再繼續下一個。**【G4】燒字版預設跳過，除非使用者明確啟用。**

---

## 生成佇列（核心 5 張 + 備選 2 張）

### 【G1】Game Over 骷髏徽章 Skull Medallion — 🟢 純 UI 元件

**用途**：懸在結算面板上緣正中的圓形木質徽章（Game Over 版）。

🔍 **文化審查**：純 UI 元件。骷髏為通用遊戲符號，可愛卡通風，非任何族群文化意象。

✨ **視覺設定校正**：圓形木質徽章 + 金色外圈 + 兩側葉叢，與【G2】獎盃徽章**共用完全相同的徽章外框設計**（只換中央圖案），確保兩個結算畫面視覺統一。骷髏走圓潤可愛卡通風：大眼窩、友善比例、額頭一道小裂紋細節，**不要**寫實骨骼質感、不要血腥恐怖元素。

🎨 **Prompt**：
```
A circular carved-wood game medallion badge UI element in a storybook-
illustrated RPG game art style: ornate dark wood circular frame with a
polished golden metal rim, small lush green leaf clusters decorating both
left and right sides of the medallion. Center motif: a cute cartoon-style
white skull — rounded friendly proportions, large simple eye sockets, a
small crack detail on the forehead — playful game-over symbol, NOT scary,
NOT realistic bone texture, no blood or horror elements. Warm lighting,
subtle 3D depth. NOT flat vector icon, NOT photorealistic photo.
Transparent background, no text or watermark, no tribal or ethnic patterns.
```
**Negative prompt**: `scary skull, realistic bone, horror, blood, gore, crossbones flag, tribal patterns, ethnic motifs, tattoos, text, numbers, watermark, flat vector icon, photorealistic photography`

📖 **備註**：建議命名 `v2-gameover-skull-badge.png`，比例約 1:1。完成後下一個是【G2】。

---

### 【G2】Stage Clear 獎盃徽章 Trophy Medallion — 🟢 純 UI 元件

**用途**：同一位置的圓形徽章（Stage Clear 過關版），與【G1】共用外框設計。

🔍 **文化審查**：純 UI 元件，無文化審查需求。

✨ **視覺設定校正**：徽章外框（木框 + 金圈 + 兩側葉叢）**必須與【G1】完全一致**，只換中央圖案為金色獎盃 + 葉冠（勝利氛圍），色溫可比骷髏版更明亮金黃。

🎨 **Prompt**：
```
A circular carved-wood game medallion badge UI element in a storybook-
illustrated RPG game art style: ornate dark wood circular frame with a
polished golden metal rim, small lush green leaf clusters decorating both
left and right sides — matching the game-over skull medallion frame design
exactly. Center motif: a shiny golden trophy cup crowned with a green
laurel leaf wreath, triumphant victory mood, bright warm golden glow.
Warm lighting, subtle 3D depth. NOT flat vector icon, NOT photorealistic
photo. Transparent background, no text or watermark, no tribal or ethnic
patterns.
```
**Negative prompt**: `skull, tribal patterns, ethnic motifs, tattoos, text, numbers, watermark, flat vector icon, photorealistic photography, inconsistent frame design`

📖 **備註**：建議命名 `v2-clear-trophy-badge.png`，比例約 1:1。完成後下一個是【G3】。

---

### 【G3】結算面板框（橫帶留空版·主方案）Result Panel Frame — 🟢 純 UI 元件

**用途**：Game Over 與 Stage Clear **共用**的結算面板主體。頂部徽章（【G1】/【G2】）由前端另外定位疊加，不烤進面板。

🔍 **文化審查**：純 UI 元件，無文化審查需求（木雕/葉紋為通用奇幻遊戲語彙）。

✨ **視覺設定校正**：三層結構——(1) 深色木質雕花外框：邊角藤蔓、葉子、金色鉚釘裝飾；(2) 上段一條深木橫帶：**完全留空**，不烤任何文字（GAME OVER/STAGE CLEAR 由 CSS 疊金色立體字）；(3) 下段大片米色做舊羊皮紙：中上方烤一組**左右對稱的箭羽花紋裝飾分隔線**（裝飾性固定元素，中央留空給前端疊中文敘述文字），分隔線以下大片留空（給前端放三張數據卡與按鈕）。整體直式構圖，約 4:5 比例。

🎨 **Prompt**：
```
A large ornate game result panel UI frame in a storybook-illustrated RPG
game art style, portrait orientation (about 4:5). Structure: an ornate dark
carved-wood outer frame with vine and leaf carvings and small golden metal
rivets at the corners; an upper horizontal dark wood banner band across the
top of the panel that is COMPLETELY EMPTY (reserved for a title text overlay
rendered by the game engine — do not bake any letters into the band); below
it, a large aged cream parchment area filling the rest of the panel, with
weathered worn edges. Near the top of the parchment area, a decorative
symmetrical divider ornament made of small arrow/fletching motifs pointing
inward from both sides, with an empty gap in the center for a text overlay.
The rest of the parchment is empty space reserved for dynamic stat cards
and buttons. Warm lighting, subtle 3D depth. NOT flat vector icon, NOT
photorealistic photo. Transparent background outside the panel shape, no
text or watermark, no tribal or ethnic patterns.
```
**Negative prompt**: `text, letters, words, numbers, baked-in title, skull, trophy, stat cards, buttons, tribal patterns, ethnic motifs, watermark, flat vector icon, photorealistic photography`

📖 **備註**：建議命名 `v2-result-panel-frame.png`。這是本批最重要的一張——徽章、數據卡、按鈕全部由前端疊放在它上面，**面板本身務必不含這些子元素**，否則無法複用。完成後下一個是【G5】（【G4】燒字版預設跳過）。

---

### 【G4】燒字版面板 ×2（備選，預設不生成）Baked-Title Panel Variants — 🟢 純 UI 元件

**啟用條件**：小排版用【G3】實測 CSS 金色立體字（金色漸層 + 浮雕陰影）後，若效果不滿意且使用者確認，才生成這兩張。**未經使用者確認不要動這一項。**

✨ **視覺設定校正**：與【G3】完全相同的面板設計，唯一差異是橫帶內烤入雕刻感金色立體字。英文字母務必拼寫正確、字距均勻——這是 AI 生圖最容易失敗的點，生成後要逐字檢查。

**【G4-a】GAME OVER 版** — 🎨 **Prompt**：在【G3】prompt 基礎上，把橫帶描述改為：
```
...an upper horizontal dark wood banner band across the top of the panel,
with the words "GAME OVER" carved into it in bold ornate golden embossed
3D lettering, correctly spelled, evenly spaced, centered...
```
（其餘與【G3】完全相同，negative prompt 移除 `text, letters, words, baked-in title`，保留其餘項目，另加 `misspelled text, distorted letters`）

**【G4-b】STAGE CLEAR 版** — 同上，文字換成 `"STAGE CLEAR"`。

📖 **備註**：建議命名 `v2-result-panel-gameover.png` / `v2-result-panel-clear.png`。與【G3】並存不覆蓋，由小排版擇一使用。

---

### 【G5】數據卡框 Stat Card Frame（一張共用 ×3）— 🟢 純 UI 元件

**用途**：SCORE / KILLS / ACC 三張並排數據卡，**只生成一張空白卡**，前端重複使用三次並各自疊數字與標籤。

🔍 **文化審查**：純 UI 元件，無文化審查需求。

✨ **視覺設定校正**：小型直式羊皮紙卡 + 細木框 + 四角小裝飾，上方大片米色羊皮紙留空（給前端疊大數字），底部一條**深綠色橫帶**留空（給前端疊 SCORE/KILLS/ACC 標籤）。深綠橫帶是 mockup 的識別特徵，務必烤進卡片，但橫帶內不烤文字。取代舊 `ui-stat-card.png`（扁平向量風）。

🎨 **Prompt**：
```
A small vertical parchment stat card UI element in a storybook-illustrated
RPG game art style: a slim carved-wood border frame with small decorative
ornaments at all four corners, aged cream parchment filling the card. The
upper area of the parchment is EMPTY (reserved for a large dynamic number
overlay). Across the bottom of the card, a solid dark-green horizontal
label band that is also EMPTY (reserved for a label text overlay) with a
subtle gold trim edge. Warm lighting, subtle 3D depth. NOT flat vector
icon, NOT photorealistic photo. Transparent background outside the card
shape, no text or numbers or watermark, no tribal or ethnic patterns.
```
**Negative prompt**: `text, letters, numbers, percentage sign, baked-in labels, tribal patterns, ethnic motifs, watermark, flat vector icon, photorealistic photography`

📖 **備註**：建議命名 `v2-result-stat-card.png`，比例約 3:4。完成後下一個是【G6】。

---

### 【G6】深綠木框按鈕 Dark Green Button（回首頁）— 🟢 純 UI 元件

**用途**：結算畫面的次要按鈕（回首頁）。金色主按鈕（記錄+重試）先試沿用 `v2-shoot-button.png`，不在本批生成。

🔍 **文化審查**：純 UI 元件，無文化審查需求。

✨ **視覺設定校正**：與 `v2-shoot-button.png`（金色版）同一套按鈕語言——木雕外框 + 3D 按鈕立體感——但填色改深綠（`#1A4A10` 一帶），視覺份量與金色版相當，中央留空給前端疊文字。橫式構圖約 2:1，跟金色版比例對齊，方便並排。

🎨 **Prompt**：
```
An ornate dark-green game button UI element in a storybook-illustrated RPG
game art style: a carved wood border frame, deep forest-green gradient fill
with a subtle glossy highlight, 3D pressed-button depth and shadow, matching
the visual weight and proportions of a companion golden button in the same
game UI set. Empty center space for text overlay (no text baked in).
Landscape orientation about 2:1. Warm lighting. NOT flat vector icon, NOT
photorealistic photo. Transparent background, no text or watermark, no
tribal or ethnic patterns.
```
**Negative prompt**: `text, letters, numbers, icons baked in, tribal patterns, ethnic motifs, watermark, flat vector icon, photorealistic photography`

📖 **備註**：建議命名 `v2-button-green.png`。完成【G6】即核心佇列全部完成；若後續發現 `v2-shoot-button.png` 沿用效果不佳，再回頭用同樣格式補一張金色結算版按鈕。

---

## Refusal and Safety Rules（沿用 v2）

- 不在圖裡烤進動態文字/數字（標題、分數、標籤、按鈕文字全由前端疊加；唯一例外是【G4】備選且需使用者明確啟用）
- 骷髏維持可愛卡通風，不走恐怖寫實、不涉及獵首/祭儀意象
- 【G1】【G2】徽章外框必須一致；面板【G3】不得烤入徽章/數據卡/按鈕子元素
- 所有裝飾不加入任何族群紋樣/圖騰/紋面
- 不用 flat vector icon 風、不用純寫實攝影
- 沿用清單內素材（`v2-shoot-button.png`、CSS 變暗背景）不重生成

---

## 生成前檢查清單

- [ ] 是否維持 v2 storybook-illustrated RPG game art 風格關鍵字、排除 flat vector icon？
- [ ] 骷髏是否為可愛卡通風（圓潤、友善、額頭裂紋），無恐怖/血腥元素？
- [ ] 【G1】與【G2】徽章外框（木框+金圈+葉叢）是否完全一致、只換中央圖案？
- [ ] 【G3】面板：橫帶是否留空？羊皮紙區是否只有箭羽分隔線裝飾、沒烤入徽章/卡片/按鈕/文字？
- [ ] 【G5】數據卡：底部深綠橫帶是否存在且留空？上方是否留空給大數字？
- [ ] 【G6】深綠按鈕比例是否與 `v2-shoot-button.png` 對齊、中央留空？
- [ ] 【G4】燒字版是否確認過使用者才生成？（預設跳過）
- [ ] 透明背景 PNG？無浮水印？無族群紋樣？

---

## 使用方式提醒

把這份文件整份貼給 Codex，說明「依佇列【G1】→【G2】→【G3】→【G5】→【G6】順序生成（【G4】預設跳過），一次一個項目確認後再繼續」。生成完成後交小畫家壓縮歸位（透明 PNG 縮最長邊 1200px、保留 alpha，與 `asset_mapping_v2.md` 慣例一致），再交小排版套進 `hunter-truku-v2.html` 的結算畫面（含 CSS 變暗遮罩、金色立體字、數字/標籤/按鈕文字疊加）並停用四張舊扁平風素材。本份不動任何程式碼、資料庫、既有素材檔。
