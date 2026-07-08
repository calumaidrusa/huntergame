# Truku Login Title Plaque Regen Codex — v11（登入畫面標題招牌・移除底部語別掛牌重生）

**Version:** 11.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 重新生成登入畫面的標題招牌 `public/images/ui/login-title-plaque.png`。現有招牌把**三行字**烤死進圖裡（「族語射手」金字主標 + 「TRUKU WORD ARCHER」英文副標 + 最底部「太魯閣語 · TRUKU LANGUAGE」語別掛牌）。本次重生的唯一目的：**保留上兩行、徹底移除最底部那條語別掛牌**，讓招牌下方乾淨，供動態語別下拉選單接在下面。本文件**只**涵蓋這一張招牌，其他登入畫面素材（雕花外框 `login-frame.png`、羊皮紙卡 `login-parchment-card.png`、分頁鈕、按鈕等）**不在範圍**。

---

## ⚠️ 給主對話 / 使用者的提醒（先標記）

1. **只重生 1 張、只改一件事**：拿掉最底部「太魯閣語 · TRUKU LANGUAGE」掛牌那一整條。上方「族語射手」金字主標 + 「TRUKU WORD ARCHER」副標掛牌 + 木質招牌本體 + 兩側吊繩 + 綠葉飾 + 上方弓箭裝飾，**全部保留、風格配色比例一致**。這不是重新設計，是「同一張招牌砍掉最下面一條」。
2. **為什麼要重生（背景）**：遊戲已改成 **42 語別可切換**，登入畫面有一個**動態語別下拉選單**（`#authLangPicker`，由 `/api/languages` 動態填 42 語別）顯示玩家當前選的語別。招牌烤死的「太魯閣語」那條因此有三個問題：(a) 多餘、(b) 玩家選別的語別（如阿美語）時招牌還寫「太魯閣語」= 內容錯誤、(c) 跟下方動態下拉選單疊字。移除後，動態下拉乾淨地接在招牌下方。
3. **換圖 / CSS 微調是小排版的事**：小畫家只生素材、寫本規格。招牌換上去、以及因「高度變矮」需要的 CSS 微調（見下方【尺寸與前端影響】），交**小排版**。小畫家不改 `hunter-truku-v2.html`（且目前有別的工作正在改該檔，只讀不碰）。
4. **文化安全：本張低風險**。純木質招牌 + 金字 + 綠葉 + 通用弓箭裝飾，中性、無任何族群符號。四角金色菱形鉚釘沿用房規（孤立裝飾鉚釘、非連續織紋，安全）。見【文化安全註記】。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, Login Title Plaque regen)**。美術風格與太魯閣族文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md` 與 `Truku_Login_Screen_Codex_v4.md`：細緻繪本/RPG 遊戲美術、木雕＋藤蔓/葉片裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），透明背景 PNG，不混用其他族群或泛部落意象。**最高原則：與現有 `login-title-plaque.png` 的木質質感、金字樣式、綠葉密度、吊繩造型、光影完全一致，僅移除底部語別掛牌。**

---

## 現況拆解（現有 `login-title-plaque.png`，1200×640 palette PNG）

由上到下的圖層構成：

| # | 元素 | 本次處理 |
|---|---|---|
| A | 上方弓與箭裝飾（半圓木框內一張弓 + 一支斜箭），左右伸出綠葉 | **保留** |
| B | 兩側吊繩（麻繩，從招牌頂垂掛到畫面上緣外） | **保留** |
| C | 主招牌木牌本體（深綠木面 + 淺木邊框 + 四角金色菱形鉚釘） | **保留** |
| D | 「族語射手」金色立體大字（主標） | **保留** |
| E | 「TRUKU WORD ARCHER」小掛牌（招牌下緣掛一條窄長綠底木牌，內含金色英文副標，兩端有小吊環） | **保留** |
| F | 兩側叢生的綠葉飾（招牌左右下角） | **保留** |
| **G** | **最底部「太魯閣語 · TRUKU LANGUAGE」掛牌（再往下掛一條窄長綠底木牌，內含金綠色中英文語別名，兩端有小吊環/繩結）** | **← 整條移除，這是本次唯一要拿掉的東西** |

> 關鍵區分：E（TRUKU WORD ARCHER）**留**，G（太魯閣語 · TRUKU LANGUAGE）**砍**。兩者長得很像（都是招牌下方掛的窄長綠底副牌），Codex 容易搞混或兩條都保留/都刪。**務必只保留一條副掛牌（英文 TRUKU WORD ARCHER），下面不要再有第二條語別掛牌。**

---

## 視覺設定（校正後・明確要求）

✨ **要生成的招牌**：一張木質吊掛遊戲標題招牌，透明背景 PNG。由上到下**只**包含：

1. **上方弓箭裝飾** —— 半圓木框內一張弓與一支斜插的箭，左右伸出幾片綠葉（沿用現況 A）。
2. **兩側吊繩** —— 麻繩從招牌頂端兩側往上垂掛（沿用現況 B）。
3. **主招牌木牌** —— 深綠木面、淺木色雕花邊框、四角各一顆金色菱形鉚釘（沿用現況 C）。
4. **「族語射手」金色立體大字** —— 置於主木牌中央，金黃漸層 + 深色描邊 + 立體光影（沿用現況 D，這是圖裡**第一組**要保留的文字）。
5. **「TRUKU WORD ARCHER」副標掛牌** —— 主招牌下緣掛一條窄長的綠底木質小牌，兩端各一個小吊環/繩結，牌內是金色大寫英文「TRUKU WORD ARCHER」（沿用現況 E，這是圖裡**第二組**、也是**最後一組**要保留的文字）。
6. **兩側綠葉飾** —— 招牌左右下角叢生的翠綠葉片（沿用現況 F）。

❌ **絕對不要**：**任何在「TRUKU WORD ARCHER」副標掛牌下方的第三條掛牌 / 副標 / 語別名文字**。招牌的最底邊就是「TRUKU WORD ARCHER」那條副掛牌（含兩側綠葉），其下**不得**再出現任何木牌、綠底條、繩結、或「太魯閣語」「TRUKU LANGUAGE」等文字。整張圖只有**兩組文字**：「族語射手」與「TRUKU WORD ARCHER」，其餘一律無字。

> 移除 G 後，構圖下緣自然收在「TRUKU WORD ARCHER」副掛牌與兩側綠葉的底部，招牌整體高度變矮、更緊湊。

---

## 🎨 English Prompt

```
A hanging wooden game title signboard on a fully transparent background, rich
storybook-illustrated RPG game art style, warm cinematic lighting, painterly
detail, ornate carved wood craft look.

Composition from top to bottom:
- At the very top center, a decorative half-round carved wooden crest holding a
  bow with a single arrow, a few green leaves sprouting to the left and right.
- Two braided rope/hemp cords hang the sign, running upward off the top edges.
- A large main wooden plaque (dark green wood face, lighter carved wood border,
  one small golden diamond rivet in each of the four corners).
- On the main plaque, big bold golden Chinese title characters "族語射手" with a
  gold gradient, dark outline and 3D beveled highlight.
- Directly below the main plaque hangs ONE narrow horizontal green-wood sub-banner
  (with a small hanging ring/rope knot at each end) containing the golden
  uppercase English subtitle "TRUKU WORD ARCHER".
- Lush green leaves clustered at the lower-left and lower-right sides of the sign.

The bottom of the whole sign ends at this single "TRUKU WORD ARCHER" sub-banner
and the side leaves. Warm gold + wood-brown + deep green palette. Only TWO pieces
of text exist in the image: "族語射手" and "TRUKU WORD ARCHER". Everything outside
the sign is fully transparent (alpha 0).
```

## 🚫 Negative Prompt

```
bottom subtitle banner, second sub-banner below the english banner, third hanging
plaque, language name text, extra bottom plaque, 太魯閣語, TRUKU LANGUAGE, any text
below "TRUKU WORD ARCHER", duplicate lower banner, dropdown menu, extra hanging
board, watermark, flat vector icon, photorealistic photography, ethnic weaving
pattern, tribal diamond weaving motif, ancestral eye motif, Atayal/Truku weaving,
Amis/Paiwan/indigenous totem, face tattoo, feathered headdress
```

> Negative 已依需求加入 `bottom subtitle banner, language name text, extra bottom plaque, 太魯閣語, TRUKU LANGUAGE`，並補強「英文副標下方任何第二/第三條掛牌」的防呆，以及全房統一的族群織紋/紋面排除。

---

## 尺寸 / 透明背景 / 命名建議

- **生成**：可先以 **1024×1024** 生成，或直接以接近目標比例的畫布生成（招牌是橫幅，高度砍掉底條後更扁）。
- **輸出規格**：**PNG（RGBA 透明背景）**，招牌外一律 alpha=0。生成後**務必驗證四角與招牌外圍透明**（沿用 v2 批次透明驗證習慣）。
- **目標比例（重要，供對位）**：現有檔 **1200×640（比例約 1.875 : 1）**。移除最底部語別掛牌那一條後，高度會少掉最下面約 18–20%，**目標新比例約 1200 : 510～525 ≈ 2.30～2.35 : 1**（更扁、更寬）。輸出寬度建議維持 **1200px**、高度落在 **約 510～525px**（依實際去掉底條後的收邊而定，以「TRUKU WORD ARCHER 副掛牌 + 側葉」的底緣為圖底）。**不必**強求跟舊圖等高——重點是砍掉底條、下緣收乾淨。

### 命名建議（二選一，本文件推薦第 1 案）

| 案 | 檔名 | 前端是否要改 | 說明 |
|---|---|---|---|
| **✅ 推薦：覆蓋同名** | `login-title-plaque.png`（原地覆蓋） | **不用改 `<img src>`** | 前端 `hunter-truku-v2.html:2087` 引用 `/images/ui/login-title-plaque.png`，覆蓋同名最省事、零程式改動。**但**因高度變矮，`.auth-plaque { width:300px; height:auto }` 會讓渲染高度自動縮短，仍需小排版微調下方間距（見下）。建議覆蓋前先備份舊檔為 `login-title-plaque.bak-3line.png`，以防回退。 |
| 備案：新檔名 | `login-title-plaque-v2.png` | **要改一行 src** | 若想保留舊 3 行版並存對照，用新檔名，並請**小排版**把 `hunter-truku-v2.html` 第 2087 行 `<img class="auth-plaque" src="/images/ui/login-title-plaque.png">` 改為 `login-title-plaque-v2.png`。小畫家不改 HTML，僅在回報中註明此一行改動。 |

> **推薦覆蓋同名**：引用零改動、風險最低；只要生成前備份舊檔即可安全回退。

---

## 尺寸與前端影響（給小排版的註記，小畫家不改 CSS）

- `.auth-plaque` 目前為 `width:300px; height:auto`（`hunter-truku-v2.html:1333-1336`），高度隨**素材比例**自動決定。新招牌比例由 1.875:1 變扁成約 2.3:1，故在 300px 寬下**渲染高度會自動從約 160px 降到約 130px**，招牌整體變矮——這是預期效果（下方留白變多，正好給動態下拉）。
- 現有 CSS 有一段註解與 `#authLangPicker` 定位（`hunter-truku-v2.html:1337-1344`）明講「招牌底部烤有太魯閣語字、下拉必須落在招牌下方不疊字」。**新招牌底部不再有語別字**，這段顧慮消失，`#authLangPicker` 的 `margin:6px 0 10px`（第 1343 行）可由小排版視覺微調（招牌變矮後可能要略增上留白讓下拉不貼太緊，或維持即可）。**這段註解文字也建議由小排版一併更新，以免誤導後人。**
- `.auth-card` 用 `margin-top:-30px`（第 1350 行）讓卡片上緣掛繩收到招牌後面；招牌變矮後這個負 margin 是否要調整，交小排版目視微調。
- 以上皆屬 CSS 排版範疇，**小畫家只提供變矮的招牌素材與比例數據，不動 HTML/CSS**。

---

## 文化安全註記

🔍 **文化審查**：本張為純木質吊掛招牌（木牌 + 金色中文字 + 金色英文字 + 綠葉 + 通用弓箭裝飾 + 吊繩），屬**中性遊戲 UI 裝飾**，無人物、無服飾、無器物紋樣、無聚落場景，**無任何太魯閣族或其他族群的文化符號**。

✨ **校正後設定**：四角金色菱形鉚釘沿用房規——這是**孤立的裝飾性金屬鉚釘/寶石造型**（通用木工語彙，現有招牌與難度框既有），**非**帶狀連續織紋、**非**祖靈之眼菱形織紋，屬安全裝飾，不構成族群符號挪用。上方弓箭為**通用遊戲弓箭手意象**，非特定族群獵具復刻。全張排除其他族群（阿美族紅黑/八角星、排灣族琉璃珠/百步蛇、泰雅族菱形織帶）圖騰、羽冠、紋面（Ptasan）。

📖 **備註**：本招牌為近似視覺語彙的遊戲美術裝飾，非特定部落符號的精確復刻。中性程度高，用於遊戲 UI 無虞。

---

## 生成前檢查清單

- [ ] 圖裡**只有兩組文字**：「族語射手」（金色大字主標）與「TRUKU WORD ARCHER」（副標掛牌），**沒有第三條語別掛牌 / 沒有「太魯閣語 · TRUKU LANGUAGE」/ 沒有任何其他字**？
- [ ] 「TRUKU WORD ARCHER」副掛牌**下方**是否乾淨（除兩側綠葉外無任何木牌/綠底條/繩結/文字）？招牌下緣即收在此？
- [ ] 上方弓箭裝飾、兩側吊繩、主木牌、四角金色菱形鉚釘、兩側綠葉飾是否**都保留、且風格配色與舊圖一致**（暖木質 + 金字 + 綠葉 + 吊繩）？
- [ ] 輸出是否為 **PNG RGBA 透明背景**、招牌外圍與四角 **alpha=0**（生成後驗證）？
- [ ] 目標比例是否約 **2.3 : 1**（寬 1200px / 高約 510～525px），較舊圖 1.875:1 更扁（因砍掉底條）？
- [ ] Negative prompt 是否含 `bottom subtitle banner, language name text, extra bottom plaque, 太魯閣語, TRUKU LANGUAGE`？
- [ ] 命名是否照建議（**推薦覆蓋同名 `login-title-plaque.png`，覆蓋前先備份舊 3 行版**；或用 `login-title-plaque-v2.png` 並在回報中請小排版改第 2087 行 src）？
- [ ] 是否先把 prompt 與張數（1 張）報給使用者確認、確認額度夠再跑？遇 `billing_hard_limit_reached` 立即停止回報、不重試？

---

## 使用方式提醒

把本文件整份貼給 Codex，請它「依【視覺設定】與【English Prompt】生成 **1 張** 招牌，生成前先報 prompt 給我確認」。**唯一硬性要求：圖裡只有『族語射手』與『TRUKU WORD ARCHER』兩組文字，絕不要第三行『太魯閣語 · TRUKU LANGUAGE』語別掛牌，其下要乾淨。** 生成後驗證透明背景與「無底部第三條掛牌」，命名照【命名建議】。換圖進畫面與因高度變矮的 CSS 微調，一律交**小排版**，小畫家不碰 `hunter-truku-v2.html`。
