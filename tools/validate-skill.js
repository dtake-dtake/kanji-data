/**
 * あかねこ漢字スキル データ整合性検証スクリプト
 * 
 * 検証項目:
 * 1. curriculum/akaneko-skill/grade[1-6].json の存在
 * 2. 各学年の配当漢字数が学習指導要領と完全一致（80, 160, 200, 202, 193, 191）
 * 3. core/ の配当漢字と過不足なく完全一致（Missing: 0, Extra: 0）
 * 4. 学年間で漢字の重複がないこと（1,026字が完全にユニーク）
 * 5. 各分冊内でスキル番号の重複がないこと
 * 6. 各レッスンの kanji 配列に空文字や不正文字が含まれていないこと
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SKILL_DIR = path.join(ROOT_DIR, 'curriculum', 'akaneko-skill');
const CORE_DIR = path.join(ROOT_DIR, 'core');

const EXPECTED_COUNTS = {
  1: 80,
  2: 160,
  3: 200,
  4: 202,
  5: 193,
  6: 191
};

let errors = 0;
let warnings = 0;

function logPass(msg) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}

function logFail(msg) {
  console.error(`  \x1b[31m✖\x1b[0m ${msg}`);
  errors++;
}

console.log('====================================================');
console.log(' あかねこ漢字スキル データ整合性検証');
console.log('====================================================\n');

const allSkillKanjiByGrade = {};
const allSeenKanji = new Map(); // char -> grade

for (let grade = 1; grade <= 6; grade++) {
  console.log(`\x1b[1m--- 小学${grade}年生 ---\x1b[0m`);
  
  const skillFile = path.join(SKILL_DIR, `grade${grade}.json`);
  const coreFile = path.join(CORE_DIR, `grade${grade}.json`);
  
  if (!fs.existsSync(skillFile)) {
    logFail(`ファイルが見つかりません: ${skillFile}`);
    continue;
  }
  if (!fs.existsSync(coreFile)) {
    logFail(`Coreファイルが見つかりません: ${coreFile}`);
    continue;
  }
  
  let skillData;
  let coreData;
  try {
    skillData = JSON.parse(fs.readFileSync(skillFile, 'utf8'));
    coreData = JSON.parse(fs.readFileSync(coreFile, 'utf8'));
  } catch (err) {
    logFail(`JSON パースエラー: ${err.message}`);
    continue;
  }
  
  // 1. スキーマ基本フィールド
  if (skillData.grade !== grade) {
    logFail(`grade プロパティが不一致: 期待値 ${grade}, 実際 ${skillData.grade}`);
  }
  if (!Array.isArray(skillData.books) || skillData.books.length === 0) {
    logFail(`books 配列が不正または空です`);
  }
  
  // 2. 漢字抽出と分冊内番号重複チェック
  const gradeSkillChars = [];
  skillData.books.forEach(b => {
    const seenNumbers = new Set();
    b.lessons.forEach(l => {
      if (seenNumbers.has(l.number)) {
        logFail(`分冊「${b.book}」でスキル番号 ${l.number} が重複しています`);
      }
      seenNumbers.add(l.number);
      
      if (!Array.isArray(l.kanji) || l.kanji.length === 0) {
        logFail(`分冊「${b.book}」スキル番号 ${l.number} の kanji が空または配列ではありません`);
      }
      l.kanji.forEach(ch => {
        if (typeof ch !== 'string' || ch.length !== 1) {
          logFail(`不正な漢字文字: "${ch}" (スキル ${l.number})`);
        }
        gradeSkillChars.push(ch);
      });
    });
  });
  
  allSkillKanjiByGrade[grade] = gradeSkillChars;
  
  // 3. 配当数チェック
  const expected = EXPECTED_COUNTS[grade];
  if (gradeSkillChars.length === expected) {
    logPass(`配当漢字総数: ${gradeSkillChars.length} / ${expected}字 一致`);
  } else {
    logFail(`配当漢字総数が不一致: 期待値 ${expected}字, 実際 ${gradeSkillChars.length}字`);
  }
  
  // 4. Core との完全一致突合
  const coreChars = Object.keys(coreData);
  const missingInSkill = coreChars.filter(c => !gradeSkillChars.includes(c));
  const extraInSkill = gradeSkillChars.filter(c => !coreChars.includes(c));
  
  if (missingInSkill.length === 0 && extraInSkill.length === 0) {
    logPass(`core/grade${grade}.json との文字セット完全一致（差分0）`);
  } else {
    if (missingInSkill.length > 0) {
      logFail(`スキルに不足している漢字 (${missingInSkill.length}字): ${missingInSkill.join(' ')}`);
    }
    if (extraInSkill.length > 0) {
      logFail(`スキルに余分な漢字 (${extraInSkill.length}字): ${extraInSkill.join(' ')}`);
    }
  }
  
  // 5. 学年内重複チェック
  const charSetInGrade = new Set();
  const dupsInGrade = [];
  gradeSkillChars.forEach(ch => {
    if (charSetInGrade.has(ch)) {
      dupsInGrade.push(ch);
    }
    charSetInGrade.add(ch);
  });
  if (dupsInGrade.length === 0) {
    logPass(`学年内漢字の重複なし（全${gradeSkillChars.length}字ユニーク）`);
  } else {
    logFail(`学年内漢字に重複があります: ${dupsInGrade.join(' ')}`);
  }
  
  // 6. 学年間重複チェック用記録
  gradeSkillChars.forEach(ch => {
    if (allSeenKanji.has(ch)) {
      logFail(`学年間重複: "${ch}" が小学${allSeenKanji.get(ch)}年生と小学${grade}年生の両方に存在`);
    } else {
      allSeenKanji.set(ch, grade);
    }
  });
  
  console.log('');
}

console.log('====================================================');
console.log(' 全学年総合集計');
console.log('====================================================');
console.log(`全スキル収録漢字総数: ${allSeenKanji.size} / 1026字`);

if (allSeenKanji.size === 1026 && errors === 0) {
  console.log('\x1b[32m\x1b[1m✔ すべての検証に合格しました！エラー件数: 0件\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m\x1b[1m✖ 検証エラーが発生しました: ${errors}件のエラー\x1b[0m\n`);
  process.exit(1);
}
