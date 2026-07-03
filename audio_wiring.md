# 山林獵人 Hunter Typer — 音訊接線與素材對應表

**產出**：小歌手（音訊負責）
**日期**：2026-07-03
**給誰**：第 1–3 節給**小工程**（把 sfx.js 引入 + 在遊戲事件呼叫音效 + 標題 BGM 播放）；第 4 節給**小排版**（音量開關 UI）。

**基準檔案**：`hunter-truku-v2.html`（行號以我核對本次現況為準；若已被再次編輯請以函式名定位）。

**核心原則（勿破壞）**：klokah.tw 詞彙發音是教學核心。所有音效 < 0.3 秒為主、音量 0.25–0.5，不與發音搶頻。抓到獵物音效 < 1 秒（`caughtPrey()` 1200ms 後就播下一詞發音）。音效系統與 `_currentAudio`（詞彙發音）完全分離，互不干擾。**不要動 `vocabulary.audio_path`。**

---

## 1. 引入 sfx.js

**檔案**：`C:\Users\asd81\Documents\Claude\01-Game\public\audio\sfx.js`（純 JS、無依賴、無需下載音檔）。

**引入方式（建議 script src，比內嵌乾淨）**：在 `hunter-truku-v2.html` 主 `<script>`（L1083）**之前**加一行——

```html
<script src="public/audio/sfx.js"></script>
<script>
  // ...原本的主 script 內容...
```

放主 script 之前，是為了確保全域 `Sfx` 物件在主 script 呼叫音效函式時已存在。sfx.js 是 IIFE，只在 `window.Sfx` 掛 16 個方法，不污染其他全域。

**AudioContext / autoplay**：sfx.js 是 lazy init，第一次呼叫任何音效才建 AudioContext 並自動 resume。因為所有音效都由使用者操作觸發（打字、點擊、過關），第一聲必然在互動後，符合 autoplay 政策，不需額外處理。
（可選優化：在登入按鈕 `submitAuth()` 成功那一刻呼叫一次 `Sfx.unlock()`，提前建好 context，讓後續第一聲零延遲。非必要。）

---

## 2. 音效接線表（12 類 → 事件 → 確切位置）

每處都是「在既有函式裡加一行呼叫」，不改動任何邏輯。**靜音/音量由 sfx.js 內部處理，呼叫端無腦呼叫即可**（靜音時函式內部自動跳過發聲）。

| # | 函式 | 遊戲事件 | 接線位置（`hunter-truku-v2.html`） | 建議加在哪一行 |
|---|---|---|---|---|
| 1 | `Sfx.sfxShoot()` | 打對一個字、射箭 | `fireArrow()` **L1654** | 函式開頭第一行（或 `submitWord()` L1592 呼叫 `fireArrow()` 的同處）。每打對一字響一次 |
| 2 | `Sfx.sfxHit()` | 箭命中閃光 | `showImpactFlash(x,y)` **L1698** | 函式開頭。與命中閃光同步（箭是 380ms 後才到，這裡時機剛好） |
| 3 | `Sfx.sfxCaught()` | 抓到整隻獵物（一個詞打完） | `caughtPrey()` **L1708** | 加在 `showCorrectBanner();`（L1723）之後、`setTimeout(nextRound,1200)` 之前。⚠️ 音效 <0.5s，1200ms 後才播下一詞發音，安全 |
| 4 | `Sfx.sfxCombo(G.combo)` | Combo ≥ 3 里程碑 | `caughtPrey()` **L1721** | 在 `const msg = G.combo >= 3 ? ...` 附近，包一個 `if (G.combo >= 3) Sfx.sfxCombo(G.combo);`。**注意：與 #3 sfxCaught 會同時發生**——建議 combo≥3 時只播 sfxCombo、或兩者都播（sfxCombo 起音略高，疊起來是加強感，可接受）。傳入 `G.combo` 讓音階隨連擊升高 |
| 5 | `Sfx.sfxMiss()` | 打錯字 MISS | `submitWord()` **L1612** | 加在 `showHit('MISS!', ...)` 那一行旁（else 分支內）。溫和不懲罰 |
| 6 | `Sfx.sfxEscape()` | 獵物逃走（時間到） | `missedPrey()` **L1767** | 加在 `showHit('ESCAPED!', ...)` 那一行旁 |
| 7 | `Sfx.sfxTick()` | 倒數警告（剩 <25%） | `startTimer()` 的 setInterval **L1518–1525** | 在 `updateTimerBar(...)`（L1520）之後加：`if (!G.listenMode && G.timeLeft > 0 && (G.timeLeft / totalTime) <= 0.25) Sfx.sfxTick();` ⚠️ **聽聲辨字模式（G.listenMode）必須排除**——玩家正在聽發音 |
| 8 | `Sfx.sfxClear()` | 過關 | `stageClear()` **L1865** | 函式開頭。過關畫面無發音競爭，可用較長凱旋音（~1.8s） |
| 9 | `Sfx.sfxGameOver()` | Game Over（HP 歸零） | `gameOver()` **L1853** | 函式開頭。惋惜不淒慘 |
| 10 | `Sfx.sfxUnlock()` | 解鎖新關卡 | `submitAndNext()` **L1907–1908** | 在 `if (AUTH.unlockedLevel > prevUnlocked) { ... }`（L1907）區塊內、顯示「🎉 解鎖 LEVEL N」文字處加一行 |
| 11a | `Sfx.sfxBanner(true)` | 關卡開場橫幅 | `showBanner(isNew)` **L1434** | 函式內 `b.classList.add('show')`（L1435）之後 |
| 11b | `Sfx.sfxBanner(false)` | 鎖定關卡提示 | `showLockedHint(lvl)` **L1274** | 函式內顯示 🔒 toast 處。傳 `false` → 兩下低音「叩叩」 |
| 12 | `Sfx.sfxClick()` | 主要按鈕點擊 | 主要 `onclick`（選關 `startGame()` L1389、模式切換 `setMode()` L1945、送出成績 `submitAndNext()`、下一關、回標題 `goTitle()` L1933 等） | **只接主要按鈕即可，不必每顆都響**。可在各 onclick handler 開頭加一行，或在 `startGame()`/`goTitle()` 等入口加。避免和 #8/#9/#11 這類「本身已有音效」的動作重複觸發 click |

**重複觸發提醒**：
- #3 sfxCaught 與 #4 sfxCombo 在 combo≥3 時同回合發生（見上）。
- #12 sfxClick 別加在「會觸發過關/GameOver/解鎖音」的按鈕上（例如點「下一關」若隨即過關），以免疊音。選關、模式切換、排行榜這類「純導覽」按鈕接 click 最安全。

---

## 3. 標題畫面 BGM（山林環境音）

**檔案**：`C:\Users\asd81\Documents\Claude\01-Game\public\audio\bgm\title-ambience.mp3`
**用途**：只在**標題畫面**當「迎賓聲景」。
**⚠️ 更新（本次）**：使用者決定「兩首 BGM 都要」。遊戲進行中改為**另放一首有節奏的遊戲 BGM**（見新增的**第 5 節**）。所以：
- 標題畫面 → 播 `title-ambience.mp3`（環境音）
- 進遊戲 → 標題環境音**淡出**、遊戲 BGM `game-loop.mp3`**淡入**（見第 5 節）
- 回標題 → 停遊戲 BGM、切回標題環境音
本節以下的標題 BGM 接線（`showTitleScreen` 播放、`startGame` 停止、`goTitle` 重播）維持不變，只是「停止標題 BGM」的同一時機同時要「啟動遊戲 BGM」——兩首的切換邏輯統一寫在第 5 節，請小工程以第 5 節為準。

### 素材來源與授權（學校教學場景，授權已核實乾淨）

| 項目 | 內容 |
|---|---|
| 檔名 | `title-ambience.mp3` |
| 內容 | 森林環境音：鳥鳴（含 crow/raven）、蟲鳴、風聲、林間氛圍（原始標題「forest ambience」，錄音地標註 Costa Rica 雨林） |
| 格式 | MP3, 44.1kHz, Stereo, VBR |
| 長度 | 約 **123 秒（2:03）** |
| 檔案大小 | 約 3.27 MB |
| 授權 | **Public Domain（PD）** |
| 來源頁 | Wikimedia Commons: `File:20090610 0 ambience.ogg`（https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg） |
| 直接下載 URL | Commons 官方 MP3 transcode：`https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0a/20090610_0_ambience.ogg/20090610_0_ambience.ogg.mp3` |
| 原始來源庫 | PDSounds（pdsounds.org，公有領域音效庫），record #70，作者署名「nille」 |
| 需標示 | PD 不強制標示；作者 nille（如頁尾想加 credit 可寫「Forest ambience by nille, Public Domain via Wikimedia Commons / PDSounds」） |

> ⚠️ **長度/大小超標的誠實回報**：規範建議 BGM 60–90 秒、1–3MB，本檔為 123 秒、3.27MB，略超。原因：本環境**沒有 ffmpeg/sox 等轉碼工具**，我無法在此把它剪成 60–90 秒的無縫 loop、也無法重壓縮。目前檔案可直接以 HTML5 `<audio loop>` 播放（123 秒到頭後會自動接回開頭；環境音無明顯旋律，接縫不明顯，可接受）。
> **後續優化建議（非必要）**：若要壓到規範內，請在有 ffmpeg 的機器上執行例如
> `ffmpeg -i title-ambience.mp3 -ss 5 -t 75 -af "afade=t=in:st=0:d=2,afade=t=out:st=73:d=2" -b:a 128k title-ambience.mp3`
> 取中段 75 秒、加頭尾 2 秒淡入淡出、128kbps → 約 1.2MB 的乾淨 loop。我可以在有工具的環境代做。

### BGM 播放接線（給小工程）

BGM 用一個獨立的 `<audio>` 元素管理，**與 `_currentAudio`（詞彙發音）完全分開**。建議做法：

1. **在 HTML 加一個 audio 元素**（放 body 內任意處）：
   ```html
   <audio id="titleBgm" src="public/audio/bgm/title-ambience.mp3" loop preload="auto"></audio>
   ```

2. **啟動點：進入標題畫面時播放** — `showTitleScreen()` **L1181**（登入成功 / 有效 token 自動進標題，都會經過這裡）。加：
   ```js
   const bgm = document.getElementById('titleBgm');
   bgm.volume = 0.2;                 // 環境音音量低，配角
   if (!AudioSettings.bgmMuted) bgm.play().catch(()=>{});  // 見第4節 localStorage 靜音狀態
   ```
   > autoplay 政策 OK：`showTitleScreen()` 一定在使用者點過登入按鈕之後才跑，已有使用者手勢。`.catch()` 防呆。

3. **停止點：進入遊戲時淡出/停止** — `startGame(lvl)` **L1394**（`titleScreen` 被隱藏那一行附近）。混搭方向 = 遊戲中無 BGM，所以進遊戲要停。建議淡出（避免硬切）：
   ```js
   fadeOutBgm(document.getElementById('titleBgm'), 600);  // 600ms 淡出後 pause
   ```
   簡易 `fadeOutBgm`：用 setInterval 每 50ms 降 volume，到 0 後 `pause()` 並把 volume 復原（下次進標題才對）。若不想寫淡出，直接 `bgm.pause()` 也行。

4. **回標題時重新播放** — `goTitle()` **L1933**（也把 `titleScreen` 設回 flex）。同 #2 邏輯：`if (!AudioSettings.bgmMuted) bgm.play()`。
   > `showTitleScreen()` 與 `goTitle()` 兩個入口都要能觸發播放；可抽一個 `playTitleBgm()` 共用。

5. **聽聲辨字模式的標題 BGM**：標題環境音只在標題畫面播，聽聲辨字模式是「遊戲中」，不涉及標題 BGM。聽聲辨字模式下的**遊戲 BGM**處理見第 5 節（建議暫停 / 壓到極低）。（另 #7 sfxTick 音效要在 listenMode 排除，見第 2 節。）

---

## 4. 音量開關 UI 需求規格（給小排版）

目標：一顆喇叭圖示按鈕，一鍵切換「全部聲音（音效 + 標題 BGM）開/關」。**不含詞彙發音**——發音是教學核心，永遠開著，不受這顆按鈕影響。

### 素材（已在庫）
- 開：`public/images/ui/ui-volume-on.png`（喇叭有聲）
- 關：`public/images/ui/ui-volume-off.png`（喇叭靜音）
- 依當前靜音狀態切換這兩張圖。

### 建議擺放
- **標題畫面角落**，跟「排行榜 / 登出」按鈕同一排（那排已是導覽按鈕群，語意一致）。
- 遊戲畫面若也想放，可放 HUD 角落；但最低要求是標題畫面有即可（BGM 只在標題響）。

### 點擊行為
按一下 = 切換靜音狀態，同時做三件事：
```js
const nextMuted = !AudioSettings.muted;
AudioSettings.muted = nextMuted;

// (1) 音效：呼叫 sfx.js 暴露的接口
Sfx.setMuted(nextMuted);

// (2) 標題 BGM：一起靜音/恢復
const bgm = document.getElementById('titleBgm');
if (nextMuted) { bgm.pause(); }
else if (document.getElementById('titleScreen').style.display !== 'none') { bgm.play().catch(()=>{}); }

// (3) 換圖示 + 記住狀態
volBtn.querySelector('img').src = nextMuted
  ? 'public/images/ui/ui-volume-off.png'
  : 'public/images/ui/ui-volume-on.png';
localStorage.setItem('ht_muted', nextMuted ? '1' : '0');
```

### 狀態持久化（localStorage，重整後保持）
- **key**：`ht_muted`（值 `'1'`=靜音 / `'0'`=有聲）。
- **頁面載入時**讀回並套用（放在 sfx.js 引入之後、標題 BGM 啟動之前）：
  ```js
  const AudioSettings = { muted: localStorage.getItem('ht_muted') === '1' };
  Sfx.setMuted(AudioSettings.muted);                 // 音效跟隨
  // 圖示初始狀態也要依 AudioSettings.muted 設好
  // 標題 BGM 啟動時（第3節）已用 !AudioSettings.muted 判斷，一致
  ```
  > 建議把上面那個 `AudioSettings` 物件當成 BGM 判斷（第 3 節用的 `AudioSettings.bgmMuted`）與音效判斷的**單一真相來源**——統一用 `AudioSettings.muted` 即可，一顆按鈕管全部，最簡單。

### sfx.js 暴露的接口（小排版可用）
| 接口 | 用途 |
|---|---|
| `Sfx.setMuted(true/false)` | 音效靜音 / 解除（這顆按鈕主要用這個） |
| `Sfx.isMuted()` | 讀目前音效靜音狀態 |
| `Sfx.setVolume(0..1)` | 若日後想做音量滑桿（非開關），調整音效整體音量（預設 0.9） |
| `Sfx.getVolume()` | 讀音效整體音量 |

> 若之後想把「音效」與「BGM」拆成兩顆獨立開關，接口都已具備（BGM 直接控 `<audio>.pause()/play()`，音效控 `Sfx.setMuted`）。目前規格是**一顆按鈕管全部**，最省事。

---

## 5. 遊戲進行中 BGM（有節奏的 chiptune loop）★本次新增，給小工程

**檔案**：`C:\Users\asd81\Documents\Claude\01-Game\public\audio\bgm\game-loop.mp3`
**用途**：只在**遊戲進行中**播放（標題畫面不放這首，標題放環境音）。溫馨奇幻繪本管弦樂——豎琴 + 木笛（recorder）主奏的柔和 RPG 情境曲，襯托打字狩獵的探索感，與 v2 細緻繪本/RPG 美術調性相搭。

> 🔄 **更換紀錄（2026-07-03）**：原本此位置為 8-bit chiptune（HydroGene「Slay The Evil」），使用者反映「太出戲、跟細緻繪本/RPG 美術完全不搭」，已否決 chiptune 方向。**本次改為溫馨奇幻繪本管弦樂**（下表）。**檔名不變（`game-loop.mp3`），小工程既有的第 5 節接線 / ducking / 切換邏輯完全不用改，換檔即生效。**

### 5.1 素材來源與授權（CC0，學校教學場景，已核實乾淨）

| 項目 | 內容 |
|---|---|
| 檔名 | `game-loop.mp3`（檔名沿用，換內容） |
| 曲名 | **Town Theme RPG** |
| 內容 | 溫馨奇幻 RPG 情境配樂：**豎琴（harp）＋ 木笛（recorder）**為主的柔和管弦樂，溫暖、輕柔、帶探索/冒險感，**無人聲**、非戰鬥史詩、無電子/chiptune、無族群音樂元素。作者原描述：「Town theme for an RPG. Typical harps and recorders fare perfect for your RPG.」 |
| 格式 | MP3, 44.1kHz, Joint Stereo, VBR |
| 長度 | 約 **97.5 秒（1:38）** |
| 檔案大小 | 約 **1.32 MB** |
| 授權 | **CC0 1.0（Creative Commons Zero, Public Domain Dedication）** — 免署名、可商用、可改作 |
| 作者 | **cynicmusic**（Alex McCulloch；OpenGameArt 知名 CC0 遊戲音樂貢獻者，2013-12-15 釋出） |
| 來源頁 | OpenGameArt: `Town Theme RPG`（https://opengameart.org/content/town-theme-rpg）— 頁面授權欄明確標示 CC0 Public Domain |
| 直接下載 URL（MP3） | `https://opengameart.org/sites/default/files/TownTheme.mp3` |
| 需標示 | CC0 不強制標示（如頁尾想加 credit 可寫「Game BGM: "Town Theme RPG" by cynicmusic, CC0, via OpenGameArt.org」） |

> ✅ 尺寸/格式都在規範內（97.5s ≈ 達標、**1.32MB** ✅ 比舊檔更小、mp3 ✅、無人聲 ✅、風格符合溫馨奇幻繪本管弦樂 ✅）。這首會在遊戲中一直循環播放，1.32MB 很輕，無需再壓。
> loop 接縫：本檔是完整曲目非「無縫剪裁 loop」，用 HTML5 `<audio loop>` 到頭會自動接回開頭。管弦樂/豎琴收尾較柔和，接縫比 chiptune 節拍更不明顯，可接受。若日後想要完全無縫淡入淡出剪裁，需在有 ffmpeg 的機器上做（本環境無 ffmpeg）；目前直接 loop 可接受。

### 5.2 建議做法：把兩首 BGM + ducking + 靜音收進一個小管理器

現在狀態變多了（標題環境音 / 遊戲 BGM 兩首切換、詞彙發音 ducking、統一靜音）。**建議不要用兩個各自為政的 `<audio>` 加散落 if**，而是抽一個小管理物件（例如 `BgmManager`）當單一真相來源。現有已實作的 `getTitleBgm()`/`playTitleBgm()`/`fadeOutBgm()`/`setAudioMuted()` 可以併進去或包一層。核心概念：

- 兩個 `<audio>` 元素：`#titleBgm`（已有）＋新增 `#gameBgm`。
- 一個「目前該播哪首」的狀態：`none | title | game`。
- ducking 只作用在**遊戲 BGM**（標題畫面不會有詞彙發音，不需 ducking）。
- 統一靜音（`setAudioMuted`）要同時管兩首。

HTML 加一個元素（放 body 內，與 `#titleBgm` 並列）：
```html
<audio id="gameBgm" src="public/audio/bgm/game-loop.mp3" loop preload="auto"></audio>
```

建議常數（可調）：
```js
const GAME_BGM_VOL_NORMAL = 0.15;  // 遊戲 BGM 正常音量（比標題 0.2 再低一點，因會一直播）
const GAME_BGM_VOL_DUCK   = 0.06;  // 詞彙發音播放時壓低到這裡（0.05–0.08 區間）
const GAME_BGM_VOL_LISTEN = 0.03;  // 聽聲辨字模式：極低（或直接 pause，見 5.5）
```

### 5.3 啟動 / 停止接線點（對齊現有函式名）

| 時機 | 函式（`hunter-truku-v2.html`） | 遊戲 BGM 動作 | 標題 BGM 動作（已存在，順帶說明） |
|---|---|---|---|
| 進遊戲 | `startGame(lvl)` **L1501** | **淡入**播放 `#gameBgm`（音量→ `GAME_BGM_VOL_NORMAL`）；若 `AudioSettings.muted` 則不播 | 已有：`fadeOutBgm(titleBgm)` 淡出停止。← 兩件事同一時機做 |
| Game Over | `gameOver()` **L1981** | **停止**（建議淡出）`#gameBgm` | 不動（此時不在標題） |
| 過關 | `stageClear()` **L1994** | **停止**（建議淡出）`#gameBgm` | 不動 |
| 回標題 | `goTitle()` **L2064** | **停止** `#gameBgm` | 切回標題環境音：`playTitleBgm()`（已有邏輯） |

> autoplay 政策 OK：`startGame()` 一定在使用者點過登入 + 選關按鈕之後，已有手勢。`.play()` 記得 `.catch(()=>{})` 防呆。
> 建議把「淡出遊戲 BGM」做成跟 `fadeOutBgm` 一樣的 setInterval 降 volume；或直接抽 `fadeBgm(el, from, to, ms, thenPause)` 通用函式，淡入淡出共用。

### 5.4 ❗ducking（最重要——保護教學核心）

詞彙發音（klokah.tw，`playWordAudio()` **L2182**，用全域 `_currentAudio = new Audio(...)`）是遊戲最重要的聲音。遊戲 BGM 在發音播放期間**必須自動壓低**，發音結束後恢復。**不要改 `playWordAudio` / `_currentAudio` 的既有邏輯**，只在其生命週期事件上「掛」ducking：

- **壓低（duck）時機**：`playWordAudio()` 內 `_currentAudio.play()` 之後（發音開始）→ 把 `#gameBgm.volume` 降到 `GAME_BGM_VOL_DUCK`（0.06，建議區間 0.05–0.08）。
- **恢復（restore）時機**：詞彙發音播完 → 把 `#gameBgm.volume` 升回 `GAME_BGM_VOL_NORMAL`（0.15）。監聽 `_currentAudio` 的 **`ended`** 事件；為保險也監聽 `pause`/`error`（發音被下一題打斷時 `playWordAudio` 會先 `pause()` 舊的 `_currentAudio`，那一刻其實緊接著又播新的，可維持 duck 不必急著恢復）。
- **不硬切、用短過渡**：建議降/升音量用 ~120–200ms 小淡變（setInterval 幾步），避免「噗」一下的突兀感。發音只有 1–2 秒，過渡要短。
- **只在遊戲 BGM 正在播時才 duck**（標題畫面沒有 `#gameBgm` 在播、也沒發音，天然不觸發）。
- **與統一靜音的關係**：若 `AudioSettings.muted`，遊戲 BGM 本來就靜音/停播，ducking 邏輯要能 no-op（判斷 `#gameBgm` 是否在播、是否 muted，再決定要不要動 volume），不要在靜音時反而把 volume 改花掉。

實作提示（掛在既有 `playWordAudio` 生命週期，不改其判定邏輯）：
```js
// 在 playWordAudio() 內、_currentAudio.play() 之後：
BgmManager.duck();                              // 遊戲 BGM → 0.06（若正在播且未 muted）
_currentAudio.addEventListener('ended', () => BgmManager.unduck());   // 發音完 → 回 0.15
_currentAudio.addEventListener('error', () => BgmManager.unduck());
// 注意：現有 listenMode 已用 _currentAudio.onended 換 🔊 圖示，
// 用 addEventListener 追加監聽不會覆蓋既有 onended（兩者可並存）。
```

### 5.5 聽聲辨字模式（`G.listenMode`）

玩家在此模式**專心聽發音打字**，遊戲 BGM 干擾最敏感。建議二選一（推薦 A）：
- **A（推薦）暫停遊戲 BGM**：進入聽聲辨字回合時 `#gameBgm.pause()`，離開該模式恢復。最乾淨、發音零競爭。
- **B 壓到極低**：`#gameBgm.volume = GAME_BGM_VOL_LISTEN`（0.03 以下）且此模式下 ducking 恢復也只回到這個極低值（不回 0.15）。

`G.listenMode` 的切換點：`setMode()`（模式切換，第 2 節 #12 提到 L1945 一帶，以實檔為準）。在切到 listenMode 時做上述 A/B，切回一般模式時恢復正常音量。

### 5.6 納入統一靜音（`setAudioMuted` / `toggleAudioMuted`）★需擴充

現有 `setAudioMuted(m)` **L1149** 目前只控**音效（Sfx）+ 標題 BGM**。本次要**擴充成也管遊戲 BGM**，確保一顆喇叭按鈕靜音時兩首 BGM 都靜。改動點（在既有 `setAudioMuted` 內）：

```js
function setAudioMuted(m) {
  AudioSettings.muted = !!m;
  if (window.Sfx) Sfx.setMuted(AudioSettings.muted);

  const titleBgm = getTitleBgm();
  const gameBgm  = document.getElementById('gameBgm');   // ← 新增

  if (AudioSettings.muted) {
    if (titleBgm) titleBgm.pause();
    if (gameBgm)  gameBgm.pause();                        // ← 新增：一起靜音
  } else {
    // 依「目前在哪個畫面」恢復對的那首（不是兩首都播）
    const ts = document.getElementById('titleScreen');
    const onTitle = ts && getComputedStyle(ts).display !== 'none';
    if (onTitle) { playTitleBgm(); }                      // 標題 → 環境音
    else if (gameBgm && /* 目前在遊戲進行中 */ true) {    // 遊戲中 → 遊戲 BGM
      gameBgm.volume = GAME_BGM_VOL_NORMAL;
      gameBgm.play().catch(()=>{});
    }
  }
  localStorage.setItem(HT_MUTED_KEY, AudioSettings.muted ? '1' : '0');
  return AudioSettings.muted;
}
```
> 「目前在遊戲進行中」的判斷用你既有的遊戲狀態旗標（例如遊戲畫面 display 或 `G.playing` 之類，以實檔為準），避免在標題時誤播遊戲 BGM。`toggleAudioMuted()` 不用改（它只呼叫 `setAudioMuted`）。

---

## 交接摘要
- **小工程**：
  - 第 1 節引入 sfx.js（1 行 script）＋第 2 節在 12 個事件各加一行呼叫。
  - 第 3 節加 `<audio id="titleBgm">` 與播放/停止接線（部分已實作：`getTitleBgm`/`playTitleBgm`/`fadeOutBgm` 已在檔案內）。
  - **第 5 節（本次重點）**：加 `<audio id="gameBgm" src="public/audio/bgm/game-loop.mp3" loop>`；在 `startGame`/`gameOver`/`stageClear`/`goTitle` 接遊戲 BGM 淡入淡出；在 `playWordAudio` 生命週期掛 **ducking**（發音時 0.06、發音完回 0.15）；聽聲辨字模式暫停遊戲 BGM；**擴充 `setAudioMuted` 讓靜音同時管兩首 BGM**。建議抽 `BgmManager` 統一管兩首切換 + ducking + 靜音。
- **小排版**：第 4 節喇叭按鈕維持不變（已呼叫統一 `toggleAudioMuted`/`setAudioMuted`，靜音範圍由第 5.6 擴充後自動涵蓋遊戲 BGM，UI 端無需改）。註：實際圖示路徑為 `/images/ui/ui-volume-on|off.png`（絕對根路徑，非 `public/images/ui/`）。
- **素材狀態**：
  - 標題 BGM `title-ambience.mp3`（PD，123s/3.27MB）— 已完成。
  - 遊戲 BGM `game-loop.mp3`（**CC0**，「Town Theme RPG」by cynicmusic，97.5s/1.32MB，豎琴+木笛溫馨奇幻管弦樂，無人聲）— **2026-07-03 已更換**（取代原 chiptune；檔名不變，接線免改）。
- **待補（可選優化）**：兩首 BGM 若要更小/無縫 loop 需 ffmpeg（本環境無），非必要。
