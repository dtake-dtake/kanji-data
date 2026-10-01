# ひらがな書き順データ (Hiragana Stroke Order Data)

ひらがなの書き順をSVGパスで収録したオープンデータセットです。

## 収録文字

| 種類 | 文字数 | 内容 |
|:---|:---:|:---|
| 清音 | 46 | あ〜ん |
| 濁音 | 20 | が〜ど |
| 半濁音 | 5 | ぱ〜ぽ |
| 小文字 | 4 | ゃゅょっ |
| 長音符 | 1 | ー |
| **合計** | **76** | |

## データ形式

```json
{
  "meta": {
    "name": "hiragana-stroke-data",
    "version": "1.0.0",
    "viewBox": "0 0 109 109",
    "license": "CC-BY-SA-3.0",
    "attribution": "Based on KanjiVG by Ulrich Apel"
  },
  "characters": {
    "あ": {
      "char": "あ",
      "strokeCount": 3,
      "paths": [
        "M28.44,30.38c...",
        "M56.22,18.18c...",
        "M43.57,42.57c..."
      ]
    }
  }
}
```

### フィールド

| フィールド | 型 | 説明 |
|:---|:---|:---|
| `char` | string | ひらがな1文字 |
| `strokeCount` | integer | 画数 |
| `paths` | string[] | SVGパスの配列（書き順通り） |

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
  fetch('hiragana.json')
    .then(r => r.json())
    .then(data => {
      const char = data.characters['あ'];
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

### Node.js

```js
const data = require('./hiragana.json');
const あ = data.characters['あ'];
console.log(`画数: ${あ.strokeCount}`);
console.log(`パス: ${あ.paths}`);
```

### Python

```python
import json

with open('hiragana.json', encoding='utf-8') as f:
    data = json.load(f)

char = data['characters']['あ']
print(f"画数: {char['strokeCount']}")
for i, path in enumerate(char['paths']):
    print(f"  {i+1}画目: {path[:50]}...")
```

## ライセンス

**Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0)**

ストロークデータは [KanjiVG](https://kanjivg.tagaini.net/) プロジェクト（© Ulrich Apel）のSVGパスデータをベースに、編集・調整を加えたものです。

利用時は以下のクレジット表記をお願いします：

```
Hiragana stroke data based on KanjiVG (https://kanjivg.tagaini.net/)
Licensed under CC BY-SA 3.0
```

## 関連リンク

- [KanjiVG](https://kanjivg.tagaini.net/) — 元となった漢字・かなストロークデータ
- [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) — ライセンス全文
