#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os

BASE = os.path.dirname(__file__)

with open(os.path.join(BASE, "truku_vocab_final.json"), encoding='utf-8') as f:
    data = json.load(f)

generated = {
    "09-21": "/images/09_21.jpg",
    "09-46": "/images/09_46.jpg",
}

count = 0
for item in data:
    if item['code'] in generated:
        item['image_path'] = generated[item['code']]
        count += 1

print(f"已更新 {count} 筆為 AI 生成圖片")

with open(os.path.join(BASE, "truku_vocab_final.json"), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

def js_str(s):
    return "null" if s is None else json.dumps(s, ensure_ascii=False)

lines = ["const TRUKU_SEED = ["]
for r in data:
    lines.append(
        f"  [{js_str(r['word'])}, {js_str(r['chinese'])}, {js_str(r['english'])}, "
        f"{js_str(r['category'])}, {r['level']}, {js_str(r['emoji'])}, "
        f"{js_str(r['hint'])}, {js_str(r['image_path'])}],"
    )
lines.append("];")

with open(os.path.join(BASE, "seed_data.js"), 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("已更新 seed_data.js")
