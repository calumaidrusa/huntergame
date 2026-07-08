/* ==========================================================================
 * 山林獵人 Hunter Typer — 音效合成模組 sfx.js
 * --------------------------------------------------------------------------
 * 小歌手（音訊負責）產出。純 Web Audio API 合成，無外部依賴、無音檔下載。
 *
 * 設計原則（貫穿全部，勿隨意調高）：
 *   - klokah.tw 詞彙發音是教學核心，所有音效都是配角。
 *   - 音量 0.25–0.5，多數 < 0.3 秒；抓到獵物音效 < 1 秒（1200ms 後會播下一個
 *     詞的發音，音效必須先結束）。
 *   - 答錯音溫和、無懲罰感（學習遊戲，小朋友不能被嚇到）。
 *   - 全程通用合成音，無任何族群文化指涉（無祭儀音樂、無口簧琴模仿）。
 *
 * 引入方式（給小工程）：
 *   在 hunter-truku-v2.html 的 </body> 之前、主 <script> 之前或之後皆可加：
 *       <script src="public/audio/sfx.js"></script>
 *   本檔會在 window 上暴露全域物件 `Sfx`（含 12 個具名音效函式 + 控制接口）。
 *
 * AudioContext 政策：
 *   單一 AudioContext，lazy init。第一次呼叫任何 sfx 函式時建立，並在使用者
 *   互動後自動 resume（符合瀏覽器 autoplay 政策）。因為所有 sfx 都由使用者
 *   操作（打字、點擊、過關）觸發，第一聲一定發生在互動之後，安全。
 *
 * 音量 / 靜音接口（給小排版的音量按鈕呼叫）：
 *   Sfx.setMuted(true|false)   靜音 / 解除
 *   Sfx.isMuted()              目前是否靜音
 *   Sfx.setVolume(0..1)        設定音效主音量（預設 0.9，指整體 SFX 匯流排）
 *   Sfx.getVolume()            讀取主音量
 *   Sfx.unlock()              （可選）在第一次使用者互動時呼叫，提前 resume
 * ========================================================================== */

(function (global) {
  'use strict';

  var ctx = null;          // 單一 AudioContext（lazy）
  var masterGain = null;   // SFX 主匯流排音量
  var muted = false;
  var masterVolume = 0.9;  // 整體 SFX 音量（各音效自身還有 0.25–0.5 的個別音量）

  // ---- AudioContext lazy init + 互動後 resume ----------------------------
  function ac() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null; // 極舊瀏覽器：無 Web Audio，靜默降級
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : masterVolume;
      masterGain.connect(ctx.destination);
    }
    // autoplay 政策：被使用者手勢觸發時 ctx 可能是 suspended，resume 之
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // 若靜音則直接跳過合成（省 CPU，也保證絕對無聲）
  function gate() {
    if (muted) return null;
    return ac();
  }

  // ---- 共用小工具 --------------------------------------------------------

  // 建一個接到主匯流排的 gain 節點，套用 ADSR 式的簡單淡入淡出封套。
  //   vol   峰值音量（該音效的個別音量，0.25–0.5）
  //   t0    開始時間
  //   attack/hold/release  秒
  function envGain(vol, t0, attack, hold, release) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + attack);
    g.gain.setValueAtTime(Math.max(vol, 0.0002), t0 + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
    g.connect(masterGain);
    return g;
  }

  // 播一個振盪器音符（oscillator → env → master）
  function tone(opts) {
    var c = gate();
    if (!c) return;
    var t0 = opts.at != null ? opts.at : c.currentTime;
    var osc = c.createOscillator();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.freqTo != null) {
      // 掃頻（glissando）：指數或線性
      var end = t0 + (opts.dur || 0.15);
      if (opts.linear) osc.frequency.linearRampToValueAtTime(opts.freqTo, end);
      else osc.frequency.exponentialRampToValueAtTime(Math.max(opts.freqTo, 1), end);
    }
    var dur = opts.dur || 0.15;
    var a = opts.attack != null ? opts.attack : 0.005;
    var r = opts.release != null ? opts.release : dur * 0.6;
    var hold = Math.max(0, dur - a - r);
    var g = envGain(opts.vol || 0.3, t0, a, hold, r);
    osc.connect(g);
    osc.start(t0);
    osc.stop(t0 + a + hold + r + 0.02);
  }

  // 播一段白噪音（用於「咻」箭破空、命中瞬態），可帶 bandpass 掃頻。
  function noise(opts) {
    var c = gate();
    if (!c) return;
    var t0 = opts.at != null ? opts.at : c.currentTime;
    var dur = opts.dur || 0.15;
    var frames = Math.floor(c.sampleRate * dur);
    var buffer = c.createBuffer(1, frames, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource();
    src.buffer = buffer;

    var node = src;
    if (opts.filter) {
      var f = c.createBiquadFilter();
      f.type = opts.filter;                 // 'bandpass' / 'lowpass' / 'highpass'
      f.frequency.setValueAtTime(opts.freq || 2000, t0);
      if (opts.freqTo != null) {
        f.frequency.exponentialRampToValueAtTime(Math.max(opts.freqTo, 1), t0 + dur);
      }
      if (opts.Q != null) f.Q.value = opts.Q;
      src.connect(f);
      node = f;
    }
    var a = opts.attack != null ? opts.attack : 0.002;
    var r = opts.release != null ? opts.release : dur * 0.7;
    var hold = Math.max(0, dur - a - r);
    var g = envGain(opts.vol || 0.3, t0, a, hold, r);
    node.connect(g);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  // ======================================================================
  // 12 類音效（對應 audio_plan_v1.md 第二節，同編號）
  // ======================================================================

  // #1 射箭 — 短促「咻」，白噪音高→低掃頻，像箭破空。 ~0.15s / 0.3
  function sfxShoot() {
    var c = gate(); if (!c) return;
    noise({ filter: 'bandpass', freq: 3500, freqTo: 700, Q: 1.2,
            dur: 0.16, vol: 0.28, attack: 0.005, release: 0.12 });
  }

  // #2 箭命中 — 清脆「叩/篤」，短噪音瞬態 + 一顆低正弦「釘進木頭」。 ~0.1s / 0.35
  function sfxHit() {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    noise({ at: t, filter: 'highpass', freq: 1800, dur: 0.05, vol: 0.3,
            attack: 0.001, release: 0.045 });
    tone({ at: t, type: 'sine', freq: 320, freqTo: 150, dur: 0.09,
           vol: 0.32, attack: 0.002, release: 0.08 });
  }

  // #3 抓到獵物 — 明亮「叮—噔」兩音上行（大三度）。務必 <1s。 ~0.4s / 0.4
  function sfxCaught() {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    // C6 → E6，清脆鈴聲感（triangle 帶點泛音但不刺）
    tone({ at: t,        type: 'triangle', freq: 1046.5, dur: 0.16, vol: 0.34, release: 0.14 });
    tone({ at: t + 0.13, type: 'triangle', freq: 1318.5, dur: 0.30, vol: 0.36, release: 0.26 });
  }

  // #4 Combo x3+ — 遞增音階 arpeggio；combo 越高起點越高，但封頂避免刺耳。 ~0.5s / 0.4
  //    comboLevel: 目前 combo 數（呼叫端傳 G.combo）
  function sfxCombo(comboLevel) {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    var level = Math.max(0, (comboLevel || 3) - 3); // 從 combo 3 起算
    // 半音位移，封頂 +12 半音（一個八度），避免越打越尖
    var shift = Math.min(level * 1, 12);
    var base = 659.25; // E5
    var semis = [0, 4, 7, 12]; // 大三和弦 + 八度，上行 arpeggio
    for (var i = 0; i < semis.length; i++) {
      var f = base * Math.pow(2, (semis[i] + shift) / 12);
      tone({ at: t + i * 0.075, type: 'triangle', freq: f,
             dur: 0.14, vol: 0.3, release: 0.11 });
    }
  }

  // #5 打錯字 — 低頻短「噗」，溫和方波低音，無挫敗/懲罰感。 ~0.15s / 0.25
  function sfxMiss() {
    var c = gate(); if (!c) return;
    // 低音、快速下滑一點點、音量壓低、release 柔和 → 「噗」而非「錯錯錯」
    tone({ type: 'square', freq: 220, freqTo: 165, dur: 0.16,
           vol: 0.22, attack: 0.008, release: 0.13, linear: true });
  }

  // #6 獵物逃走 — 下滑 glissando（高→低），「溜走了」，溫和。 ~0.4s / 0.3
  function sfxEscape() {
    var c = gate(); if (!c) return;
    tone({ type: 'sine', freq: 700, freqTo: 240, dur: 0.4,
           vol: 0.28, attack: 0.01, release: 0.3 });
  }

  // #7 倒數警告 — 輕柔「嗒」每秒一下（呼叫端只在剩 <25% 時每秒呼叫一次）。 每下 ~0.05s / 0.18
  //    ⚠️ 聽聲辨字模式建議呼叫端不要呼叫（玩家正在聽發音）。
  function sfxTick() {
    var c = gate(); if (!c) return;
    tone({ type: 'sine', freq: 880, dur: 0.05, vol: 0.16,
           attack: 0.003, release: 0.04 });
  }

  // #8 過關 — 4 音符小凱旋旋律，上行 arpeggio 收尾長音。過關畫面無發音競爭，可稍長。 ~1.8s / 0.4
  function sfxClear() {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    // C5 E5 G5 → C6 長音（大三和弦解決到八度）
    var notes = [
      { f: 523.25, at: 0.00, d: 0.16 },
      { f: 659.25, at: 0.15, d: 0.16 },
      { f: 783.99, at: 0.30, d: 0.16 },
      { f: 1046.5, at: 0.46, d: 0.9  }  // 收尾長音
    ];
    for (var i = 0; i < notes.length; i++) {
      tone({ at: t + notes[i].at, type: 'triangle', freq: notes[i].f,
             dur: notes[i].d, vol: 0.34, release: notes[i].d * 0.65 });
    }
  }

  // #9 Game Over — 3 音符下行短句，惋惜但不淒慘。 ~1.4s / 0.35
  function sfxGameOver() {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    // A4 → F4 → D4 下行，收尾放長；柔和三角波，不用悲壯的低頻轟鳴
    var notes = [
      { f: 440.00, at: 0.00, d: 0.22 },
      { f: 349.23, at: 0.24, d: 0.22 },
      { f: 293.66, at: 0.48, d: 0.8  }
    ];
    for (var i = 0; i < notes.length; i++) {
      tone({ at: t + notes[i].at, type: 'triangle', freq: notes[i].f,
             dur: notes[i].d, vol: 0.3, release: notes[i].d * 0.7 });
    }
  }

  // #10 解鎖關卡 — 「叮鈴」上行閃亮音，比過關短、更亮。 ~0.6s / 0.4
  function sfxUnlock() {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    // 快速上行三連音收在高處，帶「閃亮」的高頻鈴聲
    var notes = [784, 1046.5, 1568]; // G5 C6 G6
    for (var i = 0; i < notes.length; i++) {
      tone({ at: t + i * 0.08, type: 'triangle', freq: notes[i],
             dur: (i === 2 ? 0.32 : 0.12), vol: 0.32,
             release: (i === 2 ? 0.28 : 0.1) });
    }
  }

  // #11 開場橫幅 / 鎖定提示 —
  //     banner=true → 進關卡橫幅：低音「咚」一下（鼓點感）。
  //     banner=false → 鎖定提示：兩下低音「叩叩」。 ~0.3s / 0.3
  function sfxBanner(isBanner) {
    var c = gate(); if (!c) return;
    var t = c.currentTime;
    if (isBanner === false) {
      // 鎖定：兩下低沉「叩叩」，帶點鈍感
      tone({ at: t,        type: 'square', freq: 160, dur: 0.09, vol: 0.22, release: 0.07 });
      tone({ at: t + 0.14, type: 'square', freq: 160, dur: 0.09, vol: 0.22, release: 0.07 });
    } else {
      // 開場：一下低音「咚」+ 少許噪音瞬態，像鼓點
      noise({ at: t, filter: 'lowpass', freq: 400, dur: 0.06, vol: 0.2, release: 0.05 });
      tone({ at: t, type: 'sine', freq: 130, freqTo: 90, dur: 0.28,
             vol: 0.3, attack: 0.004, release: 0.24 });
    }
  }

  // #12 按鈕點擊 — 極短「嗒」click（只接主要按鈕）。 ~0.03s / 0.25
  function sfxClick() {
    var c = gate(); if (!c) return;
    tone({ type: 'sine', freq: 660, dur: 0.035, vol: 0.22,
           attack: 0.001, release: 0.03 });
  }

  // ======================================================================
  // 音量 / 靜音控制接口（給小排版的音量按鈕）
  // ======================================================================

  function setMuted(m) {
    muted = !!m;
    if (masterGain) {
      // 用短斜坡避免爆音
      var now = ctx ? ctx.currentTime : 0;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(muted ? 0 : masterVolume, now, 0.01);
    }
  }
  function isMuted() { return muted; }

  function setVolume(v) {
    masterVolume = Math.max(0, Math.min(1, v));
    if (masterGain && !muted) {
      var now = ctx ? ctx.currentTime : 0;
      masterGain.gain.setTargetAtTime(masterVolume, now, 0.01);
    }
  }
  function getVolume() { return masterVolume; }

  // 可選：在第一次使用者手勢（例如登入按鈕）呼叫，提前建立/resume ctx，
  // 讓之後第一聲音效沒有初始化延遲。非必要，不呼叫也能運作。
  function unlock() { ac(); }

  // ---- 暴露到全域 --------------------------------------------------------
  global.Sfx = {
    // 12 類音效
    sfxShoot: sfxShoot,
    sfxHit: sfxHit,
    sfxCaught: sfxCaught,
    sfxCombo: sfxCombo,
    sfxMiss: sfxMiss,
    sfxEscape: sfxEscape,
    sfxTick: sfxTick,
    sfxClear: sfxClear,
    sfxGameOver: sfxGameOver,
    sfxUnlock: sfxUnlock,
    sfxBanner: sfxBanner,
    sfxClick: sfxClick,
    // 控制接口
    setMuted: setMuted,
    isMuted: isMuted,
    setVolume: setVolume,
    getVolume: getVolume,
    unlock: unlock
  };

})(typeof window !== 'undefined' ? window : this);
