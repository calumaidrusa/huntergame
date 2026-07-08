#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_vocab.py —— klokah 結構化 XML → 種子資料管線（多語別）

用法：
  python fetch_vocab.py --dialect-id 33 --lang-code trv
  python fetch_vocab.py --dialect-id 2  --lang-code ami-siwkolan
  python fetch_vocab.py --all           # 依 dialectView.xml 跑全部 42 語別（lang_code 自動）

輸出：
  backend/seeds/{lang_code}.js   —— module.exports 一個 9 欄陣列，格式比照 backend/vocab_seed.js
  vocab/{lang_code}_final.json   —— 中繼 JSON（方便重跑 / diff）
  reports/{lang_code}_specialchars.txt —— 逐語別特殊字元掃描報表（§2.5）

種子欄位順序（9 欄，比照 backend/vocab_seed.js）：
  [word, chinese, english, category, level, emoji, hint, image_path, audio_path]

重要約定：
- image_path：全語別共用同一套圖（URL 不含 dialectId）。klokah picture 存在才寫 URL，
  否則 null（比照 trv 既有邏輯，用 image_check_results.json 當存在性快取；缺的抽 HEAD 補）。
- audio_path：含 dialectId（.../audio/word/{dialectId}/{code}.wav）；sound=0 的詞設 null。
- 「無此詞彙」/空 aboriginal 佔位一律跳過。
- level 只接受 E/M/H/MH，遇其他值 raise（不吞）。
- 特殊字元：正式拼寫類（撇號 ' ʼ '、^、-、/、:）原樣保留；備註滲入類（括號/句點/…/逗號等）
  在此清理（切掉尾巴括號註記、去掉句點），並在報表逐筆列出以供人工複核。

中文終端會顯示亂碼（cp950）→ 一律寫檔驗證，不靠 print 中文判斷。
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

BASE = os.path.dirname(os.path.abspath(__file__))
SEED_DIR = os.path.join(BASE, 'backend', 'seeds')
VOCAB_DIR = os.path.join(BASE, 'vocab')
REPORT_DIR = os.path.join(BASE, 'reports')
IMG_CHECK_PATH = os.path.join(BASE, 'image_check_results.json')

XML_VOCAB = "https://klokah.tw/competition/vocabulary/xml/{dialect_id}/vocabulary.xml"
XML_DIALECTS = "https://klokah.tw/competition/vocabulary/xml/dialectView.xml"
PICTURE_URL = "https://klokah.tw/competition/vocabulary/picture/{img_code}.jpg"
AUDIO_URL = "https://web.klokah.tw/vocabulary/audio/word/{dialect_id}/{code}.wav"

UA = {'User-Agent': 'Mozilla/5.0'}

LEVEL_MAP = {'E': 1, 'M': 2, 'H': 3, 'MH': 4}

# class(兩碼字串) -> 類別中文名。全語別共用同一套 1094 詞框架，故此對照表語別無關。
# 由既有 trv 種子與 XML 逐筆對齊萃取而得（36 類，1:1，零衝突）。
CLASS_CATEGORY = {
    '01': '數字計量', '02': '代名詞、指示詞', '03': '疑問詞', '04': '親屬稱謂',
    '05': '人物、身分', '06': '身體部位', '07': '動物(含昆蟲)', '08': '植物',
    '09': '物品(不含食品)', '10': '山川地理', '11': '自然景觀', '12': '建築',
    '13': '時間', '14': '空間', '15': '農耕', '16': '狩獵', '17': '宗教',
    '18': '織布服飾', '19': '傳統文化與習俗', '20': '交通', '21': '食物(非植物)',
    '22': '顏色', '23': '聲音', '24': '抽象名詞', '25': '行動', '26': '肢體動作',
    '27': '飲食', '28': '認知感官', '29': '情緒思維', '30': '生活作息',
    '31': '生老病死傷', '32': '特徵', '33': '助動詞', '34': '其他',
    '35': '否定詞', '36': '助詞或其他',
}

# 「無此詞彙」佔位（各語別可能用不同字串），統一跳過。
PLACEHOLDER_ABORIGINAL = {'無此詞彙', ''}

# ── 特殊字元分類（§2.5）────────────────────────────────────────────
# 正式拼寫類：原樣保留，交前端正規化層處理（不在此清理）
APOSTROPHES = {'ʼ', '’', "'"}   # MODIFIER LETTER APOSTROPHE / RIGHT SINGLE QUOTE / straight '
# 各族正式羅馬字書寫系統用到、但標準鍵盤打不出的字母（跨全 42 語別掃描確認為系統性用字）：
#   ʉ U+0289（拉阿魯哇/卡那卡那富/鄒/魯凱等的央高元音）
#   ɨ U+0268（多納魯凱等）  ṟ U+1E5F（萬大泰雅）  é U+00E9 / ē U+0113（元音變體）
#   ː U+02D0（長音符）
# 這些如同撇號，屬「正式拼寫、鍵盤難打」，前端正規化層需逐語別對應（下一階段）。
EXTENDED_LETTERS = {'ʉ', 'ɨ', 'ṟ', 'é', 'ē', 'ː'}
# 「兩種說法皆可」分隔符：/ 及其變體（∕ U+2215、～/~ 波浪號）——前端拆 variants 用。
VARIANT_SEPARATORS = {'/', '∕', '～', '~'}
FORMAL_KEEP = APOSTROPHES | EXTENDED_LETTERS | VARIANT_SEPARATORS | {'^', '-', ':'}
# 白名單：ASCII 字母/數字/空白 + 正式拼寫類。其餘視為「可疑」須進報表。
WHITELIST_RE = re.compile("[A-Za-z0-9 ʼ’'^/:\\-]|" +
                          "[" + "".join(EXTENDED_LETTERS | VARIANT_SEPARATORS) + "]")

# 備註滲入類（管線不動字元、僅報表標記供人工複核）：括號、句點、逗號、刪節號、
# 各式標點與 CJK 漢字（漢字滲入 aboriginal 屬資料品質問題）。
MEMO_LEAK_CHARS = set('（）()【】「」『』。．.，,、；;…‧·　_<>+\\：!?')  # incl fullwidth space U+3000


# ── 工具 ────────────────────────────────────────────────────────
def http_get(url, retries=3, timeout=30):
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except Exception as e:
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"GET failed after {retries} tries: {url} :: {last}")


def head_ok(url, timeout=8):
    try:
        req = urllib.request.Request(url, method='HEAD', headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False


def load_image_cache():
    """image_check_results.json：code(hyphen) -> bool，圖片全語別共用故可跨語別重用。"""
    if os.path.exists(IMG_CHECK_PATH):
        with open(IMG_CHECK_PATH, encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_image_cache(cache):
    with open(IMG_CHECK_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def normalize_source(word):
    """對 aboriginal 原字串做「無損」正規化：只折疊空白、去頭尾空白。
    不動任何實際字元（含括號/撇號/^///:）——保持與 trv 既有生產資料一致（fidelity 優先）。
    真正的清理決策交由報表 → 人工複核（§2.5），不在管線靜默改字。
    回傳 (正規化後字串, 是否有動過空白)。"""
    s = re.sub(r'\s+', ' ', word).strip()
    return s, (s != word)


def is_cjk(ch):
    """是否為 CJK 漢字（滲入 aboriginal 屬資料品質問題，歸類為備註滲入）。"""
    o = ord(ch)
    return (0x3400 <= o <= 0x9FFF) or (0xF900 <= o <= 0xFAFF) or (0x20000 <= o <= 0x2FFFF)


def classify_specials(word):
    """掃描 word 內非白名單字元，分成兩類供報表：
      memo_leak:  括號/句點/逗號/…/標點/CJK 漢字 → 疑似備註滲入，人工複核決定是否清
      unknown:    以上以外、又不在白名單的字元（理論上該為空；出現代表有新型態需人工判定）
    白名單已含正式拼寫類（撇號/^/-///:/擴充字母 ʉ ɨ ṟ é ē ː 等），不會落入這兩類。
    """
    memo_leak = sorted({ch for ch in word if ch in MEMO_LEAK_CHARS or is_cjk(ch)})
    non_white = sorted({ch for ch in word if not WHITELIST_RE.match(ch)})
    unknown = sorted(set(non_white) - set(memo_leak))
    return memo_leak, unknown


# ── 解析單一語別 ────────────────────────────────────────────────
def parse_dialect(dialect_id, lang_code, img_cache, do_head_fill=True):
    """抓 + 解析一個 dialectId，回傳 (rows, report_lines, stats)。
    rows: list of 9 欄陣列 (dict 形式，之後轉 JS)。"""
    url = XML_VOCAB.format(dialect_id=dialect_id)
    raw = http_get(url)
    root = ET.fromstring(raw)
    vocs = root.findall('vocabulary')

    rows = []
    report = []            # 特殊字元/清理報表逐筆
    level_counter = Counter()
    skipped_placeholder = 0
    cleaned_count = 0
    special_counter = Counter()   # 各特殊字元出現「詞數」
    apostrophe_words = 0
    slash_words = 0
    caret_words = 0

    # 需要補 HEAD 的圖片 code（不在快取內）
    pending_img = []

    for v in vocs:
        cls = (v.findtext('class') or '').strip()
        order = (v.findtext('order') or '').strip()
        image_field = (v.findtext('image') or '').strip()
        sound = (v.findtext('sound') or '').strip()
        level_letter = (v.findtext('level') or '').strip()
        chinese = (v.findtext('chinese') or '').strip()
        aboriginal_raw = (v.findtext('aboriginal') or '').strip()
        memo = (v.findtext('memo') or '').strip()

        code_us = f"{cls}_{order}"          # 底線：圖片
        code_hy = f"{cls}-{order}"          # 連字號：音檔

        # 佔位跳過
        if aboriginal_raw in PLACEHOLDER_ABORIGINAL:
            skipped_placeholder += 1
            continue

        # level 嚴格檢查——遇未知值報錯不吞
        if level_letter not in LEVEL_MAP:
            raise ValueError(
                f"[{lang_code}] {code_hy} 未知 level 值 {level_letter!r}（chinese={chinese!r}）"
            )
        level = LEVEL_MAP[level_letter]
        level_counter[level] += 1

        category = CLASS_CATEGORY.get(cls, '其他')

        # ── 無損正規化（只折疊空白，不動任何字元，保 trv fidelity）──
        word, ws_changed = normalize_source(aboriginal_raw)
        if ws_changed:
            cleaned_count += 1

        # ── 特殊字元掃描 + 分類（正規化後字串為準）──
        memo_leak, unknown = classify_specials(word)
        # 逐類別統計正式拼寫特殊字（撇號/斜線/^）——供報表與 §2.5 判定層佐證
        if any(a in word for a in APOSTROPHES):
            apostrophe_words += 1
        if '/' in word:
            slash_words += 1
        if '^' in word:
            caret_words += 1
        # 累計所有「值得注意」字元的出現詞數（正式拼寫類 + 疑似備註類 + 未知類），每詞每字元計一次
        noteworthy = {ch for ch in word if (ch in FORMAL_KEEP or ch in MEMO_LEAK_CHARS
                                            or not WHITELIST_RE.match(ch))}
        for ch in noteworthy:
            special_counter[ch] += 1

        # 報表：疑似備註滲入（人工複核決定是否清）
        if memo_leak:
            report.append(
                f"[MEMO?] {code_hy}\t{chinese}\t{word!r}\t疑似備註字元:{''.join(memo_leak)}"
            )
        # 報表：白名單外、又非已知備註類的真正未知字元（理論上該為空）
        if unknown:
            report.append(
                f"[UNKNOWN] {code_hy}\t{chinese}\t{word!r}\t未知字元:{''.join(unknown)}"
            )
        # 報表：含正式拼寫特殊字（保留必打，交前端正規化層）
        formal_here = sorted({ch for ch in word if ch in FORMAL_KEEP})
        if formal_here:
            report.append(
                f"[FORMAL] {code_hy}\t{chinese}\t{word!r}\t正式拼寫特殊字:{''.join(formal_here)}"
            )

        # ── image_path（共用圖，用快取判存在；缺則排隊 HEAD）──
        img_key = image_field.replace('_', '-') if image_field else code_hy
        cached = img_cache.get(img_key)
        if cached is None and do_head_fill:
            pending_img.append(img_key)

        rows.append({
            'code_us': code_us, 'code_hy': code_hy,
            'img_field': image_field or code_us,
            'img_key': img_key,
            'word': word, 'chinese': chinese, 'english': '',
            'category': category, 'level': level, 'emoji': '🎯',
            'hint': word,
            'sound': sound,
        })

    # ── 補 HEAD（圖片存在性；全語別共用，補進 img_cache）──
    if pending_img:
        pending_uniq = sorted(set(pending_img))
        print(f"  [{lang_code}] 需補 HEAD 圖片檢查 {len(pending_uniq)} 筆 ...")
        with ThreadPoolExecutor(max_workers=20) as ex:
            futs = {ex.submit(head_ok, PICTURE_URL.format(img_code=k.replace('-', '_'))): k
                    for k in pending_uniq}
            for fut in as_completed(futs):
                img_cache[futs[fut]] = fut.result()

    # ── 組出最終 image_path / audio_path 字串 ──
    for r in rows:
        has_img = img_cache.get(r['img_key'], False)
        r['image_path'] = PICTURE_URL.format(img_code=r['img_field']) if has_img else None
        # audio：sound=1 才寫；含 dialectId
        r['audio_path'] = (AUDIO_URL.format(dialect_id=dialect_id, code=r['code_hy'])
                           if r['sound'] == '1' else None)

    stats = {
        'total_xml': len(vocs),
        'valid': len(rows),
        'skipped_placeholder': skipped_placeholder,
        'levels': dict(sorted(level_counter.items())),
        'cleaned': cleaned_count,
        'with_image': sum(1 for r in rows if r['image_path']),
        'with_audio': sum(1 for r in rows if r['audio_path']),
        'apostrophe_words': apostrophe_words,
        'slash_words': slash_words,
        'caret_words': caret_words,
        'special_chars': {ch: c for ch, c in special_counter.most_common()},
    }
    return rows, report, stats


# ── 輸出 ────────────────────────────────────────────────────────
def js_val(v):
    if v is None:
        return 'null'
    return json.dumps(v, ensure_ascii=False)


def write_seed_js(lang_code, dialect_id, name_zh, rows):
    os.makedirs(SEED_DIR, exist_ok=True)
    lines = [
        f"// {name_zh}（dialectId={dialect_id}, lang_code={lang_code}）詞彙種子資料",
        f"// 自動生成 by fetch_vocab.py，來源：klokah 結構化 XML",
        f"// 格式: [word, chinese, english, category, level, emoji, hint, image_path, audio_path]",
        f"// level: 1=初級 2=中級 3=高級 4=中高級",
        f"// image_path/audio_path 為 null 代表無對應素材",
        f"const SEED = [",
    ]
    for r in rows:
        lines.append(
            "  [" + ", ".join([
                js_val(r['word']), js_val(r['chinese']), js_val(r['english']),
                js_val(r['category']), str(r['level']), js_val(r['emoji']),
                js_val(r['hint']), js_val(r['image_path']), js_val(r['audio_path']),
            ]) + "],"
        )
    lines.append("];")
    lines.append("module.exports = SEED;")
    out = os.path.join(SEED_DIR, f"{lang_code}.js")
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    return out


def write_json(lang_code, rows):
    os.makedirs(VOCAB_DIR, exist_ok=True)
    out = os.path.join(VOCAB_DIR, f"{lang_code}_final.json")
    slim = [{
        'code': r['code_hy'], 'word': r['word'], 'chinese': r['chinese'],
        'category': r['category'], 'level': r['level'],
        'image_path': r['image_path'], 'audio_path': r['audio_path'],
    } for r in rows]
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(slim, f, ensure_ascii=False, indent=2)
    return out


def write_report(lang_code, dialect_id, name_zh, report, stats):
    os.makedirs(REPORT_DIR, exist_ok=True)
    out = os.path.join(REPORT_DIR, f"{lang_code}_specialchars.txt")
    with open(out, 'w', encoding='utf-8') as f:
        f.write(f"# 特殊字元 / 清理報表 — {name_zh} (dialectId={dialect_id}, lang_code={lang_code})\n")
        f.write(f"# 統計\n")
        f.write(json.dumps(stats, ensure_ascii=False, indent=2))
        f.write("\n\n# 逐筆（CLEAN=備註滲入已清理 / SPECIAL=保留的正式拼寫特殊字 / EMPTY=清理後為空）\n")
        f.write('\n'.join(report) if report else '(無)')
        f.write('\n')
    return out


# ── 語別清單 ────────────────────────────────────────────────────
# 16 族／42 語別 dialectId -> (lang_code, name_zh)。
# 依 dialectView.xml 權威清單建置（每一 dialectId 的 name_zh 皆與 XML 逐字核對；
# resolve_lang() 會於執行時再次比對 XML dialectCh，不符即報錯，避免 slug 錯配）。
# lang_code：族別採 ISO 639-3（阿美 ami、泰雅 tay、賽夏 xsy、邵 ssf、賽德克 sdq、
# 布農 bnn、排灣 pwn、魯凱 dru、太魯閣 trv、噶瑪蘭 ckv、鄒 tsu、卡那卡那富 xnb、
# 拉阿魯哇 sxr、卑南 pyu、雅美 tao、撒奇萊雅 szy），單語別者不加後綴，多方言者加 ASCII slug 後綴。
# dialectId 33（太魯閣語）固定 'trv'（對齊既有 vocabulary.lang_code DEFAULT）。
# dialectId 12 不存在。
DIALECT_LANG = {
    1:  ('ami-nanshi',      '南勢阿美語'),
    2:  ('ami-siwkolan',    '秀姑巒阿美語'),
    3:  ('ami-coastal',     '海岸阿美語'),
    4:  ('ami-malan',       '馬蘭阿美語'),
    5:  ('ami-hengchun',    '恆春阿美語'),
    6:  ('tay-squliq',      '賽考利克泰雅語'),
    7:  ('tay-culi',        '澤敖利泰雅語'),
    8:  ('tay-mnawyan',     '汶水泰雅語'),
    9:  ('tay-mabtalah',    '萬大泰雅語'),
    10: ('tay-skikun',      '四季泰雅語'),
    11: ('tay-yilan-culi',  '宜蘭澤敖利泰雅語'),
    # 12 不存在
    13: ('xsy',             '賽夏語'),
    14: ('ssf',             '邵語'),
    15: ('sdq-tgdaya',      '都達語'),
    16: ('sdq-tkdaya',      '德固達雅語'),
    17: ('sdq-truku',       '德鹿谷語'),
    18: ('bnn-takituduh',   '卓群布農語'),
    19: ('bnn-takbanuaz',   '卡群布農語'),
    20: ('bnn-takivatan',   '丹群布農語'),
    21: ('bnn-takitakbanuad', '巒群布農語'),
    22: ('bnn-isbukun',     '郡群布農語'),
    23: ('pwn-east',        '東排灣語'),
    24: ('pwn-north',       '北排灣語'),
    25: ('pwn-central',     '中排灣語'),
    26: ('pwn-south',       '南排灣語'),
    27: ('dru-budai',       '東魯凱語'),
    28: ('dru-wutai',       '霧台魯凱語'),
    29: ('dru-tanan',       '大武魯凱語'),
    30: ('dru-teldreka',    '多納魯凱語'),
    31: ('dru-maga',        '茂林魯凱語'),
    32: ('dru-mantauran',   '萬山魯凱語'),
    33: ('trv',             '太魯閣語'),
    34: ('ckv',             '噶瑪蘭語'),
    35: ('tsu',             '鄒語'),
    36: ('xnb',             '卡那卡那富語'),
    37: ('sxr',             '拉阿魯哇語'),
    38: ('pyu-nanwang',     '南王卑南語'),
    39: ('pyu-katratripul', '知本卑南語'),
    40: ('pyu-west',        '西群卑南語'),
    41: ('pyu-jianhe',      '建和卑南語'),
    42: ('tao',             '雅美語'),
    43: ('szy',             '撒奇萊雅語'),
}


def fetch_dialect_list():
    """抓 dialectView.xml → list of (dialect_id, dialect_ch, language_ch)。"""
    raw = http_get(XML_DIALECTS)
    root = ET.fromstring(raw)
    out = []
    for item in root.findall('item'):
        did = int(item.findtext('dialectId'))
        dch = (item.findtext('dialectCh') or '').strip()
        lch = (item.findtext('languageCh') or '').strip()
        out.append((did, dch, lch))
    return sorted(out)


def resolve_lang(dialect_id, dialect_ch):
    """回傳 (slug, name_zh)。name_zh 一律以 XML dialect_ch 為準。
    slug 取內建表；若內建表的預期名稱與 XML 不符 → raise（避免 dialectId/slug 錯配）。
    內建表沒有的 dialectId → 退回 d{dialectId}。"""
    entry = DIALECT_LANG.get(dialect_id)
    if entry is None:
        return f"d{dialect_id}", dialect_ch
    slug, expected_name = entry
    slug = slug.strip()
    if expected_name != dialect_ch:
        raise ValueError(
            f"dialectId={dialect_id} slug={slug!r} 預期名稱 {expected_name!r} "
            f"與 XML dialectCh {dialect_ch!r} 不符——請修正 DIALECT_LANG 對照表"
        )
    return slug, dialect_ch


def run_one(dialect_id, lang_code, name_zh, img_cache):
    print(f"== [{lang_code}] dialectId={dialect_id} {name_zh} ==")
    rows, report, stats = parse_dialect(dialect_id, lang_code, img_cache)
    seed_path = write_seed_js(lang_code, dialect_id, name_zh, rows)
    json_path = write_json(lang_code, rows)
    report_path = write_report(lang_code, dialect_id, name_zh, report, stats)
    print(f"  valid={stats['valid']} skipped={stats['skipped_placeholder']} "
          f"levels={stats['levels']} img={stats['with_image']} audio={stats['with_audio']} "
          f"cleaned={stats['cleaned']} specialWords(apos/slash/caret)="
          f"{stats['apostrophe_words']}/{stats['slash_words']}/{stats['caret_words']}")
    print(f"  -> {os.path.relpath(seed_path, BASE)} | {os.path.relpath(report_path, BASE)}")
    return stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dialect-id', type=int)
    ap.add_argument('--lang-code', type=str)
    ap.add_argument('--all', action='store_true', help='跑全部 42 語別')
    ap.add_argument('--list', action='store_true', help='只印語別清單')
    args = ap.parse_args()

    img_cache = load_image_cache()

    if args.list:
        for did, dch, lch in fetch_dialect_list():
            slug, _ = resolve_lang(did, dch)
            print(f"{did}\t{slug}\t{lch}\t{dch}")
        return

    summary = {}
    try:
        if args.all:
            dialects = fetch_dialect_list()
            for did, dch, lch in dialects:
                slug, name_zh = resolve_lang(did, dch)
                try:
                    summary[slug] = run_one(did, slug, name_zh, img_cache)
                except Exception as e:
                    print(f"  !! [{slug}] dialectId={did} 失敗: {e}")
                    summary[slug] = {'error': str(e)}
                save_image_cache(img_cache)   # 逐語別存快取，避免中斷全丟
        else:
            if not args.dialect_id or not args.lang_code:
                ap.error('請給 --dialect-id 與 --lang-code，或用 --all')
            # 若 dialectView 有名稱就用，否則用內建表
            name_zh = DIALECT_LANG.get(args.dialect_id, (None, args.lang_code))[1] or args.lang_code
            summary[args.lang_code] = run_one(args.dialect_id, args.lang_code, name_zh, img_cache)
            save_image_cache(img_cache)
    finally:
        save_image_cache(img_cache)

    # 寫總結
    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(os.path.join(REPORT_DIR, 'import_summary.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print("\n== 總結已寫 reports/import_summary.json ==")


if __name__ == '__main__':
    main()
