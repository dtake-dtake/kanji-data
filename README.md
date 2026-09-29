# 小学校漢字データ (Elementary School Kanji Data)

小学校1〜6年生で学ぶ全1,026字の漢字データセットです。

- **ストロークデータ（書き順）**: [KanjiVG](https://kanjivg.tagaini.net/) 由来のSVGパス
- **教科書カリキュラムデータ**: 単元名・掲載ページ・音訓読み・用例

## データ構成

```
├── core/                            ← Layer 1: 共通事実データ
│   ├── grade1.json ... grade6.json  ← 漢字・学年・画数・SVGストロークパス・書き順座標
│   └── schema.json                  ← JSON Schema（データ仕様定義）
│
├── curriculum/                      ← Layer 2: 教科書・教材別カリキュラムデータ
│   ├── mitsumura-2020/              ← 光村図書 令和2年度版
│   │   ├── grade1.json ... grade6.json
│   │   ├── meta.json                ← 出版社・版・年度の情報
│   │   └── ../schema.json           ← JSON Schema
│   │
│   └── akaneko-skill/               ← あかねこ漢字スキル（光村図書準拠版）
│       ├── grade1.json ... grade6.json ← 各学年の学期別スキル番号 ⇄ 配当漢字
│       ├── meta.json                ← シリーズ・出版社・学年構成
│       └── schema.json              ← JSON Schema
│
├── app/                             ← Webアプリケーション群
│   └── drill.html                   ← 漢字書き順ドリル（なぞり書き・書き順・読みクイズ）
│
└── tools/
    ├── validate.js                  ← 教科書データ整合性検証スクリプト
    └── validate-skill.js            ← スキルデータ整合性検証スクリプト
```

## Layer 1: core/ — ストロークデータ

文部科学省「学年別漢字配当表」（平成29年告示 学習指導要領）に基づく学年配当と、KanjiVGプロジェクト由来の書き順SVGパスデータ。

### 学年別配当数

| 学年 | 配当数 |
|:---:|:---:|
| 小1 | 80字 |
| 小2 | 160字 |
| 小3 | 200字 |
| 小4 | 202字 |
| 小5 | 193字 |
| 小6 | 191字 |
| **合計** | **1,026字** |

### データ形式

各ファイルはJSONオブジェクトで、キーが漢字1文字です。

```json
{
  "一": {
    "char": "一",
    "grade": 1,
    "codePoint": "04e00",
    "strokeCount": 1,
    "paths": [
      "M15.04,57.65c2.93,0.57,5.74,0.69,8.94,0.46c18.97,-1.38,46.3,-4.7,63.02,-4.82c3.31,-0.02,5.3,0.22,6.96,0.45"
    ],
    "numbers": [
      { "num": 1, "x": 4.25, "y": 54.13 }
    ]
  }
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `char` | string | 漢字1文字 |
| `grade` | integer | 配当学年（1〜6） |
| `codePoint` | string | Unicodeコードポイント（5桁16進数） |
| `strokeCount` | integer | 画数 |
| `paths` | string[] | SVGパス文字列の配列（書き順）。viewBox: `0 0 109 109` |
| `numbers` | object[] | 画番号の表示座標（`num`, `x`, `y`） |

## Layer 2: curriculum/ — 教科書カリキュラムデータ

教科書出版社ごとに、単元構成・掲載ページ・漢字の読みや用例を収録。

### 対応教材・副教材

- **教科書**: 光村図書 令和2年度版（`curriculum/mitsumura-2020/`）
- **漢字スキル**: 光村教育図書「あかねこ漢字スキル」（`curriculum/akaneko-skill/`）
  - 全6学年・17冊分（小1: 上下、小2〜小6: 1〜3学期）
  - スキル番号（①、②…）と配当漢字リストのインデックスデータ

## Webアプリケーション (`app/drill.html`)

宿題や自習で活用できる書き順学習Webドリルアプリです。
- **3つの選定モード**:
  - 📕 **漢字スキル（宿題）**: 学年・学期・スキル番号を選んで即座に練習開始
  - 📖 **教科書単元**: 単元別に学習
  - 🔤 **全漢字一覧**: ピンポイントで練習
- **3つの学習・テスト機能**:
  - ✏️ **なぞり書きドリル**: HTML5 Canvas + ペン/タッチ対応。お手本アニメーション、書き順始点ガイド、反復練習判定
  - 🎯 **書き順クイズ**: 赤く光る画が「何画目か」を答えるクイズ
  - 📖 **読み方クイズ**: 音声認識（Web Speech API）/ タイピング / 4択ヒント対応
- **URL共有**: `drill.html?grade=2&book=0&lesson=1` 等のパラメータで特定スキルを直接起動可能

## 検証

```bash
node tools/validate.js        # 教科書カリキュラム整合性検証
node tools/validate-skill.js  # あかねこ漢字スキル整合性検証
```

### データ形式

```json
{
  "grade": 1,
  "totalKanji": 80,
  "units": [
    {
      "book": "上",
      "name": "さくらのはなびら",
      "kanji": ["花", "見", ...]
    }
  ],
  "kanjiDetails": {
    "花": {
      "book": "上",
      "page": 100,
      "unit": "さくらのはなびら",
      "readings": {
        "primary": "はな",
        "on": ["カ"],
        "kun": ["はな"],
        "extra": []
      },
      "examples": ["花火", "花びん"]
    }
  },
  "specialWords": [
    { "word": "一人", "reading": "ひとり", "page": 20, "book": "上" }
  ]
}
```

## 使い方

### JavaScript / HTML

```html
<script>
  fetch('core/grade1.json')
    .then(r => r.json())
    .then(data => {
      const kanji = data['一'];
      console.log(kanji.paths); // SVG パスの配列
    });
</script>
```

### Node.js

```js
const grade1 = require('./core/grade1.json');
const textbook = require('./curriculum/mitsumura-2020/grade1.json');
```

### Git Submodule として利用

```bash
git submodule add <このリポジトリのURL> resources/kanji-data
```

## 検証

```bash
node tools/validate.js
```

全学年の整合性チェック（配当数・core↔curriculum一致・学年間重複・ストロークデータ妥当性）を実行します。

## ライセンス

- **ストロークデータ（core/）**: KanjiVGプロジェクト由来  
  [Creative Commons Attribution-ShareAlike 3.0](https://creativecommons.org/licenses/by-sa/3.0/) ライセンス  
  © KanjiVG project contributors
- **カリキュラムデータ（curriculum/）**: 教科書の事実情報（単元名・ページ番号・読み）に基づく  
  CC BY-SA 3.0 ライセンス

> **注記**: 本データは光村図書出版株式会社の公式製品ではありません。  
> カリキュラムデータ（curriculum/）は、教科書に掲載されている漢字の配当情報（単元名・ページ番号・読み方・一般的な用例）を事実情報としてまとめたものであり、教科書の本文・挿絵・解説等の著作物は含まれていません。

## 貢献

他社の教科書データの追加、データの修正・改善を歓迎します。

1. `curriculum/<publisher>-<year>/` フォルダを作成
2. `meta.json` と各学年の `grade[1-6].json` を作成
3. `node tools/validate.js` で検証
4. プルリクエストを送信

## 謝辞

- [KanjiVG](https://kanjivg.tagaini.net/) — 高品質な漢字ストロークデータ
- [文部科学省](https://www.mext.go.jp/) — 学年別漢字配当表
