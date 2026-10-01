#!/usr/bin/env node
/**
 * 配布用ビルドスクリプト
 * hiragana.json のデータを hiragana-practice.html に埋め込んで
 * 1ファイルで完結する配布用HTMLを生成する
 *
 * 使い方: node scripts/build-practice.js
 * 出力:   dist/hiragana-practice.html
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_HTML = path.join(ROOT, 'app', 'hiragana-practice.html');
const SRC_JSON = path.join(ROOT, 'data', 'hiragana.json');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_HTML = path.join(DIST_DIR, 'hiragana-practice.html');

// 1. ファイル読み込み
const html = fs.readFileSync(SRC_HTML, 'utf8');
const jsonData = fs.readFileSync(SRC_JSON, 'utf8');

// 2. fetch ブロックを inline データに置き換え
//    fetch('../data/hiragana.json') の部分を window.HIRAGANA_DATA = {...} に
const replaced = html.replace(
  /\/\/ hiragana\.json を fetch で読み込み[\s\S]*?const _hiraganaReady = fetch\([\s\S]*?\);/,
  `// [配布用] hiragana.json のデータを埋め込み済み
    window.HIRAGANA_DATA = ${jsonData.trim()};
    const _hiraganaReady = Promise.resolve();`
);

// 3. 出力
if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(DIST_HTML, replaced, 'utf8');

console.log('✅ 配布用HTML生成完了');
console.log(`   ${DIST_HTML}`);
console.log(`   サイズ: ${(fs.statSync(DIST_HTML).size / 1024).toFixed(0)} KB`);
