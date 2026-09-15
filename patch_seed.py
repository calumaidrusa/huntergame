#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

BASE = r"C:\Users\asd81\Documents\Claude\01-Game"

with open(f"{BASE}\\truku_vocab_final.json", encoding='utf-8') as f:
    data = json.load(f)

with open(f"{BASE}\\image_check_results.json", encoding='utf-8') as f:
    checks = json.load(f)

has_img, no_img = 0, 0
for item in data:
    ok = checks.get(item['code'], False)
    if ok:
        has_img += 1
    else:
        item['image_path'] = None
        no_img += 1

print(f"有圖: {has_img}, 無圖(設為 null): {no_img}")

with open(f"{BASE}\\truku_vocab_final.json", 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

def js_str(s):
    if s is None:
        return "null"
    return json.dumps(s, ensure_ascii=False)

lines = ["const TRUKU_SEED = ["]
for r in data:
    lines.append(
        f"  [{js_str(r['word'])}, {js_str(r['chinese'])}, {js_str(r['english'])}, "
        f"{js_str(r['category'])}, {r['level']}, {js_str(r['emoji'])}, "
        f"{js_str(r['hint'])}, {js_str(r['image_path'])}],"
    )
lines.append("];")

with open(f"{BASE}\\seed_data.js", 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("已更新 seed_data.js")
