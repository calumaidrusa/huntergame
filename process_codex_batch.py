#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
小畫家：Codex 新批次素材 壓縮 / 切圖 / 歸位
來源（原檔不動）：C:/Users/asd81/Documents/Codex/02-game/public/images/ui/
目標：C:/Users/asd81/Documents/Claude/01-Game/public/images/ui/
規則：透明 PNG 保留 alpha、縮最長邊 1200（背景 1536）；背景 JPEG q85。
      合圖切圖後語意命名；sprite 三幀等寬不 trim，保持地面基準線對齊。
"""
import os
from PIL import Image

SRC = 'C:/Users/asd81/Documents/Codex/02-game/public/images/ui/'
DST = 'C:/Users/asd81/Documents/Claude/01-Game/public/images/ui/'
os.makedirs(DST, exist_ok=True)

log = []

def save_png(img, name, max_edge=1200):
    img = img.convert('RGBA')
    w, h = img.size
    if max(w, h) > max_edge:
        if w >= h:
            nw, nh = max_edge, round(h * max_edge / w)
        else:
            nw, nh = round(w * max_edge / h), max_edge
        img = img.resize((nw, nh), Image.LANCZOS)
    out = os.path.join(DST, name)
    img.save(out, 'PNG', optimize=True)
    kb = os.path.getsize(out) // 1024
    # verify corner alpha stays 0
    px = img.load()
    W, H = img.size
    corners = [px[0, 0][3], px[W - 1, 0][3], px[0, H - 1][3], px[W - 1, H - 1][3]]
    log.append(f'  PNG  {name:38s} {img.size} {kb}KB corner-alpha={corners}')

def save_jpg(src_name, name, max_edge=1536, quality=85):
    img = Image.open(SRC + src_name).convert('RGB')
    w, h = img.size
    if max(w, h) > max_edge:
        if w >= h:
            nw, nh = max_edge, round(h * max_edge / w)
        else:
            nw, nh = round(w * max_edge / h), max_edge
        img = img.resize((nw, nh), Image.LANCZOS)
    out = os.path.join(DST, name)
    img.save(out, 'JPEG', quality=quality, optimize=True)
    kb = os.path.getsize(out) // 1024
    log.append(f'  JPG  {name:38s} {img.size} {kb}KB')

def whole_png(src_name, dst_name, max_edge=1200):
    img = Image.open(SRC + src_name)
    save_png(img, dst_name, max_edge)

def slice_and_save(src_name, cuts, names, max_edge=1200):
    """Slice image vertically at x-cut columns into len(names) pieces (full height, no trim)."""
    img = Image.open(SRC + src_name).convert('RGBA')
    W, H = img.size
    bounds = [0] + cuts + [W]
    for i, nm in enumerate(names):
        piece = img.crop((bounds[i], 0, bounds[i + 1], H))
        save_png(piece, nm, max_edge)

print('=== 處理開始 ===')

# ---- 登入畫面 ----
whole_png('login-l1-ornate-frame.png', 'login-frame.png', max_edge=1400)      # L1 全畫面外框
whole_png('login-l2a-title-plaque.png', 'login-title-plaque.png')             # L2a 標題木牌(含字)
whole_png('login-l4-parchment-card.png', 'login-parchment-card.png')          # L4 羊皮紙登入卡
whole_png('login-l8-guest-button.png', 'login-guest-button.png')              # L8 訪客按鈕

# L3 分頁鈕合圖 -> 切2 (gap col 922)
slice_and_save('login-l3-tab-buttons.png', [922],
               ['login-tab-active.png', 'login-tab-inactive.png'])

# L5 圖示徽章合圖 -> 切3 (gaps 696, 1285)
slice_and_save('login-l5-icon-badges.png', [696, 1285],
               ['login-icon-person.png', 'login-icon-lock.png', 'login-icon-quill.png'])

# L7 音量鈕合圖 -> 切2 (gap 936)
slice_and_save('login-l7-volume-buttons.png', [936],
               ['login-volume-on.png', 'login-volume-off.png'])

# ---- 獵人 sprite 三幀 (等寬第三切，不 trim，保地面基準線) ----
# W=1881 -> 627 / 1254
slice_and_save('v2-hunter-truku-sprites.png', [627, 1254],
               ['v2-hunter-truku-idle.png', 'v2-hunter-truku-aim.png', 'v2-hunter-truku-release.png'])

# ---- 遊戲畫面 ----
save_jpg('v2-background-game-cliff.jpg', 'v2-background-game-cliff.jpg', max_edge=1536)

# ---- Game Over / Stage Clear ----
whole_png('v2-gameover-skull-badge.png', 'v2-gameover-skull-badge.png')
whole_png('v2-clear-trophy-badge.png', 'v2-clear-trophy-badge.png')
whole_png('v2-result-panel-frame.png', 'v2-result-panel-frame.png')
whole_png('v2-result-panel-gameover.png', 'v2-result-panel-gameover.png')     # 燒字備選
whole_png('v2-result-panel-clear.png', 'v2-result-panel-clear.png')           # 燒字備選
whole_png('v2-result-stat-card.png', 'v2-result-stat-card.png')
whole_png('v2-button-green.png', 'v2-button-green.png')

print('\n'.join(log))
print(f'\n=== 完成，共輸出 {len(log)} 個檔案 ===')
