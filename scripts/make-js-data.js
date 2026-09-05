const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'kanji', 'grade1.json');
const jsPath = path.join(__dirname, '..', 'data', 'kanji', 'grade1.js');

const data = fs.readFileSync(jsonPath, 'utf-8');
const jsContent = `// Auto-generated Grade 1 Kanji Data for direct browser loading\nwindow.GRADE1_KANJI = ${data};\n`;

fs.writeFileSync(jsPath, jsContent, 'utf-8');
console.log('Saved data/kanji/grade1.js successfully.');
