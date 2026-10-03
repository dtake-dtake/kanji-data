# カタカナ書き順データ (Katakana Stroke Order Data)

カタカナの書き順をSVGパスで収録したオープンデータセットです。

## 収録文字

| 種類 | 文字数 | 内容 |
|:---|:---:|:---|
| 清音 | 46 | ア〜ン |
| 濁音 | 20 | ガ〜ド |
| 半濁音 | 5 | パ〜ポ |
| 小文字 | 9 | ァィゥェォャュョッ |
| 長音符 | 1 | ー |
| **合計** | **81** | |

## データ形式

```json
{
  "meta": {
    "name": "katakana-stroke-data",
    "version": "1.0.0",
    "viewBox": "0 0 109 109",
    "license": "CC-BY-SA-3.0",
    "attribution": "Based on KanjiVG by Ulrich Apel"
  },
  "characters": {
    "ア": {
      "char": "ア",
      "row": "ア行",
      "codePoint": "030a2",
      "strokeCount": 2,
      "paths": [
        "M23.5,26.25c...",
        "M53.12,41.12c..."
      ],
      "numbers": [
        { "num": 1, "x": 20.41, "y": 22.13 },
        { "num": 2, "x": 44.79, "y": 41.75 }
      ]
    }
  }
}
```

### フィールド

| フィールド | 型 | 説明 |
|:---|:---|:---|
| `char` | string | カタカナ1文字 |
| `row` | string | 行名（ア行、カ行、ガ行など） |
| `codePoint` | string | Unicode コードポイント（5桁16進数） |
| `strokeCount` | integer | 画数 |
| `paths` | string[] | SVGパスの配列（書き順通り） |
| `numbers` | object[] | 各画の番号表示位置（num, x, y） |

### 座標系

- **viewBox**: `0 0 109 109`
- SVG `<path d="...">` のd属性としてそのまま使用可能
- 座標は左上が原点 (0,0)、右下が (109, 109)

## 使い方

### JavaScript / HTML

```html
<svg viewBox="0 0 109 109" width="200" height="200">
  <!-- JSでpathを追加 -->
</svg>

<script>
  fetch('katakana.json')
    .then(r => r.json())
    .then(data => {
      const char = data.characters['ア'];
      char.paths.forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#333');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        document.querySelector('svg').appendChild(path);
      });
    });
</script>
```

### JSラッパー（HTMLから直接読み込み）

```html
<script src="katakana.js"></script>
<script>
  // window.KATAKANA_DATA.characters['ア'] でアクセス
  const ア = window.KATAKANA_DATA.characters['ア'];
  console.log(`画数: ${ア.strokeCount}`);
</script>
```

### Node.js

```js
const data = require('./katakana.json');
const ア = data.characters['ア'];
console.log(`画数: ${ア.strokeCount}`);
console.log(`パス: ${ア.paths}`);
```

### Python

```python
import json

with open('katakana.json', encoding='utf-8') as f:
    data = json.load(f)

char = data['characters']['ア']
print(f"画数: {char['strokeCount']}")
for i, path in enumerate(char['paths']):
    print(f"  {i+1}画目: {path[:50]}...")
```

## ライセンス

**Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0)**

ストロークデータは [KanjiVG](https://kanjivg.tagaini.net/) プロジェクト（© Ulrich Apel）のSVGパスデータをベースに、編集・調整を加えたものです。

利用時は以下のクレジット表記をお願いします：

```
Katakana stroke data based on KanjiVG (https://kanjivg.tagaini.net/)
Licensed under CC BY-SA 3.0
```

## 関連リンク

- [KanjiVG](https://kanjivg.tagaini.net/) — 元となった漢字・かなストロークデータ
- [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) — ライセンス全文
