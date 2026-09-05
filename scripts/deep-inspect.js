const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'kanji', 'grade1.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function samplePathPoints(d) {
  const numRegex = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
  const matches = d.match(numRegex);
  if (!matches) return [];
  const coords = [];
  for (let i = 0; i < matches.length; i += 2) {
    if (i + 1 < matches.length) {
      coords.push({ x: parseFloat(matches[i]), y: parseFloat(matches[i+1]) });
    }
  }
  return coords;
}

function analyzeAllGrade1() {
  const reports = [];

  for (const [char, kObj] of Object.entries(data)) {
    const paths = kObj.paths;
    const ptsList = paths.map(samplePathPoints);
    const boxes = ptsList.map((pts, i) => {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      return {
        idx: i + 1,
        minX, maxX, minY, maxY,
        width: maxX - minX,
        height: maxY - minY,
        start: pts[0] || { x: 0, y: 0 },
        end: pts[pts.length - 1] || { x: 0, y: 0 }
      };
    });

    const issues = [];

    // 1. 天 (Heaven): 1st stroke must be shorter than 2nd stroke
    if (char === '天') {
      const len1 = boxes[0].width;
      const len2 = boxes[1].width;
      if (len1 >= len2) {
        issues.push({
          target: '1画目と2画目の横棒',
          problem: `1画目(${len1.toFixed(1)}px)が2画目(${len2.toFixed(1)}px)より長くなっています。教科書体では【1画目＝短、2画目＝長】が基本です。`,
          suggestion: '1画目の左右を少し短くし、2画目をしっかり長く伸ばす'
        });
      }
    }

    // 2. 村 (Village): 寸 top should be lower than 木 top
    if (char === '村') {
      const kiTopY = boxes[1].minY; // 2nd stroke of 木 (vertical)
      const sunTopY = boxes[4].minY; // 5th stroke of 村 (horizontal of 寸)
      if (sunTopY < kiTopY + 5) {
        issues.push({
          target: 'へんとつくりの段差',
          problem: `「寸」の横棒(5画目: y=${sunTopY.toFixed(1)})が「木」の頭(2画目: y=${kiTopY.toFixed(1)})と同じ高さか上にあります。教科書体では【寸の頭を少し下げる】のが自然です。`,
          suggestion: '5〜7画目（寸）全体を少し下に配置する'
        });
      }
    }

    // 3. 校 (School): 木 vs 交
    if (char === '校') {
      const kiTop = boxes[1].minY; // 木 vertical
      const koDot = boxes[4].minY; // 交 dot top
      if (koDot < kiTop) {
        issues.push({
          target: 'へんとつくりの段差',
          problem: `「交」の1画目の点(5画目)が「木」の縦棒の頭より高くなっています。`,
          suggestion: '交のパーツの高さを木と揃えるか少し下げる'
        });
      }
    }

    // 4. 生 (Life/Birth): 3 horizontals
    if (char === '生') {
      // strokes: 1(left sweep), 2(top horiz), 3(vertical), 4(middle horiz), 5(bottom horiz)
      const len2 = boxes[1].width;
      const len4 = boxes[3].width;
      const len5 = boxes[4].width;
      if (len4 >= len2 || len2 >= len5) {
        issues.push({
          target: '横棒3本のメリハリ',
          problem: `横棒3本（2画目・4画目・5画目）の長さの比率（下 > 上 > 中）の確認。`,
          suggestion: '5画目の土台を最も長く、4画目の中横を最も短くする'
        });
      }
    }

    // 5. 王 (King): 3 horizontals
    if (char === '王') {
      const len1 = boxes[0].width;
      const len2 = boxes[1].width;
      const len4 = boxes[3].width;
      if (len2 >= len1 || len1 >= len4) {
        issues.push({
          target: '横棒3本の比率',
          problem: `横棒3本の長さ（4画目(下) > 1画目(上) > 2画目(中)）の確認。`,
          suggestion: '最下段をしっかり長く、中段を短めにして安定感を出す'
        });
      }
    }

    // 6. 土 (Soil) vs 士
    if (char === '土') {
      const len1 = boxes[0].width;
      const len3 = boxes[2].width;
      if (len1 >= len3 * 0.8) {
        issues.push({
          target: '1画目と3画目の横棒比率',
          problem: `1画目(${len1.toFixed(1)}px)と3画目(${len3.toFixed(1)}px)の差。土は【上が短く、下が長い】文字です。`,
          suggestion: '3画目の土台をしっかり長くして「士」と明確に差別化'
        });
      }
    }

    // 7. 正 (Correct)
    if (char === '正') {
      const len1 = boxes[0].width;
      const len5 = boxes[4].width;
      if (len1 >= len5 * 0.8) {
        issues.push({
          target: '上下の横棒比率',
          problem: `1画目の冠横棒と5画目の土台横棒の長さ比率。`,
          suggestion: '5画目の下横棒をしっかり長くしてどっしりさせる'
        });
      }
    }

    // 8. 手 (Hand)
    if (char === '手') {
      const len2 = boxes[1].width;
      const len3 = boxes[2].width;
      if (len2 >= len3 * 0.8) {
        issues.push({
          target: '2画目と3画目の横棒比率',
          problem: `2画目(${len2.toFixed(1)}px)と3画目(${len3.toFixed(1)}px)の差。3画目を deutlich 長く反らせるのが教科書体です。`,
          suggestion: '3画目の横棒を左右にしっかり伸ばす'
        });
      }
    }

    // 9. 右 vs 左
    if (char === '右') {
      // 1: sweep, 2: horiz
      if (boxes[0].width < boxes[1].width * 0.4) {
        issues.push({
          target: '1画目(ノ)の長さ',
          problem: '1画目の左払いが短すぎないか確認',
          suggestion: '左払いを伸びやかに'
        });
      }
    }
    if (char === '左') {
      // 1: horiz, 2: sweep
      const len1 = boxes[0].width;
      const len2 = boxes[1].width;
      if (len1 > 70) {
        issues.push({
          target: '1画目の横棒',
          problem: '左の1画目は右の横棒よりやや短めが手書きの基本',
          suggestion: '横棒を適度な長さに'
        });
      }
    }

    if (issues.length > 0) {
      reports.push({ char, issues });
    }
  }

  return reports;
}

const reports = analyzeAllGrade1();
console.log(`\n=== 検出レポート: 教科書体とのズレ・要確認文字 (${reports.length}字) ===\n`);
reports.forEach((r, i) => {
  console.log(`${i+1}. 【 ${r.char} 】`);
  r.issues.forEach(iss => {
    console.log(`   ・部位: ${iss.target}`);
    console.log(`     症状: ${iss.problem}`);
    console.log(`     改善案: ${iss.suggestion}`);
  });
});
