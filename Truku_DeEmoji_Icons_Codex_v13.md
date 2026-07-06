# Truku De-Emoji Icons Codex — v13（全站去 emoji：缺圖預設 placeholder + UI icon 套組）

**Version:** 13.0
**Target AI:** Codex / GPT image generation / DALL-E-style image tools
**Language:** Traditional Chinese for review, English for image prompts
**Purpose:** 配合使用者鐵律「網頁全部都不能出現 emoji」，把桌機 `hunter-truku-v2.html` 與手機 `mobile.html` 畫面上會渲染的系統 emoji，凡屬「插畫/icon 類」者改成自製透明底 PNG 素材。純符號類（✓ ✗ ▶ ● □ ⌄ 等）不在本文件，交小工程用 CSS/SVG 向量處理。

本文件涵蓋 **兩批素材**：
- **批 P（最優先，1 張）**：缺圖預設 placeholder — 取代目前所有無 `image_path` 詞彙渲染的 `🎯`。
- **批 I（icon 套組，9 張）**：發音 / 提示 / 排行榜 / 玩家 / 登出 / 刪除 / 單詞回顧 / HP心 / 提示卡徽章 — 統一成一套木質圓框 icon。

> 動物 fallback emoji（🐗🦌🐿🦅🐒🐻🐆）**不在本文件**：這些詞的插畫 `prey-*.png` 已存在，應由小工程/小排版把 fallback 從 emoji 改指向現有 PNG，不需生圖（見文末【不生圖・交接】）。

---

## ⚠️ 給主對話 / 使用者的提醒（先標記）

1. **本批要生 10 張**：批 P 1 張（placeholder，最優先，可單獨先生）+ 批 I 9 張 icon。全部透明背景 PNG（RGBA，四周 alpha=0）。
2. **placeholder 是止血關鍵**：目前約 46000 筆詞彙 fallback 都渲染 `🎯`。生 1 張 placeholder 後，小工程把 fallback 從 emoji 字改成這張 img，一次全站止血。**這張建議第一個生、單獨確認。**
3. **icon 統一成一套**：9 個 icon 共用同一組視覺語言（圓形木盤 + 金邊 + 中央符號），跟現有 `v2-audio-button-wood.png`（木雕喇叭圓盤）同一家族，才不會東一個風格西一個風格。
4. **文化安全：本批低風險**。全部是通用功能符號（喇叭/燈泡/獎盃/人像/門/垃圾桶/書/愛心/準星靶），無人物服飾器物紋樣、無儀式、無聚落場景。無紋面、無族群織紋。見【文化安全註記】。
5. **換圖 / CSS / fallback 邏輯是小工程 + 小排版的事**：小畫家只生素材、寫本規格。emoji 字串換成 img、CSS `content` 換 `background-image`、JS `textContent='🔊'` 改成加 class，一律交小工程/小排版（見【整合・交接】）。**小畫家不改 `hunter-truku-v2.html` / `mobile.html` 本體。**
6. **先報 prompt 給使用者確認額度再貼 Codex**。遇 `billing_hard_limit_reached` 立即停止回報、不重試。
7. 純符號類（✓ ✗ ✕ ▶ ▾ ● □ ◯ ⭐ ⬇ ➤ ⌄ ⚠）**不在本文件**，交小工程 CSS/SVG（見文末【交小工程・向量】）。

---

## System Role

You are the **Truku Hunter Game Art Director (v2 style, de-emoji icon set)**。美術風格與太魯閣族文化安全規則**完全沿用** `Truku_Hunter_Game_Assets_Codex_v2.md`：細緻繪本/RPG 遊戲美術、木雕＋藤蔓/葉片裝飾語言、暖色調（金黃 `#F5A623`/`#FFD700`、深綠 `#1A4A10`/`#0A2A08`、木質棕 `#8B5500`/`#5A3000`），透明背景 PNG，不混用其他族群或泛部落意象。素材要與現有 `public/images/ui/`（尤其 `v2-audio-button-wood.png` 木雕喇叭圓盤）視覺一致。

---

## 統一 icon 視覺規範（批 I 9 張共用）

所有 icon 走**同一個模板**，只換中央符號：

- **外形**：正方畫布，中央一枚**圓形木盤徽章**（wood-carved round medallion），暖木棕主體 + 一圈金邊（`#F5A623`/`#FFD700`）+ 邊緣輕微立體光影/藤葉小點綴（呼應現有木質 UI）。
- **中央符號**：一個**乾淨、可小尺寸辨識**的功能符號（見各 icon 定義），亮金/米白色，簡潔線條，不要細碎到縮小成 24–40px 就糊掉。
- **背景**：圓盤以外**完全透明（alpha 0）**，四角乾淨。
- **不要**任何文字、數字、浮水印。**不要**寫實照片感。**不要**族群織紋/紋面/菱形/祖靈眼。
- 前端顯示尺寸多在 **24–48px**，故細節要「小尺寸清楚」為第一原則，寧簡勿繁。

> 若使用者希望 icon 走「無木盤、純符號插畫」更輕量的版本，也可；但預設建議帶木盤，與現有喇叭鈕成套。這點列為【待主管/使用者決策】其一。

---

## 批 P — 缺圖預設 placeholder（最優先，1 張）

🔍 **用途**：詞彙沒有配圖時的預設視覺。取代目前的 `🎯`。出現位置：桌機 `#prey` 獵物區（射擊目標）、`#wordBubble` 詞彙卡主視覺、L2 提示卡徽章；手機版同類 fallback。**必須在「當射擊目標」與「當卡片插畫」兩種情境下都好看**，所以做成一個「有主體感、可愛、中性」的圖，而不是抽象色塊。

✨ **要生成的**：一枚**木質繪本風的「狩獵準星靶 / 標靶」圖標**——一個帶同心圓的木牌圓靶（bullseye），可再點綴一支斜插的箭或一片葉子，暖木棕 + 金 + 綠，繪本 RPG 質感，透明背景。它要能同時當「射擊目標」（切題：獵人遊戲）與「這個詞還沒有專屬插畫」的中性佔位。**不要**畫成任何特定動物（那會誤導詞義）；**不要**任何文字。

### 🎨 English Prompt（P）
```
A cute wooden hunting target / bullseye icon for a storybook RPG hunter game, on a
fully transparent background. A round wooden target board with concentric rings
(warm wood-brown outer ring, cream and warm-gold inner rings, a small red-gold
center dot), a subtle carved wooden frame with a thin gold rim, optional a single
small arrow lodged slightly off-center and a tiny green leaf sprig for a cozy
adventurous touch. Rich storybook-illustrated game art style, warm cinematic
lighting, painterly detail, warm gold + wood-brown + green palette. The object is
centered and fills most of the square canvas, everything outside the target is
fully transparent (alpha 0). This is a neutral placeholder / shooting-target icon,
NOT any specific animal. No text, no numbers, no watermark.
```

### 🚫 Negative Prompt（P）
```
any specific animal, animal, face, letters, text, numbers, watermark, flat vector
icon, photorealistic photography, dartboard sports logo, ethnic weaving pattern,
tribal diamond weaving motif, ancestral eye motif, Atayal/Truku weaving,
Amis/Paiwan/indigenous totem, feathered headdress, face tattoo, Ptasan
```

- **尺寸/比例**：正方，建議 **512×512**，主體置中、四周透明。輸出 **PNG RGBA**。前端當獵物約 90–130px、當卡片主視覺約 130px、當 L2 徽章縮到約 24px——**輪廓要在最小尺寸仍可辨（同心圓夠粗）**。
- **檔名**：`v2-prey-placeholder.png`（回收到 `public/images/ui/`）。

---

## 批 I — UI icon 套組（9 張，同一模板）

以下 9 張都套用上方【統一 icon 視覺規範】，只換中央符號。命名中性、日後可重用。

| # | 檔名 | 中央符號 | 取代的 emoji（出現位置示例） |
|---|---|---|---|
| I1 | `v2-ui-icon-sound.png` | 喇叭 + 音波（speaker with sound waves） | 🔊 發音（桌機 wp-speaker/listenPlayBtn/choicePlayBtn 等多處、mobile audioBtn/howto） |
| I2 | `v2-ui-icon-hint.png` | 燈泡（lightbulb） | 💡 提示（hintBtnLabel 前的 hint-ic） |
| I3 | `v2-ui-icon-trophy.png` | 獎盃（trophy cup） | 🏆 排行榜/過關（openLeaderboard 鈕、lbTitle、clearIcon） |
| I4 | `v2-ui-icon-player.png` | 人像半身剪影（person bust） | 👤 玩家/訪客（goRankResult/clRankResult 訪客標記） |
| I5 | `v2-ui-icon-logout.png` | 門 + 外向箭頭（door / exit） | 🚪 登出（logout 鈕） |
| I6 | `v2-ui-icon-delete.png` | 垃圾桶（trash can） | 🗑 刪除（排行榜管理刪除鈕，僅管理員可見，但仍屬畫面 emoji） |
| I7 | `v2-ui-icon-review.png` | 翻開的書（open book） | 📖 本關單詞回顧（review-title） |
| I8 | `v2-ui-icon-heart.png` | 愛心（heart，紅/金） | ❤ HP（mg-prev-hud「HP ❤❤❤」預覽） |
| I9 | `v2-ui-icon-target-small.png` | 準星靶（同 placeholder 語言的縮小版） | 🎯 提示卡徽章（L2 hint-card `content:'🎯 提示卡'`）、其他 🎯 內文標記 |

> **I9 vs 批 P**：批 P 是「詞彙缺圖」的插畫佔位（同心圓靶主體感重）；I9 是「UI 徽章」小標記（要跟其他 icon 一樣是圓木盤 + 準星符號）。兩者用途不同，建議分開；若使用者想省 1 張，L2 提示卡徽章也可直接複用批 P 那張縮小，屆時 I9 可略。列為【待主管/使用者決策】其二。

### 🎨 English Prompt 模板（I1–I9 共用，把 {SYMBOL} 換成該 icon 的符號）
```
A single UI icon for a storybook RPG jungle-adventure game, on a fully transparent
background. A round wood-carved medallion (warm wood-brown, subtle carved wood
grain, a thin bright gold rim, soft three-dimensional lighting, a tiny green leaf
accent), with a clean centered {SYMBOL} symbol in bright gold / cream, simple bold
readable shape. Rich storybook-illustrated game art style, warm cinematic lighting,
painterly detail, warm gold + wood-brown + green palette, consistent with an
existing wood-carved speaker button from the same game. The medallion is centered
and fills most of the square canvas; everything outside the medallion is fully
transparent (alpha 0). Bold and legible at small sizes (24–48px). No text, no
numbers, no watermark.
```

各 icon 的 `{SYMBOL}` 填入：
- **I1** `a speaker / loudspeaker emitting two or three curved sound waves`
- **I2** `a glowing lightbulb`
- **I3** `a two-handled victory trophy cup`
- **I4** `a simple person bust / head-and-shoulders silhouette`
- **I5** `an open door with an arrow pointing outward (exit)`
- **I6** `a trash can / waste bin with a lid`
- **I7** `an open book with visible pages`
- **I8** `a heart` （顏色可用暖紅 `#E24` + 金邊，其餘同模板）
- **I9** `a bullseye target / shooting reticle` （與批 P 同語言，縮小徽章版）

### 🚫 Negative Prompt（I1–I9 共用）
```
text, letters, numbers, watermark, flat vector app icon, photorealistic photography,
glossy modern material-design icon, ethnic weaving pattern, tribal diamond weaving
motif, ancestral eye motif, Atayal/Truku weaving, Amis/Paiwan/indigenous totem,
feathered headdress, face tattoo, Ptasan, human character face, cluttered tiny
details that vanish when small
```

- **尺寸/比例**：正方，建議每張 **512×512**，圓盤置中、四周透明，輸出 **PNG RGBA**。
- **一致性提醒**：9 張最好**一次連續生成**（或給 Codex 看第一張成功的當參考再生其餘），確保木盤大小/金邊粗細/光影方向一致。

---

## 命名與回收位置

全部回收到 `public/images/ui/`：

| 素材 | 檔名 |
|---|---|
| 缺圖預設 placeholder | `v2-prey-placeholder.png` |
| 發音 | `v2-ui-icon-sound.png` |
| 提示 | `v2-ui-icon-hint.png` |
| 排行榜/獎盃 | `v2-ui-icon-trophy.png` |
| 玩家 | `v2-ui-icon-player.png` |
| 登出 | `v2-ui-icon-logout.png` |
| 刪除 | `v2-ui-icon-delete.png` |
| 單詞回顧 | `v2-ui-icon-review.png` |
| HP 心 | `v2-ui-icon-heart.png` |
| 準星徽章（小） | `v2-ui-icon-target-small.png` |

- 全部 **PNG RGBA 透明背景**，生成後**務必驗四周 alpha=0**（沿用 v2 透明驗證習慣）。

---

## 整合・交接（給小工程 / 小排版；小畫家不改 HTML/CSS/JS）

素材回收後，怎麼接進畫面**不是小畫家的活**。以下只是給接手者的定位參考：

1. **CSS `content` 型（有現成隱藏 emoji 的機制可循）**：
   - L2 提示卡徽章 `content:'🎯 提示卡'`（約 line 399/403）→ 改用 `background-image` 疊 `v2-ui-icon-target-small.png` + `content:'提示卡'`，emoji 拿掉。可仿現有 `v2-audio-button-wood.png` 的「background 圖 + font-size:0 藏 emoji」手法（見 line 1991/2119 註解）。
   - `🌿`/`🍃` 葉飾（line 1285/1366/2810/2812 等）屬**純裝飾符號**，可交小工程用 CSS/SVG 葉片向量或現有葉素材，不必生圖（見文末【交小工程・向量】）。
2. **JS `textContent='🔊'` 型（會被程式反覆重設）**：line 4404/4467/5556/5713 等把按鈕文字設成 🔊/🔉。建議小工程改成「切 class（如 `.is-playing`）」而非寫 emoji 字，按鈕背景圖用 `v2-ui-icon-sound.png`。**小畫家只提供圖，切換邏輯是小工程。**
3. **HTML 內嵌 emoji span**：如 `<span class="wp-speaker">🔊</span>`（2723）、`<span class="hint-ic">💡</span>`（2677）、`🏆 排行榜` 鈕（2524/2603）等 → 小排版把 emoji 換成 `<img>` 或 `background-image`。
4. **動物 fallback（不生圖）**：見下一段。

---

## 不生圖・交接（動物 fallback → 用現有 prey PNG）

桌機 line 3521–3532 的 fallback 詞組用了動物 emoji，但**這些詞的 v2 插畫早就有了**，應改指向現成 PNG，不需生圖：

| emoji | 詞 | 現有素材 |
|---|---|---|
| 🐗 山豬 bowyak | `public/images/ui/prey-boar.png` |
| 🦌 水鹿 rqnux | `prey-deer.png` |
| 🦌 山羌 pada | `prey-muntjac.png` |
| 🐿 飛鼠 rapit | `prey-flying-squirrel.png` |
| 🦅 老鷹 kjiraw | `prey-hawk-eagle.png` |
| 🐒 猴子 rungay | `prey-monkey.png` |
| 🐻 熊 kumay | `prey-bear.png` |
| 🐆 雲豹 ngiyaw | `prey-clouded-leopard.png` |

→ **交小工程**：把這幾筆 fallback 的 `image`/`emoji` 欄改成對應 PNG 路徑（或給 `image` 欄填值），emoji 就不再渲染。**剩下沒有現成 PNG 的**：🌲樹(qhuni)、💨風(bgihur)、🔥火(tahut)、☀太陽(hidaw)、🌏語別 icon(2630) — 這幾個若使用者要去 emoji，可再開 v14 生自然物 icon（樹/風/火/太陽/地球），本批先不做，列為【待主管/使用者決策】其三。

---

## 交小工程・向量（純符號，本批不生圖）

以下為畫面上的**純符號 emoji**，判定「能向量就向量」，交小工程用 CSS/SVG：

| 符號 | 位置示例 | 建議做法 |
|---|---|---|
| `▾` 下拉箭 | 2499/2552 lang-trigger-caret；mobile `⌄` 56/102 | CSS border 三角 或 SVG caret |
| `✕` 關閉 | 2617/2631 | CSS 兩條斜線 或 SVG × |
| `✓` `✗` 對錯標記 | 3811/3853/5455/5459/5493 等 | SVG check / cross，可配綠/紅色 |
| `▶` NEXT/播放 | 2994 | CSS 三角 或 SVG play |
| `⬇` 下載 | 2969/3002 | SVG download arrow |
| `➤` 飛箭 | 5177（射擊動畫箭矢） | 建議 SVG 箭頭；若要更精緻可另議生小箭 PNG（列選配，本批先向量） |
| `●` 音節點 | 554 提示點列 | CSS 圓點 |
| `□` 拼字格 | 4229 mg-prev-cells | CSS 方框 |
| `⭐` 星等 | 5425 | SVG star（或改用現有 `v2-score-sparkle.png`，交小排版判斷） |
| `⌄` caret | mobile 56/102 | 同 `▾` |
| `⚠` | 多在註解/console.warn（非畫面） + line 5607/5759/5821 少數 toast | toast 內的可換 SVG 警告；註解/console 的**非玩家可見，略** |

> `➤` 飛箭是動畫元素，向量即可；若日後要「木箭」質感再開單張。`⭐` 若要跟遊戲風統一，小排版可評估直接用現有 `v2-score-sparkle.png`。

---

## 文化安全註記

🔍 **文化審查**：本批 = 通用功能符號 icon（喇叭/燈泡/獎盃/人像/門/垃圾桶/書/愛心/準星靶）+ 木質圓盤徽章外框 + 一枚缺圖準星 placeholder。**無人物角色、無服飾器物、無儀式、無聚落場景**。人像 icon（I4）是抽象半身剪影，非具體人物，不涉及服飾/紋面。

✨ **校正後設定**：
- 全部 icon 只用「圓木盤 + 金邊 + 通用符號」語言，**無族群織紋、無菱形、無祖靈眼、無紋面（Ptasan）**，Negative 已明列排除。
- placeholder 是「狩獵準星靶」通用意象（切遊戲主題但不涉文化符號），且明確排除畫成任何特定動物或編造圖騰。
- 木盤上的「藤葉小點綴」是自然裝飾（葉片），非文化紋樣，安全。
- 全批排除阿美族紅黑/八角星、泰雅太魯閣菱形織帶、排灣琉璃珠/百步蛇、羽冠、紋面。

📖 **備註**：近似視覺語彙的中性遊戲 UI icon，非特定部落符號精確復刻，用於遊戲 UI 無虞。**本批低風險，通過。**

---

## 生成前檢查清單

- [ ] 10 張都是 **PNG RGBA 透明背景**、四周 alpha=0？
- [ ] placeholder：同心圓靶主體、**不是任何特定動物**、無文字、小尺寸仍可辨？
- [ ] 9 個 icon：**同一組木盤/金邊/光影**（一致性）、中央符號在 24–48px 仍清楚、無文字？
- [ ] 全批 Negative 都含族群織紋/紋面/祖靈之眼/其他族群圖騰排除？
- [ ] 命名照建議、回收到 `public/images/ui/`？
- [ ] 是否先報 prompt + 張數（10 張）給使用者確認額度再跑？遇 `billing_hard_limit_reached` 立即停止？

---

## 使用方式提醒

把本文件相關段落貼給 Codex，**先生批 P（placeholder，1 張）確認風格 OK，再連續生批 I（9 張 icon）**。生成前先報 prompt 確認額度。回收全部到 `public/images/ui/`，驗透明背景。emoji 換成 img/background、`textContent` 改切 class、動物 fallback 指向現有 prey PNG、純符號走 CSS/SVG——**一律交小工程/小排版，小畫家不碰 `hunter-truku-v2.html` / `mobile.html`**。
