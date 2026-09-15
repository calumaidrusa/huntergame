# Truku Audio Button Assets Codex — v8（木雕音訊按鈕，取代 emoji 🔊）

**Version:** 8.0
**Target AI:** Codex / GPT image generation（`gpt-image-1`）
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 四模式 UI 檢討指出現況播放鈕是 **emoji 🔊 + CSS 光暈脈動**，視覺上像「現代 3D 金屬 icon」，跟森林／木質／藤蔓／原民冒險風格不搭。本文件盤點後判定：只需新生 **1 顆「圓形木雕音訊按鈕」正常態**（透明背景 PNG），取代 L1 音選詞面板與 L3 聽打共用的 emoji 播放鈕。hover／點擊發光與音波皆用 CSS，不多生變體。美術風格與文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md` 與 `Truku_AudioChoice_Screen_Codex_v7.md`，本文件不重新定義。

> 分工提醒：本文件只做**素材需求評估 + 生圖規格**。emoji→PNG 換接、`background-image`/`<img>` 疊放、CSS 音波動畫、「點擊重播/播放語音」文字疊字皆為 **CSS/HTML 工作，交小排版**；播放/重播邏輯（`replayChoiceAudio()`/`replayAudio()`）為小工程既有。小畫家不改 `hunter-truku-v2.html`、不自己呼叫生圖 API。

---

## 現況盤點

| 位置 | 元素 id | 現況 | 判定 |
|---|---|---|---|
| L1 音選詞中央面板播放鈕 | `#choicePlayBtn` | emoji 🔊（`font-size:60px`）+ `filter:drop-shadow` 金光 + `pulseSpeaker` 脈動動畫，`onclick=replayChoiceAudio()` | 🆕 換木雕 PNG |
| L3 聽打播放鈕 | `#listenPlayBtn` | emoji 🔊（`font-size:52px`）+ 同款金光 + `pulseSpeaker` 脈動，`onclick=replayAudio()` | ♻ **共用同一張** PNG（尺寸差異用 CSS `width/height` 縮放解決，不另生） |
| L4 看圖選詞 | 無播放鈕 | picture cue，喇叭鈕 `display:none`，改顯示 `#choiceCueImg` 大圖 | — 不需播放鈕 |
| 標題／HUD 音量開關 | `.title-icon-btn` img / `#volBtnImg` | **已是木質徽章 PNG**（`ui-volume-on/off.png`、`login-volume-*.png`），是**靜音開關**不是「播放發音」鈕，語意不同 | ✅ 已備齊，**不在本批範圍、不要動** |

**結論：真正要新生的只有 1 張——L1 `#choicePlayBtn` 與 L3 `#listenPlayBtn` 共用的「圓形木雕音訊按鈕（正常態）」。** hover 放大／點擊發光沿用現況 CSS（`:hover transform:scale`、`pulseSpeaker` 金光），使用者要求的「柔和音波」用 CSS 動畫（擴散環）做，不烤進圖。

---

## 為什麼要換 & 為什麼只生 1 張

- **為什麼換**：emoji 🔊 是系統字型渲染，多數平台呈現為**現代扁平／半立體的塑膠或金屬喇叭**，與 L1 面板那三張深木＋金邊＋綠葉的木雕素材（`v2-choice-panel-frame` / `v2-hourglass-timer` / `v2-choice-option-plaque`）調性斷裂，正是使用者說的「像從素材庫硬貼」。換成木雕圓鈕後，中央面板整組視覺才統一。
- **為什麼只生 1 張正常態**：
  - **hover/點擊態不用生** → 現況已有 `#…PlayBtn:hover{transform:scale}` 放大 + `pulseSpeaker` 金色 drop-shadow 脈動，PNG 直接套用即可產生「發光」回饋，不必燒「按下態」進圖。
  - **柔和音波不用生** → 使用者明示可用 CSS 動畫；建議小排版做「點擊時從按鈕中心擴散 1–2 圈**暖金色半透明環**（`@keyframes` scale + fade）」，避免藍色科技感。音波是動態、不該進靜態圖。
  - **L1 與 L3 共用** → 兩處都是同一顆「播放這個詞的發音」語意，造型應一致；尺寸差（60px vs 52px）用 CSS 縮放，一張足矣。
- **不做「按下態」變體**：若日後使用者要更明確的「凹陷按下」回饋再議；本批先出一張，最省額度。

---

## System Role

You are the **Truku Hunter Game Art Director（v2 style, Audio Button batch）**。細緻繪本/RPG 遊戲美術、木雕＋羊皮紙裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），不混用其他族群或泛部落意象——規範全部沿用 `Truku_Hunter_Game_Assets_Codex_v2.md`。與同批 L1 三張素材（`v2-choice-panel-frame` / `v2-hourglass-timer` / `v2-choice-option-plaque`）**同一調性**：深木底、金邊、綠葉藤蔓點綴、暖光。

生成參數沿用既有方案：`gpt-image-1`、`quality: medium`、透明背景元件輸出 **PNG**。**生成前先把 prompt 列給使用者確認、確認額度夠再跑**，遇 `billing_hard_limit_reached` 立即停止回報、不重試。生成後用 Pillow 裁掉四周透明留白、確認圓形外緣 alpha 乾淨再交小排版。

---

## 素材生成佇列

### 【B1】圓形木雕音訊按鈕（正常態）Round Carved-Wood Audio Button — 🟢 中性木雕＋自然裝飾，無族群符號 ｜ ✅ 必生（唯一一張）

**現況**：全新素材，取代 `#choicePlayBtn` / `#listenPlayBtn` 的 emoji 🔊。

🔍 **文化備註**：純**木雕圓盤 + 藤蔓葉片**外圈裝飾，中央**通用簡潔金色喇叭符號**，採**中性森林／木工藝語彙**，不加入任何太魯閣族或其他族群的織紋、菱形紋、紋面（Ptasan）、祭儀符號。藤蔓葉片為通用自然裝飾、金色喇叭為通用播放意象，風險低。

✨ **視覺設定**：
- **圓形木雕徽章**：深色木質圓盤，邊緣有雕刻厚度與立體光影、暖金色細金邊環，與 `v2-choice-option-plaque` / `v2-choice-panel-frame` 同一「深木＋金邊」調性、明度相配。
- **外圈藤蔓葉片**：沿圓周環繞一圈**細藤蔓與小綠葉**（呼應森林主題、呼應面板四角的葉片點綴），中性自然裝飾、疏密適中，縮小到 UI 尺寸（約 44–60px）仍能看出是葉飾、不糊成一團。
- **中央金色喇叭符號**：**簡潔、通用、扁平化**的金色喇叭剪影（梯形號角 + 1–2 道簡單聲波弧線即可，或完全不畫弧線只留號角本體），**啞光金／暖金**質感，**不要**現代金屬鏡面高反光、不要 3D 塑膠感。喇叭符號本身是圖的一部分（非文字），可保留。
- **暖光**：整體暖色打光，木質溫潤、金邊微亮，符合 v2 繪本 RPG 手繪質感（NOT flat vector、NOT 照片）。
- **不畫**：任何文字（「播放語音／點擊重播」是前端疊字）、數字、藍色、科技藍光、漂浮陰影、投射地面陰影、外框方底。
- 透明背景 PNG，**正方構圖、圓鈕置中、四周留透明**（`gpt-image-1` `1024x1024`，圓形主體置中，四角透明），縮到 UI 尺寸仍清晰。

🎨 **Prompt**：
```
A single round carved-wood audio button for a fantasy forest game UI, seen
straight-on (top-down flat, NOT tilted, NOT floating). A dark warm-brown
wooden disc with a thin glowing golden rim and visible hand-carved 3D edge
thickness. Around the outer ring, a wreath of thin green vines and small
leaves as a neutral forest ornament. In the exact center, a simple, clean,
flat GOLDEN speaker/horn symbol (a small trapezoid horn with one or two
simple curved sound lines) in matte warm gold — universal "play sound" icon,
minimal and readable. Rich storybook-illustrated RPG game art style, warm
cozy lighting, hand-painted illustration texture (NOT flat vector, NOT a
photograph). Centered composition with fully transparent background around
the circular shape. No text, no numbers, no watermark.
```
**Negative prompt**：`modern metal speaker, chrome speaker, glossy 3D plastic speaker, realistic loudspeaker, blue glow, blue tech sound waves, neon, sci-fi, holographic, floating shadow, drop shadow on ground, tilted perspective, text, letters, numbers, words, playback label, tribal weaving patterns, diamond motifs, face tattoo, ethnic ceremonial symbols, flat vector icon, photorealistic photography, watermark, square frame, background scenery`

📖 **備註**：
- **命名建議**：`v2-audio-button-wood.png`（放 `public/images/ui/`）。
- **交接**：小排版把 `#choicePlayBtn` / `#listenPlayBtn` 的 emoji 內容換成此 PNG（`<img>` 或 `background-image`，`font-size` 相關樣式移除，改 `width/height`），hover 放大與 `pulseSpeaker` 金光**沿用現況 CSS**；柔和音波用 CSS 擴散環新增（暖金色、非藍色）。「點擊重播 / 播放語音」小字沿用現況 `#choiceReplayLabel` / `#listenReplayLabel` 前端文案，**不進圖**。
- **一張共用**：L1（`#choicePlayBtn`）與 L3（`#listenPlayBtn`）套同一張，尺寸差用 CSS。

---

## 已備齊免生成（❗不要重複生 / 不要動）

| 元素 | 現有素材 / 做法 | 路徑 | 說明 |
|---|---|---|---|
| 標題／HUD 靜音開關（on/off） | 已是木質圓徽 PNG | `public/images/ui/ui-volume-on.png` / `ui-volume-off.png` | **靜音切換**鈕，語意≠播放發音，不在本批、不要換 |
| 登入頁靜音開關 | 已是木質圓徽 PNG（trim 版） | `public/images/ui/login-volume-on-trim.png` / `login-volume-off-trim.png` | 同上，不動 |
| L1 中央面板框／沙漏／選項木牌 | v7 已規格/生成 | `v2-choice-panel-frame.png` / `v2-hourglass-timer.png` / `v2-choice-option-plaque.png` | 本批只加音訊鈕，這三張不動 |
| L4 看圖選詞大圖 | picture cue（`#choiceCueImg`） | 詞彙插畫 | L4 不顯示播放鈕，無需素材 |
| hover 放大 / 點擊發光 / 柔和音波 | 純 CSS（`:hover scale`、`pulseSpeaker` 金光、擴散環動畫） | — | 不生變體 |

---

## 文化安全註記（太魯閣族紅線，務必遵守）

- 【B1】為**中性木雕圓鈕 + 通用金色喇叭符號 + 自然藤蔓葉片**，**不涉人物、服飾、器物、祭儀場景**，無族群符號挪用疑慮。
- **絕不描繪紋面（Ptasan）**；**不混用**泰雅菱形紋/織紋、阿美紅黑配色/'alofo 情人袋/八角星繡、排灣琉璃珠/貴族圖騰、美洲羽冠/圖騰柱/夢網等元素。
- 「原民風」以**森林木工藝的中性語彙**（木紋、藤蔓、葉片、暖金）表達，**不套用任何特定族群的圖騰或儀式符號**。
- 金色喇叭用**通用簡潔造型**（號角剪影），不做任何具族群意涵的變形。
- 📖 若素材日後用於正式出版/教學/對外公開，建議請太魯閣族文化工作者確認。

---

## 生成前檢查清單

- [ ] 只生 **1 張**【B1】圓形木雕音訊按鈕（正常態）？「已備齊」清單（靜音開關、L1 三張、L4）一張都沒重生/沒動？
- [ ] 中央喇叭是**簡潔啞光金色符號**、**非現代金屬 3D 鏡面**、**無藍色科技音波**、**無漂浮/投射陰影**、**非傾斜視角**（正面平視）？
- [ ] 外圈有**藤蔓葉片**、整體**深木底＋金邊**、與 `v2-choice-option-plaque` 調性一致？
- [ ] 圖裡**沒有任何文字/數字**（「播放語音／點擊重播」全由前端疊）？喇叭符號本身可保留（非文字）。
- [ ] **無紋面、無族群織紋/圖騰/祭儀符號**、無其他族群視覺元素？
- [ ] Prompt 含 v2 風格關鍵字（storybook-illustrated RPG game art）＋ negative 明確排除 `modern metal 3D speaker / blue tech waves / floating / tilted`？
- [ ] 輸出 **PNG 透明背景**、Pillow 裁掉四周透明留白、圓形外緣 alpha 乾淨？
- [ ] 生成前先報 prompt 與張數（1 張）給使用者確認（額度把關）？

---

## 使用方式提醒

把本文件整份交給生圖流程：**只生【B1】1 張**「圓形木雕音訊按鈕（正常態）」，命名 `v2-audio-button-wood.png`。「已備齊」清單裡的靜音開關、L1 三張、L4 大圖**一律不重生/不動**。生完的 emoji→PNG 換接、音波 CSS 動畫、播放/重播文字疊字交**小排版**；播放/重播邏輯為小工程既有。小畫家只出素材與本規格，不改 `hunter-truku-v2.html`、不動後端。
