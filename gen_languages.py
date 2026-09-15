#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""由 fetch_vocab.DIALECT_LANG 產出 backend/seeds/languages.js（languages 表 seed）。"""
import sys, importlib.util, json
sys.stdout.reconfigure(encoding='utf-8')

sys.argv = ['gen_languages.py']
spec = importlib.util.spec_from_file_location("fv", "fetch_vocab.py")
fv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fv)
DL = fv.DIALECT_LANG

# 羅馬字自稱（族層級，保守填已知者；缺者 null，前端顯示時 fallback name_zh）
NATIVE = {
    'trv': 'Truku',
    'ami-nanshi': 'Pangcah', 'ami-siwkolan': 'Pangcah', 'ami-coastal': 'Pangcah',
    'ami-malan': 'Pangcah', 'ami-hengchun': 'Pangcah',
    'tay-squliq': 'Tayal', 'tay-culi': 'Tayal', 'tay-mnawyan': 'Tayal',
    'tay-mabtalah': 'Tayal', 'tay-skikun': 'Tayal', 'tay-yilan-culi': 'Tayal',
    'xsy': 'SaySiyat', 'ssf': 'Thao',
    'sdq-tgdaya': 'Seediq', 'sdq-tkdaya': 'Seediq', 'sdq-truku': 'Seediq',
    'bnn-takituduh': 'Bunun', 'bnn-takbanuaz': 'Bunun', 'bnn-takivatan': 'Bunun',
    'bnn-takitakbanuad': 'Bunun', 'bnn-isbukun': 'Bunun',
    'pwn-east': 'Paiwan', 'pwn-north': 'Paiwan', 'pwn-central': 'Paiwan', 'pwn-south': 'Paiwan',
    'dru-budai': 'Drekay', 'dru-wutai': 'Drekay', 'dru-tanan': 'Drekay',
    'dru-teldreka': 'Drekay', 'dru-maga': 'Drekay', 'dru-mantauran': 'Drekay',
    'ckv': 'Kavalan', 'tsu': 'Cou', 'xnb': 'Kanakanavu', 'sxr': 'Hlaʼalua',
    'pyu-nanwang': 'Pinuyumayan', 'pyu-katratripul': 'Pinuyumayan',
    'pyu-west': 'Pinuyumayan', 'pyu-jianhe': 'Pinuyumayan',
    'tao': 'Tao', 'szy': 'Sakizaya',
}


def jv(v):
    if v is None:
        return 'null'
    return json.dumps(v, ensure_ascii=False)


lines = [
    "// 語別對照表（languages 表 seed）。來源：klokah dialectView.xml（權威 name_zh）。",
    "// 欄位: { lang_code, dialect_id, name_zh, name_native, active }",
    "// dialectId 33（太魯閣語）lang_code 固定 'trv'，對齊 vocabulary.lang_code DEFAULT。",
    "// active=1 代表上架可選；預設全部語別 active=1（詞庫 seed 皆已備妥）。",
    "module.exports = [",
]
for did in sorted(DL):
    slug, name_zh = DL[did]
    slug = slug.strip()
    nat = NATIVE.get(slug)
    lines.append(
        f"  {{ lang_code: {jv(slug)}, dialect_id: {did}, "
        f"name_zh: {jv(name_zh)}, name_native: {jv(nat)}, active: 1 }},"
    )
lines.append("];")

with open('backend/seeds/languages.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')
print(f"languages.js written with {len(DL)} languages")
