# HANDOFF.md — セッション引継ぎドキュメント

> **🤖 AIへの指示**: セッション開始時は必ずこのファイルを読んでください。

---

## 最終更新

- **日時**: 2026-10-02
- **セッション概要**: 
  - **ひらがな・カタカナスキル（kana-skill.html）＆ 漢字スキル（kanji-skill.html）の完成**:
    - 「① なぞり（手本＋吸着）➔ ② れんしゅう（白紙＋吸着）➔ ③ ほんばん（白紙＋肉筆）」の3段階教育設計を両スキルで完全統一
    - 最後のステップ呼称を「しあげ」から「ほんばん」へ変更し、練習との対比を直感化
    - 漢字スキルにおいて、学年別配当に基づく「既習漢字・学年別自動切り替え（案A）」を実装（UI・単元名・例文が学年に応じて自然に漢字化）
    - かなスキルの手本マスから書き順番号を撤廃し、動画で書き順を把握するすっきりした手本文字表示に統一
    - かなスキルの「ことば欄」絵文字・単語辞書（`data/kana-words.js`）の徹底精査、縦書き表示崩れ解消とオートスケール対応
  - **次フェーズ**: ✅ 親教育アプリ（`learning-platform`）との連携実装・デプロイ完了（2026-10-02）
    - `public/apps/` に教材HTML＋データ21ファイルを配置
    - `SkillProgress` テーブル新設、`POST/GET /api/progress/skill` API実装
    - スキルポータル画面（`/student/skills`）＆ `SkillPlayer` コンポーネント実装
    - 本番DB（Cloud SQL）反映 → GitHub push → Cloud Run 自動デプロイ済み

---

## 現在の状態

### ✅ 完了済み

| 完了日 | 内容 |
|---|---|
| 2026-10-02 | **仮名スキルの手本マスすっきり化** (`kana-skill.html`, `app/kana-skill.html`) — 見本マス・なぞりマスから書き順番号（数字）を撤廃し、純粋な手本文字表示に統一 |
| 2026-10-02 | **漢字スキルの既習漢字・学年別配当管理（案A）実装** (`kanji-skill.html`, `app/kanji-skill.html`) — 学年タブ連動でナビ（まえ/前、つぎ/次）、見出し（れんしゅう/練習、ほんばん/本番）、単元タイトル、例文テキスト、花丸モーダル文言を自動で既習漢字化 |
| 2026-10-02 | **学習ステップ名称の改定（「しあげ」➔「ほんばん」）** (`kana-skill.html`, `kanji-skill.html`, `app/`) — 子どもが「練習の次は本番！」と直感的に意欲を持てる呼称へ統一 |
| 2026-10-02 | **かなスキルの練習マス吸着（snap）完全実装** (`kana-skill.html`, `app/kana-skill.html`) — ①なぞり・②れんしゅうは手本SVGパス（Path2D）にピタッと吸着、③ほんばんのみ肉筆を保持。ミス時始点オレンジ点滅ヒント、Backspace取り消し機能追加 |
| 2026-10-02 | **かなスキルのことば欄・絵文字辞書の徹底精査＆縦書きオートスケール** (`data/kana-words.js`, `kana-skill.html`) — 2〜3文字の代表的具体物に厳選、flex撤廃で縦書き正常化、画面幅に合わせた自動縮小（scale）実装 |
| 2026-10-02 | **ひらがな・カタカナスキル（kana-skill.html）の新規開発** — 漢字スキルと同一の1画面完結・3x2グリッド・右開き縦書き進行でひらがな76字・カタカナ81字を完全網羅 |
| 2026-10-01 | **漢字エディタUI刷新・機能強化** (`app/stroke-editor.html`, `stroke-editor.html`) — 左サイドバー文字選択グリッド（学年別タブ・検索・ハイライト連動）、全画一括移動、画クリア・全クリア、画面内自動フィット |
| 2026-10-01 | **カタカナ小文字（9字）の左下縮小配置** (`data/katakana.json`, `data/katakana.js`, `scripts/transform-small-katakana.js`) — 清音（ア〜ツ）から0.60倍・左下部屋（中心27.25, 81.75）へ自動配置 |
| 2026-10-01 | **かなエディタのカタカナ対応** (`app/hiragana-editor.html`, `scripts/server.js`) — モード切替、50音グリッド、自動同期、保存API、小文字お手本対応 |
| 2026-10-01 | **かなドリルのカタカナ対応** (`app/hiragana-drill.html`) — ひらがな/カタカナ切替タブ、50音表、テストモード |
| 2026-10-01 | **カタカナ書き順データ作成（全81文字）** (`data/katakana.json`, `data/katakana.js`) — KanjiVG由来、50音・グループメタ情報完備 |
| 2026-09-08 | **あかねこ漢字スキルのデータ化（全6学年17冊分・全1,026字完全網羅）** (`curriculum/akaneko-skill/`) |
| 2026-09-06 | 小1〜小6 全1,026字の教科書写真からの手動読み取り（光村図書 2020年版） |
| 2026-09-06 | **GitHub公開**: https://github.com/dtake-dtake/kanji-data |

### 学年別データサマリ

| 学年 | 配当数 | 教科書 | ストローク | 検証 |
|:---:|:---:|:---:|:---:|:---:|
| 小1 | 80字 | ✅ | ✅ | ✅ |
| 小2 | 160字 | ✅ | ✅ | ✅ |
| 小3 | 200字 | ✅ | ✅ | ✅ |
| 小4 | 202字 | ✅ | ✅ | ✅ |
| 小5 | 193字 | ✅ | ✅ | ✅ |
| 小6 | 191字 | ✅ | ✅ | ✅ |
| **合計** | **1,026字** | ✅ | ✅ | ✅ |

---

## プロジェクト構成

```
C:\Users\theea\Desktop\漢字　書き順アプリ\
├── HANDOFF.md              ← このファイル
├── README.md               ← 使い方・データ仕様・ライセンス
├── LICENSE                 ← CC BY-SA 3.0
├── .gitignore              ← 教科書写真等を除外
├── push.bat                ← GitHubワンクリック更新
│
├── core/                   ← Layer 1: ストロークデータ（KanjiVG由来）
│   ├── grade1.json〜grade6.json
│   └── schema.json
│
├── curriculum/             ← Layer 2: 教科書・副教材カリキュラムデータ
│   ├── schema.json
│   ├── mitsumura-2020/     ← 光村図書 令和2年版（全1,026字）
│   │   ├── grade1.json〜grade6.json
│   │   └── meta.json
│   └── akaneko-skill/      ← あかねこ漢字スキル 光村図書準拠版（全1,026字）
│       ├── grade1.json〜grade6.json
│       ├── meta.json
│       └── schema.json
│
├── app/                    ← アプリ本体
│   ├── kanji-skill.html    ← **【完成】漢字スキル（学年配当・吸着・本番・1P完結）**
│   ├── kana-skill.html     ← **【完成】かなスキル（ひらがな/カタカナ・吸着・本番・1P完結）**
│   ├── drill.html          ← 漢字ドリル（全学年・スキル宿題・教科書対応）
│   ├── hiragana-drill.html ← ひらがなドリル
│   ├── viewer.html         ← 書き順ビューア
│   ├── stroke-editor.html  ← 書き順エディタ
│   ├── batch-adjust.html   ← 一括調整ツール
│   └── review-list.html    ← 要確認リスト
│
├── data/                   ← アプリ用マスターデータ（app/から参照）
│   ├── kanji/              ← grade[1-6].json/js + all_grades.js
│   ├── textbook/           ← grade[1-6].json/js
│   ├── akaneko-skill/      ← grade[1-6].json/js + all_skills.js
│   ├── hiragana.json/js    ← ひらがな書き順データ（76文字）
│   ├── katakana.json/js    ← カタカナ書き順データ（81文字）
│   ├── kana-words.js       ← かなスキル用単語・絵文字辞書（厳選・精査済み）
│   └── review_status.json
│
├── tools/
│   ├── validate.js         ← 教科書整合性検証スクリプト
│   └── validate-skill.js   ← スキル整合性検証スクリプト
│
├── scripts/
│   ├── server.js           ← ローカル開発サーバー（port 3000）
│   └── sync-data.js        ← all_grades.js 生成
│
├── docs/textbook/          ← 教科書写真（.gitignore で除外・非公開）
│   ├── 教科書1年上/
│   ├── ...
│   └── 教科書6年下/
│
├── kanji-skill.html        ← ルート版（app/kanji-skill.html と完全同期）
└── kana-skill.html         ← ルート版（app/kana-skill.html と完全同期）
```

---

## GitHub リポジトリ

- **URL**: https://github.com/dtake-dtake/kanji-data
- **公開設定**: Public（完全公開）
- **ライセンス**: CC BY-SA 3.0（KanjiVG由来のため）
- **アカウント**: `dtake-dtake`

### GitHubへの変更反映方法

#### 方法A: Antigravityに依頼（推奨）
```
「〇〇を修正してGitHubに反映して」
```
Antigravityがローカル編集 → commit → push まで実行する。
push時にはPersonal Access Token（PAT）が必要。
GitHub設定画面で発行: https://github.com/settings/tokens/new
（スコープ: 「リポジトリ」にチェック）

#### 方法B: push.bat をダブルクリック
1. ローカルでファイルを編集
2. `push.bat` をダブルクリック
3. コミットメッセージを入力 → Enter
4. 初回のみユーザー名 `dtake-dtake` とトークン（PAT）の入力が必要
   （Windows Credential Manager が記憶するので2回目以降は不要）

#### 方法C: GitHubブラウザ上で直接編集
https://github.com/dtake-dtake/kanji-data でファイルを開き、
鉛筆アイコン（✏️）で直接編集 → 「Commit changes」で保存。

### push時のPATについて
- 前回発行したトークンは **セッション中に使用済み**
- セキュリティのため、使い終わったら削除（Revoke）を推奨
- 次回push時には新しいトークンを発行するか、
  Windows Credential Managerに保存済みであればそのまま使える
- 発行先: https://github.com/settings/tokens/new（スコープ: リポジトリ）

---

## ローカル開発サーバー

```bash
node scripts/server.js
```
→ http://localhost:3000 でHTML アプリやデータにアクセス可能。
ストロークエディタの保存機能（`/api/save-stroke`）もこのサーバーが提供。

---

## データの整合性検証

```bash
node tools/validate.js
```
全6学年の以下をチェック:
- core/ と curriculum/ のファイル存在
- 配当数が新学習指導要領と一致するか
- core ↔ curriculum の漢字セット完全一致
- 学年間の漢字重複なし
- strokeCount と paths.length の一致
- units と kanjiDetails の漢字セット一致

---

## 関連プロジェクト

### 学習プラットフォーム
- **パス**: `C:\Users\theea\.gemini\antigravity-ide\scratch\learning-platform`
- **GitHub**: https://github.com/dtake-dtake/learning-platform
- **技術**: Next.js 16 + Prisma + PostgreSQL (Cloud SQL) + Tailwind CSS
- **デプロイ**: Google Cloud Run（mainへのpushで自動デプロイ）
- **連携方針**: 漢字・かなスキルをHTML単体モジュールとしてiframe埋め込み・URLパラメータ起動。
  合格時に `postMessage` で進捗を親アプリへ自動送信。
  具体的な連携仕様・Reactコンポーネントコードは [**`docs/learning-platform-integration.md`**](file:///c:/Users/theea/Desktop/%E6%BC%A2%E5%AD%97%E3%80%80%E6%9B%B8%E3%81%8D%E9%A0%86%E3%82%A2%E3%83%97%E3%83%AA/docs/learning-platform-integration.md) を参照。

---

## 重要な設計決定

| 項目 | 決定内容 |
|---|---|
| データ構造 | 2層分離: core（ストローク）+ curriculum（教科書別） |
| ストロークデータ元 | KanjiVG（CC BY-SA 3.0） |
| SVG viewBox | `0 0 109 109` |
| 教科書 | 光村図書 令和2年版（新学習指導要領・平成29年告示準拠） |
| 4年配当数 | 202字（都道府県漢字含む） |
| ライセンス | CC BY-SA 3.0（KanjiVG由来のため必須） |
| 公開範囲 | 完全公開 |
| 教科書写真 | .gitignore で除外（非公開） |

---

## 次のTODO

### 🔴 優先度: 最上位（次回セッションで実施）
- [x] **親教育アプリ（learning-platform: Next.js 16 + Prisma + PostgreSQL）との連携実装**（✅ 2026-10-02 完了）
  - **実装内容**:
    - `public/apps/` への教材配備（全21ファイル）
    - `SkillProgress` テーブル新設（文字単位の習熟度をupsert管理）
    - `POST/GET /api/progress/skill` API実装
    - スキルポータル画面（`/student/skills`）＆ `SkillPlayer` 実装
    - 本番DB反映 ＆ Cloud Run 自動デプロイ完了
  - **連携アーキテクチャの検討・決定**:
    1. **方式1: URLパラメータによる文字・単元ダイレクト起動**
       - `kanji-skill.html?grade=2&kanji=書` や `kana-skill.html?type=hiragana&char=あ`
       - 親アプリのカリキュラム一覧や「今日の宿題」からワンタップで指定文字を開く。
    2. **方式2: iframe 埋め込み ＋ postMessage API による学習完了通知**
       - 6マス全クリア（花丸モーダル表示時）に、子画面（skill）から親画面（learning-platform）へ `postMessage` を発火:
         `window.parent.postMessage({ type: 'SKILL_COMPLETED', grade: 2, char: '書', mode: 'kanji', timestamp: Date.now() }, '*')`
       - 親アプリ側でこれを受け取り、学習履歴・ポイント・バッジをDB（PostgreSQL / Prisma）に即時保存。
    3. **方式3: 学習ポータル統合 / フルReactコンポーネント化（中長期）**
       - 将来的にNext.js内に直接Canvas/SVGコンポーネントとして移植、またはCloud Run配信の静的アセットとしてシームレス連携。

### 🟡 優先度: 中
- [ ] **効果音（Web Audio API）のオプション追加** — ストローク成功時の「ピコン♪」、花丸時のファンファーレなどの任意ON/OFF。
- [ ] **ストロークデータの品質微調整** — 一部の漢字でKanjiVG由来の書き順が気になる場合の個別調整（stroke-editor.htmlで実施）。

### 🟢 優先度: 低
- [ ] **印刷機能（プリント出力）** — 画面の内容をそのままA4マス目プリントとしてブラウザ印刷できるスタイルシート（@media print）の追加。
- [ ] **npm パッケージ化 / CI自動検証** — `npm install kanji-data` や GitHub Actions の導入。
