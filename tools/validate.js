#!/usr/bin/env node
/**
 * validate.js - 漢字データの整合性を検証するスクリプト
 *
 * 検証項目:
 * 1. core/ と curriculum/ の全学年ファイルが存在するか
 * 2. 各学年の漢字数が新学習指導要領の配当数と一致するか
 * 3. core と curriculum の漢字セットが完全一致するか
 * 4. 全学年を通じて漢字の重複がないか
 * 5. 各漢字のストロークデータが妥当か（paths.length === strokeCount）
 * 6. curriculum の units と kanjiDetails の漢字セットが一致するか
 *
 * 使い方: node tools/validate.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXPECTED = { 1: 80, 2: 160, 3: 200, 4: 202, 5: 193, 6: 191 };
const TOTAL = 1026;

let errors = 0;
let warnings = 0;

function fail(msg) {
  console.error(`  ❌ ${msg}`);
  errors++;
}
function warn(msg) {
  console.warn(`  ⚠️  ${msg}`);
  warnings++;
}
function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

function loadJSON(filePath) {
  const abs = path.join(ROOT, filePath);
  if (!fs.existsSync(abs)) {
    fail(`ファイルが見つかりません: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf-8'));
  } catch (e) {
    fail(`JSONパースエラー: ${filePath} - ${e.message}`);
    return null;
  }
}

// ── 1. ファイル存在チェック ──
console.log('\n📁 ファイル存在チェック');
for (let g = 1; g <= 6; g++) {
  const corePath = `core/grade${g}.json`;
  const currPath = `curriculum/mitsumura-2020/grade${g}.json`;
  if (fs.existsSync(path.join(ROOT, corePath))) {
    ok(`${corePath}`);
  } else {
    fail(`${corePath} が見つかりません`);
  }
  if (fs.existsSync(path.join(ROOT, currPath))) {
    ok(`${currPath}`);
  } else {
    fail(`${currPath} が見つかりません`);
  }
}

// ── 2-5. 学年別検証 ──
const allCoreChars = new Map(); // char -> grade
let totalCore = 0;
let totalCurr = 0;

for (let g = 1; g <= 6; g++) {
  console.log(`\n📖 学年${g} 検証`);

  const core = loadJSON(`core/grade${g}.json`);
  const curr = loadJSON(`curriculum/mitsumura-2020/grade${g}.json`);
  if (!core || !curr) continue;

  const coreChars = Object.keys(core);
  const currChars = Object.keys(curr.kanjiDetails || {});

  // 2. 配当数チェック
  if (coreChars.length === EXPECTED[g]) {
    ok(`core: ${coreChars.length}字 (期待値: ${EXPECTED[g]})`);
  } else {
    fail(`core: ${coreChars.length}字 (期待値: ${EXPECTED[g]})`);
  }
  if (currChars.length === EXPECTED[g]) {
    ok(`curriculum: ${currChars.length}字 (期待値: ${EXPECTED[g]})`);
  } else {
    fail(`curriculum: ${currChars.length}字 (期待値: ${EXPECTED[g]})`);
  }

  // 3. core ↔ curriculum 一致
  const missingInCurr = coreChars.filter(c => !curr.kanjiDetails[c]);
  const missingInCore = currChars.filter(c => !core[c]);
  if (missingInCurr.length === 0 && missingInCore.length === 0) {
    ok('core と curriculum の漢字セットが完全一致');
  } else {
    if (missingInCurr.length) fail(`core にあるが curriculum にない: ${missingInCurr.join(', ')}`);
    if (missingInCore.length) fail(`curriculum にあるが core にない: ${missingInCore.join(', ')}`);
  }

  // 4. 学年間重複チェック
  for (const c of coreChars) {
    if (allCoreChars.has(c)) {
      fail(`漢字「${c}」が学年${allCoreChars.get(c)}と学年${g}で重複`);
    }
    allCoreChars.set(c, g);
  }

  // 5. ストロークデータ妥当性
  let strokeErrors = 0;
  for (const [ch, entry] of Object.entries(core)) {
    if (entry.paths.length !== entry.strokeCount) {
      strokeErrors++;
      if (strokeErrors <= 3) {
        fail(`「${ch}」paths.length(${entry.paths.length}) ≠ strokeCount(${entry.strokeCount})`);
      }
    }
    if (!entry.codePoint || !/^[0-9a-f]{5}$/.test(entry.codePoint)) {
      warn(`「${ch}」codePoint が不正: ${entry.codePoint}`);
    }
  }
  if (strokeErrors === 0) {
    ok('全漢字のストロークデータ整合性OK');
  } else if (strokeErrors > 3) {
    fail(`他 ${strokeErrors - 3} 件のストロークエラーあり`);
  }

  // 6. units ↔ kanjiDetails 一致
  if (curr.units) {
    const unitChars = [];
    for (const u of curr.units) {
      unitChars.push(...(u.kanji || []));
    }
    const unitSet = new Set(unitChars);
    const detailSet = new Set(currChars);
    const missingInDetails = [...unitSet].filter(c => !detailSet.has(c));
    const missingInUnits = [...detailSet].filter(c => !unitSet.has(c));
    if (missingInDetails.length === 0 && missingInUnits.length === 0) {
      ok(`units(${unitChars.length}字) と kanjiDetails(${currChars.length}字) 完全一致`);
    } else {
      if (missingInDetails.length) fail(`units にあるが kanjiDetails にない: ${missingInDetails.join(', ')}`);
      if (missingInUnits.length) fail(`kanjiDetails にあるが units にない: ${missingInUnits.join(', ')}`);
    }
    // 重複チェック
    if (unitChars.length !== unitSet.size) {
      warn(`units 内に重複漢字あり (${unitChars.length}字中 ${unitChars.length - unitSet.size}字)`);
    }
  }

  totalCore += coreChars.length;
  totalCurr += currChars.length;
}

// ── 全体サマリ ──
console.log('\n═══════════════════════════════');
console.log('📊 全体サマリ');
console.log(`   core 合計: ${totalCore}字 (期待値: ${TOTAL})`);
console.log(`   curriculum 合計: ${totalCurr}字 (期待値: ${TOTAL})`);
console.log(`   ユニーク漢字: ${allCoreChars.size}字`);

if (totalCore === TOTAL && totalCurr === TOTAL && allCoreChars.size === TOTAL) {
  ok(`全${TOTAL}字 完全一致 ✨`);
} else {
  fail('総数が期待値と不一致');
}

console.log('\n═══════════════════════════════');
if (errors === 0 && warnings === 0) {
  console.log('🎉 全検証パス！エラー0件');
  process.exit(0);
} else {
  console.log(`結果: ${errors}件のエラー, ${warnings}件の警告`);
  process.exit(errors > 0 ? 1 : 0);
}
