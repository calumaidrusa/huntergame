# Truku Hunter Game — Hunter Character Codex v3（太魯閣族風獵人服飾）

**Version:** 3.1（3.0 = 原始 H1/H2 設定；3.1 新增「射箭動作分解圖（動畫幀）」章節）
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Art direction:** 維持 v2 細緻繪本/RPG 遊戲畫風（storybook-illustrated RPG game art），動態拉弓姿勢
**Purpose:** 把遊戲主角「獵人」從現有的**通用奇幻弓箭手**造型，改造成**參考真實太魯閣族服飾**的造型，取代現有的 `v2-hunter-character.png`。

> **⚠️ 這是方向調整，也是本專案文化風險最高的單一素材。** 先前 v2 刻意讓獵人停在「泛奇幻弓箭手」以迴避文化議題；現在使用者要求**有依據地參考真實太魯閣族族服**。因為涉及真實原住民族文化，**這份文件的文化審查做得比以往任何素材都嚴謹**，且**每個 prompt 都附中文免責**。Codex 生成前務必完整讀過文化界線章節。

---

## System Role

You are the **Truku Hunter Game Art Director (v3 · character)**，負責重繪遊戲主角獵人，讓造型從通用奇幻弓箭手改為**參考太魯閣族（Truku）真實服飾**的獵人，同時嚴守太魯閣族文化視覺安全底線。你必須：把使用者提供的、有限而確切的文化事實忠實反映到服裝上；對任何**不確定的具體圖騰/紋樣一律簡化或省略**；**絕不描繪紋面（Ptasan）**；不挪用其他族群元素。

---

## 文化參考來源（重要：來源受限，只依使用者親自摘要）

- 使用者提供了一個 Facebook 貼文（TCCDAKA 太魯閣族文化相關，台灣原住民 16 族青年輪流展現族服特色的影片）。
- **該連結小畫家與主對話的 Claude 都無法直接讀取**（FB 需登入、社群內容抓不到）。因此文化參考**完全依據使用者親自摘要的關鍵描述**，不做任何額外臆測或網路補充：

> **太魯閣族服以「米白（苧麻本色）為主色調」的素淨風格。**

- 這條摘要與既有文化事實一致：太魯閣族以**苧麻纖維**織布（詞彙表內 `nuqih` 苧麻纖維、`gsak` 剮麻具皆在）。米白/苧麻本色即為主色調的依據來源。

---

## Style Guide（沿用 v2）

- **美術風格**：storybook-illustrated RPG game art，清楚五官、溫暖電影感光影 —— NOT flat vector icon，NOT 純寫實攝影
- **姿勢/用途**：動態拉弓（蹲姿瞄準、拉弓搭箭），與現有獵人角色的遊戲用途一致，是要**取代** `public/images/ui/v2-hunter-character.png`
- **輸出**：透明背景 PNG，角色置中，背景可淺山林烘托或全透明

---

## 太魯閣族文化界線（❗嚴格遵守，這是真實原住民族文化，錯了會冒犯）

### 應該有（有依據、通用、安全）
- **主色調：米白 / 苧麻本色**（使用者明確指定 + 符合苧麻織布文化事實）
- **簡約的紅色系織帶 / 條紋點綴**：太魯閣族/賽德克織布以紅色為重要色彩，這是通用、有依據的層面，可用作素淨米白上的少量點綴
- 通用且屬太魯閣族真實文化的獵人元素：**苧麻米白上衣**、**頭帶**、**綁腿**、佩掛的**獵刀**或**弓箭**（狩獵是太魯閣族真實文化，`bhniq` 弓、`pucing` 獵刀皆在詞彙表）

### 絕對不要（會冒犯 / 文化挪用）
- **絕對不畫紋面（Ptasan）**：太魯閣族最神聖的成年/技能標誌，casual 遊戲角色臉上**絕對不能**出現任何臉部紋樣/線條/塗色。**這條沒有例外。**
- **不要編造複雜的具體織紋圖騰**：不確定的具體圖案一律**簡化或省略**，寧可素淨也不亂畫。紅色點綴維持在「簡單織帶/條紋」層級，不畫成具象人形紋/複雜幾何族群紋。
- **不挪用其他族群元素**：不用泰雅菱形紋當主視覺（雖同源但要克制）、不用阿美紅黑配色、不用排灣琉璃珠、不用美洲原住民羽冠/戰紋/圖騰柱。
- 不奇幻部落戰士皮甲、不暴露/性化服裝。

---

## 完整四段式文化審查

### 🔍 文化審查

本素材是**人物角色 + 首次參考真實太魯閣族族服**，為全專案最高文化風險項目。主要風險點：
1. **紋面（Ptasan）誤植**：v2 風格畫清楚五官，AI 極易在臉上自動加上「原住民感」的臉部塗色/線條，這會直接踩到最神聖禁忌。
2. **織紋圖騰編造**：要求「太魯閣族服」時 AI 容易自行填入複雜幾何織紋，多半是拼湊或誤取其他族群紋樣。
3. **跨族群混用**：AI 常把「台灣原住民」概括成泰雅菱形紋、阿美紅黑、排灣琉璃珠等，造成族群混淆。
4. **主色調偏移**：AI 預設「部落服飾」常給高彩度大紅大黑，與太魯閣族「米白素淨」的真實特徵相反。

### ✨ 視覺校正

- **主色調鎖定米白 / 苧麻本色**（off-white / natural ramie），大面積素淨，這是最能忠實反映使用者摘要、也最能與其他族群拉開區別的關鍵。
- **紅色只作少量點綴**：胸口/袖口/頭帶處簡單的紅色系織帶或細條紋，**不畫成複雜具象圖騰**。
- **臉部完全乾淨**：清楚五官、堅毅年輕表情，但**零臉部紋樣/塗色/線條**。
- **織紋一律簡化**：若要暗示手織質感，用素淨的布料紋理或極簡的紅白條紋帶，不填入具體幾何母題。
- **通用可靠元素**：苧麻米白長上衣 + 頭帶 + 綁腿 + 佩掛獵刀/背弓箭，維持 v2 拉弓動態姿勢。
- **只有依據的才畫，不確定的一律省略。**

### 🎨 Prompt + Negative Prompt（提供 2 個變體供選）

---

**【H1 · 變體 A：站姿拉弓 / 全身較完整呈現服裝】**

🎨 **Prompt**：
```
A detailed storybook-illustrated RPG game character: a young Taiwanese Truku
(Taroko) indigenous hunter in a dynamic archery pose, drawing a bow with an
arrow nocked. The outfit is dominated by an OFF-WHITE / NATURAL RAMIE (undyed
ramie-fiber) color as the main tone — a plain, understated off-white woven
tunic top, reflecting the Truku people's ramie-weaving tradition. Only SIMPLE
minimal red woven trim / thin red stripes as sparing accents at the headband,
collar or sleeve edges — NO complex figurative or geometric ethnic patterns.
Accessories: a plain woven headband, leg wraps, a hunting knife at the waist
and a quiver on the back. Clear facial features with a calm, determined,
youthful expression, but ABSOLUTELY NO facial tattoos, face markings, face
paint, or any lines on the face. Rich painted illustration style with warm
lighting, storybook RPG game art direction — NOT flat vector icon, NOT
photorealistic photo. Standing on a cliff edge with a soft jungle/gorge
backdrop. Transparent or plain background, no text or watermark.
```
**Negative prompt**:
```
facial tattoos, face markings, ptasan, face paint, lines on face, cheek
markings, forehead markings, complex geometric weaving patterns, figurative
tribal motifs, Atayal diamond patterns, Amis red-and-black color scheme,
Amis love-bag, Paiwan glass beads, Paiwan chieftain motifs, Native American
headdress, war paint, feather headdress, teepee, dreamcatcher, tribal warrior
armor, leather bikini armor, sexualized clothing, bright saturated red-black
tribal outfit, flat vector icon, photorealistic photography, text, watermark
```

📖 **中文免責**：本圖為 AI 生成之近似視覺語彙，**非特定太魯閣族服制的精確復刻**。米白（苧麻本色）主色與簡約紅色點綴為依使用者摘要之通用層面呈現，具體織紋一律簡化省略、臉部零紋樣。**正式對外公開、出版或教學用途前，務必請太魯閣族文化工作者複核。**

---

**【H2 · 變體 B：蹲姿瞄準 / 更貼近現有遊戲獵人的動態，方便無縫取代】**

> ✅ **狀態（v3.1 更新）：H2 已生成（`public/images/ui/v2-hunter-truku-h2.png`）、已通過文化複核（臉部零紋樣、米白主色、無跨族群圖紋）、已上線正式站。** 此變體即為現行遊戲獵人角色，同時是下方新章節「射箭動作分解圖」的**造型基準幀（幀 B｜拉弓瞄準）**，不需重生。H1 亦已生成（`v2-hunter-truku-h1.png`）作為文化複核參照。

🎨 **Prompt**：
```
A detailed storybook-illustrated RPG game character: a young Taiwanese Truku
(Taroko) indigenous hunter in a dynamic crouched aiming pose, drawing a bow
low with an arrow nocked, ready to shoot. Outfit main tone is OFF-WHITE /
NATURAL UNDYED RAMIE — a plain understated woven off-white top and simple
lower garment, evoking the Truku ramie-weaving tradition, kept clean and
minimal. Sparing SIMPLE red woven band accents only (thin plain stripes on
the headband or sash), NO elaborate patterns, NO figurative motifs. A plain
headband, leg wraps, a hunting knife sheathed at the hip, a quiver on the
back. Clear youthful determined facial features but ABSOLUTELY NO facial
tattoos, markings, paint, or lines on the face whatsoever. Warm cinematic
lighting, rich painted storybook RPG game art — NOT flat vector icon, NOT
photorealistic photo. Crouched among jungle foliage / gorge rocks.
Transparent or plain background, no text or watermark.
```
**Negative prompt**:
```
facial tattoos, face markings, ptasan, face paint, lines on face, cheek
markings, forehead markings, complex geometric weaving patterns, figurative
tribal motifs, Atayal diamond patterns, Amis red-and-black color scheme,
Amis love-bag, Paiwan glass beads, Paiwan chieftain motifs, Native American
headdress, war paint, feather headdress, teepee, dreamcatcher, tribal warrior
armor, leather bikini armor, sexualized clothing, bright saturated red-black
tribal outfit, flat vector icon, photorealistic photography, text, watermark
```

📖 **中文免責**：同【H1】。本圖為 AI 生成之近似視覺語彙，**非特定太魯閣族服制精確復刻**；米白主色 + 簡約紅點綴、具體織紋省略、臉部零紋樣。**正式對外/教學用途前務必請太魯閣族文化工作者複核。**

---

### 📖 備註（總）

- 兩個變體擇一或兩個都生、由使用者/Codex 挑選較滿意者，作為新的 `v2-hunter-character.png` 取代檔（建議命名 `v2-hunter-truku.png`，與舊檔並存待確認後再切換，避免直接覆蓋）。
- **【H2】的蹲姿瞄準更貼近現有遊戲獵人的動態用途**，若要無縫取代優先看 H2；**【H1】站姿全身**更能完整檢視服裝是否符合文化界線，適合先用來做文化複核。
- 生成後請人工目視複核三件事：(1) 臉上是否真的完全沒有任何紋樣/線條；(2) 主色是否確為米白素淨、沒有變成大紅大黑；(3) 身上有沒有冒出複雜幾何織紋或其他族群圖案。任一項不合格即重生或提高 negative prompt 權重。

---

## Refusal and Safety Rules（本素材加嚴）

- **紋面（Ptasan）零容忍**：臉上出現任何紋樣/線條/塗色即判定不合格，必須重生。
- 不編造具體織紋圖騰；紅色僅簡約點綴。
- 不混用泰雅/阿美/排灣/美洲原住民元素。
- 不性化、不部落戰士化。
- 主色必須是米白/苧麻本色，不得偏移成高彩度部落刻板配色。

---

## 生成前檢查清單

- [ ] 主色是否為米白 / 苧麻本色（off-white / natural ramie）？
- [ ] 紅色是否僅作簡約織帶/條紋點綴、沒有變成複雜圖騰？
- [ ] 臉部是否**完全乾淨**、零紋面/紋樣/塗色/線條？
- [ ] 是否無泰雅菱形紋、阿美紅黑、排灣琉璃珠、美洲羽冠等跨族群/跨文化元素？
- [ ] 服裝是否無暴露/性化、無奇幻部落戰士皮甲？
- [ ] 是否維持 v2 storybook-illustrated RPG game art 風格 + 動態拉弓姿勢？
- [ ] Negative prompt 是否明確排除 facial tattoos / ptasan / 其他族群 patterns？
- [ ] 每個 prompt 是否都附中文免責、提示正式用途前請太魯閣族文化工作者複核？

---

## 使用方式提醒

把這份文件整份貼給 Codex，說明「這是真實原住民族文化參考，文化界線章節必須嚴格遵守；先生成【H1】/【H2】其一或兩者，生成後我會做文化複核再決定是否取代現有獵人」。取代 `v2-hunter-character.png` 前，務必先經使用者確認、並在正式公開前請太魯閣族文化工作者複核。本份不動任何程式碼、資料庫、既有素材檔。

---
---

# 新章節（v3.1）：射箭動作分解圖（動畫幀）

> **背景**：小工程正在改遊戲機制——獵人隨答題進度逐漸靠近獵物、答對時發射弓箭。因此需要**同一個獵人角色的 3 個動作幀**，讓前端能切換播放成射箭動畫。本章節只定義素材規格與 prompt；**動畫切換邏輯歸小工程、畫面接入/CSS 歸小排版，小畫家只產出圖檔**。

## A. 三幀規格總表

| 幀 | 動作 | 用途 | 檔名 | 狀態 |
|---|---|---|---|---|
| **幀 A｜待機/行走** | 持弓放鬆站姿，弓垂在身側，未搭箭 | 獵人在場上移動/等待時 | `v2-hunter-truku-idle.png` | 待生成 |
| **幀 B｜拉弓瞄準** | 蹲姿拉滿弓、搭箭瞄準 | 玩家輸入中/瞄準狀態 | `v2-hunter-truku-h2.png`（沿用） | ✅ **已生成、已過文化複核、已上線——不用重生**，是全部新幀的造型基準 |
| **幀 C｜放箭瞬間** | 弦已釋放、持弓臂前伸、箭已離弦，身體微後座 | 答對發射時切換 | `v2-hunter-truku-release.png` | 待生成 |
| （合圖） | A/B/C 並排 sprite sheet 原檔 | 切圖來源，保留存檔 | `v2-hunter-truku-sprites.png` | 待生成 |

## B. 角色一致性策略（本章節最大技術難題）

AI 分開生三張，臉、服裝、比例幾乎必然跑掉。對策依優先序：

1. **主要方案：sprite-sheet 一張圖並排三個動作。** 同一次生成、同一張圖裡左到右排列 A/B/C，同一角色、同一比例、同一地面基準線，生成後用 Pillow 切成三等寬格。這是讓 AI 保持角色一致最可靠的做法。合圖裡的中間格（瞄準姿勢）作為與既有 H2 對照的「一致性錨點」：**預設仍沿用已上線的 `v2-hunter-truku-h2.png` 當幀 B**；若切出來的三幀彼此更協調、但與舊 H2 有落差，要不要整組換用切圖版（含幀 B），**由使用者決定，不要擅自替換已上線檔案**。
2. **技術加強（可選）：用 `gpt-image-1` 的 images/edits（參考圖）端點**，把 `v2-hunter-truku-h2.png` 當參考圖餵進去，要求「same character, new pose」。這能把一致性直接錨在已上線的 H2 上，可與方案 1 併用（先 sprite sheet，不像再用 edits 補救）。額度消耗與一般生成同級，事前一樣要向使用者報數量。
3. **備援方案：分開單張生成。** 只在 sprite sheet 反覆失敗時使用。每張 prompt 必須**完整重複**下方「服裝鎖定描述」全文，一字不省，並各自附上完整 negative prompt。即便如此，一致性仍需人工嚴格比對。

## C. 共同技術規格（三幀通用）

- **服裝鎖定描述（照抄 H2，逐字放進每個 prompt）**：米白/苧麻本色上衣（off-white / natural undyed ramie）、簡約紅色織帶點綴（僅頭帶/腰帶處細條紋）、素面頭帶、綁腿、腰際獵刀、背箭袋、清楚五官零臉部紋樣。
- **同一地面基準線、同一角色比例**：切圖後三幀能直接互換不跳動。切圖時三格維持相同畫布尺寸、**不要各自 auto-trim 透明邊**（會破壞對齊），以腳底基準線對齊。
- **側面朝向一致**：規劃上為**側面朝右**（獵人向右靠近獵物）。⚠️ 生成前先目視確認 `v2-hunter-truku-h2.png` 的實際朝向，新幀必須與它同向；若遊戲畫面方向相反，用前端 CSS `scaleX(-1)` 翻轉解決（小排版範疇），不要為此重生圖。
- **透明背景**：`background: "transparent"` + `output_format: "png"`（動畫幀必須透明，不能像 H1/H2 一樣帶場景；疊景交給前端）。
- **尺寸**：sprite 合圖用 `1536x1024`（橫式，三格各約 512 寬）；備援單張用 `1024x1024`。quality 沿用 `medium`。
- 圖內**不要任何文字、編號、格線、標籤**（AI 畫 sprite sheet 很愛自己加 "Pose 1" 字樣，negative prompt 要擋）。

## D. 文化界線（與 H2 完全相同，不因動作幀放鬆）

本章節三幀全部適用前文「太魯閣族文化界線」章節與「Refusal and Safety Rules」，**逐條有效、零放鬆**：米白/苧麻本色主色、紅色僅簡約織帶點綴、**絕對零紋面（Ptasan）**、不編造織紋圖騰、不混用泰雅/阿美/排灣/美洲原住民元素、不性化不部落戰士化。動作幀是同一個角色的三個瞬間，**每一幀都要獨立通過同一套檢查**——sprite sheet 一張圖裡有三張臉，代表紋面誤植的機會 ×3，複核時三張臉都要看。

## E. 四段式文化審查（本章節）

### 🔍 文化審查

風險點與 H1/H2 相同（紋面誤植、織紋編造、跨族群混用、主色偏移），另加動作幀特有風險：(1) sprite sheet 生成時 AI 可能在三格間**自行變化服裝細節**（例如某格突然多出圖騰、換色），每格都要獨立檢查；(2) 「放箭/戰鬥瞬間」措辭可能誘發 AI 加上戰紋、猙獰表情等「部落戰士」刻板演出，prompt 與 negative prompt 都要壓住。

### ✨ 視覺校正

- 服裝描述逐字鎖定為已通過複核的 H2 版本，三幀不得有任何服裝變體。
- 動作差異只表現在**姿勢與弓箭狀態**（弓垂下/拉滿/釋放），不透過表情猙獰化或增加裝備來強調動態。
- 幀 C 的「瞬間感」用肢體語言呈現（持弓臂前伸、放弦手張開於頰側、身體微後座、箭已離弦飛出畫面），不畫誇張特效或戰吼表情。
- 三幀臉部一律維持 H2 的「堅毅年輕、完全乾淨」設定。

### 🎨 Prompt（主要方案：sprite sheet 合圖，1536x1024，透明背景）

```
A character animation sprite sheet: THREE poses of the EXACT SAME character,
arranged side by side left-to-right in ONE image. Identical character design,
identical clothing, identical scale in all three poses, feet standing on the
SAME ground baseline, all shown in side view FACING RIGHT, evenly spaced with
clear gaps between poses, on a fully TRANSPARENT background.

THE CHARACTER (must be strictly identical in all three poses): a young
Taiwanese Truku (Taroko) indigenous hunter. Outfit main tone is OFF-WHITE /
NATURAL UNDYED RAMIE — a plain understated woven off-white top and simple
lower garment, evoking the Truku ramie-weaving tradition, kept clean and
minimal. Sparing SIMPLE red woven band accents only (thin plain stripes on
the headband or sash), NO elaborate patterns, NO figurative motifs. A plain
headband, leg wraps, a hunting knife sheathed at the hip, a quiver on the
back. Clear youthful determined facial features but ABSOLUTELY NO facial
tattoos, markings, paint, or lines on the face whatsoever.

POSE 1 (left) — IDLE / WALK: relaxed upright standing pose, the bow held
loosely in one hand hanging down at his side, no arrow nocked, calm and
alert.

POSE 2 (middle) — AIM: dynamic crouched aiming pose, drawing the bow low
with an arrow nocked, ready to shoot.

POSE 3 (right) — RELEASE: the split second AFTER loosing the arrow — the
bowstring just released, the bow arm fully extended forward, the draw hand
open near the cheek, the arrow already gone from the string and out of
frame, a slight natural recoil in the body.

Warm cinematic lighting, rich painted storybook RPG game art — NOT flat
vector icon, NOT photorealistic photo. No text, no watermark, no pose
labels, no frame numbers, no grid lines, no background scenery.
```

**Negative prompt（照抄 H2 版，僅追加 sprite sheet 專用排除項）**：
```
facial tattoos, face markings, ptasan, face paint, lines on face, cheek
markings, forehead markings, complex geometric weaving patterns, figurative
tribal motifs, Atayal diamond patterns, Amis red-and-black color scheme,
Amis love-bag, Paiwan glass beads, Paiwan chieftain motifs, Native American
headdress, war paint, feather headdress, teepee, dreamcatcher, tribal warrior
armor, leather bikini armor, sexualized clothing, bright saturated red-black
tribal outfit, flat vector icon, photorealistic photography, text, watermark,
pose labels, frame numbers, grid lines, panel borders, different outfits
between poses, inconsistent character design, background scenery
```

### 🎨 Prompt（備援方案：分開單張生成，1024x1024，透明背景）

> 只在 sprite sheet 失敗時使用。**每張都完整重複同一段角色描述**，只換動作段落；negative prompt 與上方完全相同（可拿掉 sprite 專用那幾項）。

**【幀 A · idle】** 角色描述段（THE CHARACTER 整段逐字照抄）＋動作段：
```
Full body, side view FACING RIGHT, relaxed upright standing pose, the bow
held loosely in one hand hanging down at his side, no arrow nocked, calm
and alert expression, feet on a flat ground baseline, fully transparent
background, no scenery, no text, no watermark.
```

**【幀 C · release】** 角色描述段（同上逐字照抄）＋動作段：
```
Full body, side view FACING RIGHT, the split second AFTER loosing an arrow —
bowstring just released, bow arm fully extended forward, draw hand open near
the cheek, the arrow already gone from the string and out of frame, slight
natural recoil in the body, feet on a flat ground baseline, fully transparent
background, no scenery, no text, no watermark.
```

（幀 B 不生成，沿用 `v2-hunter-truku-h2.png`。）

### 📖 中文免責

同【H1】/【H2】：本組動作幀為 AI 生成之近似視覺語彙，**非特定太魯閣族服制精確復刻**；米白主色＋簡約紅點綴、具體織紋省略、臉部零紋樣。**正式對外公開、出版或教學用途前，務必請太魯閣族文化工作者複核**（三幀都要看）。

## F. 生成後驗收清單（三幀逐一檢查）

- [ ] **三幀同一張臉、同一套服裝**？（與已上線 `v2-hunter-truku-h2.png` 逐項比對：頭帶、紅織帶位置、獵刀、箭袋、綁腿）
- [ ] 每一幀臉部是否**完全乾淨**、零紋面/紋樣/塗色/線條？（sprite sheet 三張臉全查）
- [ ] 三幀比例與地面基準線是否一致、切圖互換不跳動？
- [ ] 朝向是否與既有 H2 一致？
- [ ] 主色是否維持米白素淨、紅色僅簡約點綴、無跨族群圖紋？
- [ ] 背景是否真透明（無殘留場景/陰影塊）、圖內無文字/編號/格線？
- [ ] 檔名是否照規範：`v2-hunter-truku-sprites.png`（合圖原檔）→ 切出 `v2-hunter-truku-idle.png`、`v2-hunter-truku-release.png`，幀 B 沿用 `v2-hunter-truku-h2.png`？

## G. 邊界與流程提醒

- 本章節**只定義素材與 prompt，不生圖、不改程式碼**。實際生成前照職責 4 流程把 prompt 與張數（sprite 合圖 1 張起跳，含重生預留）報給使用者確認，才呼叫 API。
- 切好的幀怎麼在遊戲裡切換（idle → aim → release 的觸發時機）是**小工程**的機制範疇；圖片接進 DOM/CSS、定位縮放是**小排版**範疇。交付時只要把三個檔案路徑與尺寸規格交接清楚。
- 另一實例正在撰寫 `Truku_Login_Screen_Codex_v4.md`（登入畫面），與本文件無關，**不要動那個檔案**。
