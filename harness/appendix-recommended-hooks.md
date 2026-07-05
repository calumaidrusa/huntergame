# 附錄：建議加裝的物理級護欄（Hooks + 權限收斂）

> **狀態：護欄 A/B/C 仍待命未套用**（User 當初選擇「只用文字規則」）；**護欄 D 已於 2026-07-05 套用**（User 明確要求「工作日誌怎麼強制執行」後，選擇「軟提醒＋中度」方案），見第 4 節。
> 想啟用 A/B/C 時：可用 `/update-config` 技能或請 `claude-code-guide` 協助，**套用前務必用官方文件核對當前 hooks schema**（欄位名可能隨版本微調，勿照抄未驗證）。改 `settings.json` 前先備份 `.bak`。
> 為什麼值得裝：見 [`G`](G-handoff-letter.md) 事②——這是把「文字勸阻」升級成「物理阻擋」的唯一手段。

---

## 1. 三道最該裝的 PreToolUse 護欄（依價值排序）

### 護欄 A：擋住對 `scores` 表的破壞性寫入（最高價值，守不可逆的真實資料）
- **目的**：任何 Bash/PowerShell 指令若含 `DROP TABLE scores` / `DELETE FROM scores` / `UPDATE scores`（或 sqlite 對 scores 的寫入），直接封鎖。
- **邏輯（虛擬碼，實作成一支腳本）**：
  ```
  讀 stdin 的 tool_input.command
  若比對到 /(drop\s+table|delete\s+from|update|truncate)\s+scores/i
     → 輸出警告到 stderr，exit 2（阻擋）
  否則 exit 0（放行）
  ```
- **掛法（settings.json，示意）**：
  ```json
  {
    "hooks": {
      "PreToolUse": [
        { "matcher": "Bash",
          "hooks": [ { "type": "command", "command": "<擋 scores 的腳本路徑>" } ] }
      ]
    }
  }
  ```

### 護欄 B：擋住密鑰外洩（守 `.env` / 金鑰）
- **目的**：封鎖會把 `.env`、`*.key`、`~/.ssh/hunter_deploy` 內容 `cat`/`echo`/送往外部（curl/scp 到非預期主機）的指令；封鎖把 `OPENAI_API_KEY` 寫進非 `.env` 檔的指令。
- **邏輯**：比對 command 是否同時出現 (`.env`|`.key`|`hunter_deploy`|`OPENAI_API_KEY`) 與 (`cat`|`echo`|`curl`|`>`|外部 host) → exit 2。

### 護欄 C：部署前強制備份檢查
- **目的**：偵測到「部署 / 對正式站 142.93.3.132 操作 hunter.db」的指令時，若前面沒有出現 `hunter.db.backup-` 備份動作 → 阻擋並提示先備份。
- **註**：此護欄較難完美偵測「是否已備份」，退而求其次可做成 **PreToolUse 提示（不 exit 2）**，強制模型確認備份已完成。

> 補充：也可加一道 **PostToolUse / Stop 提醒**，在 session 結束時提示「若動過 harness 檔，記得依 [`F`](F-knowledge-iteration.md) 更新 LESSONS」。

---

## 2. 權限清單收斂建議（取代目前 84 條碎裂的 allow）

**現況問題**（見 [`A`](A-diagnosis.md) 痛點 #3）：`.claude/settings.local.json` 的 allow 是 84 條一次性超specific 條目，同指令因引號不同被重複加入，完全無法當白名單用，也沒有 `deny`。

**建議結構（示意，套用前依實際需要調整）**：
```json
{
  "permissions": {
    "allow": [
      "Read(//c/Users/asd81/Documents/Claude/01-Game/**)",
      "Bash(<localtools node 路徑> *)",
      "Bash(python3 *)",
      "Bash(git *)",
      "Bash(node --check *)",
      "Bash(cp * *)",
      "WebFetch(domain:klokah.tw)",
      "WebFetch(domain:web.klokah.tw)",
      "WebFetch(domain:github.com)"
    ],
    "deny": [
      "Bash(*DROP TABLE scores*)",
      "Bash(*DELETE FROM scores*)",
      "Read(//c/Users/asd81/Documents/Claude/01-Game/.env)",
      "Read(//c/Users/asd81/.ssh/**)"
    ]
  }
}
```

**收斂原則**：
- ⚠️ **路徑格式**：上面的 `Read(//c/Users/...)` 是 **Claude Code permission 專用的 glob 格式**（正斜線、`//c/` 前綴），**跟 shell 指令裡的 Windows 路徑（`C:\Users\...`）不是同一種寫法**——不要把它當 shell 路徑貼進 Bash/PowerShell。維持與現有 `settings.local.json` 既有條目相同的 glob 格式即可。
- 用**萬用字元收攏**同類指令（例如所有 `python3 *` 一條搞定），取代逐條列舉。
- 加 `deny` 作為第二層物理防線（deny 通常優先於 allow）。
- 保留現有真正用到的外部 domain；移除一次性、與專案無關的殘留條目。
- **注意**：`deny` 的比對是字串/glob，未必攔得住所有變形寫法（例如換行、大小寫、註解夾帶）；它是「縱深防禦的一層」，不是萬能，仍需搭配護欄 A 的腳本級檢查。

---

## 3. 套用前檢查清單
- [ ] 已備份 `settings.json` / `settings.local.json` 為 `.bak`
- [ ] 已用官方文件 / `claude-code-guide` 核對 hooks schema 欄位名
- [ ] 護欄腳本先在**非破壞性指令**上測過會正確放行（避免誤擋日常工作）
- [ ] 護欄腳本在**目標破壞性指令**上測過會正確 exit 2 阻擋
- [ ] 跟 User 確認過 deny 清單不會擋到正常開發流程

---

## 4. 護欄 D：Agent 工作日誌軟提醒（✅ 已套用，2026-07-05）

> 對應 [`harness/H-agent-journals.md`](H-agent-journals.md) 的日誌協議、[`D-judgment-matrix.md`](D-judgment-matrix.md) 的 DoD 清單新增項。
> User 提問「怎樣才可以強制執行」→ 三檔強度選項（軟提醒/中度/硬擋）→ User 選「軟提醒 + 中度」。

**目的**：每次叫用 Agent 工具且 `subagent_type` 是本專案 5 個角色（小畫家/小工程/小排版/小歌手/小蘋果）之一時，自動檢查對應 `harness/journals/<agent>.md` 有沒有在這次呼叫期間被更新過；沒有就把提醒**灌回模型 context**（不只是印給人看），確保指揮官不會單純因為「忘記」而漏掉——這是本檔開頭說的「軟提醒」層級：**只提醒，不阻擋**，`continue` 維持預設 `true`。

**實作**：
- `.claude/hooks/journal-pretooluse.sh`：`PreToolUse` on `matcher: "Agent"`，記錄叫用當下對應 journal 檔的 mtime 到 `.claude/.journal-hook-state.json`（已 `.gitignore`，純本機暫存 bookkeeping）。
- `.claude/hooks/journal-posttooluse.sh`：`PostToolUse` on `matcher: "Agent"`，比對現在的 mtime 跟記錄值；沒變 → 輸出 `{systemMessage, hookSpecificOutput.additionalContext}`（不設 `continue:false`，不阻擋）；有變/不是我們 5 個角色 → 安靜結束，無任何輸出。
- 兩支腳本都用 **`node -e`** 解析/產生 JSON（本機環境沒裝 `jq`，改用系統已有的 Node），對映表寫死在腳本內：`小畫家→xiaohuajia.md`、`小工程→xiaogongcheng.md`、`小排版→xiaopaiban.md`、`小歌手→xiaogeshou.md`、`小蘋果→xiaopingguo.md`。
- 掛法（`.claude/settings.json`，**專案共用、會 commit**，理由見下方「已知限制」）：
  ```json
  {
    "hooks": {
      "PreToolUse":  [{ "matcher": "Agent", "hooks": [{ "type": "command", "command": "bash .claude/hooks/journal-pretooluse.sh",  "shell": "bash", "timeout": 10 }] }],
      "PostToolUse": [{ "matcher": "Agent", "hooks": [{ "type": "command", "command": "bash .claude/hooks/journal-posttooluse.sh", "shell": "bash", "timeout": 10 }] }]
    }
  }
  ```

**驗證過程**（誠實記錄，含一次重要的意外發現）：
1. 先用合成 stdin JSON 對兩支腳本做了 4 組 pipe-test：①記錄 mtime ②日誌未更新→正確警告 ③日誌有更新→正確安靜 ④不相關 `subagent_type`（如 `Explore`）→正確安靜無輸出。全數 PASS。
2. `node -e` JSON 語法驗證通過（環境無 `jq`，改用 Node，等效驗證）。
3. **真實呼叫 Agent 工具測試第一次失敗**：呼叫小畫家做一次瑣碎測試任務，**完全沒收到提醒**。查證後發現根因——**當時這個對話所在的 git worktree 是另一條分支（`claude/nervous-kare-81ae61`），其 `.claude/` 目錄裡完全沒有這次新裝的 `settings.json`/`hooks/`（甚至沒有整套 `harness/`）**，因為這些檔案是直接寫進主專案目錄、屬於主專案當時所在分支（`feat/v2-overhaul-accounts-ui-vocab`），worktree 是完全獨立的另一個 checkout，不會自動看到。這跟 [`LESSONS.md`](LESSONS.md) L-009「promote 沒做＝形同不存在」是同一個模式，只是這次發生在 hook 層。
4. 把 `settings.json`/`hooks/`/`harness/journals/xiaohuajia.md` 手動鏡射進該 worktree 後，**重新呼叫一次小畫家，這次提醒正確灌回了模型 context**（`PostToolUse:Agent hook additional context` 系統提示如預期出現，文字內容完全正確）。這證明**機制本身完全正確**，問題只在「檔案有沒有放在這次 session 實際會讀的那個 `.claude/` 目錄」。

**⚠️ 已知限制（比裝好 hook 本身更重要，請務必讓 User 知道）**：
這套 hook（以及整套 `harness/`、`CLAUDE.md`）目前只存在於**主專案目錄** `C:\Users\asd81\Documents\Claude\01-Game` 當時所在的分支 `feat/v2-overhaul-accounts-ui-vocab` 的工作目錄裡（尚未 commit 進該分支前是 untracked 檔案；即使 commit 了，也只在那條分支上）。若之後開新的 session／worktree：
- 直接在主專案目錄 `01-Game` 開 session → 正常吃得到，沒問題。
- 用 `--worktree` 或系統自動建立新 worktree → **`worktree.baseRef` 設定預設是 `"fresh"`（從 `origin/<default-branch>` 也就是 `origin/main` 分支出去）**，而 `origin/main` 目前**連 PR #2（`feat/v2-overhaul-accounts-ui-vocab`，這幾個月幾乎全部成果）都還沒合併**——新 worktree 會從一個缺少整套 harness／journal hook／甚至五玩法／多語別遊戲內容的舊基準長出來，這套機制（以及很多其他東西）會直接消失，且不會有任何錯誤訊息，安安靜靜地就是「不存在」。
- 這不是這次 hook 特有的問題，是**任何**放在 `feat/v2-overhaul-accounts-ui-vocab` 但沒進 `main` 的東西，在預設 worktree 工作流下都會遇到的結構性風險。有三條可能的路（哪一條由 User 決定，不是模型能自己選的品味/架構題）：
  1. 把 `feat/v2-overhaul-accounts-ui-vocab`（含 PR #2）合併進 `main`，讓它成為新 worktree 的預設基準。
  2. 把 `worktree.baseRef` 設定改成 `"head"`（從目前本機 HEAD 分支出去，而不是 `origin/main`）。
  3. 接受這個限制，每次開新 worktree 都手動重新「promote」一次關鍵檔案（跟這次修 hook 時做的鏡射動作一樣）——最省事但最容易被忘記、最不持久。
