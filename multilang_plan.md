# 多語別切換架構規劃（multilang plan v2）

> 目標：讓「山林獵人 Hunter Typer」從單一太魯閣語（klokah dialectId=33）擴充為可切換
> 台灣原住民族語 16 族 42 語別的學習遊戲。本文件為純規劃，未動任何程式碼或資料庫。
>
> 撰寫依據（現況研究）：`backend/server.js`、`backend/vocab_seed.js`、`parse_vocab.py`、
> `patch_audio.py`、`check_audio.py`、`truku_vocab_final.json`、`hunter-truku-v2.html`、`public/admin.html`。
>
> **v2（2026-07-03）**：使用者拍板三項決策（見下方「已定案決策」），據此簡化 §4/§5/§6、
> 重排 §8 實施階段；另實測確認 klokah 有結構化 XML 端點，§2 資料管線改為全自動抓取
> （不再需要人工提供 CSV）；試點語別定案秀姑巒阿美語（dialectId=2），並由其詞彙掃描
> 發現特殊字元/答案判定問題，新增 §2.5 工作項（含太魯閣語既有缺陷修復）。

---

## ✅ 已定案決策（使用者拍板，2026-07-03）

| # | 決策 | 定案內容 | 對應章節 |
|---|---|---|---|
| 1 | **玩家進度** | **不分語別，跨語別共用一條解鎖線**。帳號**不**綁語別，玩家每次登入自選語別、隨時可換；太魯閣語解鎖到 Level 3，換任何語別也直接玩 Level 3。`getUnlockedLevel()` 維持現狀不改 | §4 |
| 2 | **排行榜** | **混合榜**。所有語別同一個榜；每筆分數記錄它是玩哪個語別拿的（`scores.lang_code`），榜上顯示語別標籤 | §1.3、§5 |
| 3 | **語別選擇位置** | **登入之後選**。登入後顯示語別選擇畫面（localStorage 記住上次選擇當預設、可一鍵繼續）→ 進標題畫面；標題畫面另有「切換語別」入口可隨時換 | §6 |

架構上的直接後果（比 v1 的任何方案都簡單）：
- **`players` 表完全不用動**——語別是「當次遊玩的選擇」，不是帳號屬性，不需要 `players.lang_code`、
  不需要綁定/解綁 API、不需要管理員後門。
- 進度、登入身分都跟語別無關；語別只影響兩件事：**載入哪套詞彙**（`?lang=`）與
  **這筆分數標注什麼語別**（`scores.lang_code`）。

另依本次修訂一併定案（詳見文末「待決事項」）：
- **#4 語別代號**：按原建議採 **ISO 639-3 為主 + 方言後綴**（`trv`、`tay-squliq`…）——使用者未表態，先定案，**若使用者反對再改**。
- **#5 試點語別**：✅ **已定案：秀姑巒阿美語（dialectId=2）**。已實測：XML 200（1094 詞、
  0 筆「無此詞彙」、level 分布同框架）、音檔抽測 3/3 通過、雙語對照正確（「一」= trv `kingal` / ami `cecay`）。
  代碼依 #4 慣例用 `ami` + 方言後綴（阿美語多方言，建議 `ami-siwkolan`，拼法實作時再確認）。
  **前置必要條件**：§2.5 答案判定正規化層（該語別 547/1094 詞含特殊字元）。
- **#6 獵人族服隨語別**：後置（Phase 5 再議）。

---

## 0. 現況盤點（跟多語別有關的關鍵事實）

| 項目 | 現況 | 多語別下的問題 |
|---|---|---|
| `vocabulary` 表 | 無語別欄位；`word` 為事實上的準主鍵（圖片/音檔上傳 API 用 `WHERE word = ?`） | 不同語別可能拼出相同 `word`（泛泰雅語群同源詞很常見），`word` 當 key 會互相蓋 |
| 種子邏輯 | `server.js` 啟動時 `COUNT(*)===0` 才 `seed(TRUKU_SEED)`（整表計數） | 多語別下「整表空才種」不夠用，需改成「**逐語別**空才種」 |
| 種子檔 | 單一 `backend/vocab_seed.js`，export 一個 9 欄陣列 `TRUKU_SEED` | 需演化為多語別結構 |
| 資料管線 | 現行 `parse_vocab.py` 吃本地 CSV、`patch_audio.py`/`check_audio.py` 寫死 dialectId `33` | **已實測確認 klokah 有結構化 XML 端點** → 管線改寫為「輸入 dialectId 即全自動產出種子」，見 §2 |
| 圖片 URL | `https://klokah.tw/competition/vocabulary/picture/{code}.jpg`，**不含語別代號** | 已證實：全語別共用同一套 1094 詞框架（同中文釋義、同圖片編號），新語別不用重做圖；XML 的 `image` 欄位直接給圖片編號 |
| 音檔 URL | `https://web.klokah.tw/vocabulary/audio/word/33/{code}.wav`，`33`=太魯閣語 dialectId | 換 dialectId 即可指到其他語別音檔（需逐語別驗證存在性，同 `check_audio.py` 做法） |
| `/api/vocabulary` | 篩選參數只有 `level`/`category`/`active` | 需加 `lang` |
| `players` 表 | `id, username, password_hash, display_name` | **已定案：不用動**（語別不綁帳號） |
| `scores` 表 | `player, level, score, kills, accuracy, combo, player_id, cleared`，無語別 | **已定案**：進度不分語別（`getUnlockedLevel()` 不用改）、榜混合；加 `lang_code` 記錄每筆分數的語別，見 §1.3 |
| 前端 | `loadVocabulary(level)`、`VOCAB_CACHE` 以 level 為 key；`FALLBACK_PREY` 是太魯閣語內建詞 | 需帶語別參數；可隨時切換語別 → 快取 key 含語別、或切換時整包清空（見 §6） |
| 答案判定 | `normalizeInput()`（1823 行）只做 trim+空白折疊+lowercase；載詞時 `r.word.trim().split(/\s+/)`（1574 行）以空白切詞逐字判定 | 特殊撇號（U+02BC 等）標準鍵盤打不出；`supug / sabal` 這類多讀音詞的斜線被當成要打的「字」——**太魯閣語現在就有的潛在缺陷**，見 §2.5 |
| UI 文案 | 多處寫死「太魯閣語」（見 §7） | 需改成依當前語別動態填入 |
| admin.html | `GET /api/vocabulary?active=all` 全撈、上傳/刪除以 `word` 為 key | 需加語別篩選；上傳 API 的 key 需改 |

---

## 1. 資料層

### 1.1 `vocabulary` 加語別欄位

沿用 server.js 既有的「try ALTER TABLE、已存在就 catch」migration 模式：

```sql
ALTER TABLE vocabulary ADD COLUMN lang_code TEXT NOT NULL DEFAULT 'trv';
CREATE INDEX IF NOT EXISTS idx_vocab_lang_level ON vocabulary(lang_code, level, active);
```

- `lang_code` 採 ISO 639-3（`trv`=太魯閣、`tay`=泰雅、`ami`=阿美…），**42 語別比 16 族語碼細**，
  同語多方言時用 `'tay-squliq'` 形式（已定案，見文首）。klokah 的最小單位是 dialectId，
  所以另建一張語別對照表（`dialect_id` + `name_zh` 可從 `dialectView.xml` 端點自動取得，見 §2；
  `lang_code` 與 `name_native` 人工指定）：

```sql
CREATE TABLE IF NOT EXISTS languages (
  lang_code   TEXT PRIMARY KEY,   -- 內部代碼，如 'trv'（同語多方言時可用 'tay-squliq' 形式）
  dialect_id  INTEGER NOT NULL,   -- klokah dialectId，如 33
  name_zh     TEXT NOT NULL,      -- '太魯閣語'（給 UI 顯示用，取代寫死文案）
  name_native TEXT,               -- 'Truku'
  active      INTEGER DEFAULT 1
);
```

- **既有太魯閣語資料遷移**：`ALTER TABLE ... DEFAULT 'trv'` 對既有 1092 筆自動生效，**零資料搬移、零丟失**。
  不需要清空 `vocabulary`（除非同時要換種子內容，那也只 `DELETE FROM vocabulary WHERE lang_code='trv'`，逐語別清）。
- **word 撞名問題**：`image/audio 上傳 API` 目前 `WHERE word = ?`，多語別後必須改成
  `WHERE word = ? AND lang_code = ?`（或干脆改用 `vocabulary.id` 當 key，較乾淨，admin.html 一併調整）。

### 1.2 種子資料檔演化

從單一 `vocab_seed.js` 改為「一語別一檔 + 一個 index」：

```
backend/seeds/
  index.js        // module.exports = { trv: require('./trv'), tay: require('./tay'), ... }
  trv.js          // 現在的 vocab_seed.js 原封搬過來（9 欄格式不變）
  tay.js          // 之後新語別逐一加入
```

種子邏輯從「整表空才種」改為「**逐語別**空才種」：

```js
for (const [lang, rows] of Object.entries(SEEDS)) {
  const c = db.prepare('SELECT COUNT(*) c FROM vocabulary WHERE lang_code=?').get(lang).c;
  if (c === 0) seedLang(lang, rows);   // INSERT 時多帶 lang_code
}
```

好處：部署新語別＝加一個 seed 檔重啟，**不必碰既有語別的資料**；也保留「清掉單一語別重種」的操作彈性。

### 1.3 `scores` 加 `lang_code`（每筆分數記錄「玩哪個語別拿的」）【依定案 #2】

玩家可隨時換語別，所以「這筆分數是哪個語別的」只能記在分數本身，語別由前端送分時帶上：

```sql
ALTER TABLE scores ADD COLUMN lang_code TEXT NOT NULL DEFAULT 'trv';
```

- **用途一（榜面標籤）**：混合榜每筆/每人可顯示語別標籤（§5）。
- **用途二（未來統計彈性）**：日後想做「各語別遊玩次數」「哪個語別最多人學」等統計，
  資料從第一天就在，不用回頭補。
- 寫入規則：`POST /api/scores` body 加 `lang_code`（前端帶當次選擇的語別）；後端驗證存在於
  `languages` 表，**未帶或無效時 fallback `'trv'`**——舊快取前端不帶參數也照常運作，向下相容。
- `DEFAULT 'trv'` 讓 Kacaw 等既有紀錄自動標注太魯閣語，**不動任何一筆資料**。
- 注意：`lang_code` 只是標注，**不參與**解鎖進度判定（§4）與榜面聚合邏輯（§5），
  所以不需要為它加索引（現階段查詢都不以它篩選）。

---

## 2. 資料管線 —— 改以 klokah 結構化 XML 端點為準（v2 更新，已實測）

**不再需要人工提供 CSV。** 實測發現 klokah 有結構化 XML 端點，管線可寫成
「**輸入 dialectId → 抓 XML → 產出該語別種子資料**」全自動，新增語別零人工。

### 端點（皆已實測）

| 端點 | 內容 |
|---|---|
| `https://klokah.tw/competition/vocabulary/xml/{dialectId}/vocabulary.xml` | 該語別完整詞表（實測 33 太魯閣、15 都達語皆 200） |
| `https://klokah.tw/competition/vocabulary/xml/dialectView.xml` | 42 語別清單（dialectId + 中文名），可用來自動填 `languages` 表對照 |
| `https://web.klokah.tw/vocabulary/audio/word/{dialectId}/{code}.wav` | 音檔（照舊不變） |

### vocabulary.xml 每筆 `<vocabulary>` 欄位 → 我們的欄位對應

| XML 欄位 | 意義 | 對應 |
|---|---|---|
| `dialectId` | 語別 id | 驗證用 |
| `class` + `order` | 組合成詞條編號 `code`（如 `01-01`） | 圖/音檔 URL 的 `{code}`、內部對齊 key |
| `image` | **圖片編號直接給** | `image_path`（不用再自己推算） |
| `sound` | `1` = 有音檔旗標 | 決定 `audio_path` 是否寫入（可省全量 HEAD 掃描，抽樣驗證即可） |
| `level` | 字母碼：`E`=初級1、`M`=中級2、`H`=高級3、`MH`=中高級4 | `level`（實測分布 256/237/299/302，與現有資料吻合） |
| `chinese` | 中文釋義 | `chinese` |
| `aboriginal` | 族語拼字（**唯一逐語別不同的欄位**） | `word`（同時作為 `hint`，照既有慣例） |
| `memo` | 備註 | 視內容決定是否入庫 |

已證實的關鍵事實：**全語別共用同一套 1094 詞框架**（同中文釋義、同圖片編號），只有
`aboriginal` 拼字不同；其中含 2 筆「無此詞彙」佔位，照舊跳過（太魯閣 1092 = 1094 − 2）。

### 管線改寫方向

```
python fetch_vocab.py --dialect-id 13 --lang-code tay \
    --out-json vocab/tay_final.json --out-seed backend/seeds/tay.js
```

1. 以 XML 抓取取代 `parse_vocab.py` 的 CSV 解析（可改寫原檔或另立 `fetch_vocab.py`）；
   輸出 seed 的變數名 `TRUKU_SEED` 改為 `module.exports`（語別無關）。
2. `check_audio.py`/`patch_audio.py` 的角色縮小：`sound` 旗標直接決定音檔有無，
   保留抽樣 HEAD 驗證（每語別抽 20–30 筆）確認旗標可信；缺音檔的詞在聽聲辨字模式
   本來就會被跳過，機制已存在。
3. 保留每語別的 `*_final.json` 產物，方便重跑與 diff。

風險備註（試點時要驗證）：
- 「無此詞彙」佔位的判斷方式與筆數逐語別不同（實測：33 太魯閣/15 都達各 2 筆、
  2 秀姑巒阿美 0 筆）——各語別有效筆數不一樣，前端不可假設固定數量。
- `sound=1` 旗標與音檔實際存在性的一致度（抽樣 HEAD 驗證）。
- `level` 字母碼是否有 E/M/H/MH 以外的值（parse 時遇未知值要報錯而非默默吃掉）。
- **授權註記（照舊保留）**：資料來源為族語E樂園（klokah），正式使用前建議取得其同意。

---

## 2.5 輸入正規化與答案判定【新增工作項，v2】

> **定位**：此工作項**同時修復太魯閣語既有 bug**（斜線多讀音詞），且是**阿美語試點的
> 前置必要條件**（秀姑巒阿美語 547/1094 詞含特殊字元）。純前端判定邏輯、向下相容，
> 可獨立於多語別其他改動先行部署。

### 掃描結果（秀姑巒阿美語 `aboriginal` 欄位，547/1094 詞含特殊字元）

| 字元 | 出現 | 性質 | 處理原則 |
|---|---|---|---|
| `ʼ` U+02BC（MODIFIER LETTER APOSTROPHE） | 266 | **標準鍵盤打不出來** | 判定時 U+02BC / U+2019 / U+0027 三種撇號**視為同一字元**：顯示保留原字，比對前雙方（目標與輸入）都正規化 |
| `’` U+2019（RIGHT SINGLE QUOTATION MARK） | 19 | 同上 | 同上 |
| `^` | 225 | Shift+6 打得出，屬正式書寫系統的一部分 | **保留必打**；「寬鬆模式」（判定時忽略 `^`）列為未來選項【需使用者拍板才做】 |
| `/` | 187 | 「兩種說法皆可」分隔符（如 `polo’/mo^tep`），**不是詞的一部分** | 拆成多個可接受答案，**任一個打對就算對**；顯示時可並列原字串 |
| `:` | 8 | 逐一檢視 | 屬正式拼寫（長音等）則保留必打；屬備註滲入則管線清理 |
| `-` | 23 | 打得出 | 保留必打（多為重疊詞連字號） |
| `…`、括號、句點、逗號 | 各少量 | 多屬備註滲入詞欄位的資料品質問題 | **管線（§2）清理**：fetch 時掃描非白名單字元、輸出逐語別報表、人工檢視後決定清或留，不讓髒字進 DB |

**太魯閣語現況也中招**：現有資料同樣有斜線多讀音詞（如 07-25 `supug / sabal`、
07-26 `kjiyu / ssaya`）。現行程式載詞時 `r.word.trim().split(/\s+/)`（1574 行）以空白切詞，
**斜線會變成一個玩家必須打出來的「字」**——這是既有潛在缺陷，本工作項一併修復，
修法必須同時適用單語別現況（向下相容）。

### 實作設計（hunter-truku-v2.html）

現況：`normalizeInput(s)`（1823 行）只做 `trim + 空白折疊 + toLowerCase`；
命中比對散在 1794（逐字上色）、1832、1836 行，各自 `toLowerCase()`。

1. **新增 `normalizeAnswer(s)` 正規化層**：在 `normalizeInput` 基礎上統一撇號
   （U+02BC、U+2019 → U+0027）；目標字串與玩家輸入**都過同一函式**再比對，
   既有各比對點收斂到這一層。函式內預留「寬鬆模式」掛勾點（如忽略 `^`），但先不啟用。
2. **多讀音拆解**：載入詞彙時把 `word` 以 `/` 切成 `variants` 陣列（各段 trim），
   判定改為「任一 variant 打對即命中」；提示泡泡/答對彩帶顯示保留原字串並列。
   沒有斜線的詞 variants 長度為 1，行為與現在完全相同（向下相容）。
3. **聽聲辨字模式**同樣走 variants 判定（音檔通常只唸其中一種讀法，任一 variant 算對尤其必要）。
4. **資料端配合**（§2 管線）：fetch 時掃描非白名單字元 → 逐語別報表 → 備註滲入類清理，
   正式拼寫類（`^`、`-`、撇號、`/`）原樣入庫，交給前端正規化層處理。
5. **驗收**：太魯閣語 07-25/07-26 等斜線詞可用任一讀法過關；
   阿美語含 U+02BC 詞可用一般鍵盤撇號 `'` 打對；`^` 詞必須打 `^` 才算對；
   無特殊字元的詞行為與現在完全一致。

### `/api/vocabulary` 加 `lang`，預設值向下相容

```
GET /api/vocabulary?lang=trv&level=1
```

- `lang` 未帶時 **預設 `'trv'`**：舊前端（含快取中的 HTML）、admin.html 不改也照常運作，向下相容。
- SQL 加 `AND lang_code = ?`，用 §1.1 的複合索引。
- `GET /api/vocabulary/:id` 不用改（id 全域唯一）。
- `POST/PUT /api/vocabulary` body 加選填 `lang_code`（預設 `'trv'`）。
- 圖/音上傳與刪除 API：`WHERE word=?` → `WHERE word=? AND lang_code=?`（或改用 id，見 §1.1）。
- 新增 `GET /api/languages`：回傳 `languages` 表（active=1），給前端語別選擇畫面用，之後加語別不用改前端。
- `POST /api/scores`：body 加選填 `lang_code`（前端帶當次語別；後端對照 `languages` 驗證，
  未帶/無效 fallback `'trv'`），寫入 `scores.lang_code`（§1.3）。
- **auth 系列 API（register/login/me）完全不用動**——語別不是帳號屬性（定案 #1）。
- **`getUnlockedLevel()` 完全不用動**（§4）。

---

## 4. 玩家進度【已定案：不分語別，跨語別共用一條解鎖線】

**定案內容**：進度是帳號層級、跨語別共用。玩太魯閣語解鎖到 Level 3，切到任何語別
也直接能玩 Level 3；換語別不重爬、進度不受語別切換影響。

**明確結論：`getUnlockedLevel(playerId)` 維持現狀，一行都不用改。**

```js
// 現行實作原封不動（backend/server.js）：
// cleared=1 的最高 level + 1，單一事實來源是 scores 表，不看語別
'SELECT COALESCE(MAX(level), 0) AS maxLevel FROM scores WHERE player_id = ? AND cleared = 1'
```

設計上的自覺（使用者已拍板接受，非待決）：關卡解鎖代表的是「打字/遊戲熟練度」而非
「單一語別的詞彙量」——玩家可以用熟悉的語別解鎖高關卡後，直接用高關卡玩不熟的語別。
這是有意的取捨（換語別不懲罰玩家），不做防範。

---

## 5. 排行榜【已定案：混合榜 + 語別標籤】

**定案內容**：所有語別玩家同一個榜，聚合邏輯（每人每關最佳分加總，不看語別）**維持現狀**，
只多顯示語別標籤。既有分數靠 `DEFAULT 'trv'` 自動標注太魯閣語，**Kacaw 等真實紀錄一筆不動**。

### `/api/leaderboard`（總榜）修改示意

總榜是「每人一列」的聚合，但一個玩家可能玩過多個語別，一列只能標一個 →
建議標注**該玩家最近一筆分數的語別**（語意=「目前在玩」，實作最簡單）：

```sql
SELECT p.display_name AS player,
       SUM(best.score) AS score,
       COUNT(DISTINCT best.level) AS levels_played,
       (SELECT s2.lang_code FROM scores s2
         WHERE s2.player_id = best.player_id
         ORDER BY s2.id DESC LIMIT 1) AS lang      -- ★ 唯一新增：最近遊玩的語別
FROM (
  SELECT player_id, level, MAX(score) AS score
  FROM scores WHERE player_id IS NOT NULL
  GROUP BY player_id, level
) best
JOIN players p ON p.id = best.player_id
GROUP BY best.player_id
ORDER BY score DESC
LIMIT ?
```

聚合邏輯一字不動，只加一個相關子查詢欄位。（若嫌子查詢，也可改標「筆數最多的語別」，
但 SQL 較繁瑣、語意差異對玩家無感，建議就用最近一筆。）

### `/api/leaderboard/top3?level=`（關卡榜）修改示意

關卡榜每列就是一筆分數，直接多 SELECT 一欄（此 API 含舊匿名分數、本來就不 JOIN players）：

```sql
SELECT player, score, kills, accuracy, lang_code
FROM scores WHERE level = ? ORDER BY score DESC LIMIT 3
```

- 前端榜面在玩家名旁加小標籤顯示語別（用 `/api/languages` 對照出 `name_zh`/`name_native`），
  標籤樣式屬小排版範疇。

---

## 6. 前端【已定案：登入後選語別，可隨時切換】

### 登入後流程

```
authScreen（登入/註冊，不動）
   │ 登入成功
   ↓
langScreen（★新畫面：語別選擇，每次登入都經過）
   │ 選單資料：GET /api/languages（不寫死清單）
   │ localStorage('hunter_lang') 記住上次選擇 → 預設高亮，可一鍵「繼續上次語別」
   │ 選定 → 寫回 localStorage → 純前端狀態，無需呼叫任何綁定 API
   ↓
titleScreen（右上/角落加「切換語別」入口 → 回 langScreen 重選）
```

- `#langScreen` 為新增畫面，**比照現有 `#authScreen` → `#titleScreen` 的切換模式**
  （同一套 display 切換，不引入新機制）。畫面外觀/排版屬小排版範疇，DOM id 與切換函式介面由小工程定義後交接。
- 語別是純前端 session 狀態（`G.lang` + localStorage），伺服器不記錄「玩家目前語別」；
  伺服器唯一收到語別的時機是送分（`POST /api/scores` 的 `lang_code`，§1.3）。
- **切換限制**：只能在標題畫面/語別畫面切換，**遊戲進行中不可換**（避免 mid-game 換詞庫的狀態問題）。

### 切換語別時要重載什麼

| 項目 | 動作 |
|---|---|
| 全域狀態 | `G.lang = { code, nameZh, nameNative }`（從 `/api/languages` 回應挑出所選項） |
| `VOCAB_CACHE` | 切換時**整包清空重抓**（簡單優先；每語別約千筆 JSON 很小）。或 key 改 `` `${lang}:${level}` `` 保留跨語別快取——二選一，建議先用清空 |
| `loadVocabulary(level)` | 帶 `&lang=${G.lang.code}` |
| 解鎖進度 | **不動**（§4，進度跨語別共用），關卡鎖 UI 不需重算 |
| 排行榜 | 混合榜不分語別（§5），不需因切換重抓；榜面本來就含各語別標籤 |
| UI 文案 | 依 `G.lang` 更新 §7 各處 |
| 送分 | `POST /api/scores` 帶 `lang_code: G.lang.code` |
| `FALLBACK_PREY` | 只有太魯閣語有內建 fallback；非 trv 語別 API 掛掉時顯示「連線失敗」而非誤用太魯閣詞（fallback 是離線保險，不必每語別都做） |
| localStorage | `hunter_lang` 存代碼，下次登入當預設；查無此代碼（語別被下架）時退回選擇畫面 |

### 7. UI 寫死「太魯閣語」文案盤點（hunter-truku-v2.html）

| 行號（現行檔案） | 位置 | 內容 | 改法 |
|---|---|---|---|
| 901 | 標題畫面副標 `.title-sub` | `太魯閣語學習 · TRUKU VOCABULARY` | 改由 JS 依當前語別填入 `{name_zh}學習 · {NAME_NATIVE} VOCABULARY` |
| 963 | 遊戲中 HUD `.game-sub-hud` | `太魯閣語 · TRUKU LANGUAGE` | 同上 |
| 1014 | 答對彩帶預設分類 `#ribbonCategory` | `太魯閣語詞彙` | 同上（HTML 預設值 + JS 動態） |
| 1888 | `showCorrectBanner()` | `` `太魯閣語・${prey.category}` : '太魯閣語詞彙' `` | 改 `` `${G.lang.nameZh}・${category}` `` |
| 45 | `<title>` | `Hunter Typer: Forest Chase`（無語別，不用改） | — |
| — | 檔名 `hunter-truku-v2.html` 本身含 truku | 不影響功能；正式站路由是 Nginx 決定，可不改 | 低優先 |

另外非文案但語別相關：`FALLBACK_PREY`（1410 起，太魯閣語內建詞）、獵人角色圖 `v2-hunter-truku-h2.png`
（各族服飾不同，**已定案後置**，屬小畫家/小排版範疇，見待決事項 #6）。
admin.html 需加語別下拉篩選（現在 `?active=all` 全撈，1092×N 筆會越來越難管）。

---

## 8. 分階段實施順序（依定案重排）

> 標注 🟢 = **現在就可以動工、不影響線上**（本機開發測試即可展開；要部署時仍照部署安全規則走）。

**Phase 1 — 資料層與 API 向下相容層** 🟢 現在就可動工
1. `vocabulary.lang_code`（DEFAULT 'trv'）+ 複合索引 + `languages` 表（先只塞 trv 一筆）
2. `scores.lang_code`（DEFAULT 'trv'，§1.3）——`players` 表不動
3. 種子邏輯改逐語別、`vocab_seed.js` 搬到 `seeds/trv.js`
4. `/api/vocabulary` 加 `lang` 參數（預設 trv）、上傳 API 改 `word+lang_code`（或 id）、
   `GET /api/languages`、`POST /api/scores` 收選填 `lang_code`（未帶 fallback 'trv'）
5. 驗收：不帶 lang 的一切請求行為與現在完全一致；正式玩家資料 0 變動
   ※ 部署照安全規則：備份、只動 schema 不動資料、scores 前後筆數比對

**Phase 2 — 答案判定正規化層（§2.5）** 🟢 現在就可動工，**可獨立先行部署**
6. `normalizeAnswer()`（撇號統一 U+02BC/U+2019/U+0027）、比對點收斂、寬鬆模式掛勾（不啟用）
7. `word` 以 `/` 拆 `variants`，任一打對即命中（含聽聲辨字模式）；顯示保留原字並列
8. 驗收：太魯閣語 07-25/07-26 斜線詞任一讀法過關；無特殊字元詞行為與現在完全一致
   ※ 這是**太魯閣語既有 bug 修復**，不依賴 Phase 1，驗證後可單獨部署上線；
   同時是 Phase 4 阿美語試點的**前置必要條件**

**Phase 3 — 前端語別選擇/切換** 🟢 現在就可動工（本機開發；**部署需在 Phase 1 之後**）
9. `#langScreen` 新畫面 + 登入後流程、標題畫面「切換語別」入口、localStorage 預設
   （畫面外觀交小排版，DOM 介面先講好）
10. `G.lang` 全域狀態、`loadVocabulary` 帶 lang、切換時清 `VOCAB_CACHE`、送分帶 `lang_code`
11. UI 文案動態化（§7 全清）、`FALLBACK_PREY` 限 trv 的保護
12. 排行榜語別標籤：`/api/leaderboard` 加最近語別欄、top3 加 `lang_code` 欄（§5 SQL）、前端榜面顯示
13. 本機全流程實測：登入→選語別→玩→上榜有標籤；切換語別→詞彙換、進度不變；
    遊戲中無法切換；只有 trv 一個語別時整體體驗與現在無異
    ※ 此階段部署後（只有 trv 一筆語別時）玩家看得到的變化：登入後多一個語別畫面
    （一鍵繼續）＋榜上多語別標籤——也可選擇「語別數 < 2 時自動跳過 langScreen」，體驗零變化

**Phase 4 — XML 自動化管線與秀姑巒阿美語試點（已定案 dialectId=2）**
14. 🟢 管線改寫為 XML 全自動抓取 + 特殊字元掃描報表（§2、§2.5 第 4 點；純本機腳本、
    端點公開，**現在就可動工並可實際試跑**）
15. `fetch_vocab.py --dialect-id 2 --lang-code ami-siwkolan` → `seeds/ami-siwkolan.js`
    （XML/音檔/對照已由 coordinator 實測通過，無其他前置）
16. 本機驗證：兩語別並存、`?lang=` 篩選正確、切換流暢、音檔抽測可播（sound 旗標一致度）、
    特殊字元詞可正常打對（§2.5 驗收項）、兩語別交替遊玩進度共用正確、榜面標籤正確
17. `languages` 表加第二筆（active=1 即上架）、部署（授權註記：正式上架前建議取得族語E樂園同意）
    ※ **部署前置**：Phase 1、2、3 都已上線

**Phase 5 — 規模化與加值（後置）**
18. 逐語別跑管線加 seed 檔（每加一個語別＝一支 PR，不碰他語資料；每語別先過特殊字元掃描報表）
19. （可選）語別專屬視覺（獵人族服，待決事項 #6）、「寬鬆模式」（忽略 `^`，需使用者拍板）、其他加值功能

依賴關係整理：Phase 1、2、3、14 的**開發**可並行展開（都不影響線上）；
**部署**順序：Phase 2 可隨時單獨上（trv bug 修復）；Phase 1 → Phase 3 → Phase 4。
試點語別已定案（秀姑巒阿美語），Phase 4 已無外部卡點。

---

## 附：待決事項（更新後）

| # | 事項 | 狀態 |
|---|---|---|
| 1 | 玩家進度分語別與否 | ✅ **已定案（2026-07-03）**：不分語別，跨語別共用一條解鎖線；帳號不綁語別，隨時可換 → 見文首與 §4 |
| 2 | 排行榜分榜與否 | ✅ **已定案（2026-07-03）**：混合榜 + 每筆分數記語別、榜上顯示標籤 → 見文首與 §5 |
| 3 | 語別選擇位置 | ✅ **已定案（2026-07-03）**：登入後選（每次登入經過語別畫面，localStorage 記上次選擇），標題畫面可隨時切換 → 見文首與 §6 |
| 4 | lang_code 命名 | ✅ **按原建議定案**：ISO 639-3 為主 + 方言後綴（`trv`、`tay-squliq`…）。使用者未表態，**若使用者反對再改**（改代碼只影響內部字串，越早定越省事） |
| 5 | 試點語別 | ✅ **已定案（2026-07-03）**：秀姑巒阿美語（dialectId=2，代碼建議 `ami-siwkolan`）。已實測 XML 200（1094 詞、0 筆無此詞彙）、音檔抽測 3/3、雙語對照正確 → 見文首與 §8 Phase 4。前置：§2.5 答案判定正規化層 |
| 6 | 獵人視覺隨語別換族服 | ⏸ **後置**（Phase 5 再議；牽動小畫家工作量，與功能架構解耦） |
| 7 | 答案判定「寬鬆模式」（判定時忽略 `^`） | ⏸ **未來選項，需使用者拍板才做**（§2.5）。`^` 是正式書寫系統的一部分，預設保留必打；正規化層已預留掛勾點，要開只是一個開關 |
