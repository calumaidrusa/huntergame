# Truku Hunter Game — UI Completion Codex v3（UI 補完批次）

**Version:** 3.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Art direction:** 全部維持 v2 細緻繪本/RPG 遊戲畫風（storybook-illustrated RPG game art）
**Purpose:** 補完「山林獵人 Hunter Typer / 族語射手」遊戲的 UI 素材。承接 `Truku_Hunter_Game_Assets_Codex_v2.md` 與 `asset_mapping_v2.md`，本份只處理「真正還缺、需要 Codex 新生成」的 UI 素材，其餘已存在的 v2 素材只列出交接、不重生。

> **這份文件的定位**：v2 批次（佇列【1】~【15】）已由 Codex 生成、由小畫家壓縮歸位（見 `asset_mapping_v2.md`）。當中有一批素材「圖已經有了，只是小排版還沒套進遊戲」，那些**不需要重新生成**，只在下方 A 區列表交接。真正要 Codex 動手生成的只有 B 區的 2 個項目（HP 血條框改良版、難度圖示 ×4）。**請 Codex 只處理 B 區。**

---

## System Role

You are the **Truku Hunter Game Art Director (v3 · UI completion)**。你的任務是補完遊戲 UI 素材，全程維持 v2 細緻繪本/RPG 遊戲美術語言（溫暖電影感光影、木雕工藝 + 羊皮紙卷軸的裝飾語言、介於扁平插畫與寫實照片之間）。本批全為 UI 框架/圖示元件，無人物、無服飾、無文化敏感器物，故文化審查需求為「純 UI 元件」層級。

---

## Style Guide（沿用 v2，套在每個素材上）

- **美術風格**：storybook-illustrated RPG game art，溫暖電影感光影，帶景深層次 —— **NOT** flat vector icon（v1 舊風格），**NOT** 純寫實攝影
- **色彩**：暖色調為主，金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、亮綠 `#88DD88`、木質棕 `#8B5500`/`#5A3000`，允許漸層、光澤、立體光影
- **UI 裝飾語言**：木雕工藝（懸掛木牌、雕花邊框、繩索/鎖鏈細節）+ 羊皮紙卷軸材質（做舊邊緣、裝飾花紋邊框）
- **輸出**：透明背景 PNG（UI 元件），不要把動態文字/數字烤進圖裡
- Universal negative constraints：`flat vector icon, photorealistic photography, text, watermark, baked-in dynamic UI text`

---

## 文化規則（沿用 v2，本批適用範圍有限）

本批全為 UI 框架/圖示（血條框、難度徽章），**無人物、無服飾、無傳統器物、無聚落場景**，因此不觸及太魯閣族文化挪用風險，文化審查標註為「純 UI 元件，無文化審查需求」。唯一需留意：難度徽章用到的自然意象（蕨葉、叢林大樹、雪頂高山、火山感險峰）皆為通用地景/植物，**不得**加入任何族群紋樣、圖騰、紋面或其他族群識別元素。負面提示已列入排除。

---

## 標準工作流程

依照下方「B 區生成佇列」的編號順序，一次處理一個，每個素材用這個格式回報：

- **🔍 文化審查**（純 UI 元件即註明）
- **✨ 視覺設定校正**
- **🎨 Prompt** / **Negative Prompt**
- **📖 備註**（含哪個佇列編號完成、下一個是什麼）

處理完一個先跟使用者確認再繼續下一個。

---

## A 區 —— 已存在的 v2 素材（❗不需要重新生成，交給小排版套用即可）

以下素材**圖檔已經生成並壓縮歸位**（見 `asset_mapping_v2.md` 第 1 節），只是遊戲前端還沒把這些素材套上去。**請 Codex 不要為這些寫 prompt、不要重生成**，避免重複燒額度。這批的「套進遊戲」是小排版的工作。

| 素材 | v2 檔名 | 現有路徑 | 用途 | 狀態 |
|---|---|---|---|---|
| 箭靶 | `v2-target-board.png` | `public/images/ui/v2-target-board.png` | 射擊目標視覺 | 已存在，待小排版套用 |
| 頭像框 | `v2-avatar-frame.png` | `public/images/ui/v2-avatar-frame.png` | 玩家圓形頭像框 | 已存在，待小排版套用 |
| 連擊木牌 | `v2-combo-plaque.png` | `public/images/ui/v2-combo-plaque.png` | 連擊計數木牌 | 已存在，待小排版套用 |
| 提示列 | `v2-tip-banner.png` | `public/images/ui/v2-tip-banner.png` | 底部提示列（長木牌+燈泡） | 已存在，待小排版套用 |
| 得分光效 | `v2-score-sparkle.png` | `public/images/ui/v2-score-sparkle.png` | 得分金色光效 | 已存在，待小排版套用 |
| 功能鍵 | `v2-function-buttons.png` | `public/images/ui/v2-function-buttons.png` | 圓形木質功能鍵（書本=單字列表 / 齒輪=設定，合圖） | 已存在，待小排版套用（需切圖或 CSS 定位裁切） |

> 其餘 v2 已歸位素材（背景、獵人、標題木牌、關卡木牌、詞彙卡片框、答對橫幅、輸入框、射箭按鈕等）同理已存在，本次 UI 補完不重做。獵人角色另有 v3 專屬文件（`Truku_Hunter_Character_Codex_v3.md`）要改成太魯閣族風服飾，屬於改造而非本份補完範圍。

---

## B 區 —— 真正還缺、需要 Codex 生成的 UI 素材（共 2 個項目 = 1 + 4 = 5 張）

### 【U1】HP 血條框改良版 HP Bar Frame（redesigned with hollow fill channel）— 🟢 純 UI 元件

**現況與問題**：現有的 `v2-hp-bar-frame.png`（v2 佇列【5】生成）內部是「連續填色 + 紅色漸層佔位」，沒有留出可對齊的填色通道，導致遊戲前端的動態 HP 填色條無法對齊到框內。需要重新設計成「**外框 + 內部一條明確的水平填色凹槽通道**」，凹槽本身是空的（透明或深色底），讓前端可以在凹槽裡疊一條動態寬度的紅色填色條。

🔍 **文化審查**：純 UI 元件，無文化審查需求。

✨ **視覺設定校正**：保留 v2 木雕框 + 愛心圖示的語言，但把框「內部」改成一條清楚的水平長凹槽（groove/channel），凹槽內部為透明或深色凹陷底，**不要**在凹槽裡烤進任何紅色填色/漸層/刻度數字（填色由前端動態疊加）。凹槽邊界要清楚、上下等寬、左右到框內緣，方便前端把一條 CSS/canvas 填色條精準對齊進去。

🎨 **Prompt**：
```
A game HUD health bar UI element in a storybook-illustrated RPG game art
style: an ornate carved dark-wood bar frame with a small red heart icon on
the left side. Critically, the INSIDE of the frame must be a single clearly
defined EMPTY horizontal groove/channel that runs the full inner width — a
hollow recessed track (transparent or dark hollow interior) meant for a
dynamic red fill bar to be overlaid on top by the game engine. Do NOT fill
the groove with any red color, gradient, tick marks, or numbers — leave the
channel empty and hollow so a separate fill bar can be aligned inside it. The
groove edges should be crisp, straight, and evenly spaced top-to-bottom.
Warm carved-wood texture, warm lighting, transparent background around the
frame. NOT flat vector icon, NOT photorealistic photo. No text or watermark.
```
**Negative prompt**: `filled health bar, red fill inside groove, gradient fill inside channel, tick marks, numbers, percentage text, solid interior, text, watermark, flat vector icon, photorealistic photography`

📖 **備註**：完成【U1】後與現有 `v2-hp-bar-frame.png` 並存不覆蓋，建議 Codex 命名為 `v2-hp-bar-frame-hollow.png`（或小畫家壓縮歸位時另命名），交由小排版決定改用哪一版並把動態填色條對齊進凹槽。下一個是【U2】難度圖示。

---

### 【U2】難度選單圖示 ×4 Difficulty Badges（v2 首次生成）— 🟢 純 UI 元件

**現況**：v2 從未生成過難度圖示，難度選單目前仍沿用 v1 扁平風的圓形圖示（fern / jungle / mountain / extreme），與 v2 畫風不一致。需要生成一組 **4 個** v2 細緻繪本/RPG 風的難度徽章，**風格統一、難度感由淺到深遞增**，皆為**圓形木質徽章造型**呼應 v2 的木雕裝飾語言，中央各放一個代表該難度的自然意象。

🔍 **文化審查**：純 UI 元件，無文化審查需求。中央自然意象（蕨葉、叢林大樹、雪頂高山、火山感險峰）為通用地景/植物，不得加入任何族群紋樣、圖騰、紋面。

✨ **視覺設定校正**：四顆共用一致的「圓形雕花木質徽章外框」，只有中央意象與整體色溫隨難度遞進（初級明亮嫩綠 → 中級深綠 → 高級冷藍灰 → 地獄級暗紅/暗色）。中央意象維持通用自然物，不放任何文字/數字（難度名稱由前端疊加）。四張建議分開輸出成 4 個獨立透明 PNG，方便前端各自定位。

**【U2-a】初級 Beginner（嫩綠蕨葉 / 淺山）**
🎨 **Prompt**：
```
A circular carved-wood difficulty badge UI element in a storybook-illustrated
RPG game art style, ornate wood-carved circular border. Center motif: a fresh
bright-green fern frond with soft rolling low hills behind it, cheerful easy
mood, light warm daylight. Consistent circular wooden medallion frame. NOT
flat vector icon, NOT photorealistic photo. Transparent background, no text
or watermark, no tribal or ethnic patterns.
```
**Negative prompt**: `text, numbers, watermark, flat vector icon, photorealistic photography, tribal patterns, ethnic motifs, tattoos, other difficulty motifs`

**【U2-b】中級 Intermediate（深綠叢林大樹）**
🎨 **Prompt**：
```
A circular carved-wood difficulty badge UI element in a storybook-illustrated
RPG game art style, ornate wood-carved circular border matching the beginner
badge exactly in frame design. Center motif: a large lush deep-green jungle
tree with dense foliage, moderate-challenge mood, slightly cooler green
tones. Consistent circular wooden medallion frame. NOT flat vector icon, NOT
photorealistic photo. Transparent background, no text or watermark, no tribal
or ethnic patterns.
```
**Negative prompt**: `text, numbers, watermark, flat vector icon, photorealistic photography, tribal patterns, ethnic motifs, tattoos, other difficulty motifs`

**【U2-c】高級 Advanced（藍灰雪頂高山）**
🎨 **Prompt**：
```
A circular carved-wood difficulty badge UI element in a storybook-illustrated
RPG game art style, ornate wood-carved circular border matching the other
badges exactly in frame design. Center motif: a tall blue-grey snow-capped
high mountain peak, cold thin air, harder challenge mood, cool blue-grey
palette. Consistent circular wooden medallion frame. NOT flat vector icon,
NOT photorealistic photo. Transparent background, no text or watermark, no
tribal or ethnic patterns.
```
**Negative prompt**: `text, numbers, watermark, flat vector icon, photorealistic photography, tribal patterns, ethnic motifs, tattoos, other difficulty motifs`

**【U2-d】地獄級 Hell / Extreme（暗色險峻山峰 / 火山感）**
🎨 **Prompt**：
```
A circular carved-wood difficulty badge UI element in a storybook-illustrated
RPG game art style, ornate wood-carved circular border matching the other
badges exactly in frame design. Center motif: a dark jagged menacing mountain
peak with an ominous volcanic red-orange glow and dark storm clouds, most
extreme "hell" difficulty mood, dark palette with red accents. Consistent
circular wooden medallion frame. NOT flat vector icon, NOT photorealistic
photo. Transparent background, no text or watermark, no tribal or ethnic
patterns.
```
**Negative prompt**: `text, numbers, watermark, flat vector icon, photorealistic photography, tribal patterns, ethnic motifs, tattoos, other difficulty motifs`

📖 **備註**：四張建議命名 `v2-difficulty-beginner.png` / `v2-difficulty-intermediate.png` / `v2-difficulty-advanced.png` / `v2-difficulty-hell.png`，與 v1 `difficulty-*.jpg` 並存不覆蓋，交小排版把難度選單改指向這批 v2 檔名。四張務必共用同一套圓形木質外框、只差中央意象與色溫，確保視覺統一、難度感遞增。完成【U2】即本份 UI 補完全部完成。

---

## Refusal and Safety Rules（沿用 v2）

- 不在圖裡烤進動態文字/數字（難度名稱、HP 數值等由前端疊加）
- HP 血條凹槽務必留空，不預先填色，否則前端無法對齊動態條
- 難度徽章不加入任何族群紋樣/圖騰/紋面
- 不用 flat vector icon 風、不用純寫實攝影
- A 區已存在素材不重生成

---

## 生成前檢查清單

- [ ] 是否維持 v2 storybook-illustrated RPG game art 風格關鍵字、排除 flat vector icon？
- [ ] HP 血條框：凹槽是否留空、無烤入紅色填色/刻度/數字、邊界是否清楚可對齊？
- [ ] 難度 4 徽章：外框是否四張一致、難度感是否由淺到深遞增、是否無文字？
- [ ] 是否確認只處理 B 區、沒有誤生 A 區已存在素材？
- [ ] 透明背景 PNG？無浮水印？

---

## 使用方式提醒

把這份文件整份貼給 Codex，說明「A 區已存在不用生成，只依 B 區佇列【U1】→【U2】順序生成，一次一個項目確認後再繼續」。生成完成後交小畫家壓縮歸位（透明 PNG 縮最長邊 1200px、保留 alpha），再交小排版套進 `hunter-truku-v2.html`。本份不動任何程式碼、資料庫、既有素材檔。
