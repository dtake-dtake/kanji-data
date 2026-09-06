# HANDOFF.md — セッション引継ぎドキュメント

> **🤖 AIへの指示**: セッション開始時は必ずこのファイルを読んでください。

---

## 最終更新

- **日時**: 2026-09-06
- **セッション概要**: 小1〜小6 全1,026字の漢字データ（ストローク＋教科書カリキュラム）の抽出・検証・2層アーキテクチャ整備・GitHub公開

---

## 現在の状態

### ✅ 完了済み

| 完了日 | 内容 |
|---|---|
| 2026-09-06 | 小1〜小6 全1,026字の教科書写真からの手動読み取り（光村図書 2020年版） |
| 2026-09-06 | `data/kanji/grade[1-6].json` — KanjiVG由来ストロークデータ 全1,026字 |
| 2026-09-06 | `data/textbook/grade[1-6].json` — 教科書カリキュラムデータ 全1,026字 |
| 2026-09-06 | 2層アーキテクチャ整備（`core/` + `curriculum/mitsumura-2020/`） |
| 2026-09-06 | JSON Schema 定義（`core/schema.json`, `curriculum/schema.json`） |
| 2026-09-06 | `tools/validate.js` — 全1,026字の整合性検証スクリプト（エラー0件） |
| 2026-09-06 | `app/` — viewer.html, stroke-editor.html等をサブフォルダに整理 |
| 2026-09-06 | README.md, LICENSE (CC BY-SA 3.0), .gitignore 作成 |
| 2026-09-06 | **GitHub公開**: https://github.com/dtake-dtake/kanji-data |
| 2026-09-06 | `push.bat` — ワンクリックGitHub更新スクリプト |

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
├── curriculum/             ← Layer 2: 教科書カリキュラムデータ
│   ├── schema.json
│   └── mitsumura-2020/     ← 光村図書 2020年版
│       ├── grade1.json〜grade6.json
│       └── meta.json
│
├── app/                    ← リファレンス実装（HTMLアプリ）
│   ├── viewer.html         ← 書き順ビューア
│   ├── stroke-editor.html  ← 書き順エディタ
│   ├── batch-adjust.html   ← 一括調整ツール
│   └── review-list.html    ← 要確認リスト
│
├── data/                   ← アプリ用マスターデータ（app/から参照）
│   ├── kanji/              ← grade[1-6].json + all_grades.js
│   ├── textbook/           ← grade[1-6].json（curriculum/と同一）
│   └── review_status.json
│
├── tools/
│   └── validate.js         ← 整合性検証スクリプト
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
├── viewer.html             ← ルート版（従来互換・.gitignore で除外）
└── stroke-editor.html      ← ルート版（従来互換・.gitignore で除外）
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
- **連携方針**: 漢字書き順アプリをHTML単体ファイルとしてプラットフォームに登録配信。
  将来的には kanji-data を Git Submodule として取り込むことも可能。

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

### 🔴 優先度: 高
- [ ] **ストロークデータの品質レビュー** — 一部の漢字でKanjiVGの書き順が教科書体と微妙に異なる可能性あり。stroke-editor.html で目視確認・修正
- [ ] **学習プラットフォームへの統合検討** — 書き順練習アプリのHTMLを作成してプラットフォームに登録する具体的な方針決め

### 🟡 優先度: 中
- [ ] **他の教科書データ追加** — 東京書籍など他社のカリキュラムデータを `curriculum/tokyo-shoseki-20XX/` として追加
- [ ] **スキル（ドリル）の写真整理** — `docs/textbook/` にスキルの写真を追加して漢字練習帳データも整備
- [ ] **書き順アプリの機能拡充** — 学年・単元セレクタ、書き順練習モード、用例表示の統合画面

### 🟢 優先度: 低
- [ ] **npm パッケージ化** — `npm install kanji-data` で利用可能にする
- [ ] **GitHub Actions** — push時に `tools/validate.js` を自動実行するCI設定
