#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, json, base64, urllib.request, urllib.error, time, sys, io
from PIL import Image

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    with open(env_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                os.environ.setdefault(k, v)

load_env()
API_KEY = os.environ.get('OPENAI_API_KEY')
if not API_KEY:
    print("找不到 OPENAI_API_KEY"); sys.exit(1)

BASE = os.path.dirname(__file__)
FINAL_DIR = os.path.join(BASE, 'public', 'images')
os.makedirs(FINAL_DIR, exist_ok=True)
PROGRESS_FILE = os.path.join(BASE, 'image_gen_progress.json')

CARTOON_STYLE = (
    "可愛扁平向量插畫風格（flat vector illustration），色彩鮮豔飽和，線條乾淨俐落，"
    "類似兒童教育繪本/App圖示的插畫，簡單幾何造型，柔和陰影，背景為單一淺色或白色（不要複雜場景），"
    "主體置中、佔滿畫面，不要任何文字或浮水印，正方形構圖。"
)

def compress_and_save(raw_bytes, out_path, max_size=512, quality=85):
    img = Image.open(io.BytesIO(raw_bytes)).convert('RGB')
    img.thumbnail((max_size, max_size), Image.LANCZOS)
    img.save(out_path, 'JPEG', quality=quality, optimize=True)

def gen_image_bytes(chinese, retries=2):
    prompt = f"畫一個「{chinese}」的插畫。{CARTOON_STYLE}"
    body = json.dumps({
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": "1024x1024",
        "quality": "medium",
        "n": 1,
    }).encode('utf-8')
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        method="POST"
    )
    for attempt in range(retries + 1):
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode('utf-8'))
            b64 = data['data'][0]['b64_json']
            return True, base64.b64decode(b64), time.time() - t0, None
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            if attempt < retries:
                time.sleep(3); continue
            return False, None, time.time() - t0, f"HTTP {e.code}: {err_body[:300]}"
        except Exception as e:
            if attempt < retries:
                time.sleep(3); continue
            return False, None, time.time() - t0, str(e)

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_progress(p):
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False, indent=2)

TEST_CODES = ["09-21","09-46","09-31","09-28","08-28","08-35","12-12","12-19",
              "10-21","11-33","18-05","18-06","18-15","18-20","18-26"]

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'test'

    with open(os.path.join(BASE, 'truku_vocab_final.json'), encoding='utf-8') as f:
        data = json.load(f)
    by_hint = {d['hint']: d for d in data}

    if mode == 'test':
        codes = TEST_CODES
    elif mode == 'all':
        codes = [d['hint'] for d in data if d['image_path'] is None]
    else:
        print("用法: python3 gen_batch.py [test|all]"); sys.exit(1)

    progress = load_progress()
    total = len(codes)
    t_start = time.time()
    for i, code in enumerate(codes, 1):
        item = by_hint.get(code)
        if not item:
            continue
        fname = code.replace('-', '_') + '.jpg'
        out_path = os.path.join(FINAL_DIR, fname)
        if progress.get(code, {}).get('ok'):
            continue
        print(f"[{i}/{total}] {code} {item['word']} ({item['chinese']}) ...", flush=True)
        ok, raw, elapsed, err = gen_image_bytes(item['chinese'])
        if ok:
            try:
                compress_and_save(raw, out_path)
                progress[code] = {'ok': True, 'elapsed': round(elapsed,1), 'word': item['word'], 'chinese': item['chinese'], 'image_path': f'/images/{fname}'}
                print(f"    完成 ({elapsed:.1f}s) -> {fname}")
            except Exception as e:
                progress[code] = {'ok': False, 'error': f'壓縮失敗: {e}', 'word': item['word'], 'chinese': item['chinese']}
                print(f"    壓縮失敗: {e}")
        else:
            progress[code] = {'ok': False, 'error': err, 'word': item['word'], 'chinese': item['chinese']}
            print(f"    失敗: {err}")
        save_progress(progress)

    ok_count = sum(1 for v in progress.values() if v.get('ok'))
    print(f"\n總計: {ok_count}/{len(progress)} 成功，耗時 {time.time()-t_start:.0f}s")

if __name__ == '__main__':
    main()
