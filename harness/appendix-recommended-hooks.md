# 附錄：建議加裝的物理級護欄（Hooks + 權限收斂）

> **狀態：待命，未套用。** User 本次選擇「只用文字規則」，故本檔是**現成可套的建議稿**，不是已生效的設定。
> 想啟用時：可用 `/update-config` 技能或請 `claude-code-guide` 協助，**套用前務必用官方文件核對當前 hooks schema**（欄位名可能隨版本微調，勿照抄未驗證）。改 `settings.json` 前先備份 `.bak`。
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
