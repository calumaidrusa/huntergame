# 山林獵人 · Hunter Typer — v1 開發總結

> 記錄日期：2026-07-01
> 正式站：http://142.93.3.132/

## 這個版本做了什麼

從一個只有 26 個詞彙、3 個難度的原型，擴充成完整的 4 級難度、1092 個太魯閣語詞彙的學習遊戲，並串接外部圖片與音檔資源。

---

## 1. 詞彙資料來源與匯入

- 詞彙來源：使用者提供的 Excel/CSV 檔（`2026學習詞表-33太魯閣語.csv`），共 1092 個有效詞彙（原始 1094 筆，2 筆「無此詞彙」略過）
- 級別對應 CSV 原始「級別」欄位，分 4 級：
  | 級別 | 中文名稱 | 筆數 |
  |---|---|---|
  | 1 | 初級 | 256 |
  | 2 | 中級 | 237 |
  | 3 | 高級 | 297 |
  | 4 | 中高級 | 302 |
- 資料處理管線（可重複執行）：
  - `parse_vocab.py` — 解析 CSV，輸出 `truku_vocab_final.json` + `seed_data.js`
  - `patch_seed.py` — 套用圖片可用性檢查，缺圖設為 null
  - `patch_generated.py` — 補上 AI 生成圖片的路徑
  - `patch_audio.py` — 套用音檔可用性檢查，補上 audio_path
  - 產出的 `seed_data.js` 需手動組合成 `backend/vocab_seed.js`（含檔頭註解 + `module.exports`）

## 2. 外部素材串接（klokah.tw 族語 E 樂園）

### 圖片
- URL 格式：`https://klokah.tw/competition/vocabulary/picture/{編號}.jpg`（編號如 `01_01`，對應 CSV 的 `01-01`）
- 實測結果：1092 筆中只有 **600 筆（55%）有圖**，其餘 492 筆多為抽象詞/文法詞/動詞，沒有對應教學插圖
- 缺圖詞彙：`image_path` 存 `null`，前端會自動 fallback 顯示 🎯 emoji

### 音檔
- URL 格式：`https://web.klokah.tw/vocabulary/audio/word/33/{編號}.wav`（`33` 是太魯閣語在 klokah.tw 的 dialectId，透過反查 `dialectView.xml` 找到）
- 是從族語 E 樂園「learn.php」單字學習頁的 `learn.js` 原始碼中找到 audio URL 組成邏輯而發現的
- 實測結果：**1092 筆全部都有音檔（100%）**
- 前端本來就有 `playWordAudio()` 邏輯（原本是為「聽聲辨字」模式寫的），這次資料補齊後，一般模式出題時也會自動播放發音，**完全沒改前端程式碼**

### AI 生成圖片（補缺圖用）
- 因為 klokah.tw 圖片缺口達 45%，原本計畫用 GPT/AI 補圖
- 嘗試過瀏覽器操作 ChatGPT 網頁版生成圖片 → **太慢且不穩定**（單張測試等了近 9 分鐘還沒生成完成），放棄此方式
- 改用 OpenAI Image API（`gpt-image-1`）搭配使用者提供的 API Key，寫 Python 腳本直接呼叫：
  - 風格：一開始用寫實照片風，使用者反饋「好醜」，改成**可愛扁平向量插畫風**（cartoon flat vector illustration）
  - 單張生成約 15-20 秒，1024×1024 原圖約 1.2MB，用 Pillow 壓縮成 512×512 JPEG 後約 20-25KB
  - 測試批次進行到一半時遇到 **OpenAI 帳單額度上限**（billing_hard_limit_reached），目前只成功生成 2 張：
    - `asu`（船隻）→ `/images/09_21.jpg`
    - `lihaw`（鏡子）→ `/images/09_46.jpg`
  - 剩餘 490 張缺圖詞彙待額度恢復後繼續生成
  - 生成腳本：`gen_batch.py`（支援 `test`/`all` 兩種模式，會自動跳過已完成項目，可隨時中斷續跑）

## 3. 遊戲前端修改（`hunter-truku-v2.html`）

- `LEVEL_CONFIG` 從 3 級擴充為 4 級，難度遞增（時間、回合數、HP、扣血量都隨級別提高）
- 標題畫面新增第 4 個難度按鈕（⛰️ 中高級 / EXTREME）
- 排行榜新增 LV4 分頁
- 圖片顯示加上 `onerror` fallback：圖片載入失敗（含網路問題）會自動退回 emoji 顯示，不會出現破圖圖示
- **修掉一個既有 bug**：分數上傳 API 原本寫死正式環境 IP（`http://142.93.3.132/api`），跟其他 API 呼叫（相對路徑同源）不一致，會導致本機測試污染正式排行榜。已改成統一用相對路徑
- `hint` 欄位語意修正：原本一度誤用 CSV 內部編號當 hint 顯示給玩家（如「(34-37)」），修正為顯示詞彙本身，符合原始設計慣例

## 4. 後端修改（`backend/server.js`）

- 詞彙表 `INSERT` 種子資料從硬編碼的 26 筆，改為從獨立檔案 `backend/vocab_seed.js`（1092 筆，9 欄位含 audio_path）`require` 載入
- 移除舊的、指向已不存在詞彙的圖片路徑 migration 區塊（已作廢）
- `PORT` / `DB_PATH` / `IMG_DIR` / `AUDIO_DIR` 全部改為可用環境變數覆寫（有預設值，正式環境行為完全不變），讓本機測試變得可行
- 新增 `SERVE_STATIC` 環境變數開關：設定後會額外提供靜態檔案服務（模擬 Nginx 行為），只在本機測試時使用，正式環境不會設定此變數所以不受影響

## 5. 本機測試環境搭建

- 原本系統只有 Node v24（太新），`better-sqlite3` 沒有預編譯版本，且沒裝 Visual Studio Build Tools 無法本地編譯
- 改抓官方 Node 20 LTS 免安裝版（zip），版本跟正式伺服器的 Node 20.20.2 一致
- `.claude/launch.json` 新增 `hunter-backend-local` 設定，透過 `backend/start-local-test.js` 包裝腳本設定本機測試專用的環境變數（DB 路徑、圖片/音檔目錄都指向 `.localtest/`，不會污染正式資料）
- 完整端到端測試：啟動本機後端 → 載入 1092 筆真實資料 → 實際玩一輪（輸入答案、命中判定、記分、排行榜）全部通過

## 6. 正式環境部署

- 部署前務必：
  1. **備份 `hunter.db`**（每次部署都做）
  2. 確認 `scores` 表（真實玩家分數，目前有 2 筆，其中 `Kacaw` 玩家 1460 分）**絕對不能被清除或覆蓋**
  3. 只清空 `vocabulary` 表讓新種子資料生效，其餘表格不動
- 部署方式：SSH 金鑰登入（透過 DigitalOcean Web Console 手動加入公鑰到 `~/.ssh/authorized_keys`，因為原本沒有設定 SSH 存取）
- 已完成兩次部署：
  1. 第一次：1092 筆詞彙 + 4 級難度 + 2 張 AI 生成圖片
  2. 第二次：補上全部 1092 筆的音檔連結
- 每次部署後都驗證：API health check、詞彙筆數與級別分布、`scores` 表筆數與內容不變、實際圖片/音檔可存取

---

## 已知限制 / 待辦事項

- [ ] 492 個詞彙仍缺圖片（目前顯示 🎯 emoji 佔位），等 OpenAI 額度恢復後用 `gen_batch.py all` 繼續生成
- [ ] `public/images/` 目前混雜舊的 26 個詞彙圖（原型時期）與新生成的 2 張，之後可以考慮清理未使用的舊圖
- [ ] 本機測試用的 `IMG_DIR`/`AUDIO_DIR` 環境變數目前指向 `.localtest/`，跟實際存放圖片的 `public/images/` 不同路徑，如果之後要在本機測試「管理面板上傳圖片」功能需留意這個路徑落差
- [ ] `multer@1.4.5-lts.2` 有已知安全性漏洞警告（npm install 時提示），建議未來找時間升級到 2.x

## 檔案清單（本次新增的工具腳本）

```
01-Game/
├── CHANGELOG_v1.md          ← 本文件
├── parse_vocab.py           ← CSV 解析（詞彙、級別、圖片URL）
├── patch_seed.py            ← 套用圖片可用性檢查
├── patch_generated.py       ← 補上 AI 生成圖片路徑
├── patch_audio.py           ← 套用音檔並補上 audio_path
├── check_audio.py           ← 音檔可用性批次檢查
├── gen_image_test.py        ← 單張圖片生成測試
├── gen_batch.py             ← 批次生成圖片（test/all 模式）
├── truku_vocab_final.json   ← 完整詞彙資料（含級別、圖片、音檔路徑）
├── image_check_results.json ← 圖片可用性檢查結果快取
├── audio_check_results.json ← 音檔可用性檢查結果快取
├── image_gen_progress.json  ← AI 圖片生成進度記錄
├── .env                     ← OpenAI API Key（已 gitignore）
├── .localtools/             ← 本機測試用 Node 20（已 gitignore）
├── .localtest/              ← 本機測試用資料庫與素材目錄（已 gitignore）
└── backend/
    ├── vocab_seed.js         ← 1092 筆詞彙種子資料
    └── start-local-test.js   ← 本機測試啟動包裝腳本
```
