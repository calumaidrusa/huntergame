# -*- coding: utf-8 -*-
"""
自製無旋律環境 pad（給遊戲中 BGM，取代有旋律的 Town Theme RPG）。
純 Python 標準庫（wave/struct/math/random），無 numpy/scipy/ffmpeg。

設計原則（給語言學習遊戲的「不干擾」BGM）：
- 無旋律線、無節拍、無明確音高感 → 不與 klokah 詞彙發音搶注意力
- 質感 = 柔和「風掠過山林」的氣息聲 + 極低的溫暖底噪 pad
- 頻譜集中在中低頻並做低通，避開人聲子母音的高頻清晰帶（~2-5kHz）以免蓋住發音辨識
- 極緩 LFO 讓音量像呼吸般起伏，有生命感但不會「引起注意」
- 首尾做 crossfade 讓 <audio loop> 循環無縫

輸出 WAV（16-bit）。用 22050Hz 取樣率 + 適度長度控制體積。
"""
import wave, struct, math, random

SR = 22050          # 取樣率（環境音低通後 22.05kHz 已足夠，體積減半）
DUR = 40.0          # 秒（loop 長度；環境音無旋律，40s 循環聽不出重複）
XFADE = 3.0         # 首尾 crossfade 秒數（無縫 loop）
CH = 1              # 單聲道（環境 drone 不需立體聲，體積再減半）
AMP = 0.5           # 整體振幅（HTML 端還會再乘 GAME_BGM_VOL_NORMAL）

N = int(SR * DUR)
random.seed(42)

# --- 產生粉紅噪音（比白噪音更柔和、更像自然風/氣息，能量隨頻率下降）---
# Voss-McCartney 近似
def pink_noise(n):
    rows = 16
    counters = [0]*rows
    values = [random.uniform(-1,1) for _ in range(rows)]
    running = sum(values)
    out = [0.0]*n
    max_key = (1<<rows)-1
    key = 0
    for i in range(n):
        last_key = key
        key = (key+1) & max_key
        diff = last_key ^ key
        for b in range(rows):
            if diff & (1<<b):
                running -= values[b]
                values[b] = random.uniform(-1,1)
                running += values[b]
        out[i] = running / rows
    return out

pink = pink_noise(N)

# --- 一階低通濾波（去掉高頻的「嘶」，只留下柔和氣息；避開發音的高頻清晰帶）---
# 截止頻率約 900Hz：像遠處的風/悶柔的環境底噪，人聲辨識靠的 2-5kHz 完全讓給發音
def lowpass(sig, cutoff, sr):
    dt = 1.0/sr
    rc = 1.0/(2*math.pi*cutoff)
    alpha = dt/(rc+dt)
    out = [0.0]*len(sig)
    prev = 0.0
    for i,x in enumerate(sig):
        prev = prev + alpha*(x-prev)
        out[i] = prev
    return out

body = lowpass(pink, 700, SR)      # 主體：柔和風/氣息
# 多級低通疊加 → 更陡的斜率，把 2-5kHz 發音清晰帶與 >5k 高頻壓到幾乎歸零
body = lowpass(body, 700, SR)
body = lowpass(body, 650, SR)
body = lowpass(body, 600, SR)      # 四級一階 ≈ 24dB/oct，聽感是「遠處悶柔的風」

# --- 極低頻溫暖底噪 drone：兩個非常低、互相失諧的正弦，製造「空間感」而非音高感 ---
# 用很低的頻率（55Hz / 每 5 秒緩慢滑動幾 Hz）避免形成可辨識的「音」
def warm_drone(n, sr):
    out=[0.0]*n
    for i in range(n):
        t=i/sr
        # 基頻極低且緩慢漂移，聽感是「厚度」不是「旋律」
        f1 = 55.0 + 2.0*math.sin(2*math.pi*0.013*t)
        f2 = 82.0 + 1.5*math.sin(2*math.pi*0.017*t)   # 非整數倍，避免和聲感
        v = 0.5*math.sin(2*math.pi*f1*t) + 0.35*math.sin(2*math.pi*f2*t)
        out[i]=v
    return out

drone = warm_drone(N, SR)
drone = lowpass(drone, 220, SR)    # drone 只留超低頻厚度

# --- 極緩 LFO（呼吸感音量起伏，週期 ~11 秒）---
def lfo(i):
    t=i/SR
    return 0.72 + 0.28*(0.5+0.5*math.sin(2*math.pi*(1.0/11.0)*t))

# --- 混音 ---
mix=[0.0]*N
for i in range(N):
    m = 0.80*body[i] + 0.30*drone[i]
    m *= lfo(i)
    mix[i]=m

# 正規化到 AMP
peak = max(1e-9, max(abs(x) for x in mix))
scale = AMP/peak
mix = [x*scale for x in mix]

# --- 首尾 crossfade 成無縫 loop ---
xf = int(XFADE*SR)
for i in range(xf):
    a = i/xf                      # 0->1
    head = mix[i]
    tail = mix[N-xf+i]
    # 用 tail 的尾巴淡入疊到頭部：等功率交叉
    ca = math.sqrt(a); cb = math.sqrt(1-a)
    mix[i] = head*ca + tail*cb
# 砍掉被用掉的尾段，讓結尾直接接回開頭
mix = mix[:N-xf]

# --- 寫 WAV 16-bit ---
out_path = r"C:\Users\asd81\AppData\Local\Temp\claude\C--Users-asd81-Documents-Claude-01-Game\b860e875-7f6f-4a2b-a1b4-bb2966a439f1\scratchpad\game-ambient.wav"
w = wave.open(out_path,'w')
w.setnchannels(CH); w.setsampwidth(2); w.setframerate(SR)
frames=bytearray()
for x in mix:
    v=int(max(-1.0,min(1.0,x))*32767)
    frames += struct.pack('<h', v)
w.writeframes(bytes(frames))
w.close()

import os
print("WROTE", out_path)
print("bytes:", os.path.getsize(out_path), "=", round(os.path.getsize(out_path)/1024/1024,2), "MB")
print("dur:", round(len(mix)/SR,2), "s")
