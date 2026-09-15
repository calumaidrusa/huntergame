# Truku Enter-Key Icon Codex — v14（送出鈕 → 「按 ENTER」鍵帽 icon）

**Version:** 14.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 使用者要求把桌機 `hunter-truku-v2.html` 的送出鈕改成「一看就知道按 Enter」的圖示。本文件只生**一顆「Enter / Return 鍵帽」icon**（中央有 ↵ 折返箭頭），透明底 PNG，回收後由小工程/小排版接進 `.shoot-btn`。

> 玩家實際送出方式是**按鍵盤 Enter**，所以這顆鈕改成 Enter 鍵圖示是「所見即操作」的正確引導。

---

## ⚠️ 給主對話 / 使用者的提醒（先標記）

1. **本批只生 1 顆 icon**（若採兩案並比，最多 2 張；見下）。透明背景 PNG（RGBA，四周 alpha=0）。
2. **小尺寸清楚是第一原則**：這顆最終在畫面上只有 **~40–58px 寬**，`↵`（return 折返箭頭）必須一眼可辨、線條夠粗，別塞細碎裝飾糊掉。
3. **我（小畫家）建議採「案 A：木質金邊鍵帽」**，理由見下方【A vs B 決策】——與 v13 木盤 icon 套組、現有金鈕同家族，風格不會東一塊西一塊。案 B（輕量向量鍵帽）留作備選，若使用者想要更簡潔現代感可改採。
4. **文化安全：本顆低風險**。純功能性鍵盤鍵圖示，無人物/服飾/器物/儀式/聚落，無族群織紋、無紋面。Negative 仍明列排除紋面（Ptasan）/織紋/祖靈眼等（見【文化安全註記】）。
5. **換圖 / CSS / 送出鈕怎麼放，是小工程 + 小排版的事**：小畫家只生素材、寫本規格。**小畫家不改 `hunter-truku-v2.html` 本體。** icon 取代「送出」文字/emoji、`.shoot-btn` 樣式調整、hover/active 疊圖邏輯，一律交小工程/小排版（見【整合・交接】）。
6. **先報 prompt 給使用者確認額度再貼 Codex**。遇 `billing_hard_limit_reached` 立即停止回報、不重試。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, UI key icon)**。美術風格與太魯閣族文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md` 與 v13 icon 套組：細緻繪本/RPG 遊戲美術、木雕＋金邊裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），透明背景 PNG，不混用其他族群或泛部落意象。素材要與現有 `public/images/ui/`（尤其 `v2-audio-button-wood.png` 木雕喇叭圓盤、v13 木盤 icon 套組）視覺一致。

---

## 現況（給接手者參考，本文件不改 HTML）

- 桌機 `hunter-truku-v2.html` 的送出鈕：class `.shoot-btn`，目前是一顆 **58×58px 圓形金質漸層鈕**（`radial-gradient(#FFD740→#E88B00)` + `#8B5500` 邊 + 立體投影），內含一個 emoji（現況 `🏹`；使用者描述的另一版本為金膠囊 + 「送出」文字，兩種情況本 icon 都適用）。`onclick="submitWord()"`，`title="發射 (Enter)"`。
- 使用者要把這顆鈕的視覺改成「按 ENTER」的鍵盤鍵圖示。

---

## A vs B 決策（小畫家建議 A）

| | 案 A：木質金邊鍵帽（**建議**） | 案 B：輕量向量鍵帽 |
|---|---|---|
| 外觀 | 深色木質/深棕鍵面的方形鍵帽，一圈金邊 + 立體光影，中央亮金 `↵` + 小字「Enter」 | 乾淨圓角金/米色鍵帽，深棕 `↵`，極簡、少光影 |
| 優點 | 與 v13 木盤 icon、現有金鈕**同家族**，整站一致；有質感 | 更簡潔、小尺寸最不易糊 |
| 缺點 | 木紋在極小尺寸細節較多，需靠「大 `↵` + 粗線」保清晰 | 與現有木質 UI 家族略有出入，較「通用 app」感 |

**小畫家建議採 A**：整站 UI（喇叭鈕、v13 木盤 icon、金鈕）都走木雕金邊語言，送出鈕若換成純扁平向量鍵帽會顯得不成套。A 只要遵守「`↵` 夠大夠粗、木紋當低調底紋不搶主體」即可兼顧一致性與小尺寸清晰。**若使用者偏好極簡，改採 B。** 兩案 prompt 皆附於下，可只生 A，或 A/B 各生 1 張比稿（共 2 張）。

---

## 素材定義

🔍 **用途**：取代 `.shoot-btn` 內的送出視覺，讓玩家「一看就知道按鍵盤 Enter 送出」。出現位置：桌機遊戲畫面輸入列右側送出鈕（約 40–58px 寬）。

✨ **要生成的**：一顆**鍵盤 Enter / Return 鍵帽**，鍵面中央一個**大而清楚的 `↵`（return 折返箭頭）**，其下（或旁）可加一行小字「Enter」。方形鍵帽、圓角，透明背景。**不要**畫整塊鍵盤、不要多顆鍵；只要**單一 Enter 鍵**。`↵` 必須是主角、線條粗、小尺寸可辨。

---

### 🎨 English Prompt — 案 A（木質金邊鍵帽，建議）
```
A single keyboard Enter / Return key icon for a storybook RPG jungle-adventure
game, on a fully transparent background. One square rounded-corner keycap with a
warm dark wood-brown top surface (subtle low-contrast wood grain, not busy), a
thin bright gold rim and soft three-dimensional beveled lighting so it reads as a
pressable key. In the center, one large, bold, clearly legible return arrow symbol
"↵" (a downward-then-left bent return/enter arrow) in bright gold / cream, with a
small clean word "Enter" in cream beneath or beside it, small and secondary to the
arrow. Rich storybook-illustrated game art style, warm cinematic lighting,
painterly detail, warm gold + wood-brown palette, consistent with an existing
wood-carved speaker button and wood medallion icon set from the same game. The
keycap is centered and fills most of the square canvas; everything outside the
keycap is fully transparent (alpha 0). The return arrow must stay bold and legible
when scaled down to about 40–48px. No other keys, no full keyboard, no watermark.
```

### 🎨 English Prompt — 案 B（輕量向量鍵帽，備選）
```
A single clean keyboard Enter / Return key icon for a warm jungle-adventure game
UI, on a fully transparent background. One square rounded-corner keycap in soft
gold / cream with a gentle bevel and light drop shadow so it looks pressable. In
the center, one large bold dark-brown return arrow symbol "↵" (downward-then-left
bent enter arrow), with a small dark-brown word "Enter" beneath it, secondary to
the arrow. Minimal, clean, painterly-but-simple game UI style, warm gold + wood-
brown palette. The keycap is centered and fills most of the square canvas;
everything outside the keycap is fully transparent (alpha 0). The return arrow must
stay bold and legible at about 40–48px. No other keys, no full keyboard, no text
besides the word "Enter", no watermark.
```

### 🚫 Negative Prompt（A / B 共用）
```
full keyboard, multiple keys, key rows, laptop, computer, hands, mouse, text or
letters other than the word "Enter", numbers, watermark, flat vector app-store
icon, glossy modern material-design icon, photorealistic photography, cluttered
tiny details that vanish when small, ethnic weaving pattern, tribal diamond weaving
motif, ancestral eye motif, Atayal/Truku weaving, Amis/Paiwan/indigenous totem,
feathered headdress, face tattoo, Ptasan, human character face
```

> ⚠️ **關於小字「Enter」**：這是唯一容許的文字（功能標籤，非動態遊戲文字）。若 Codex 把 "Enter" 拼錯或糊掉，寧可**去掉文字、只留大 `↵`**——`↵` 本身就足以表達「按 Enter」。生成後請檢查文字是否拼對；拼錯就重生或改用無字版。無字版 prompt：把上面 A/B 句中「with a small clean word "Enter" ...」整句刪除，其餘不變。

---

## 尺寸 / 命名 / 回收位置

- **尺寸/比例**：正方，建議 **512×512**，鍵帽置中、四周透明，輸出 **PNG RGBA**（之後小工程回收壓縮）。
- **前端顯示**：約 40–58px 寬（現況 `.shoot-btn` 58×58；若小工程改成長方鈕可再議）。**`↵` 在最小尺寸仍需清楚**。
- **檔名**：`v2-ui-key-enter.png`（回收到 `public/images/ui/`）。
- 若 A/B 都生比稿：`v2-ui-key-enter-a.png`、`v2-ui-key-enter-b.png`，選定後定名 `v2-ui-key-enter.png`。
- 若另出**無字版**（只 `↵`）：`v2-ui-key-enter-noword.png`，供小尺寸情境備用。
- 生成後**務必驗四周 alpha=0**（沿用 v2 透明驗證習慣）。

---

## 整合・交接（給小工程 / 小排版；小畫家不改 HTML/CSS/JS）

素材回收後怎麼接進畫面**不是小畫家的活**。以下只是定位參考：

1. **這顆 icon 怎麼放（小畫家建議）**：
   - **建議「icon 取代文字/emoji」**：把 `.shoot-btn` 內的 `🏹`（或「送出」文字）拿掉，改用 `v2-ui-key-enter.png` 當按鈕視覺（`<img>` 或 `background-image` + `font-size:0` 藏原字，仿現有 `v2-audio-button-wood.png` 手法）。因為 icon 本身已含 `↵`（+「Enter」小字），語意完整，**不需要再並排一個「送出」文字**，否則資訊重複又擠。
   - **`.shoot-btn` 目前是圓形 58×58**：鍵帽 icon 是方形，小排版可考慮把 `.shoot-btn` 的 `border-radius:50%` 改成小圓角（讓外框貼合方形鍵帽），或維持圓底當「托盤」、鍵帽 icon 疊中央——兩種都行，交小排版視覺定案。
   - `title`/`aria-label` 建議保留「送出 (Enter)」以維持無障礙與提示。
2. **hover/active**：現有 `.shoot-btn:hover/active` 有位移+投影動畫，換成 icon 後可沿用；若要「按下去像壓鍵」效果，小工程可在 active 時微調 icon 位移，屬前端細節，非小畫家範圍。
3. **手機版**：本文件針對桌機送出鈕。手機版若也有對應送出/確認鈕要不要跟進換 Enter 圖示，請走小蘋果評估雙邊同步，不在本批。

---

## 文化安全註記

🔍 **文化審查**：本顆 = 通用功能性「鍵盤 Enter 鍵」icon（方形鍵帽 + `↵` + 小字「Enter」）。**無人物角色、無服飾器物、無儀式、無聚落場景**，不涉及任何太魯閣族或其他族群文化符號。

✨ **校正後設定**：
- 只用「木質/金邊鍵帽 + 通用 `↵` 折返箭頭」語言，**無族群織紋、無菱形、無祖靈眼、無紋面（Ptasan）**，Negative 已明列排除。
- 木鍵面上的木紋是低調自然材質底紋（呼應遊戲木雕 UI 家族），**非文化紋樣**，安全。
- 全批排除阿美族紅黑/八角星、泰雅/太魯閣菱形織帶、排灣琉璃珠/百步蛇、羽冠、紋面。

📖 **備註**：近似視覺語彙的中性遊戲 UI 鍵盤 icon，非特定部落符號，用於遊戲 UI 無虞。**本顆低風險，通過。**

---

## 生成前檢查清單

- [ ] PNG RGBA 透明背景、四周 alpha=0？
- [ ] 只有**單一 Enter 鍵帽**（不是整塊鍵盤、不是多顆鍵）？
- [ ] 中央 `↵` **大、粗、置中**，縮到 40–48px 仍一眼可辨？
- [ ] 除了容許的「Enter」小字外，**無其他文字/數字**？「Enter」拼字正確（否則改無字版）？
- [ ] 風格與現有木質 UI 家族（喇叭鈕、v13 木盤 icon）一致（若採 A）？
- [ ] Negative 含族群織紋/紋面/祖靈之眼/其他族群圖騰排除？
- [ ] 命名照建議、回收到 `public/images/ui/`？
- [ ] 是否先報 prompt + 張數給使用者確認額度再跑？遇 `billing_hard_limit_reached` 立即停止？

---

## 使用方式提醒

把本文件相關段落貼給 Codex，**建議先生案 A 一張**看風格 OK；若使用者想比稿再生案 B。生成前先報 prompt 確認額度。回收到 `public/images/ui/`，驗透明背景與 `↵` 小尺寸清晰。換圖、`.shoot-btn` 樣式、藏原字/emoji、hover 邏輯——**一律交小工程/小排版，小畫家不碰 `hunter-truku-v2.html`**。
