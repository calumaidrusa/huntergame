#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv
import json
import re

CSV_PATH = r"C:\Users\asd81\Downloads\2026學習詞表-33太魯閣語.csv"
OUT_JSON = r"C:\Users\asd81\Documents\Claude\01-Game\truku_vocab_final.json"
OUT_JS = r"C:\Users\asd81\Documents\Claude\01-Game\seed_data.js"

LEVEL_MAP = {'初級': 1, '中級': 2, '高級': 3, '中高級': 4}

rows_out = []
current_category = 'general'
skipped = []

with open(CSV_PATH, encoding='utf-8-sig', newline='') as f:
    reader = csv.reader(f)
    all_rows = list(reader)

for row in all_rows[3:]:  # skip header rows (0-2); row 3 is first 類別 header
    if len(row) < 6:
        continue
    seq, code, chinese, word, note, level_text = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip(), row[4].strip(), row[5].strip()

    # 類別行： 第一欄="類別", 第二欄=category name
    if seq == '類別':
        m = re.match(r'^\d*(.*)$', code)
        current_category = m.group(1) if m else code
        continue

    if not code or not word:
        continue
    if word in ('無此詞彙',):
        skipped.append((code, chinese, word))
        continue

    level = LEVEL_MAP.get(level_text)
    if level is None:
        skipped.append((code, chinese, word, level_text))
        continue

    img_code = code.replace('-', '_')
    image_url = f"https://klokah.tw/competition/vocabulary/picture/{img_code}.jpg"

    rows_out.append({
        'word': word,
        'chinese': chinese,
        'english': '',
        'category': current_category,
        'level': level,
        'emoji': '🎯',
        'hint': word,
        'code': code,
        'image_path': image_url
    })

print(f"總共解析: {len(rows_out)} 筆")
print(f"略過: {len(skipped)} 筆")
for s in skipped[:20]:
    print("  skip:", s)

from collections import Counter
lvl_count = Counter(r['level'] for r in rows_out)
for lvl in sorted(lvl_count):
    print(f"Level {lvl}: {lvl_count[lvl]}")

with open(OUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(rows_out, f, ensure_ascii=False, indent=2)

# 生成 JS array literal（給 server.js 用）
def js_str(s):
    return json.dumps(s, ensure_ascii=False)

lines = []
lines.append("const TRUKU_SEED = [")
for r in rows_out:
    lines.append(
        f"  [{js_str(r['word'])}, {js_str(r['chinese'])}, {js_str(r['english'])}, "
        f"{js_str(r['category'])}, {r['level']}, {js_str(r['emoji'])}, "
        f"{js_str(r['hint'])}, {js_str(r['image_path'])}],"
    )
lines.append("];")

with open(OUT_JS, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"\n已寫出: {OUT_JSON}")
print(f"已寫出: {OUT_JS}")
