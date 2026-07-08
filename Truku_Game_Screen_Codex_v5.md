# Truku Game Screen Assets Codex — v5（遊戲進行畫面補完）

**Version:** 5.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 依使用者提供的**遊戲進行畫面 mockup** 補完素材。比對素材庫後，mockup 九成素材已備齊（只待小排版接線），**真正需要生圖的只有兩項**：【G1】頂部標題橫幅木牌（必生）、【G2】背景懸崖平台變體（可選，優先度低）。美術風格、文化安全規則**完全沿用 `Truku_Hunter_Game_Assets_Codex_v2.md`**，本文件不重新定義。

> ✅ **遊戲名稱已由使用者定案：「族語射手 TRUKU WORD ARCHER」**（不是「族語獵人」）。本文件所有燒字內容一律以「族語射手」四字為準，登入畫面同名素材見 `Truku_Login_Screen_Codex_v4.md`（已同步改名）。

---

## 已備齊免生成（❗不要重複生，直接接線）

mockup 上的以下區塊都已有對應素材，屬小排版的組版工作，**本批一張都不用生**：

| mockup 區塊 | 現有素材 | 路徑 |
|---|---|---|
| 背景（峽谷/瀑布/叢林） | v2 遊戲主背景 | `public/images/ui/v2-background-game.jpg` |
| 獵人角色 | v2 獵人（弓箭手） | `public/images/ui/v2-hunter-character.png` |
| 箭靶（獵物/詞彙目標區） | v2 箭靶板 | `public/images/ui/v2-target-board.png` |
| 玩家頭像框 | v2 頭像木框 | `public/images/ui/v2-avatar-frame.png` |
| 連擊（COMBO）顯示 | v2 連擊木牌 | `public/images/ui/v2-combo-plaque.png` |
| 得分光效 | v2 得分光芒 | `public/images/ui/v2-score-sparkle.png` |
| 功能鈕（單字本/設定） | v2 功能鍵合圖 | `public/images/ui/v2-function-buttons.png`（切圖用） |
| 底部提示列 | v2 提示橫幅 | `public/images/ui/v2-tip-banner.png` |
| 詞彙卡 | v2 羊皮紙詞彙卡 | `public/images/ui/v2-word-card-frame.png` |
| HP 條外框 | v2 血條框（鏤空版） | `public/images/ui/v2-hp-bar-frame-hollow.png` |
| 射箭按鈕 | v2 金色木框按鈕 | `public/images/ui/v2-shoot-button.png` |
| 答對橫幅 | v2 「正確」橫幅 | `public/images/ui/v2-correct-banner.png` |
| 關卡/等級標示 | v2 等級徽章 | `public/images/ui/v2-level-badge.png` |

> 既有 `v2-title-sign.png` 是**直式垂掛木牌**（登入/標題畫面用），跟本 mockup 頂部的**橫式嵌框橫幅**造型不同，不能直接沿用，所以才有【G1】。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, Game Screen batch)**。細緻繪本/RPG 遊戲美術、木雕＋羊皮紙裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），不混用其他族群或泛部落意象——規範全部沿用 `Truku_Hunter_Game_Assets_Codex_v2.md`。

生成參數沿用既有方案：`gpt-image-1`、`quality: medium`、透明背景元件輸出 PNG。**生成前先把 prompt 列給使用者確認、確認額度夠再跑**，遇 `billing_hard_limit_reached` 立即停止回報，不重試。

---

## 素材生成佇列（僅 2 項）

#
> 💡 **省額度提示（後補）**：使用者最新的遊戲畫面 mockup 中，標題是「懸掛式木牌」造型，與登入畫面 md（v4）的【L2a】標題木牌同款。**若已生成 L2a，本項 G1 可直接沿用該圖、不必另生**；只有想要「橫式嵌框」不同造型時才生 G1。

## 【G1】頂部標題橫幅木牌 Top Title Banner Plaque — 🟡 簡短文化備註 ｜ ✅ 必生

**現況**：全新素材，本批唯一必生項。mockup 頂部有一塊**橫式長條木牌**嵌在畫面頂框中央（上緣與木框融合的造型）：深色木底、金色立體雕刻字「族語射手」置中、字兩側各一支**橫向箭矢**裝飾、下方兩行小字——「TRUKU WORD ARCHER」（金色）與「太魯閣語・TRUKU LANGUAGE」（綠色）。

比照登入 codex【L2a】/【L2b】的做法，生**兩版**：
- **(a) 完整燒字版**：賭 AI 中文渲染。生成後**逐字檢查「族語射手」四個字有沒有錯字/缺筆**，「太魯閣語」四字同樣要查，錯一筆就作廢改用 (b)。
- **(b) 保底空白版**：中文區全部留白由 CSS 疊字；英文副標「TRUKU WORD ARCHER」渲染成功率高，仍燒入。

🔍 **文化備註**：箭矢為通用射箭意象（呼應遊戲名「射手」），非特定太魯閣族紋樣或儀式符號，風險低；不加入任何族群織紋、紋面元素。

✨ **視覺設定**：橫式長條深色木牌，頂緣平直（設計成可與畫面頂部木框相接/融合），底緣可微弧或垂穗裝飾；金色雕刻立體中文「族語射手」置中，左右各一支水平箭矢（箭頭朝外或朝內對稱皆可）；中文下方兩行小字橫幅——金色「TRUKU WORD ARCHER」、綠色「太魯閣語・TRUKU LANGUAGE」。透明背景 PNG、橫式寬幅構圖（目標約 1536×400 的橫條；`gpt-image-1` 可用 `1536x1024` 生成後裁切，構圖時把木牌畫在畫面垂直置中的橫條帶內、上下留透明）。

🎨 **Prompt（a 完整燒字版）**：
```
A horizontal wooden title banner plaque UI element for a game screen header:
a long dark carved wood plank designed to sit embedded at the top center of
a game frame (flat top edge that blends into a wooden border above it, with
subtle golden rivets). In the center, large ornate carved 3D golden
Traditional Chinese characters reading exactly 「族語射手」 (render these
four Chinese characters precisely and legibly,
carved-wood-with-gold-leaf style). On each side of the characters, one
horizontal decorative golden arrow ornament pointing outward. Below the
Chinese title, two small lines of text: the upper line "TRUKU WORD ARCHER"
in golden carved capital letters, and the lower line 「太魯閣語・TRUKU
LANGUAGE」 in green lettering. Wide landscape banner composition, the plaque
centered as a horizontal strip with transparent space above and below.
Rich storybook-illustrated RPG game art style, warm lighting, transparent
background around the plaque shape. No other text, no watermark.
```
**Negative prompt**: `wrong or garbled Chinese characters, extra text, misspelled English, watermark, flat vector icon, photorealistic photography, tribal face tattoo motifs, ethnic weaving patterns, vertical hanging sign, ropes`

🎨 **Prompt（b 保底空白版）**：
```
A horizontal wooden title banner plaque UI element for a game screen header:
a long dark carved wood plank designed to sit embedded at the top center of
a game frame (flat top edge that blends into a wooden border above it, with
subtle golden rivets). The center of the plank is left EMPTY (no text) —
reserved for a game title text overlay added later — flanked on each side by
one horizontal decorative golden arrow ornament pointing outward. Below the
empty title area, a single small line of text "TRUKU WORD ARCHER" in golden
carved capital letters, and beneath it a thin green ribbon strip left EMPTY
(no text) for a text overlay. Wide landscape banner composition, the plaque
centered as a horizontal strip with transparent space above and below.
Rich storybook-illustrated RPG game art style, warm lighting, transparent
background around the plaque shape. No other text, no watermark.
```
**Negative prompt**: `Chinese characters, extra text on the plank, misspelled English, watermark, flat vector icon, photorealistic photography, tribal face tattoo motifs, ethnic weaving patterns, vertical hanging sign, ropes`

📖 **備註**：(a)(b) 同批生成（兩張都要），最終用哪張由使用者看成品決定。生成後：(1) 逐字檢查「族語射手」「太魯閣語」無錯字缺筆；(2) 檢查英文「TRUKU WORD ARCHER」拼字；(3) 用 Pillow 裁掉上下透明留白、確認四周 alpha 乾淨再交小排版。

---

### 【G2】背景懸崖平台變體 Background Cliff Platform Variant — 🟢 地景，無文化審查需求 ｜ ⚠️ 可選、優先度低

**現況**：**可先不生，用現有背景也能運作，純視覺加分項。** 現有 `v2-background-game.jpg` 的變體：左側前景多一個**突出的草地懸崖平台**（獵人站位用），右側留空間給箭靶區，其餘峽谷/瀑布構圖維持原本感覺。額度緊時直接跳過本項。

✨ **視覺設定**：與現行主背景同一場景語彙（太魯閣峽谷意象：大理石峽谷、瀑布、雲霧、茂密森林、暖色天光），但左側前景加一塊向畫面中央突出的草地懸崖平台，平台面平坦可站人；右側中景相對開闊、留視覺空間放箭靶；整體仍是插畫質感、非攝影。

🎨 **Prompt**：
```
A lush mountain gorge landscape game background, rich storybook-illustrated
RPG game art style: a deep marble canyon with a tall waterfall, misty clouds,
dense green forest and warm golden sunlight, painted illustration quality
with cinematic lighting and layered depth (NOT a photograph). In the LEFT
foreground, a grassy cliff platform juts out toward the center of the frame —
a flat-topped rocky outcrop covered in grass, large and stable enough for a
character to stand on, with a few small plants and stones on its edge. The
RIGHT side of the middle ground stays relatively open and uncluttered,
leaving clear visual space for a game target to be placed there. No
characters, no animals, no buildings, no UI elements. Landscape 16:9
composition. No text or watermark.
```
**Negative prompt**: `characters, people, animals, buildings, UI elements, text, watermark, flat vector icon, photorealistic photography, foreign landmarks`

📖 **備註**：純地理景觀（峽谷/瀑布/森林），無文化挪用疑慮。輸出比照現行背景：JPEG（不用透明）、生成後壓縮。命名建議 `v2-background-game-cliff.jpg`，**保留原 `v2-background-game.jpg` 不覆蓋**，讓小工程/小排版可切換或 A/B 比較。

---

## 生成前檢查清單

- [ ] 「已備齊免生成」清單裡的素材是否**一張都沒有重生**？（箭靶/頭像框/連擊木牌/得分光效/功能鈕/提示列/背景/獵人等都已存在）
- [ ] 【G1】燒字內容是否為定案名稱「**族語射手**」？（不是「族語獵人」——舊 mockup 名稱已作廢）
- [ ] 【G1a】生成後是否逐字檢查「族語射手」「太魯閣語」無錯字缺筆、「TRUKU WORD ARCHER」拼字正確？錯字是否改用【G1b】而非硬上？
- [ ] 【G1】是否為橫式嵌框構圖（非直式垂掛、無繩索）、透明背景、上下留白已裁切？
- [ ] 【G2】是否確認過使用者要生才生？（標注可選、優先度低，額度緊直接跳過）
- [ ] 【G2】是否保留原 `v2-background-game.jpg` 不覆蓋？
- [ ] 箭矢裝飾是否維持通用射箭意象、未加入任何族群織紋/紋面/儀式符號？
- [ ] Prompt 是否包含 v2 風格關鍵字（storybook-illustrated RPG game art）＋排除 flat vector icon / photorealistic photography？
- [ ] 是否生成前先報 prompt 與張數給使用者確認（額度把關）？

---

## 使用方式提醒

把這份文件整份貼給 Codex，告訴它「請依編號順序處理：【G1】必生（a、b 兩版都要），【G2】先問過使用者再決定生不生」。已備齊清單裡的素材**不要重生**；生完的接線組版（HTML/CSS）交小排版，需要邏輯配合（如背景切換）交小工程。遊戲名稱定案「族語射手 TRUKU WORD ARCHER」，任何燒字/疊字一律用新名稱。
