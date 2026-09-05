const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'kanji', 'grade1.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Helper to parse SVG path commands to approximate points
function samplePathPoints(d) {
  // Extract all coordinates from path
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

function analyzeKanji(char, kanjiObj) {
  const issues = [];
  const paths = kanjiObj.paths;
  const strokeCount = paths.length;

  const strokeBoxes = paths.map((p, idx) => {
    const pts = samplePathPoints(p);
    if (pts.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0, start: {x:0, y:0}, end: {x:0, y:0} };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });
    return {
      index: idx + 1,
      minX, maxX, minY, maxY,
      width: maxX - minX,
      height: maxY - minY,
      start: pts[0],
      end: pts[pts.length - 1]
    };
  });

  // 1. Left-Right structure balance checks
  // Left-Right characters in Grade 1: 村, 林, 校, 休, 町 (already fixed), etc.
  if (char === '村') {
    // 木 (strokes 1-4) vs 寸 (strokes 5-7)
    // In textbook: 寸's top horizontal (stroke 5) should be lower than 木's top (stroke 2)
    const kiTop = strokeBoxes[1].minY; // 2nd stroke of 木
    const sunTop = strokeBoxes[4].minY; // 1st stroke of 寸 (stroke 5)
    if (sunTop <= kiTop + 3) {
      issues.push({
        type: '段差（へんとつくり）',
        detail: `「寸」の横棒（5画目: y=${sunTop.toFixed(1)}）が「木」（2画目: y=${kiTop.toFixed(1)}）より十分に下がっていません。`,
        severity: 'high'
      });
    }
  }

  if (char === '校') {
    // 木 (strokes 1-4) vs 交 (strokes 5-10)
    // In textbook: 交's dot (stroke 5) should start slightly below 木's vertical top (stroke 2)
    const kiTop = strokeBoxes[1].minY;
    const koTop = strokeBoxes[4].minY;
    if (koTop < kiTop) {
      issues.push({
        type: '段差（へんとつくり）',
        detail: `「交」の頭（5画目: y=${koTop.toFixed(1)}）が「木」（2画目: y=${kiTop.toFixed(1)}）より高くなっています。`,
        severity: 'medium'
      });
    }
  }

  if (char === '休') {
    // イ (strokes 1-2) vs 木 (strokes 3-6)
    const ninTop = strokeBoxes[0].minY;
    const kiTop = strokeBoxes[2].minY;
    // 木's vertical (stroke 4) should be prominent
  }

  if (char === '林') {
    // Left 木 (1-4) vs Right 木 (5-8)
    // Left 木 stroke 4 should be a dot (止め), Right 木 stroke 8 should be a sweep (払い)
    // Right 木 is slightly larger/taller than left 木
    const leftKiTop = strokeBoxes[1].minY;
    const rightKiTop = strokeBoxes[5].minY;
    const leftKiBottom = strokeBoxes[1].maxY;
    const rightKiBottom = strokeBoxes[5].maxY;
    if (leftKiTop < rightKiTop - 2) {
      issues.push({
        type: '左右バランス',
        detail: `左の木（2画目: y=${leftKiTop.toFixed(1)}）が右の木（6画目: y=${rightKiTop.toFixed(1)}）より高くなっています（右が主役）。`,
        severity: 'low'
      });
    }
  }

  // 2. Stroke length proportions
  if (char === '天') {
    // Stroke 1 (top horizontal) vs Stroke 2 (middle horizontal)
    // In textbook: 1st stroke is SHORTER than 2nd stroke
    const len1 = strokeBoxes[0].width;
    const len2 = strokeBoxes[1].width;
    if (len1 >= len2 * 0.9) {
      issues.push({
        type: '横棒の長短比率',
        detail: `1画目(${len1.toFixed(1)}px)と2画目(${len2.toFixed(1)}px)の長さの差が小さめ（1画目は短く、2画目を長く）。`,
        severity: 'medium'
      });
    }
  }

  if (char === '王') {
    // Stroke 1 (top), Stroke 2 (middle), Stroke 4 (bottom)
    // Length order: bottom > top > middle
    const len1 = strokeBoxes[0].width;
    const len2 = strokeBoxes[1].width;
    const len4 = strokeBoxes[3].width;
    if (len2 >= len1 || len1 >= len4) {
      issues.push({
        type: '横棒の長短比率',
        detail: `横棒3本のバランス（下 > 上 > 中）の確認を推奨。`,
        severity: 'low'
      });
    }
  }

  if (char === '手') {
    // 1: slant sweep, 2: short horizontal, 3: long horizontal, 4: hook
    const len2 = strokeBoxes[1].width;
    const len3 = strokeBoxes[2].width;
    if (len2 >= len3 * 0.8) {
      issues.push({
        type: '横棒の長短比率',
        detail: `2画目の横棒と3画目の横棒のメリハリ（3画目がしっかり長い）。`,
        severity: 'low'
      });
    }
  }

  if (char === '女') {
    // Stroke 1 crossing
    const s1 = strokeBoxes[0];
    const s3 = strokeBoxes[2];
    if (s3.width < 50) {
      issues.push({
        type: '横棒の長さ',
        detail: `3画目の横棒が左右にしっかり突き出ているか確認。`,
        severity: 'low'
      });
    }
  }

  if (char === '正') {
    // Stroke 1 (top) vs Stroke 5 (bottom)
    const len1 = strokeBoxes[0].width;
    const len5 = strokeBoxes[4].width;
    if (len1 >= len5 * 0.85) {
      issues.push({
        type: '横棒の長短比率',
        detail: `1画目(${len1.toFixed(1)}px)と5画目(${len5.toFixed(1)}px)の差（5画目の土台をしっかり長く）。`,
        severity: 'medium'
      });
    }
  }

  if (char === '土') {
    // Stroke 1 (top) vs Stroke 3 (bottom)
    const len1 = strokeBoxes[0].width;
    const len3 = strokeBoxes[2].width;
    if (len1 >= len3 * 0.85) {
      issues.push({
        type: '横棒の長短比率',
        detail: `1画目(${len1.toFixed(1)}px)が3画目(${len3.toFixed(1)}px)に対して長すぎないか確認。`,
        severity: 'medium'
      });
    }
  }

  if (char === '石') {
    // Stroke 1 (horizontal) vs Stroke 2 (left sweep)
    // 1 is horizontal, 2 starts from top center
    const s1Start = strokeBoxes[0].start;
    const s2Start = strokeBoxes[1].start;
    if (s2Start.y < s1Start.y - 5) {
      issues.push({
        type: '交差・書き順バランス',
        detail: `1画目の横棒と2画目の左払いの接触位置確認。`,
        severity: 'low'
      });
    }
  }

  return issues;
}

const allResults = [];
for (const char of Object.keys(data)) {
  const issues = analyzeKanji(char, data[char]);
  if (issues.length > 0) {
    allResults.push({ char, issues });
  }
}

console.log(`\n=== 1年生80字の教科書体バランス自動照合結果 ===`);
console.log(`検出件数: ${allResults.length} 文字 / 80 文字中\n`);

allResults.forEach((res, idx) => {
  console.log(`[${idx+1}] 【 ${res.char} 】`);
  res.issues.forEach(iss => {
    console.log(`  - [${iss.type}] ${iss.detail} (重要度: ${iss.severity})`);
  });
});
