#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, json, base64, urllib.request, urllib.error, time, sys

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

OUT_DIR = os.path.join(os.path.dirname(__file__), 'generated_images')
os.makedirs(OUT_DIR, exist_ok=True)

def gen_image(prompt, out_path, size="1024x1024"):
    body = json.dumps({
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": size,
        "quality": "medium",
        "n": 1,
    }).encode('utf-8')
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST"
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"HTTP錯誤 {e.code}: {err_body}")
        return False
    elapsed = time.time() - t0
    b64 = data['data'][0]['b64_json']
    img_bytes = base64.b64decode(b64)
    with open(out_path, 'wb') as f:
        f.write(img_bytes)
    print(f"完成: {out_path} ({len(img_bytes)} bytes, {elapsed:.1f}s)")
    return True

CARTOON_STYLE = (
    "可愛扁平向量插畫風格（flat vector illustration），色彩鮮豔飽和，線條乾淨俐落，"
    "類似兒童教育繪本/App圖示的插畫，簡單幾何造型，柔和陰影，背景為單一淺色或白色（不要複雜場景），"
    "主體置中、佔滿畫面，不要任何文字或浮水印，正方形構圖。"
)

if __name__ == '__main__':
    prompt = f"畫一個「船隻」（傳統獨木舟/小船）的插畫。{CARTOON_STYLE}"
    gen_image(prompt, os.path.join(OUT_DIR, "test_asu_cartoon.png"))
