# Harness 制度總目錄（00-INDEX）

> 本資料夾是「族語射手 TRUKU WORD ARCHER」（原山林獵人 Hunter Typer）專案的**工作流防閉環迭代機制（Harness）**。
> 讀者是未來的執行模型（主要 Opus 4.8；若日後啟用 Sonnet / Haiku 亦適用）。
> 由 Fable 5 於 2026-07-03 建立，2026-07-05 由主對話模型 promote 到主專案根目錄並更新現況、新增 Agent 日誌協議（見 [`G2`](G2-promotion-addendum-20260705.md)）。
> 目的：把高階判斷力外化為**可肉眼比對、有明確判準、有正反例**的制度檔案，讓後續模型在框架下穩定自主產出。

## 這套制度怎麼用（30 秒版）

1. 每個 session 開場：先讀專案根目錄 [`CLAUDE.md`](../CLAUDE.md)（路由中心），它會告訴你去哪找細節。
2. 接到任務先問自己三件事，答案都在本資料夾：
   - **這件事該我（主對話）做，還是派 Subagent？** → 讀 [`C-model-dispatch.md`](C-model-dispatch.md)
   - **我怎麼判斷方向對不對 / 做完了沒 / 該不該停下問人？** → 讀 [`D-judgment-matrix.md`](D-judgment-matrix.md)
   - **我要派工，指令怎麼寫才不會出錯？** → 抄 [`E-delegation-templates.md`](E-delegation-templates.md)
3. 踩坑了 → 依 [`F-knowledge-iteration.md`](F-knowledge-iteration.md) 的格式寫進 [`LESSONS.md`](LESSONS.md)。
4. 你是某個專責 subagent（小畫家/小工程/小排版/小歌手/小蘋果）→ 完成工作後依 [`H-agent-journals.md`](H-agent-journals.md) 用第一人稱寫進 `journals/<你自己>.md`；開工前也可以先讀讀自己過去寫了什麼。
5. 想改這套制度本身 → 先讀 [`F-knowledge-iteration.md`](F-knowledge-iteration.md) 的「可自改 / 需先問人」清單。

## 檔案清單與狀態

| 代號 | 檔案 | 內容 | 誰能改 | 狀態 |
|---|---|---|---|---|
| A | [`A-diagnosis.md`](A-diagnosis.md) | Harness 漏水診斷書（前三痛點 + 阻斷方案 + 能力極限誠實條款） | 唯讀（歷史文件，勿改） | ✅ |
| B | [`../CLAUDE.md`](../CLAUDE.md) | 專案主入口 / 路由中心 | 需先問 User（事實節可自行同步） | ✅ 2026-07-05 已依現況重寫 |
| C | [`C-model-dispatch.md`](C-model-dispatch.md) | 模型調度與動態升降級守則 | 需先問 User | ✅ |
| D | [`D-judgment-matrix.md`](D-judgment-matrix.md) | 判斷力外化矩陣（停損 / 完成 / 熔斷 三張檢核表） | 需先問 User（文末促升註記除外） | ✅ |
| E | [`E-delegation-templates.md`](E-delegation-templates.md) | 標準化派工 Prompt 模板（搜尋 / 實作 / 重構 / 審查） | 可自行小幅優化 | ✅ |
| F | [`F-knowledge-iteration.md`](F-knowledge-iteration.md) | 知識迭代與反思協議（自改邊界 + 踩坑格式 + 精簡觸發 + 日誌協議定位） | 需先問 User | ✅ |
| G | [`G-handoff-letter.md`](G-handoff-letter.md) | 給未來 session 的交接信（3 件關鍵事 + 腐化預警） | 唯讀（歷史文件，勿改） | ✅ |
| G2 | [`G2-promotion-addendum-20260705.md`](G2-promotion-addendum-20260705.md) | Promote 完成 + 日誌協議新增的交接附錄 | 唯讀（歷史文件，勿改；再更新開 G3） | ✅ |
| H | [`H-agent-journals.md`](H-agent-journals.md) | Agent 第一人稱工作日誌協議（格式/位置/分工邊界） | 需先問 User | ✅ 2026-07-05 新增 |
| — | [`LESSONS.md`](LESSONS.md) | 踩坑紀錄簿（append-only，模型可自行追加） | 可自行追加，不可刪改他人紀錄 | ✅ L-001~L-014 |
| — | [`journals/`](journals/) | 5 位角色 agent 各自的第一人稱工作日誌 | 各 agent 可自行追加自己那份 | ✅ 2026-07-05 新增，已回溯補寫歷史 |
| — | [`appendix-recommended-hooks.md`](appendix-recommended-hooks.md) | 建議加裝的物理級 Hooks（User 目前選擇不裝，保留待命） | 需先問 User 才可套用 | ✅ |

## 核心設計原則（弱模型需要明確，強模型需要留白）

- **明確優先**：所有規則都給「量化判準 + 完美正例 + 典型反例」，禁止「保持高品質」這種自由心證詞彙。
- **主對話省 Context**：指揮官不下場做大批量讀檔 / 掃描 / 搜尋，一律派 Subagent，主對話只收精簡結論。
- **實作者不自驗**：驗收一律由 Fresh-Context Subagent 用 read-back / 實跑測試 完成。
- **同一件事最多兩輪**：重試上限硬性寫死，撞到就熔斷問人（見 D）。
- **物理 > 文字**：目前 User 選擇純文字規則，故本制度以「流程強制點」代替 Hooks；能力極限見 A 的誠實條款。
- **事實會過期，制度本身要抗腐化**：facts（關卡數/語別數/agent 名單）寫在 `CLAUDE.md` 且可自行同步；rules（判準/門檻/熔斷條件）需先問人才能改——這條分界是這套制度沒有腐化成「僵化教條」或「隨意漂移」的關鍵。
