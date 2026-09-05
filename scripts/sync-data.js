const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'kanji');
const allData = {};

for (let g = 1; g <= 6; g++) {
  const jsonPath = path.join(dataDir, `grade${g}.json`);
  if (fs.existsSync(jsonPath)) {
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    Object.assign(allData, content);

    const jsPath = path.join(dataDir, `grade${g}.js`);
    fs.writeFileSync(jsPath, `// Grade ${g} Kanji Data\nwindow.GRADE${g}_KANJI = ${JSON.stringify(content, null, 2)};\n`, 'utf-8');
  }
}

fs.writeFileSync(path.join(dataDir, 'all_grades.json'), JSON.stringify(allData, null, 2), 'utf-8');
fs.writeFileSync(path.join(dataDir, 'all_grades.js'), `// All Elementary School Kanji Master Data (1026 chars)\nwindow.ALL_GRADES_KANJI = ${JSON.stringify(allData, null, 2)};\n`, 'utf-8');

console.log('Synchronized all grade data files successfully.');
