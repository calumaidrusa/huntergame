# Truku Login Screen Assets Codex — v4（登入/入口畫面全面改造）

**Version:** 4.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 依使用者提供的登入畫面 mockup，把現行「深色卡片表單」登入頁全面改造成 v2 細緻繪本/RPG 風格的遊戲入口畫面。本文件只涵蓋**登入/入口畫面**素材，遊戲內 HUD 素材見 `Truku_Hunter_Game_Assets_Codex_v2.md`（風格規範完全沿用該文件，不重新定義）。

---

## ⚠️ 給主對話的提醒（非美術決策，先標記、不展開做）

這張 mockup 隱含了兩個**超出美術範疇**的決策，生圖歸生圖，但正式套用前要使用者拍板：

1. **遊戲改名（已定案，不再是待決事項）**：✅ **名稱已由使用者定案：「族語射手 TRUKU WORD ARCHER」**。mockup 上原本寫的是「族語獵人」，後續使用者正式定案為「族語射手」，本文件所有 prompt 燒字內容與描述文字已同步改為「族語射手」，生圖與檢查一律以「族語射手」四字為準。名稱連動的 HTML `<title>`、HUD 標題文字、對外文案等仍需更新（改字屬小排版、改邏輯內字串屬小工程）。【L2b】空白版木牌照樣生成當保底（中文渲染失敗時由 CSS 疊「族語射手」）。
2. **訪客模式**：mockup 右下角有「訪客模式」按鈕，但現行帳號系統是強制登入才能玩。要不要加訪客模式（免帳號遊玩、成績不上排行榜之類）是功能決策，屬於**小工程**的範疇，要使用者確認。按鈕素材【L8】照樣先生（生了不虧，功能沒做就先不掛上畫面），但功能本身不在小畫家職責內。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, Login Screen batch)**，負責依 mockup 把登入畫面拆解成可重用的圖片素材並逐一生成。美術風格、太魯閣族文化安全規則**完全沿用 `Truku_Hunter_Game_Assets_Codex_v2.md`**：細緻繪本/RPG 遊戲美術、木雕＋羊皮紙裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），不混用其他族群或泛部落意象。

---

## Style Guide（沿用 v2，登入畫面補充事項）

- 基底規範見 `Truku_Hunter_Game_Assets_Codex_v2.md` 的 Style Guide，這裡不重抄，只列本批補充：
- **文字原則**：所有動態/可變文字（分頁鈕、輸入欄標籤、「進入山林」、「訪客模式」）一律**留空白由前端 CSS 疊字**。唯一例外是**標題木牌**：「族語射手」金色雕刻立體字 CSS 難以重現，屬裝飾性固定文字，可燒進圖裡——但 AI 中文渲染有失敗風險，所以標題木牌生**兩個方案**（【L2a】含字完整版、【L2b】空白保底版），英文「TRUKU WORD ARCHER」渲染成功率高，兩版都可以燒
- **透明背景**：除背景圖外，所有 UI 元件素材都要透明背景 PNG（transparent background），跟 v2 批次一致
- **鏤空外框是本批最高風險項**：v1 的 `frame-game.png` 就是因為中央不透明、沒真的鏤空而報廢。【L1】的 prompt 必須明確要求 transparent hollow center、only the border frame itself，生成後**第一件事就是驗證中央 alpha 是否為 0**
- **重複元件共用**：輸入框一張共用三列；同組小圖示（徽章 ×3、音量開/關 ×2、分頁鈕 ×2）合圖生成再切，省額度也保風格一致

---

## 可沿用素材（不重生，省額度）

比對 `asset_mapping_v2.md` 與 mockup 後，以下現有素材可直接或條件性沿用：

| mockup 區塊 | 沿用素材 | 路徑 | 沿用方式 |
|---|---|---|---|
| 背景（叢林峽谷瀑布） | v2 遊戲主背景 | `public/images/ui/v2-background-game.jpg` | **直接沿用**，mockup 背景與此圖幾乎一樣，不重生 |
| 左下角齒輪（設定）鈕 | v2 功能鍵合圖（書本＋齒輪） | `public/images/ui/v2-function-buttons.png` | **直接沿用**，切出齒輪那顆（小排版切圖/CSS 定位） |
| 「進入山林」金色大按鈕 | v2 射箭按鈕（金色木框） | `public/images/ui/v2-shoot-button.png` | **候補沿用**：同為金色木框按鈕、文字區空白，先套看看；圖上有小箭矢裝飾，若視覺上跟「進入山林」語意不衝突就直接用，不合再啟用【L6b】重生 |
| 三列輸入框 | v2 輸入框（深綠木框） | `public/images/ui/v2-input-field.png` | **候補沿用**：同為深綠木框輸入框，但該圖左側燒了一個小圖示，跟 mockup「左側另有獨立圖示徽章」的排版可能打架；先試套，衝突再啟用【L6】重生 |
| 標題木牌（萬一【L2a】【L2b】都失敗） | v2 標題木牌（空白通用版） | `public/images/ui/v2-title-sign.png` | **保底的保底**：沒有弓箭徽章與橫幅帶，裝飾簡單，僅在新生成全數失敗時墊檔 |

> 音量鈕注意：現有 `ui-volume-on/off.png` 是 v1 扁平風，跟 v2 不一致，**不沿用**，列入【L7】重生。

---

## 標準工作流程

依「生成佇列」編號順序一次處理一個，每個素材用 v2 文件的格式回報：

**🔍 文化審查**（涉及人物/器物意象時；純 UI 框架寫「純 UI 元件，無文化審查需求」）
**✨ 視覺設定校正**
**🎨 Prompt** / **Negative Prompt**
**📖 備註**（含哪個編號完成、下一個是什麼）

生成參數沿用既有方案：`gpt-image-1`、`1024x1024`（或依元件比例）、`quality: medium`、透明背景元件輸出 PNG。**生成前先把 prompt 列給使用者確認、確認額度夠再跑**，遇 `billing_hard_limit_reached` 立即停止回報，不重試。

---

## 素材生成佇列（登入畫面批次，依序處理）

### 【L1】全畫面木質雕花外框 Full-Screen Ornate Frame — 🟢 純 UI 元件 ｜ ❗本批最高風險項

**現況**：全新素材。v1 的 `frame-game.png` 因中央不透明報廢，這次成敗關鍵就是**中央完全透明鏤空**。

✨ **視覺設定**：深色木質雕花邊框環繞整個視窗四邊，四角有金色鉚釘/菱形裝飾，像遊戲機台框；中央大面積完全透空，讓背景與登入卡從框內透出。

🎨 **Prompt**：
```
A full-screen ornate game border frame UI element: ONLY the border itself —
a dark carved wood frame running along all four edges of the canvas, with
golden rivets and small golden diamond ornaments at the four corners, subtle
leaf/vine carving details along the wood. The ENTIRE center of the image must
be completely EMPTY and TRANSPARENT (hollow cutout, alpha = 0) — do NOT paint
any background, scene, color fill, or vignette inside the frame; render
nothing but the wooden border strips themselves on a fully transparent
background. Landscape 16:9 canvas proportions matching a game viewport.
Rich storybook-illustrated RPG game art style, warm lighting on the wood.
No text or watermark.
```
**Negative prompt**: `filled center, opaque center, background scene inside frame, vignette, solid color fill, text, watermark, flat vector icon, photorealistic photography`

📖 **備註**：生成後立即用 Pillow 驗證中央區域 alpha 是否為 0，不透明就重下 prompt，不要交差。

---

### 【L2a】標題木牌完整版（含雕刻中文字）Title Plaque with Carved Text — 🟡 簡短文化備註

**現況**：全新素材，畫面視覺主角。賭 AI 中文渲染，失敗就靠【L2b】。

🔍 **文化備註**：弓箭徽章是通用射箭意象（弓＋箭交叉＋葉圈），非特定太魯閣族紋樣或儀式符號，風險低；不加入任何族群織紋、紋面元素。

✨ **視覺設定**：兩條粗麻繩自上方垂掛深綠色木板；金色雕刻立體字「族語射手」；木牌頂部中央弓箭徽章（弓與箭交叉、環繞葉圈）；四角葉叢裝飾＋金色菱形鉚釘；下方接兩條橫幅帶——金色字「TRUKU WORD ARCHER」、綠底字「太魯閣語・TRUKU LANGUAGE」。

🎨 **Prompt**：
```
A hanging wooden game title plaque UI element: a dark green carved wood board
suspended from two thick hemp ropes at the top. At the top center of the
plaque sits a golden emblem of a bow and arrow crossed, surrounded by a
circular leaf wreath. The plaque corners are decorated with leaf clusters and
small golden diamond rivets. On the board, large ornate carved 3D golden
Traditional Chinese characters reading exactly 「族語射手」 (render these four
Chinese characters precisely and legibly, carved-wood-with-gold-leaf style).
Below the plaque hang two ribbon banners: the upper golden banner with the
English text "TRUKU WORD ARCHER" in carved capital letters, and the lower
green banner with the text 「太魯閣語・TRUKU LANGUAGE」. Rich
storybook-illustrated RPG game art style, warm lighting, transparent
background around the plaque shape. No other text, no watermark.
```
**Negative prompt**: `wrong or garbled Chinese characters, extra text, misspelled English, watermark, flat vector icon, photorealistic photography, tribal face tattoo motifs, ethnic weaving patterns`

📖 **備註**：中文四字＋橫幅共三段文字全燒進圖，是高難度渲染；生成後逐字檢查「族語射手」「太魯閣語」是否正確無缺筆，錯字即作廢改用【L2b】。

---

### 【L2b】標題木牌保底版（空白字區）Title Plaque Blank Fallback — 🟡 簡短文化備註

**現況**：全新素材，【L2a】的保底。中文區留白給 CSS 疊字；英文「TRUKU WORD ARCHER」渲染成功率高，仍燒進金色橫幅；綠色橫幅（原「太魯閣語・TRUKU LANGUAGE」含中文）留白。

🔍 **文化備註**：同【L2a】，弓箭徽章為通用射箭意象，風險低。

🎨 **Prompt**：
```
A hanging wooden game title plaque UI element: a dark green carved wood board
suspended from two thick hemp ropes at the top. At the top center of the
plaque sits a golden emblem of a bow and arrow crossed, surrounded by a
circular leaf wreath. The plaque corners are decorated with leaf clusters and
small golden diamond rivets. The center of the board is left EMPTY (no text)
— reserved for a game title text overlay added later. Below the plaque hang
two ribbon banners: the upper golden banner carries the English text
"TRUKU WORD ARCHER" in carved capital letters; the lower green banner is left
EMPTY (no text) for a text overlay. Rich storybook-illustrated RPG game art
style, warm lighting, transparent background around the plaque shape. No
other text, no watermark.
```
**Negative prompt**: `Chinese characters, extra text on the board, misspelled English, watermark, flat vector icon, photorealistic photography, tribal face tattoo motifs, ethnic weaving patterns`

📖 **備註**：與【L2a】同批生成（兩張都要），最終用哪張由使用者看成品決定；名稱已定案「族語射手」，這張是中文渲染失敗時的保底（CSS 疊「族語射手」）。

---

### 【L3】登入卡分頁鈕組 Login Tab Buttons — 🟢 純 UI 元件

**現況**：全新素材。「登入」（金色木質、選中態）＋「建立獵人」（深綠木質、未選中態），文字留白 CSS 疊。兩顆合圖生成再切，前端切換選中態時互換兩張圖。

🎨 **Prompt**：
```
A set of 2 wooden tab button UI elements for a game login card, side by side
on a transparent background: (1) an ACTIVE tab — warm golden polished wood
with a carved border, slightly raised/highlighted look; (2) an INACTIVE tab —
dark green wood, flatter and dimmer. Both share the same rounded-top tab
shape and consistent carved wood style, with EMPTY centers (no text baked in,
reserved for text overlay). Rich storybook-illustrated RPG game art style,
warm lighting, transparent background. No text or watermark.
```
**Negative prompt**: `text, letters, watermark, flat vector icon, photorealistic photography, inconsistent style between the two tabs`

📖 **備註**：提醒小排版：合圖需切兩顆；「登入/建立獵人」字由 CSS 疊，選中態切換＝底圖互換。

---

### 【L4】羊皮紙登入卡主體 Parchment Login Card — 🟢 純 UI 元件

**現況**：全新素材。米色做舊羊皮紙＋木框邊，上方有繩子與標題木牌連成一體垂掛。**不含分頁鈕**（由【L3】疊上）、**不含輸入框與按鈕**（由【L6】/沿用素材疊上）、不含任何文字。既有 `v2-word-card-frame.png` 是直式詞彙卡，比例與掛繩結構跟登入卡不同，不沿用。

🎨 **Prompt**：
```
A large aged parchment login card UI element for a game menu: cream-colored
weathered parchment paper with worn darkened edges, mounted on a carved wood
frame border, hanging from two short ropes at the top (rope ends visible, as
if suspended from a sign above). Decorative but restrained carved corners.
The entire inner parchment area is EMPTY — no input boxes, no buttons, no
icons, no text — reserved for UI elements overlaid later. Portrait-leaning
rectangular proportions suitable for a login form. Rich storybook-illustrated
RPG game art style, warm lighting, transparent background around the card
shape. No text or watermark.
```
**Negative prompt**: `input fields, buttons, icons, text, letters, watermark, flat vector icon, photorealistic photography`

📖 **備註**：卡面必須全空，輸入列/按鈕/分頁全部由前端疊放，這樣三列輸入才能共用一張輸入框圖。

---

### 【L5】方形木質圖示徽章 ×3 Icon Badges (Person / Padlock / Quill) — 🟡 簡短文化備註

**現況**：全新素材。三列輸入欄左側的方形木質圖示徽章：人像（獵人代號）、鎖頭（通行密語）、羽毛筆（獵人名稱）。合圖生成再切三顆。

🔍 **文化備註**：人像為通用剪影式小圖示，無臉部細節，不涉及紋面（Ptasan）風險；鎖頭/羽毛筆為通用物件。安全。

🎨 **Prompt**：
```
A set of 3 small square wooden badge UI icons in a horizontal row on a
transparent background, all sharing the same carved dark wood square frame
with a subtle golden edge: (1) a simple generic person head-and-shoulders
silhouette icon (no facial features), (2) a padlock icon, (3) a quill feather
pen icon. Icons are carved/embossed in warm golden tone on the wood. Rich
storybook-illustrated RPG game art style, warm lighting, consistent style
across all three. No text or watermark.
```
**Negative prompt**: `facial features, face markings, tattoos, text, watermark, flat vector icon, photorealistic photography, inconsistent style`

📖 **備註**：提醒小排版：合圖需切三顆，依序對應獵人代號/通行密語/獵人名稱三列。

---

### 【L6】輸入框（條件性重生）Input Field — 🟢 純 UI 元件

**現況**：**先試沿用 `public/images/ui/v2-input-field.png`**。該圖左側燒了小圖示，若跟【L5】獨立徽章並排視覺打架，才啟用本項重生。一張共用三列。

🎨 **Prompt**（僅在沿用失敗時執行）：
```
A single horizontal text input field UI element for a game login form: a dark
green inset rounded rectangle with a subtle inner shadow (recessed look),
framed by a thin carved wood border, with a small decorative leaf ornament at
the right end. The interior is EMPTY dark green (no icon, no text — reserved
for typed text overlay). No icon on the left side. Rich storybook-illustrated
RPG game art style, warm lighting, transparent background. No text or
watermark.
```
**Negative prompt**: `icons inside the field, left-side icon, text, letters, watermark, flat vector icon, photorealistic photography`

📖 **備註**：這項是**條件性**的，能沿用就跳過，直接省一張額度。

---

### 【L6b】「進入山林」大按鈕（條件性重生）Enter Button — 🟢 純 UI 元件

**現況**：**先試沿用 `public/images/ui/v2-shoot-button.png`**（金色木框、文字區空白）。若圖上箭矢裝飾與「進入山林」語意/構圖不合，才啟用本項。文字由 CSS 疊。

🎨 **Prompt**（僅在沿用失敗時執行）：
```
A large ornate golden game button UI element: warm golden gradient wood
surface with a carved dark wood border, subtle leaf ornaments at both ends,
gentle 3D raised-button lighting. The center is EMPTY (no text, no icon —
reserved for text overlay). Wide horizontal proportions for a primary
call-to-action button. Rich storybook-illustrated RPG game art style, warm
lighting, transparent background. No text or watermark.
```
**Negative prompt**: `text, letters, icons, watermark, flat vector icon, photorealistic photography`

📖 **備註**：條件性項目，能沿用就跳過。

---

### 【L7】音量喇叭圓鈕（開/關兩態）Volume Buttons — 🟢 純 UI 元件

**現況**：全新素材。現有 `ui-volume-on/off.png` 是 v1 扁平風不沿用。左下角圓形木質徽章按鈕，跟沿用的齒輪鈕（`v2-function-buttons.png`）同語言。開/關兩態合圖再切。

🎨 **Prompt**：
```
A set of 2 circular wooden medallion button UI elements side by side on a
transparent background: (1) a speaker icon with sound waves (volume ON),
(2) the same speaker icon with a diagonal slash across it (volume OFF/muted).
Both share the same ornate carved dark wood circular border with a golden
carved icon, matching a consistent medallion design. Rich
storybook-illustrated RPG game art style, warm lighting, consistent style
across both. No text or watermark.
```
**Negative prompt**: `text, watermark, flat vector icon, photorealistic photography, inconsistent style`

📖 **備註**：風格需與 `v2-function-buttons.png` 的齒輪鈕一致（同為圓形木雕徽章）；合圖需切兩顆。

---

### 【L8】訪客模式橫式木牌按鈕 Guest Mode Button — 🟡 簡短文化備註

**現況**：全新素材。右下角橫式木牌按鈕，左側人像小圖示，文字區留白（「訪客模式」CSS 疊）。⚠️ 功能本身未定案（見文件開頭提醒），素材先備著，功能沒做就先不掛上畫面。

🔍 **文化備註**：人像為通用剪影小圖示，無臉部細節，無紋面風險。安全。

🎨 **Prompt**：
```
A horizontal wooden sign button UI element for a game menu: a dark carved
wood plank with a subtle golden border, a small generic person
head-and-shoulders silhouette icon (no facial features) carved in golden tone
on the left side, and an EMPTY space on the right (no text — reserved for
text overlay). Rich storybook-illustrated RPG game art style, warm lighting,
transparent background. No text or watermark.
```
**Negative prompt**: `facial features, face markings, tattoos, text, letters, watermark, flat vector icon, photorealistic photography`

📖 **備註**：本批最後一項。完成後做整批鏤空/透明驗證與文化快速複核，再交小排版組版。

---

## 生成前檢查清單

- [ ] 【L1】外框 prompt 是否明確要求 transparent hollow center / alpha 0，生成後是否驗證了中央透明？（v1 `frame-game.png` 報廢教訓）
- [ ] 所有動態文字元件（分頁/標籤/按鈕）是否都留空白、沒把字燒進圖？（唯一例外：標題木牌【L2a】與英文橫幅）
- [ ] 【L2a】生成後是否逐字檢查「族語射手」「太魯閣語」無錯字缺筆？錯字是否改用【L2b】而非硬上？
- [ ] 條件性項目【L6】【L6b】是否先試沿用既有素材再決定重生？沿用清單（背景/齒輪鈕）是否沒有重複生成？
- [ ] 人像圖示（【L5】【L8】）是否為無臉部細節的通用剪影、無紋面或臉部標記？
- [ ] 弓箭徽章是否維持通用射箭意象、未加入任何族群織紋/儀式符號？
- [ ] Prompt 是否包含 v2 風格關鍵字（storybook-illustrated RPG game art）＋排除 flat vector icon / photorealistic photography？
- [ ] 是否依編號順序、一次一個跟使用者確認，且生成前先報 prompt 與張數（額度把關）？
- [ ] 合圖項目（【L3】×2、【L5】×3、【L7】×2）是否已提醒小排版需要切圖？

---

## 使用方式提醒

把這份文件整份貼給 Codex，告訴它「請依照素材生成佇列的編號順序，一次處理一個項目，每個項目完成後跟我確認再繼續下一個」。【L6】【L6b】是條件性項目，先試沿用 `v2-input-field.png` / `v2-shoot-button.png`，確定不合再生成。背景與齒輪鈕**不要重生**。素材生成完的組版（HTML/CSS）交給小排版；遊戲名稱已定案「族語射手 TRUKU WORD ARCHER」（見文件開頭提醒區塊），訪客模式功能仍屬未定案的非美術決策，等使用者拍板。
