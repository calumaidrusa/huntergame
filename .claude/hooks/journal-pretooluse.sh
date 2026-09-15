#!/usr/bin/env bash
# Harness journal reminder — PreToolUse snapshot（軟提醒機制上半，見 harness/appendix-recommended-hooks.md 護欄 D）。
# 叫用 Agent 工具前，若 subagent_type 是本專案 5 個角色之一，記錄當下對應
# harness/journals/<agent>.md 的 mtime，供 PostToolUse 比對「這次呼叫期間有沒有被改過」。
# 絕不阻擋、絕不輸出任何內容，任何情況都 exit 0（純背景記錄，用 node 解析 JSON，不依賴 jq）。
node -e '
  let data = "";
  process.stdin.on("data", c => data += c);
  process.stdin.on("end", () => {
    try {
      const input = JSON.parse(data);
      const subagent = (input.tool_input && input.tool_input.subagent_type) || "";
      const map = {
        "小畫家": "xiaohuajia.md", "小工程": "xiaogongcheng.md",
        "小排版": "xiaopaiban.md", "小歌手": "xiaogeshou.md", "小蘋果": "xiaopingguo.md"
      };
      const file = map[subagent];
      if (!file) return;
      const fs = require("fs");
      const path = require("path");
      const jpath = path.join("harness", "journals", file);
      let mtime = 0;
      try { mtime = fs.statSync(jpath).mtimeMs; } catch (e) {}
      const stateDir = ".claude";
      const statePath = path.join(stateDir, ".journal-hook-state.json");
      let state = {};
      try { state = JSON.parse(fs.readFileSync(statePath, "utf8")); } catch (e) {}
      state[subagent] = mtime;
      fs.mkdirSync(stateDir, { recursive: true });
      fs.writeFileSync(statePath, JSON.stringify(state));
    } catch (e) { /* 吞掉所有錯誤，絕不影響正常流程 */ }
  });
'
exit 0
