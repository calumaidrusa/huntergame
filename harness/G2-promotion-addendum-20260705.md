# G2. Promote 完成 + 日誌協議新增 —— 交接信附錄

> 依 [`F`](F-knowledge-iteration.md) 第 1 節：[`G`](G-handoff-letter.md) 是唯讀歷史文件，不覆蓋原文，更新另開本檔。
> 撰寫：主對話模型（Opus 4.8）· 2026-07-05 · 觸發：User 提問「團隊工作日誌工作流有設計了嗎」→「Harness 也要運作進來喔」+「請每個 agent 寫自己的工作日誌，用第一人稱視角」。

---

## 這次做了什麼

### 1. Promote：把 Harness 從 worktree 搬進主專案根目錄
`G` 事①警告的事情，確實發生了——Harness 建好兩天，一直躺在 worktree `claude/reverent-cartwright-88659d`，主專案 `C:\Users\asd81\Documents\Claude\01-Game` 完全沒有 `CLAUDE.md`/`harness/`。已補上 [`LESSONS.md`](LESSONS.md) 的 L-009。

本次動作：
- 複製 `harness/A-diagnosis.md`、`harness/G-handoff-letter.md`、`harness/appendix-recommended-hooks.md`、`harness/C-model-dispatch.md`、`harness/E-delegation-templates.md` 到主專案，**內容逐字不改**（維持它們原本的權限等級：唯讀歷史 / 可小幅優化）。
- `harness/D-judgment-matrix.md` 複製後**在文末附加「促升註記」區塊**，標記 2026-07-03 舉例數字（1092 詞/四難度）已過期，不改動原文規則本身，只提醒去查 `CLAUDE.md` 現況節。
- `harness/F-knowledge-iteration.md` 複製後**新增第 5 節「分工日誌協議」**（見下）。
- `harness/LESSONS.md` 複製後**新增 L-009 至 L-014**，都是這幾天實際運作中踩到的真坑（不是憑空補的）。
- `harness/00-INDEX.md` 更新，加入 `H-agent-journals.md` 與本附錄的條目。
- **`CLAUDE.md` 整份重寫**（不是複製舊版）：2026-07-03 的版本已經嚴重過期——它寫「4 個難度、1092 詞」「3 個 agent」「3 張表 schema」，但現在是「五玩法關卡、42 語別、45,760+ 詞」「5 個 agent（含小歌手、小蘋果）」「帳號+languages 表+lang_code 欄位」「桌機+手機雙版本+裝置路由 index.html」。照 `CLAUDE.md` 的自改權限（事實可自行同步），已依當下真實狀態重寫。

### 2. 新增：Agent 第一人稱工作日誌協議
User 明確要求「每個 agent 寫自己的工作日誌，用第一人稱視角」。新增 [`H-agent-journals.md`](H-agent-journals.md) 定義協議，並：
- 建立 `harness/journals/` 目錄，5 個角色各一份日誌檔（`xiaohuajia.md`/`xiaogongcheng.md`/`xiaopaiban.md`/`xiaogeshou.md`/`xiaopingguo.md`）。
- 每份日誌都**用第一人稱回溯補寫**了這幾個月已知的重大工作（依 memory 與 DEVLOG 交叉還原，盡量貼近該角色實際會有的判斷與語氣）。
- 每個 `.claude/agents/<agent>.md` 定義檔尾端，都加了一段「完成工作後記得寫日誌」的指示。

---

## 給下一個 session 的提醒（沿用 G 原信的精神，寫給未來的模型跟 User）

### 這次沒做、刻意留白的事
- **5 個 agent 定義檔本身內文還有很多過期事實**（4 難度/1092 詞/舊 schema 這類敘述散落在 `xiaohuajia.md`/`xiaogongcheng.md`/`xiaopaiban.md` 內文），這次**只加了日誌指示，沒有把整份定義檔重寫**——那是更大的一次任務，範圍超出這次「promote + 日誌」的請求，故意不夾帶，避免範圍蔓延（見 harness/D 表1 停損信號 #3）。若之後要做，建議另開一次任務，並先跟 User 確認「除了加日誌，要不要順便把整份定義檔的事實也同步到現況」。
- **Hooks 仍未裝**（`appendix-recommended-hooks.md` 依然是待命狀態）——這次沒有改變這件事，只是把制度本身搬進主專案，物理護欄的決定權仍在 User。

### 日誌協議能不能撐住，取決於一件事
`H` 檔第 4 節要求每個 agent 定義檔都提醒「完成後寫日誌」，但**沒有任何物理機制強制執行**——跟整套 Harness 一樣，這是文字約定。如果之後叫用 agent 時，指揮官（主對話）沒有在派工結尾提醒「記得寫日誌」，這個協議大概率會被悄悄遺忘（正是 `G` 原信講的「腐化方式」之一：規則有寫，但沒人執行）。**建議指揮官在每次 agent 完成回報後，順手確認一句「有沒有寫日誌」**，直到這變成肌肉記憶。

---

## 未竟事項
- （若後續 session 因故未完成本次收尾的某一步，請在此追加，不要覆蓋上面已完成的記錄。）
