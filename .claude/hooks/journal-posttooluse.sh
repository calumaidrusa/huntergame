#!/usr/bin/env bash
# Harness journal reminder — PostToolUse 檢查（軟提醒機制下半，見 harness/appendix-recommended-hooks.md 護欄 D）。
# Agent 工具呼叫完成後，若 subagent_type 是本專案 5 個角色之一，比對 PreToolUse 記錄的
# mtime 跟現在的 mtime；沒變 → 印一則提醒（systemMessage 給使用者看、additionalContext
# 灌回模型 context，模型下一輪一定會看到）。純軟提醒：絕不設 continue:false，不阻擋任何流程。
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
      if (!file) return; // 不是我們的 5 個角色，安靜結束
      const fs = require("fs");
      const path = require("path");
      const jpath = path.join("harness", "journals", file);
      const statePath = path.join(".claude", ".journal-hook-state.json");
      let state = {};
      try { state = JSON.parse(fs.readFileSync(statePath, "utf8")); } catch (e) {}
      const before = state[subagent] || 0;
      let after = 0;
      try { after = fs.statSync(jpath).mtimeMs; } catch (e) {}
      if (after > before) return; // 日誌有更新，安靜結束
      const msg = `⚠️ ${subagent} 這次 Agent 呼叫後，工作日誌 harness/journals/${file} 似乎沒有更新。若這次工作值得留一筆，記得依 harness/H-agent-journals.md 用第一人稱補一條；若任務瑣碎到不值得寫，也請在回報裡說明略過原因（見 harness/D 完成定義）。`;
      console.log(JSON.stringify({
        systemMessage: msg,
        hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: msg }
      }));
    } catch (e) { /* 吞掉所有錯誤，絕不影響正常流程 */ }
  });
'
exit 0
