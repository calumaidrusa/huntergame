#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os

BASE = os.path.dirname(__file__)

with open(os.path.join(BASE, "truku_vocab_final.json"), encoding='utf-8') as f:
    data = json.load(f)

with open(os.path.join(BASE, "audio_check_results.json"), encoding='utf-8') as f:
    checks = json.load(f)

has_audio = 0
for item in data:
    ok = checks.get(item['code'], False)
    if ok:
        item['audio_path'] = f"https://web.klokah.tw/vocabulary/audio/word/33/{item['code']}.wav"
        has_audio += 1
    else:
        item['audio_path'] = None

print(f"有音檔: {has_audio} / {len(data)}")

with open(os.path.join(BASE, "truku_vocab_final.json"), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

def js_str(s):
    return "null" if s is None else json.dumps(s, ensure_ascii=False)

lines = ["const TRUKU_SEED = ["]
for r in data:
    lines.append(
        f"  [{js_str(r['word'])}, {js_str(r['chinese'])}, {js_str(r['english'])}, "
        f"{js_str(r['category'])}, {r['level']}, {js_str(r['emoji'])}, "
        f"{js_str(r['hint'])}, {js_str(r['image_path'])}, {js_str(r['audio_path'])}],"
    )
lines.append("];")

with open(os.path.join(BASE, "seed_data.js"), 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("已更新 seed_data.js（含 audio_path，9 欄位）")
