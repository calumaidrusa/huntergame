# Truku Match-Game Art Codex — v15（第六關「詞義配對消除」入口卡 + 選關頁）

**Version:** 15.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 把第六個小遊戲「詞義配對消除」（族語卡 ↔ 中文卡 配對消除、限時）的**入口/介紹卡**與其**選關頁入口按鈕**，從目前純 CSS/漸層樣式，升級成與全站一致的 vibrant jungle adventure 風格（雕花木框、金色描邊、藤蔓綠葉、瀑布叢林背景）。本批**真正需要 Codex 新生的只有 2 張透明 PNG**：`v2-match-header-ornament.png`（木質頂冠）、`v2-match-plus-badge.png`（金色「+」配對徽章）。其餘元素全部沿用現成素材或純 CSS。

> 入口卡本質是「把既有素材重新排版組合」，不是一張要整版重畫的插畫。**絕對不要讓 Codex 把整張入口卡當一張大圖生出來**——那會夾帶烤死的動態多語別文字（標題/副標/按鈕字），且無法跟現有素材成套。

---

## ⚠️ 給主對話 / 使用者的提醒（先標記）

1. **本批只生 2 張**：G1 木質頂冠 `v2-match-header-ornament.png`（1024×512 透明）、G2 金＋徽章 `v2-match-plus-badge.png`（512×512 透明）。皆透明背景 PNG（RGBA，外緣 alpha=0；G2 允許金色光暈羽化，但畫布邊緣須全透明）。
2. **入口卡其餘 12 個元素全沿用現成素材或純 CSS**（見【素材盤點】表），不生圖：外框吃 `v2-choice-panel-frame.png`/`v2-button-green.png`、金/綠牌吃 `v2-choice-option-plaque.png` 或既有 tile 漸層、沙漏吃現成 `v2-hourglass-timer.png`、背景吃 `v2-background-game.jpg`。標題/副標/按鈕/牌面字**一律前端渲染，不烤進任何圖**。
3. **三藥丸 icon（拼圖/沙漏/星芒）建議 0 張生圖，且絕不用 emoji**（🧩⏳✨ 全禁）：沙漏沿用現成 PNG、星芒沿用既有 `vico-star`、拼圖建議小工程新增 `vico-puzzle` 純向量。備選 G3 木盤 icon 套組 prompt 附於【選配】，但優先走 vico/現成，別燒額度。
4. **選關頁第 6 顆入口建議 0 張生圖（方案 A）**：直接複用 G2 金＋徽章當第 6 顆圖示，與前 5 顆圓徽章同級、與入口卡的＋呼應。方案 B（生 `v2-level-icon-6-match.png`）僅在要 6 顆完全成套時採用，prompt 附於【選關頁】。
5. **盤面（玩法進行畫面）0 張必生**：使用者說已 OK；木紋卡磚 M1/M2 為選配加值，本次不必生。
6. **文化安全：本批低風險**。全是遊戲 UI 裝飾件（木雕頂冠、金＋徽章），無人物/服飾/器物/儀式/聚落。唯一風險點是木雕表面易被 AI 自動填「菱形織紋」，Negative 已明列排除紋面（Ptasan）/織紋/祖靈眼/其他族群圖騰。詳見【文化安全註記】。
7. **換圖 / CSS / class 調整是小排版 + 小工程的事**：小畫家只生素材、寫本規格，**不改 `hunter-truku-v2.html` 本體**。`.lc-grid-icon`→`<img>`、`vico-puzzle` 向量、顯示邏輯一律交小排版/小工程（見【整合・交接】）。
8. **先報 prompt 給使用者確認額度再貼 Codex**。遇 `billing_hard_limit_reached` 立即停止回報、不重試。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, match-game UI)**。美術風格與太魯閣族文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md` 與既有 v13/v14 UI 套組：細緻繪本/RPG 遊戲美術、木雕＋金邊裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），透明背景 PNG，不混用其他族群或泛部落意象。素材要與現有 `public/images/ui/`（尤其 `v2-choice-panel-frame.png`、`v2-button-green.png`、`v2-choice-option-plaque.png`、`v2-hourglass-timer.png`）視覺一致。

---

## 現況（給接手者參考，本文件不改 HTML）

- 第六關為 `#matchScreen`：族語卡（`.match-tile.mt-word`，金漸層 `#FFD86A→#E0A02A`）↔ 中文卡（`.match-tile.mt-zh`，綠漸層 `#7CC24E→#3E7E28`）配對消除、限時。目前是純 CSS 漸層 tile，缺木紋磚質感（使用者說盤面已 OK，本批不動）。
- 入口/介紹卡目前是純 CSS/漸層樣式，使用者要升級成全站一致的 vibrant jungle adventure 風。
- 選關頁 `#levelChooser` 第 6 顆是 `.lc-btn.lc-bonus`（`onclick="startMatchGame()"`），圖示位是**純 CSS 2×2 金方格**（`.lc-grid-icon`，`display:inline-grid` + 四個金漸層 `<i>`），比前 5 顆的圓木框透明 PNG 圖示（`v2-level-icon-1..5`）單薄——這是使用者要調整的點。

---

## 素材盤點 — 入口卡每個元素怎麼來（14 元素）

| 入口卡元素 | 來源判定 | 用哪個 / 怎麼做 |
|---|---|---|
| 外層雕花木框（金描邊、四角鉚釘、藤蔓） | **沿用現成** | `v2-choice-panel-frame.png`（深木紋內底＋藤蔓四角）或 `v2-button-green.png`。直式入口卡用 CSS `border-image`/九宮格拉伸 |
| 深綠木紋內底 | **純 CSS / 沿用** | 現有 `#12301a→#0b2010` 綠漸層（`#matchScreen` 已用），或吃 `v2-button-green.png` 綠內底 |
| 頂部中央雕花木質頂飾（含 2×2 四顆金方裝飾） | **新生 G1** | 現有木牌都是「橫向懸掛牌」，沒有這種「頂冠/scroll header」造型。新生透明 PNG（見 §G1） |
| 「小遊戲」金色圓角小牌 | **純 CSS** | 金漸層 pill＋深色字，沿用 `.lc-lvtag`/`.mg-back` 金綠語言。文字動態 UI_TEXT，**不烤進圖** |
| 大標題「詞義配對消除」金色襯線字 | **純 CSS（前端字）** | 動態多語別文字前端渲染。字體選用屬小排版 CSS 範疇，小畫家不出字圖 |
| 副標「點選族語卡，再點對應中文卡」米金小字 | **純 CSS（前端字）** | 同上，動態文字前端渲染 |
| 中段左「族語」琥珀木牌 | **沿用現成** | `v2-choice-option-plaque.png` 縮小，或 CSS 金漸層（`.match-tile.mt-word` 已是）。牌面文字前端渲染 |
| 中段右「中文」綠木牌 | **沿用現成 / CSS** | `.match-tile.mt-zh` 綠漸層，或 `v2-button-green.png` 縮小 |
| 中間發光金色「+」＋火花星芒 | **新生 G2** | 入口卡視覺焦點，值得一張透明 PNG 有立體發光/火花質感（見 §G2）。CSS 硬做會很扁 |
| 下方三藥丸標籤（拼圖/沙漏/星芒 icon） | **不生圖優先** | 沙漏 `v2-hourglass-timer.png` 縮、星芒 `vico-star`、拼圖新增 `vico-puzzle`。藥丸底＋文字純 CSS（見 §藥丸 icon） |
| 底部大型綠木「開始遊戲」按鈕（金框） | **沿用現成** | `v2-button-green.png`（綠木＋金框四角鉚釘）當底，文字前端渲染 |
| 叢林/瀑布背景 | **沿用現成** | `v2-background-game.jpg` 或 `v2-background-game-cliff.jpg`（峽谷瀑布版） |

**盤點小結**：14 元素 → 沿用現成 7、純 CSS 4、新生 2（G1、G2）、選配 1（G3，優先不生）。

---

## 素材定義（本批必生 2 張）

🔍 **用途**：升級第六關入口卡到全站一致的 vibrant jungle adventure 風。G1 = 入口卡頂部視覺封頂的木質頂冠，G2 = 入口卡中段象徵「兩卡配對」的發光金＋（也可日後複用在盤面配對成功爆點、選關頁第 6 顆圖示）。

✨ **要生成的**：兩張透明背景 PNG 裝飾件。**不畫任何人物、不烤任何文字**。詳細 prompt 見下。

---

### 🎨 English Prompt — G1 木質頂冠 / 卷軸頂冠（scroll header ornament）
```
A carved wooden decorative header crest for a game UI, symmetrical horizontal
ornament, hand-painted 2D game art, vibrant jungle adventure storybook style.
Rich brown wood grain carved into a gently arched top crest with gold filigree
trim outlining its edges. Set into the center of the crest are four small square
golden gemstone studs arranged in a neat 2x2 grid. Curling green jungle vines and
a few fresh leaves wrap around the lower corners of the crest. Warm torch-lit
lighting, painterly brushwork, not flat vector, not photorealistic. Centered
composition, the ornament occupies the upper portion of the frame, clean fully
transparent background, no text, no watermark.
```

### 🎨 English Prompt — G2 金色「+」配對徽章（發光十字＋火花星芒）
```
A glowing golden plus sign emblem for a game UI, hand-painted 2D game art,
vibrant jungle adventure style. A bold thick three-dimensional golden plus
(cross) shape with beveled polished gold surfaces and a subtle carved-wood core,
radiating warm light. Small bright sparkles and star-shaped light flares burst
around it. Warm amber glow, painterly brushwork, not flat vector, not
photorealistic. Centered, symmetrical, the plus fills most of the frame, soft
golden glow feathering into a fully transparent background, no text, no watermark.
```

### 🚫 Negative Prompt（G1 / G2 共用，含文化安全防呆）
```
no text, no letters, no numbers, no watermark, no signature, no photorealism,
no flat vector icon look, no drop shadow on transparent background edges,
no woven diamond pattern, no ancestral-eye motif, no tribal tattoo,
no facial tattoo, no Ptasan, no Atayal/Amis/Paiwan/Native-American motifs,
no totem pole, no feather headdress, no human character
```
- **G1 額外**：`keep the 2x2 gold studs simple and small, no crown jewels overload`
- **G2 額外**：`no medical cross, no red cross, no religious cross styling`

---

## 尺寸 / 命名 / 回收位置

| 素材 | 檔名 | 尺寸 | 格式 | 透明 |
|---|---|---|---|---|
| G1 木質頂冠 | `v2-match-header-ornament.png` | 1024×512（橫幅） | PNG RGBA | 是（四角與外緣 alpha=0） |
| G2 金＋徽章 | `v2-match-plus-badge.png` | 512×512（正方） | PNG RGBA | 是（邊緣 alpha=0，允許金光暈羽化） |

- 回收位置：`public/images/ui/`（沿用全站 UI 素材目錄）。
- **前端顯示**：G1 入口卡頂部封頂；G2 入口卡中段焦點（最終約 48–72px）＋可複用選關頁第 6 顆圖示。
- 生成後**務必驗外緣 alpha=0**（沿用 v2 透明驗證習慣），並確認**無夾帶文字**（頂冠/徽章最易被 AI 加字）。

---

## 藥丸 icon（拼圖 / 沙漏 / 星芒）— 全站禁 emoji 處理

> **鐵律：這三個 icon 絕不能用 emoji（🧩⏳✨ 一律禁用）。** 也不是純文字降級，是「圖示元素」。

**建議處理方式（優先序，0 張 Codex 生圖）**：

| icon | 首選做法（省額度） | 說明 |
|---|---|---|
| **沙漏（限時）** | 沿用現成 `v2-hourglass-timer.png` 縮小（或新增 `vico-hourglass`） | 現成木雕沙漏 PNG 已存在，縮到 20–24px 即可，全站計時一致 |
| **星芒（消除）** | 走既有 `vico-star`（`.vico-star`，金 `#FFD54A`） | 完全不用生圖，全站爆點星/過關星都用它，天然一致 |
| **拼圖（配對）** | 新增 `vico-puzzle` 純向量 mask（交小工程加 CSS） | 現有 vico 無拼圖形，照 `vico-*` 格式加一條 puzzle-piece SVG path、金色著色。**純 CSS/SVG，非 Codex 圖、非 emoji** |

**→ 結論：三個 icon 建議 0 張 Codex 生圖。** 藥丸「膠囊底＋文字」是純 CSS。

**備選 G3（僅使用者堅持三 icon 要成套木雕透明 PNG 才做）**：
- 檔名 `v2-match-pill-icon-puzzle.png` / `v2-match-pill-icon-hourglass.png` / `v2-match-pill-icon-star.png`，各 256×256 透明 PNG（最終顯示 ~24px，須小尺寸可辨），比照 v13 `v2-ui-icon-*` 家族。
- Prompt 模板（把 `{SUBJECT}` 換成下列三者）：
```
A small round carved-wood game UI icon with a thin gold rim, hand-painted 2D
game art, vibrant jungle adventure style. Centered on the wooden disc is
{SUBJECT}, rendered in warm gold and amber tones, clearly readable at small size.
Warm torch-lit lighting, painterly brushwork, not flat vector, not photorealistic.
Centered, icon fills the frame, fully transparent background, no text, no watermark.
```
  - puzzle → `{SUBJECT}` = `a single interlocking jigsaw puzzle piece`
  - hourglass → `{SUBJECT}` = `an hourglass with golden sand`
  - star → `{SUBJECT}` = `a five-pointed sparkle star with small light flares`
- negative：套用 G1/G2 共用 negative（木盤 rim 最易被填織紋，已排）。
- **提醒**：G3 是備選，**優先走上表 vico/現成方案，不燒這 3 張額度**。

---

## 選關頁（`#levelChooser`）第 6 顆入口按鈕的調整

**現況**：第 6 顆 `.lc-btn.lc-bonus`（`onclick="startMatchGame()"`），圖示位 `.lc-grid-icon` 是純 CSS 2×2 金方格。前 5 顆用圓形木框透明 PNG（`v2-level-icon-1..5`），第 6 顆風格比前 5 顆單薄。（DOM 小畫家不改，僅描述。）

**建議做法（兩案，推薦 A）**：

- **A（推薦，0 生圖）**：把 `.lc-grid-icon` 的 CSS 金方格換成**沿用 G2 生的 `v2-match-plus-badge.png` 縮小**（`.lc-grid-icon`→`.lc-icon <img>` 指向 G2）。視覺立刻跟前 5 顆的「圓形發光徽章」同級，且與入口卡的「＋」呼應（點進去看到同一個＋，體驗連貫）。交小排版換 class。
- **B（要 6 顆完全成套才做，需生 1 張）**：新生圓形木框配對圖示 `v2-level-icon-6-match.png`（256×256 透明 PNG，對齊前 5 顆規格），中央畫「兩張卡＋發光＋」。Prompt：
```
A round carved-wood game level icon with a thin gold rim and a few green jungle
leaves on the frame, hand-painted 2D game art, vibrant jungle adventure style,
matching a set of circular wooden level badges. Centered inside: two small game
cards (one golden, one green) linked by a glowing golden plus sign with small
sparkles, symbolizing matching. Warm torch-lit lighting, painterly, not flat
vector, not photorealistic, centered, fully transparent background, no text, no
watermark.
```
  - negative：套用 G1/G2 共用 negative（圓木框 rim 防織紋）。

**→ 推薦 A**：第 6 顆直接複用 G2 金＋徽章，不必單獨生圖，且入口與選關頁視覺呼應。B 僅在要「6 顆圖示規格完全一致」時採用。

---

## 選配 — 盤面木紋卡磚（只有使用者要「木紋磚」質感才做）

- **M1 金木紋磚底**：`v2-match-tile-wood-gold.png`，512×512，鋪 `.match-tile.mt-word`
- **M2 綠木紋磚底**：`v2-match-tile-wood-green.png`，512×512，鋪 `.match-tile.mt-zh`
- Prompt 模板：
```
A seamless carved wood grain tile texture for a game UI card, hand-painted 2D
game art, vibrant jungle adventure style, {COLOR} polished wood with a subtle
gold-beveled inner edge, warm torch-lit lighting, painterly, not flat vector,
not photorealistic, no text, no watermark, square, edges designed to tile.
```
  - M1：`{COLOR}` = `warm golden amber`；M2：`{COLOR}` = `deep emerald green`
- **決策**：現有漸層已可用，**本次不必生**，列此僅備使用者要升質感時參考。

---

## 整合・交接（給小工程 / 小排版；小畫家不改 HTML/CSS/JS）

素材回收後怎麼接進畫面**不是小畫家的活**。以下只是定位參考：

1. **入口卡**：木框吃現成 PNG（`border-image`/九宮格）、G1 頂冠疊頂部中央、G2 金＋疊中段、金/綠牌吃現成或 CSS 漸層、標題/副標/按鈕/牌面字**一律前端渲染不烤圖**。→ 小排版排版。
2. **三藥丸 icon**：沙漏指 `v2-hourglass-timer.png`、星芒用 `vico-star`、**拼圖新增 `vico-puzzle` 純向量**（小工程加 SVG path）。**絕不用 emoji。** → 小工程加 vico + 小排版藥丸 CSS。
3. **選關頁第 6 顆**：推方案 A，`.lc-grid-icon`→`.lc-icon <img>` 指 G2。→ 小排版換 class；若涉顯示條件邏輯交小工程。
4. **手機版**：本文件針對桌機。手機版要不要跟進走小蘋果評估雙邊同步，不在本批。

---

## 文化安全註記

🔍 **文化審查**：本批全是遊戲 UI 裝飾件（木雕頂冠、金＋徽章、選配木紋卡磚/功能 icon），**不涉及人物、服飾、器物、儀式、聚落場景**，本質是通用奇幻/叢林探險視覺語彙，文化挪用風險低。唯一潛在風險點：木雕/圓木徽章表面容易被 AI 自動填上「菱形織紋」——這正是關卡圖示那次擋下紅菱形（泰雅/太魯閣菱形織紋＝祖靈之眼）學到的教訓。

✨ **校正後設定**：所有木件維持「素面木紋＋孤立金鉚釘/藤蔓葉」的裝飾，**不做任何連續織紋、菱形紋、祖靈眼、紋面（Ptasan）、階級紋樣**。四角金鉚釘沿用全站一貫的「孤立裝飾釘」安全用法（不是連續織帶）。人物一律不畫。

🎨 **建議 Prompt**：所有圖的共用 negative 已明列排除 `woven diamond pattern / ancestral-eye motif / facial tattoo / Ptasan / Atayal-Amis-Paiwan-Native-American motifs / totem pole / feather headdress`。

📖 **備註**：AI 生成的木雕/藤蔓為通用近似視覺語彙，非特定部落器物復刻。本批不含任何太魯閣族專屬文化符號，屬安全範圍。若日後入口卡要加入族群意象（如太魯閣峽谷地景），地理景觀本身無挪用疑慮，但仍建議另案審查。若用於正式出版、教學或對外公開用途，建議請太魯閣族文化工作者確認。

---

## 生成前檢查清單

- [ ] 本批只生 **G1 + G2 共 2 張**（不是整張入口卡大圖、不夾帶動態文字）？
- [ ] G1/G2 PNG RGBA 透明背景、外緣 alpha=0（G2 允許金光暈羽化但邊緣須透明）？
- [ ] **無夾帶任何文字/數字**（頂冠、徽章最易被 AI 加字）？
- [ ] 木件表面**無菱形織紋/祖靈眼/紋面（Ptasan）/其他族群圖騰**？G2 無醫療/宗教十字風格？
- [ ] 風格與現有木質 UI 家族（`v2-choice-panel-frame`、`v2-button-green`、`v2-hourglass-timer`）一致？
- [ ] G1 命名 `v2-match-header-ornament.png`、G2 命名 `v2-match-plus-badge.png`，回收到 `public/images/ui/`？
- [ ] 三藥丸 icon **未生圖、未用 emoji**（走 vico/現成）？選關頁第 6 顆走方案 A（複用 G2）？
- [ ] 是否先報 prompt + 張數給使用者確認額度再跑？遇 `billing_hard_limit_reached` 立即停止？

---

## 一頁摘要（給主管 / 使用者）

- **必生：2 張** — G1 木質頂冠 `v2-match-header-ornament.png`（1024×512 透明）、G2 金＋徽章 `v2-match-plus-badge.png`（512×512 透明）。
- **三藥丸 icon：0 張生圖** — 沙漏沿用現成 PNG、星芒沿用 `vico-star`、拼圖新增 `vico-puzzle` 純向量。**絕不用 emoji。**
- **選關頁第 6 顆：0 張生圖（方案 A）** — 複用 G2 金＋徽章。方案 B（生 `v2-level-icon-6-match.png`）僅要 6 顆完全成套時採用。
- **盤面：0 張必生** — 已 OK；木紋卡磚 M1/M2 為選配加值。
- **入口卡其餘元素全沿用現成素材或純 CSS**，標題/副標/按鈕/牌面字前端渲染不烤圖。
- **文化安全**：全批通過，通用叢林探險語彙，negative 已防菱形織紋/紋面/他族圖騰。
- **小畫家不改 `hunter-truku-v2.html`**；整合交小排版（換圖/CSS/`.lc-grid-icon`→`<img>`）與小工程（`vico-puzzle`/邏輯）。

---

## 使用方式提醒

把本文件相關段落貼給 Codex，**只生 G1、G2 兩張**（建議先生一張確認風格 OK 再生第二張）。生成前先報 prompt + 張數確認額度。回收到 `public/images/ui/`，驗透明背景 alpha=0、無夾帶文字、小尺寸辨識、文化安全四項。三藥丸 icon 走 vico/現成別生圖也別放 emoji、選關頁第 6 顆走方案 A 複用 G2、換圖/CSS/`vico-puzzle`/顯示邏輯——**一律交小工程/小排版，小畫家不碰 `hunter-truku-v2.html`**。
