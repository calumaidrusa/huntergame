#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = r"C:\Users\asd81\Documents\Claude\01-Game"

with open(f"{BASE}\\truku_vocab_final.json", encoding='utf-8') as f:
    data = json.load(f)

def audio_url(code):
    return f"https://web.klokah.tw/vocabulary/audio/word/33/{code}.wav"

def check(item):
    url = audio_url(item['code'])
    req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            return item['code'], resp.status == 200
    except Exception:
        return item['code'], False

results = {}
with ThreadPoolExecutor(max_workers=20) as ex:
    futures = [ex.submit(check, item) for item in data]
    done = 0
    for fut in as_completed(futures):
        code, ok = fut.result()
        results[code] = ok
        done += 1
        if done % 200 == 0:
            print(f"進度: {done}/{len(data)}")

ok_count = sum(1 for v in results.values() if v)
print(f"\n總計: {len(results)}, 有音檔: {ok_count}, 無音檔: {len(results)-ok_count}")

with open(f"{BASE}\\audio_check_results.json", 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("已儲存: audio_check_results.json")
