const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. 同期: data/kanji
const kanjiDataDir = path.join(rootDir, 'data', 'kanji');
const allKanjiData = {};

for (let g = 1; g <= 6; g++) {
  const jsonPath = path.join(kanjiDataDir, `grade${g}.json`);
  if (fs.existsSync(jsonPath)) {
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    Object.assign(allKanjiData, content);

    const jsPath = path.join(kanjiDataDir, `grade${g}.js`);
    fs.writeFileSync(jsPath, `// Grade ${g} Kanji Data\nwindow.GRADE${g}_KANJI = ${JSON.stringify(content, null, 2)};\n`, 'utf-8');
  }
}

fs.writeFileSync(path.join(kanjiDataDir, 'all_grades.json'), JSON.stringify(allKanjiData, null, 2), 'utf-8');
fs.writeFileSync(path.join(kanjiDataDir, 'all_grades.js'), `// All Elementary School Kanji Master Data (1026 chars)\nwindow.ALL_GRADES_KANJI = ${JSON.stringify(allKanjiData, null, 2)};\n`, 'utf-8');

console.log('Synchronized kanji data files successfully.');

// 2. 同期: curriculum/mitsumura-2020 -> data/textbook (.json & .js)
const tbSrcDir = path.join(rootDir, 'curriculum', 'mitsumura-2020');
const tbDestDir = path.join(rootDir, 'data', 'textbook');

if (!fs.existsSync(tbDestDir)) {
  fs.mkdirSync(tbDestDir, { recursive: true });
}

for (let g = 1; g <= 6; g++) {
  const srcJson = path.join(tbSrcDir, `grade${g}.json`);
  if (fs.existsSync(srcJson)) {
    const content = JSON.parse(fs.readFileSync(srcJson, 'utf-8'));
    fs.writeFileSync(path.join(tbDestDir, `grade${g}.json`), JSON.stringify(content, null, 2), 'utf-8');

    const jsPath = path.join(tbDestDir, `grade${g}.js`);
    fs.writeFileSync(jsPath, `// Grade ${g} Textbook Data (Mitsumura 2020)\nwindow.GRADE${g}_TEXTBOOK = ${JSON.stringify(content, null, 2)};\n`, 'utf-8');
  }
}

console.log('Synchronized textbook data files successfully.');

// 3. 同期: curriculum/akaneko-skill -> data/akaneko-skill (.json & .js)
const skillSrcDir = path.join(rootDir, 'curriculum', 'akaneko-skill');
const skillDestDir = path.join(rootDir, 'data', 'akaneko-skill');

if (!fs.existsSync(skillDestDir)) {
  fs.mkdirSync(skillDestDir, { recursive: true });
}

const allSkills = {};

for (let g = 1; g <= 6; g++) {
  const srcJson = path.join(skillSrcDir, `grade${g}.json`);
  if (fs.existsSync(srcJson)) {
    const content = JSON.parse(fs.readFileSync(srcJson, 'utf-8'));
    allSkills[g] = content;

    // JSONコピー
    fs.writeFileSync(path.join(skillDestDir, `grade${g}.json`), JSON.stringify(content, null, 2), 'utf-8');

    // JSラッパー
    const jsPath = path.join(skillDestDir, `grade${g}.js`);
    fs.writeFileSync(jsPath, `// Grade ${g} Akaneko Skill Data\nwindow.GRADE${g}_SKILL = ${JSON.stringify(content, null, 2)};\n`, 'utf-8');
  }
}

fs.writeFileSync(path.join(skillDestDir, 'all_skills.json'), JSON.stringify(allSkills, null, 2), 'utf-8');
fs.writeFileSync(path.join(skillDestDir, 'all_skills.js'), `// All Grades Akaneko Skill Data\nwindow.ALL_SKILLS = ${JSON.stringify(allSkills, null, 2)};\n`, 'utf-8');

if (fs.existsSync(path.join(skillSrcDir, 'meta.json'))) {
  fs.copyFileSync(path.join(skillSrcDir, 'meta.json'), path.join(skillDestDir, 'meta.json'));
}

console.log('Synchronized akaneko-skill data files successfully.');
