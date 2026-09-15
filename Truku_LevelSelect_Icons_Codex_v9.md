# Truku Level-Select Round Icons Codex — v9（關卡選擇畫面・圓形玩法圖示組）

**Version:** 9.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 依使用者提供的「關卡選擇畫面」改版設計圖，補齊 5 張直式 LEVEL 卡片各自需要的**圓形玩法圖示**。本文件**只**涵蓋這一組圓形關卡圖示（含 LEVEL 5 鎖定態鎖頭）。卡片木框、綠色「開始挑戰」按鈕、木框下拉選單、底部功能列（排行榜/設定/音效/登出）**不在本文件範圍**，那些多半是 CSS + 現有素材，交給小排版處理。

---

## ⚠️ 給主對話 / 使用者的提醒（先標記）

1. **這是「玩法圖示」不是「難度圖示」**：現行 `hunter-truku-v2.html`（第 1813–1833 行）把舊的 4 張 `v2-difficulty-beginner/intermediate/advanced/hell` **臨時挪用**到 5 個 LEVEL 卡片上（LEVEL 5 甚至重複用了 hell 那張）。那是佔位權宜，語意與數量都不對——舊圖畫的是「難度環境場景」（蕨葉叢/雪山/熔岩山），新設計圖要的是「玩法意象」（聽音・填空・聽打・看圖・鎖定），且需要 5 張、風格要能一眼看出玩法差異。本文件就是要生這**專屬的一組 5 張**取代挪用。
2. **換圖是小排版的事**：素材生完後，把 `hunter-truku-v2.html` 裡那 5 個 `<img src>` 換成新檔名、以及卡片木框/按鈕/下拉/功能列的組版，都由**小排版**處理。小畫家不改 HTML。
3. **LEVEL 4 文化安全已在本文件內處理**：設計圖 LEVEL 4 的原始意象是「紅色幾何菱形圖騰」，這踩到族群織紋敏感線，本文件已改為中性替代（見下方【文化安全專章】與【LV4】）。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, Level-Select Round-Icon batch)**。美術風格與太魯閣族文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md`：細緻繪本/RPG 遊戲美術、木雕＋藤蔓裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），不混用其他族群或泛部落意象。

---

## Style Guide（沿用 v2 + 本組專屬統一規範）

本組 5 張的最高原則是**「整排一致」**——5 張並排在關卡卡片上，任何一張風格跳掉都會很明顯。統一規範：

- **統一外圈：木雕圓框 + 藤蔓/葉片纏繞 + 四向金色菱形鉚釘**。這個外圈直接參照現有 `v2-difficulty-*.png`（同一套木框語言），讓新圖跟遊戲既有視覺無縫接軌。⚠️ 注意：這裡的「菱形鉚釘」是**通用木工鉚釘/寶石造型的四個孤立金屬點**（現有難度圖框上就有），**不是**帶狀連續織紋圖騰，屬安全裝飾；LV4 的處理見文化專章，不要把菱形放到圖示**主體/內圈意象**。
- **內圈是意象主體**：每張中央放一個清楚、單一、好辨識的玩法意象（見各項），內圈可有淺景深小場景烘托，但主體要一眼可讀。
- **風格關鍵字**：`rich storybook-illustrated RPG game art`，溫暖光影、插畫筆觸；**不是**扁平向量圖示、**不是**寫實照片。
- **輸出規格**：正方形 **1024×1024** 生成 → 壓縮縮到 **512×512**、輸出 **PNG（RGBA 透明背景）**。對齊現有 `v2-difficulty-*.png`（512×512 RGBA）的規格，前端可直接替換。
- **透明背景**：圓框外一律 alpha=0，只留圓形徽章本體。生成後**務必驗證四角透明**（沿用 v2 批次的透明驗證習慣）。
- **不燒任何文字**：LEVEL 編號、玩法名、說明文字全部由前端 CSS 疊，圖裡不要有字（含數字）。
- **省額度合圖建議**：LV1–LV4 這 4 張玩法圖示風格高度相似，**可考慮合成 2×2 一張 2048×2048 大圖一次生成再切**，最能保證 4 張外框粗細/藤蔓密度/打光一致（分開生容易每張長得不太一樣）。LV5 鎖定態因為要「整體變暗/上鎖」的不同處理，**單獨生**。若 Codex 端合圖切圖不便，也可 5 張分開生，但務必用同一段外框描述文字。

---

## 可沿用 / 不沿用評估（務實：能用現有就不生）

| 設計圖元素 | 現有素材 | 結論 |
|---|---|---|
| LV1–LV5 五個圓形玩法圖示 | `v2-difficulty-beginner/intermediate/advanced/hell`（4 張，難度環境場景） | **不沿用（語意不符 + 數量不足）**。舊圖是「難度環境」不是「玩法」，且只有 4 張、LV5 目前靠重複佔位。本組全數新生（LV1–LV5 共 5 張，其中 LV1–LV4 建議合圖）。舊 4 張可留著不刪（不影響），但關卡卡片改用新組。 |
| LV5 鎖頭（鎖定態） | `public/images/ui/login-icon-lock.png`（金鎖頭）| **不直接沿用**：現有鎖頭是**方形木牌**造型（589×793），跟本組**圓框**系列不一致，並排會突兀。改生**圓框版鎖頭**（【LV5】）維持整排一致。現有方鎖頭仍供登入畫面用，不動它。 |
| 圓框木雕/藤蔓/菱形鉚釘外圈語言 | `v2-difficulty-*.png` 的外框 | **沿用「視覺語言」當生成參照**（不是沿用檔案本身）：新 5 張的外圈描述比照這套木框，確保與遊戲既有風格一致。 |
| 卡片木框 / 綠色開始鈕 / 下拉選單 / 底部功能列 | 多為 CSS + 既有素材（`v2-button-green.png`、`v2-function-buttons.png` 等） | **不在本文件範圍**，交小排版評估沿用。 |

> 結論：**本組要新生 5 張**（LV1–LV5），其中 LV1–LV4 建議合 1 張 2×2 大圖生成後切 4，LV5 單生。**淨新增生成任務：2 張大圖（1 張 2×2 合圖 + 1 張 LV5）**，或最多拆成 5 張分開生。

---

## ⚠️ 文化安全專章 —— LEVEL 4「紅色幾何菱形圖騰」

**風險點（明確標示）**：設計圖 LEVEL 4「看圖選詞」的原始圓形圖示是**紅色幾何菱形圖騰**。菱形（尤其紅色、幾何連續排列）**極度接近泰雅族／太魯閣族的菱形織紋**，該紋樣承載「祖靈之眼（utux 意象）」的文化意涵，屬**高敏感文化符號**，**絕對不可直接沿用**當成一個裝飾圖示隨意使用。這正是文化守則警告的「挪用特定族群織紋／擅自使用神聖符號」錯誤。

**校正決策（中性替代）**：LEVEL 4 是「看圖選詞」玩法（看圖片、選出正確族語）。改用**與玩法直接對應、且無任何族群符號**的中性意象——**木質畫框中的一張圖卡 + 放大鏡／眼睛看的意象**，明確傳達「看圖辨識」的玩法，同時徹底避開菱形織紋。

**同時排除**：不用任何菱形連續紋、不用其他族群（阿美族紅黑/八角星、排灣族琉璃珠/百步蛇、泰雅族菱形織帶）圖騰、不紋面、不編造儀式符號。外圈允許的「四向孤立金色菱形鉚釘」是通用木工鉚釘（現有難度框既有），與「菱形織紋圖騰」是兩回事，但為求穩妥，**LV4 這一張的外框菱形鉚釘可改為圓形金屬鉚釘**，把菱形元素在這張上降到最低，避免任何聯想。

> 📖 備註：本組所有圖示皆為近似視覺語彙，非特定部落服制／符號的精確復刻。若用於正式出版或對外教學，建議請太魯閣族文化工作者確認。

---

## 素材生成佇列

### 命名建議（統一前綴，方便小排版替換）

| LEVEL | 玩法 | 檔名建議 | 對應現行被挪用的舊圖（待小排版替換） |
|---|---|---|---|
| LEVEL 1 | 聽音選詞 | `v2-level-icon-1-listen.png` | `v2-difficulty-beginner.png` |
| LEVEL 2 | 填空 | `v2-level-icon-2-fillblank.png` | `v2-difficulty-intermediate.png` |
| LEVEL 3 | 聽打 | `v2-level-icon-3-dictation.png` | `v2-difficulty-advanced.png` |
| LEVEL 4 | 看圖選詞 | `v2-level-icon-4-lookpick.png` | `v2-difficulty-hell.png` |
| LEVEL 5 | 盲打（鎖定態）| `v2-level-icon-5-blind-locked.png` | `v2-difficulty-hell.png`（重複佔位）|

> 建議都放 `public/images/ui/`，與其他 v2 素材同目錄。若之後要做 LEVEL 5「已解鎖」態，另生 `v2-level-icon-5-blind.png`（本批**先不生**，等 LEVEL 5 解鎖 UI 需求確認，見【LV5】備註）。

---

### 【LV1】聽音選詞 圓形圖示 — 🟢 純 UI 元件

設計圖意象＝綠色葉片。玩法＝聽發音選單字。

✨ **視覺設定**：木雕圓框 + 藤蔓纏繞 + 四向金色菱形鉚釘（統一外圈）。內圈中央一片飽滿的翠綠葉片，葉片旁帶柔和的聲波弧線 / 小音符，暗示「聽 → 選」，內圈可有淺淺森林景深。

🎨 **Prompt**：
```
A circular wooden game level icon badge on a transparent background: an ornate
carved dark-wood round frame wrapped with green vines and leaves, with four
small golden diamond rivets at top/bottom/left/right. Inside the circular
frame, the central motif is a single lush green leaf, with a few soft sound-wave
arcs / a tiny music note beside it suggesting listening. Subtle shallow-depth
forest tint inside. Rich storybook-illustrated RPG game art style, warm
lighting, painterly detail. Square 1024x1024, the badge centered, everything
outside the round badge fully transparent (alpha 0). No text, no numbers, no
watermark.
```
**Negative prompt**: `text, numbers, letters, watermark, flat vector icon, photorealistic photography, ethnic weaving pattern, tribal diamond motif, face tattoo`

---

### 【LV2】填空 圓形圖示 — 🟢 純 UI 元件

設計圖意象＝綠色樹木。玩法＝根據提示補上缺字。

✨ **視覺設定**：統一外圈。內圈中央一棵茂密綠樹，樹前 / 樹上點綴一個小小的空格底線或缺塊光點，暗示「補上缺字」。維持與 LV1 同樣的葉綠色系與插畫筆觸。

🎨 **Prompt**：
```
A circular wooden game level icon badge on a transparent background: the same
ornate carved dark-wood round frame wrapped with green vines and leaves, with
four small golden diamond rivets. Inside, the central motif is a single leafy
green tree; near it, a small blank underline / a glowing missing-piece gap
subtly hints at "fill in the blank". Shallow forest depth inside. Rich
storybook-illustrated RPG game art style, warm lighting, painterly detail.
Square 1024x1024, badge centered, everything outside the round badge fully
transparent (alpha 0). No text, no numbers, no watermark.
```
**Negative prompt**: `text, numbers, letters, watermark, flat vector icon, photorealistic photography, ethnic weaving pattern, tribal diamond motif, face tattoo`

---

### 【LV3】聽打 圓形圖示 — 🟢 純 UI 元件

設計圖意象＝藍天山峰。玩法＝聽發音、輸入正確單字。

✨ **視覺設定**：統一外圈。內圈中央藍天下的青灰色山峰（比照現有 advanced 那張雪山的色調，維持系列感），山前疊一組聲波弧線 + 一個小小鍵盤/游標光點，暗示「聽 → 打」。

🎨 **Prompt**：
```
A circular wooden game level icon badge on a transparent background: the same
ornate carved dark-wood round frame with green vines and four small golden
diamond rivets. Inside, the central motif is a blue-sky mountain peak (cool
blue-grey rocky summit under a bright sky), overlaid with soft sound-wave arcs
and a tiny keyboard/cursor glyph hinting at "listen then type". Shallow depth
inside. Rich storybook-illustrated RPG game art style, warm lighting, painterly
detail. Square 1024x1024, badge centered, everything outside the round badge
fully transparent (alpha 0). No text, no numbers, no watermark.
```
**Negative prompt**: `text, numbers, letters, watermark, flat vector icon, photorealistic photography, ethnic weaving pattern, tribal diamond motif, face tattoo`

---

### 【LV4】看圖選詞 圓形圖示 — 🔴 文化審查項（已校正，取代原「紅色菱形圖騰」）

🔍 **文化審查**：設計圖原意象為**紅色幾何菱形圖騰**，接近泰雅/太魯閣菱形織紋（祖靈之眼），屬高敏感符號，**不可沿用**。已於【文化安全專章】決議改為中性「看圖辨識」意象。

✨ **視覺設定校正**：中央改為**一個木質畫框，框內是一張自然圖卡（例如一片葉子/一隻小動物剪影的插畫卡），畫框旁帶一個放大鏡或一隻「看」的眼睛意象**，直接對應「看圖片、選族語」玩法。**這一張的外框四向鉚釘改為圓形金屬鉚釘（不用菱形）**，把菱形元素降到最低，避免任何族群織紋聯想。無任何幾何連續紋、無任何族群圖騰。

🎨 **Prompt**：
```
A circular wooden game level icon badge on a transparent background: an ornate
carved dark-wood round frame wrapped with green vines, with four small ROUND
golden rivets (NOT diamond-shaped) at top/bottom/left/right. Inside the circular
frame, the central motif is a small wooden picture frame holding a nature
illustration card (e.g. a leaf or a little animal silhouette), with a magnifying
glass / a friendly looking-eye icon beside it, clearly suggesting "look at the
picture and identify it". Warm painterly forest tint inside. Rich
storybook-illustrated RPG game art style, warm lighting. Square 1024x1024, badge
centered, everything outside the round badge fully transparent (alpha 0).
No text, no numbers, no watermark.
```
**Negative prompt**: `diamond rhombus motif, geometric tribal pattern, ethnic weaving pattern, ancestral eye motif, red tribal diamond, Atayal/Truku weaving, Amis/Paiwan/indigenous totem, tribal symbol, face tattoo, text, numbers, letters, watermark, flat vector icon, photorealistic photography`

📖 **備註**：這是本組唯一的紅線項。生成後檢查：內圈**沒有**任何菱形/連續幾何織紋，主體是「畫框+看圖」的中性意象，外框鉚釘是圓形。若 AI 仍冒出菱形織紋，重下 prompt，不要交差。

---

### 【LV5】盲打（鎖定態）圓形圖示 — 🟢 純 UI 元件

設計圖意象＝鎖頭 + 整張變暗/鎖定（「完成 Level 4 後解鎖」）。

✨ **視覺設定**：統一外圈，但**整張圓框做「上鎖／未啟用」處理**——木框與內圈整體壓暗、去飽和（灰暗調），中央一把金色鎖頭掛在圓框上，內圈朦朧看不清（呼應設計圖「整張變暗/鎖定」）。維持**圓框**造型（不要用登入畫面那顆方形鎖頭），才能跟 LV1–LV4 並排一致。

🎨 **Prompt**：
```
A circular wooden game level icon badge in a LOCKED / disabled state on a
transparent background: the same ornate carved dark-wood round frame with vines
and rivets, but the whole badge is DIMMED and DESATURATED (dark, greyed-out,
inactive look). A golden padlock sits over the center of the round frame; the
interior behind it is dark and hazy/obscured, conveying "locked, not yet
unlocked". Rich storybook-illustrated RPG game art style, moody dim lighting.
Square 1024x1024, badge centered, everything outside the round badge fully
transparent (alpha 0). No text, no numbers, no watermark.
```
**Negative prompt**: `bright cheerful colors, square wooden plaque frame, text, numbers, letters, watermark, flat vector icon, photorealistic photography, ethnic weaving pattern, tribal diamond motif, face tattoo`

📖 **備註**：本批**只生鎖定態**。若之後 LEVEL 5 解鎖後也要一張「盲打・已解鎖」的正常圓形圖示（例如蒙眼/閉眼打字意象），再另開 `v2-level-icon-5-blind.png` 生成——**先不生**，等小工程/小排版確認解鎖後 UI 是換圖還是純 CSS 移除變暗遮罩再決定，避免多燒額度。

---

## 生成前檢查清單

- [ ] 5 張是否共用**同一段外框描述**（木雕圓框+藤蔓+鉚釘），確保整排並排一致？
- [ ] LV1–LV4 是否採「2×2 合圖生成再切」以保證外框粗細/打光一致？（或分開生時是否逐字用同段外框描述）
- [ ] **【LV4】是否已完全去除紅色菱形圖騰？** 內圈是「畫框+看圖」中性意象、無任何菱形/族群織紋、外框鉚釘為圓形？（本批最高風險項）
- [ ] 所有圖是否**無任何文字/數字**（LEVEL 編號、玩法名由 CSS 疊）？
- [ ] 輸出是否為 512×512 **PNG RGBA**、圓框外**四角透明 alpha=0**（生成後驗證）？
- [ ] LV5 是否為**圓框**鎖定態（壓暗+金鎖頭），而非沿用登入畫面的方形鎖頭？
- [ ] Prompt 是否含 v2 風格關鍵字（storybook-illustrated RPG game art）＋排除 flat vector icon / photorealistic photography？
- [ ] Negative prompt 是否每張都排除 ethnic weaving pattern / tribal diamond motif / face tattoo（全組統一防呆）？
- [ ] 是否先把 prompt 與張數報給使用者確認、確認額度夠再跑？遇 `billing_hard_limit_reached` 立即停止回報、不重試？
- [ ] 完成後提醒**小排版**：換 `hunter-truku-v2.html` 第 1813–1833 行的 5 個 `<img src>`（小畫家不改 HTML）？

---

## 使用方式提醒

把本文件整份貼給 Codex，請它「依素材生成佇列編號順序處理，LV1–LV4 優先合成 2×2 一張生成再切、LV5 單獨生，每張生成前先報 prompt 與張數給我確認」。**LV4 是文化紅線項，務必套用校正後的中性意象與加強版 negative prompt。** 生成完的圖檔命名照上表、放 `public/images/ui/`；換進畫面（HTML 的 `<img src>` 替換）與卡片木框/按鈕/下拉/功能列組版一律交**小排版**，小畫家不碰 `hunter-truku-v2.html`。
