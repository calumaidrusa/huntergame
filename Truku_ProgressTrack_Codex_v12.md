# Truku Progress Track Codex — v12（底部「關卡步道」進度條素材生成）

**Version:** 12.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 為遊戲底部進度條生成「關卡步道」風格素材，把現有 L2 填空的 CSS 近似版（綠色填充條 + emoji🏁 + 蹲姿獵人當標記）升級成參考圖那樣的木質繪本闖關步道。參考圖來自 L4 看圖選詞畫面底部：一條橫跨畫面最底的木頭+草地小路，沿路等距排圓形關卡節點，一個奔跑姿小獵人 sprite 跑在當前節點上，右端是終點旗/營地。

本文件涵蓋 **3 張素材**（步道底圖、奔跑獵人 sprite、終點旗/營地）。關卡節點圓帽走 CSS，不生圖（見【素材盤點】）。

---

## ⚠️ 給主對話 / 使用者的提醒（先標記）

1. **要生 3 張**：(A) 步道底圖橫幅、(B) 奔跑姿獵人 sprite、(C) 終點旗/營地。三張都透明背景 PNG。節點圓帽（亮/暗兩態）用 CSS tint 做，不生圖。
2. **為什麼要生獵人**：現有 5 張獵人 sprite（`v2-hunter-truku-h1/h2/aim/idle/release`）**全是拉弓/瞄準/放箭姿**，**沒有奔跑姿**。步道進度條要的是「朝右跑」的小人，故必須新生 1 張跑姿。
3. **換圖 / CSS 是小排版的事**：小畫家只生素材、寫本規格。素材接進 `#hunterTrack`/`#trackFill`/`#trackGoal`/`#hunter` 結構、以及節點 CSS，交小排版（見【整合說明】）。小畫家不改 `hunter-truku-v2.html`。
4. **文化安全：本批低風險**。木步道、草葉、木質圓節點、旗子/營地帳篷、通用弓箭手獵人（無紋面、無族群織紋）。節點與旗幟明確排除菱形織紋/祖靈之眼。見【文化安全註記】。
5. **先報 prompt 給使用者確認額度再貼 Codex**。遇 `billing_hard_limit_reached` 立即停止回報、不重試。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, progress-track assets)**。美術風格與太魯閣族文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md`：細緻繪本/RPG 遊戲美術、木雕＋藤蔓/葉片裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），透明背景 PNG，不混用其他族群或泛部落意象。素材要與現有 `public/images/ui/` 的 v2 木質繪本風（背景、獵人、木框、難度框）視覺一致。

---

## 素材盤點（要生 / 現有 / CSS）

| 元素 | 判定 | 說明 |
|---|---|---|
| **步道底圖（木+草橫向帶）** | **✅ 生圖 A** | 需一張全寬可延展的橫幅木步道，現有無此素材 |
| **關卡節點圓帽（亮/暗兩態）** | **CSS（不生圖）** | 用 CSS 圓形木鈕：亮態＝綠色發光漸層、暗態＝灰。等距排列由 CSS/JS 生 N 顆。若日後要更精緻再議生 1 張圓帽 PNG，先 CSS |
| **奔跑姿獵人 sprite** | **✅ 生圖 B** | 現有 5 張獵人全是拉弓姿，無跑姿，必生 |
| **終點旗 / 營地帳篷** | **✅ 生圖 C** | 現用 emoji🏁 佔位，升級成木質繪本旗幟/小丘營地 |
| 題號木牌「第 X / Y 題」 | **CSS（不生圖）** | `#trackRoundLabel` 已是 CSS 木牌樣式，沿用 |
| 綠色填充/進度計算 | **CSS + 既有 JS** | `#trackFill` + `positionHunterAsProgress()`，不動 |

**結論：生 3 張（A 步道底圖、B 跑姿獵人、C 終點旗/營地），節點與題號木牌走 CSS。**

---

## 素材 A：步道底圖橫幅

✨ **要生成的**：一條橫向的木頭+草地闖關小路，透明背景 PNG，左右可被拉伸/平鋪、上下收邊乾淨（供疊在畫面最底當進度條背景）。木板路面 + 兩側綠草藤葉點綴，暖色 RPG 繪本風。**不要**在圖上畫節點圓帽、獵人、旗子（那些另外疊上去）；**不要**任何文字。

### 🎨 English Prompt（A）
```
A horizontal wooden trail path banner for a fantasy RPG level-progress bar, on a
fully transparent background, rich storybook-illustrated game art style, warm
cinematic lighting, painterly detail. A wooden plank walkway / dirt-and-wood path
running left to right like an adventure map route, with tufts of green grass, a
few small green leaves and vines sprouting along the edges, warm wood-brown planks
with soft wood grain, gentle top-down-ish illustrated perspective. The strip is
wide and short (a bottom UI ribbon), edges fade cleanly so it can tile/stretch
horizontally. Warm gold + wood-brown + green palette, consistent with a cozy
hand-painted jungle adventure game. No characters, no flags, no round buttons or
gems on the path, no text, no watermark. Everything above and below the trail
ribbon is fully transparent (alpha 0).
```

### 🚫 Negative Prompt（A）
```
characters, hunter, people, flag, tent, round level buttons, gems on path, coins,
text, numbers, watermark, flat vector icon, photorealistic photography, ethnic
weaving pattern, tribal diamond weaving motif, ancestral eye motif, Atayal/Truku
weaving, Amis/Paiwan/indigenous totem, feathered headdress, face tattoo
```

- **尺寸/比例**：橫幅，建議先 1024×1024 生成後裁成寬條，或直接生寬條。目標約 **1600×260（寬:高 ≈ 6:1）**，輸出 **PNG RGBA 透明背景**，上下留透明、左右邊緣漸隱好平鋪。

---

## 素材 B：奔跑姿獵人 sprite（朝右跑）

🔍 現有獵人皆拉弓姿，此張為**新姿勢**。維持與 `v2-hunter-truku-h2.png` **同一個角色設定**（同髮型、頭帶、米白短衣素色滾邊、綁腿、箭袋），只是改成**朝右奔跑**的動態，適合當進度條上往終點跑的小人。

✨ **要生成的**：同一位通用奇幻弓箭手少年，**側面朝右、奔跑中**的姿勢（一腳前一腳後、身體前傾、手臂擺動，弓可背在背上或握在手上不拉弦），繪本 RPG 風，透明背景。**維持通用弓箭手造型**：頭帶、護腕/綁腿、箭袋、米白短衣加素色滾邊——**不加任何族群織紋圖案、不畫紋面（Ptasan）**。

### 🎨 English Prompt（B）
```
A young generic fantasy archer boy character running toward the right, side view,
mid-stride dynamic running pose (one leg forward one back, body leaning forward,
arms swinging, bow slung on the back or held un-drawn), rich storybook-illustrated
RPG game art style, warm cinematic lighting, painterly detail, clear facial
features, cheerful adventurous look. Outfit: simple cream/off-white short tunic
with plain solid-color trim, a headband, wrapped forearms and lower legs, a quiver
of arrows on the back — a generic fantasy ranger/archer look. Consistent character
design with a kneeling archer sprite from the same game (same hair, headband, tunic
style). Fully transparent background (alpha 0), character only. No text, no
watermark.
```

### 🚫 Negative Prompt（B）
```
face tattoo, facial tattoo, Ptasan, ethnic weaving pattern, tribal diamond weaving
motif, ancestral eye motif, Atayal/Truku weaving, Amis/Paiwan/indigenous totem,
feathered headdress, war paint, tribal warrior, revealing armor, drawing the bow,
aiming, kneeling, shooting, text, watermark, flat vector icon, photorealistic
photography, background scenery
```

- **尺寸/比例**：直立人物，建議 **768×768 或 1024×1024**，人物置中、四周透明。輸出 **PNG RGBA**。前端會縮到約 52×46px 顯示，故細節不用過度，但輪廓要在小尺寸下清楚可辨（朝右跑的剪影明確）。

---

## 素材 C：終點旗 / 營地

✨ **要生成的**：進度條右端的終點標記——**小山丘上一面旗子**，或**小營地帳篷**（二選一，本規格傾向「小丘 + 旗子 + 帳篷營地」複合小場景，當「目的地」意象）。木質繪本風，透明背景，尺寸小（進度條右端角標）。旗面**素色或簡單圖案**，**不要菱形織紋/祖靈之眼**。

### 🎨 English Prompt（C）
```
A small level-goal marker for a fantasy RPG progress bar: a little grassy hill with
a planted checkpoint flag and a small cozy camp tent beside it, marking the
destination, rich storybook-illustrated game art style, warm cinematic lighting,
painterly detail, warm wood-brown + green + gold palette. Small compact icon-sized
composition. The flag cloth is a plain solid color or a very simple stripe (NO
woven diamond pattern, NO ethnic motif). Fully transparent background (alpha 0),
the hill/flag/tent only. No text, no watermark.
```

### 🚫 Negative Prompt（C）
```
ethnic weaving pattern, tribal diamond weaving motif, ancestral eye motif on flag,
Atayal/Truku weaving, Amis/Paiwan/indigenous totem, feathered headdress, skull,
text, numbers, watermark, flat vector icon, photorealistic photography, characters,
people
```

- **尺寸/比例**：小圖標，建議 **512×512**，主體置中、四周透明。輸出 **PNG RGBA**。前端顯示約 20–40px。

---

## 命名與回收位置

三張都回收到 `public/images/ui/`，命名（建議）：

| 素材 | 檔名 | 前端接點 |
|---|---|---|
| A 步道底圖 | `public/images/ui/v2-progress-track.png` | 疊在 `#hunterTrack` 當 `background`（見【整合】） |
| B 跑姿獵人 | `public/images/ui/v2-hunter-truku-run.png` | 進度條標記 `#hunter`（`blank-active` 時換用此張）或獨立節點小人 |
| C 終點旗/營地 | `public/images/ui/v2-progress-goal.png` | 換掉 `#trackGoal` 的 emoji🏁 |

- 全部 **PNG RGBA 透明背景**，生成後**務必驗四周 alpha=0**（沿用 v2 透明驗證習慣）。

---

## 整合說明（給小排版；小畫家不改 HTML/CSS）

現有穩定 DOM（`hunter-truku-v2.html`）：
- `#hunterTrack`（line 622-626）：細條容器，`left:20 right:130 bottom:12 height:12`，僅 `body.blank-active` 顯示。
- `#trackFill`（line 627）：綠色填充，`width` 由 `positionHunterAsProgress()`（line 5047）依 `round/totalRounds` 設。
- `#trackGoal`（line 633）：終點，現 emoji🏁。
- `#trackRoundLabel`（line 637）：第 X/Y 題木牌（CSS，沿用）。
- `#hunter`（line 615，`blank-active` 時）：被 `positionHunterAsProgress` 重定位成軌道標記，`left` 依進度。

**接法**：
1. **步道底圖 A**：把 `#hunterTrack` 的 `background`（現為深綠半透明色條 line 624）改成 `url('/images/ui/v2-progress-track.png') repeat-x` 或 `100% 100%`；高度可從 12px 加高到約 28–40px 讓步道插畫看得出來（需連帶調 `bottom` 與答案格 `#answerArea` 的間距，見 L2 既有 `bottom:62px` line 593）。
2. **節點圓帽（CSS 生）**：在 `#hunterTrack` 內用 JS/CSS 依 `totalRounds` 等距排 N 顆 `.track-node`（圓形木鈕）：已過關/當前態＝綠色發光漸層 + 金邊、未到態＝灰。`positionHunterAsProgress` 已算好每題進度，可據此 toggle 節點亮暗。**這是小排版新增的 CSS + 小工程配合的節點狀態切換**（見【工作分配】）。
3. **跑姿獵人 B**：`body.blank-active #hunter` 的 `src` 換成 `v2-hunter-truku-run.png`（朝右跑）。**注意**：`#hunter` 是同一個 DOM，遊戲其他關用蹲姿 h2；L2 進度條要換跑姿——由小工程在 `applyLevelMode`/`blank-active` 切換時換 `src`，或小排版用 `body.blank-active #hunter{content:url(...)}` 換圖。兩者擇一，需小工程/小排版對齊。
4. **終點旗 C**：`#trackGoal` 內的 emoji🏁 換成 `<img src="/images/ui/v2-progress-goal.png">`，調 `right/bottom/尺寸`。

---

## 工作分配

- **小畫家（我）**：生 3 張（A/B/C），本規格 + prompt。生成前報 prompt 給使用者確認額度（本文件即是）。回收後驗透明/比例。
- **小排版**：`#hunterTrack` 換步道底圖背景 + 加高、`.track-node` 圓帽 CSS（亮/暗態）、`#trackGoal` 換旗幟 img、L2 獵人換跑姿 src、連帶答案格間距微調。
- **小工程**：節點亮暗狀態隨 `round` 切換（配合 `positionHunterAsProgress`）、L2 進度條獵人 src 切換時機（`applyLevelMode`/`blank-active`）。

---

## 只做 L2 還是設計成可重用？（建議）

**建議：素材與結構設計成「可重用到其他關」，但先只在 L2 啟用。**

理由：
- 參考圖本身來自 **L4** 看圖選詞畫面，代表這條步道進度條**視覺上適合多關共用**，不是 L2 專屬。
- 現在 `#hunterTrack` 綁在 `body.blank-active`（只 L2）。素材（步道/獵人/旗）與節點 CSS 本身**與模式無關**，可被任何關卡復用。
- **做法建議**：素材命名保持中性（`v2-progress-track` 而非 `v2-l2-track`），CSS 節點類名中性（`.track-node`）。日後要開放給 L3/L4/L5，只需把顯示條件從 `body.blank-active` 放寬（例如新增 `body.has-progress-track`，由小工程在對應關卡加上），**不用重生素材**。
- **短期範圍**：先只 L2 上線驗證，穩了再由小工程一行條件放寬到其他關。這樣素材一次到位、不重工。

---

## 文化安全註記

🔍 **文化審查**：本批 = 木步道（木板+草+藤葉）、圓形木質關卡節點、終點旗/營地帳篷、通用奇幻弓箭手奔跑 sprite。無服飾器物紋樣、無儀式、無聚落文化場景。

✨ **校正後設定**：
- **獵人（B）**：維持通用奇幻弓箭手造型（頭帶/護腕/箭袋/素色滾邊短衣），**無紋面（Ptasan）、無族群織紋**，Negative 已明列排除。只是換奔跑姿，文化風險與現有蹲姿獵人同級（低）。
- **節點/旗幟（C）**：旗面素色或簡單條紋，Negative 明列排除「菱形織紋/祖靈之眼/其他族群圖騰」——避免旗幟或圓節點被畫成織紋徽章。
- **步道（A）**：純自然地景（木板/草/葉），無文化符號。
- 全批排除阿美族紅黑/八角星、泰雅太魯閣菱形織帶、排灣琉璃珠/百步蛇、羽冠、紋面。

📖 **備註**：近似視覺語彙的中性遊戲 UI 裝飾，非特定部落符號精確復刻，用於遊戲 UI 無虞。**本批低風險，通過。**

---

## 生成前檢查清單

- [ ] 3 張都是 **PNG RGBA 透明背景**、四周 alpha=0？
- [ ] A 步道：無獵人/旗/節點/文字，左右邊緣可平鋪，約 6:1 寬條？
- [ ] B 獵人：**朝右奔跑**姿、與現有角色同設定、**無紋面/無族群織紋**、無背景？
- [ ] C 終點：小丘+旗+營地、旗面**無菱形織紋**、小圖標、無文字？
- [ ] 三張 Negative 都含族群織紋/紋面/祖靈之眼/其他族群圖騰排除？
- [ ] 命名照建議（`v2-progress-track` / `v2-hunter-truku-run` / `v2-progress-goal`），回收到 `public/images/ui/`？
- [ ] 是否先報 prompt + 張數（3 張）給使用者確認額度再跑？遇 `billing_hard_limit_reached` 立即停止？

---

## 使用方式提醒

把本文件相關段落貼給 Codex，請它**分三次各生 1 張**（A 步道 / B 跑姿獵人 / C 終點旗），生成前先報 prompt 確認。回收三張到 `public/images/ui/`，驗透明背景。換圖進 `#hunterTrack`/`#hunter`/`#trackGoal` 結構、節點 CSS、獵人 src 切換，一律交小排版/小工程，小畫家不碰 `hunter-truku-v2.html`。
