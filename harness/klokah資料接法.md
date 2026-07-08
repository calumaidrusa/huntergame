# 如何連接原住民族語E樂園（klokah.tw）的族語資料

> 給接手 agent / 其他族語遊戲專案的技術配方。
> 「族語射手」的詞彙、圖卡、發音全部來自 **klokah.tw（原住民族語E樂園，原民會）** 的公開 XML 與媒體端點——我們不自造資料，是「抓 + 連」他們的。要做另一款族語遊戲，照這份 + `fetch_vocab.py` 就能自己接。

---

## 1. 資料來源端點

- **語別清單 XML**：`https://klokah.tw/competition/vocabulary/xml/dialectView.xml`
  （列出全部 42 個語別 + 每個語別的 **dialectId**）
- **某語別詞彙 XML**：`https://klokah.tw/competition/vocabulary/xml/{dialectId}/vocabulary.xml`
  （一支語別所有單詞：族語詞、中文、詞性、圖 code、有無音檔等）

## 2. 圖 / 音網址規則（「連接」的核心）

每個單詞的圖片與發音是**直接連到 klokah 的網址（hotlink，檔案留在他們伺服器）**：

| 媒體 | URL 樣板 | 重點 |
|---|---|---|
| **圖片** | `https://klokah.tw/competition/vocabulary/picture/{img_code}.jpg` | **全語別共用同一套圖**，URL **不含 dialectId**。code 用**底線**：`01_01` |
| **發音** | `https://web.klokah.tw/vocabulary/audio/word/{dialectId}/{code}.wav` | **含 dialectId**（每語別發音不同）。code 用**連字號**：`01-01` |

> 關鍵眉角：**圖是「語言無關」**（「一/one」的圖各語別共用一張）；**音是「逐語別」**（每族發音不同 → URL 帶 dialectId）。同一個詞 code，圖用 `01_01`（底線）、音用 `01-01`（連字號），別搞混。

## 3. dialectId 對照（部分，全部查 dialectView.xml）

`太魯閣語 trv=33`、`泰雅-賽考利克 tay-squliq=6`、`阿美-南勢 ami-nanshi=1`、`排灣-中排 pwn-central=25` … 共 42 個。完整對照存在 `backend/seeds/languages.js`（`lang_code ↔ dialect_id`）。

## 4. 產線（klokah → 遊戲資料）

腳本 `fetch_vocab.py`：抓 klokah XML → 解析 → 產出每筆 9 欄
`[族語詞, 中文, 英文, 分類, 分級, emoji, 提示, image_path, audio_path]`

- 用法：`python fetch_vocab.py --dialect-id 33 --lang-code trv`，或 `--all`（依 dialectView.xml 跑全部 42 語別）。
- klokah 沒圖的詞 → `image_path = null`；`sound=0` 的詞 → `audio_path = null`（前端遇 null 顯示占位 / 不播）。

## 5. 完整資料流

```
klokah XML/媒體  →  fetch_vocab.py 解析  →  seed 檔（每語別一支 backend/seeds/{lang_code}.js）
                 →  灌進資料庫 vocabulary 表  →  /api/vocabulary  →  前端渲染
                 （圖/音欄位存 klokah 網址，執行時瀏覽器直接向 klokah 抓）
```

vocabulary 表欄位：`word, chinese, english, category, level, emoji, hint, image_path, audio_path, lang_code`。

## 6. 注意事項

- **圖音是外連 klokah、非自存**：好處省空間；風險是「klokah 關站 / 改網址 / 擋 hotlink 就會壞」。要穩就自己下載存一份（但涉重製散布，需授權）。
- **版權 / 授權**：內容來源是原住民族語E樂園（原民會）。正式 / 商用 / 對外發布前**務必取得授權**，並在畫面標示來源（如「本網站之單詞以及單詞圖卡由原住民族語E樂園 製作」）。
- **音檔一定帶對的 dialectId**，否則抓到別族發音或 404；**圖 URL 不含 dialectId**，別硬塞。

---

*同層參考：`文化準則-太魯閣.md`、`小畫家工作流程.md`、`LESSONS.md`。*
