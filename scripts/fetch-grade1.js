const fs = require('fs');
const path = require('path');
const https = require('https');

const GRADE1_KANJI = [
  { char: '一', on: ['イチ', 'イツ'], kun: ['ひと', 'ひと-つ'] },
  { char: '右', on: ['ウ', 'ユウ'], kun: ['みぎ'] },
  { char: '雨', on: ['ウ'], kun: ['あめ', 'あま'] },
  { char: '円', on: ['エン'], kun: ['まる-い'] },
  { char: '王', on: ['オウ'], kun: [] },
  { char: '音', on: ['オン', 'イン'], kun: ['おと', 'ね'] },
  { char: '下', on: ['カ', 'ゲ'], kun: ['した', 'しも', 'もと', 'さ-げる', 'さ-がる', 'くだ-る', 'くだ-す', 'くだ-さる', 'お-ろす', 'お-りる'] },
  { char: '火', on: ['カ'], kun: ['ひ', 'ほ'] },
  { char: '花', on: ['カ', 'ケ'], kun: ['はな'] },
  { char: '貝', on: ['バイ'], kun: ['かい'] },
  { char: '学', on: ['ガク'], kun: ['まな-ぶ'] },
  { char: '気', on: ['キ', 'ケ'], kun: ['いき'] },
  { char: '九', on: ['キュウ', 'ク'], kun: ['ここの', 'ここの-つ'] },
  { char: '休', on: ['キュウ'], kun: ['やす-む', 'やす-まる', 'やす-める'] },
  { char: '玉', on: ['ギョク'], kun: ['たま'] },
  { char: '金', on: ['キン', 'コン'], kun: ['かね', 'かな'] },
  { char: '空', on: ['クウ'], kun: ['そら', 'あ-く', 'あ-ける', 'から'] },
  { char: '月', on: ['ゲツ', 'ガツ'], kun: ['つき'] },
  { char: '犬', on: ['ケン'], kun: ['いぬ'] },
  { char: '見', on: ['ケン'], kun: ['み-る', 'み-える', 'み-せる'] },
  { char: '五', on: ['ゴ'], kun: ['いつ', 'いつ-つ'] },
  { char: '口', on: ['コウ', 'ク'], kun: ['くち'] },
  { char: '校', on: ['コウ'], kun: [] },
  { char: '左', on: ['サ'], kun: ['ひだり'] },
  { char: '三', on: ['サン'], kun: ['み', 'み-つ', 'みっ-つ'] },
  { char: '山', on: ['サン', 'セン'], kun: ['やま'] },
  { char: '子', on: ['シ', 'ス'], kun: ['こ'] },
  { char: '四', on: ['シ'], kun: ['よ', 'よ-つ', 'よっ-つ', 'よん'] },
  { char: '糸', on: ['シ'], kun: ['いと'] },
  { char: '字', on: ['ジ'], kun: ['あざ'] },
  { char: '耳', on: ['ジ'], kun: ['みみ'] },
  { char: '七', on: ['シチ'], kun: ['なな', 'なな-つ', 'なの'] },
  { char: '車', on: ['シャ'], kun: ['くるま'] },
  { char: '手', on: ['シュ'], kun: ['て', 'た'] },
  { char: '十', on: ['ジュウ', 'ジッ'], kun: ['とお', 'と'] },
  { char: '出', on: ['シュツ', 'スイ'], kun: ['で-る', 'だ-す'] },
  { char: '女', on: ['ジョ', 'ニョ', 'ニョウ'], kun: ['おんな', 'め'] },
  { char: '小', on: ['ショウ'], kun: ['ちい-さい', 'こ', 'お'] },
  { char: '上', on: ['ジョウ', 'ショウ'], kun: ['うえ', 'うわ', 'かみ', 'あ-げる', 'あ-がる', 'のぼ-る', 'のぼ-せる', 'のぼ-す'] },
  { char: '森', on: ['シン'], kun: ['もり'] },
  { char: '人', on: ['ジン', 'ニン'], kun: ['ひと'] },
  { char: '水', on: ['スイ'], kun: ['みず'] },
  { char: '正', on: ['セイ', 'ショウ'], kun: ['ただ-しい', 'ただ-す', 'まさ'] },
  { char: '生', on: ['セイ', 'ショウ'], kun: ['い-きる', 'い-かす', 'い-ける', 'う-まれる', 'う-む', 'お-う', 'は-える', 'は-やす', 'き', 'なま'] },
  { char: '青', on: ['セイ', 'ショウ'], kun: ['あお', 'あお-い'] },
  { char: '夕', on: ['セキ'], kun: ['ゆう'] },
  { char: '石', on: ['セキ', 'シャク', 'コク'], kun: ['いし'] },
  { char: '赤', on: ['セキ', 'シャク'], kun: ['あか', 'あか-い', 'あか-らむ', 'あか-らめる'] },
  { char: '千', on: ['セン'], kun: ['ち'] },
  { char: '川', on: ['セン'], kun: ['かわ'] },
  { char: '先', on: ['セン'], kun: ['さき'] },
  { char: '早', on: ['ソウ', 'サッ'], kun: ['はや-い', 'はや-まる', 'はや-める'] },
  { char: '草', on: ['ソウ'], kun: ['くさ'] },
  { char: '足', on: ['ソク'], kun: ['あし', 'た-りる', 'た-る', 'た-す'] },
  { char: '村', on: ['ソン'], kun: ['むら'] },
  { char: '大', on: ['ダイ', 'タイ'], kun: ['おお', 'おお-きい', 'おお-いに'] },
  { char: '男', on: ['ダン', 'ナン'], kun: ['おとこ'] },
  { char: '竹', on: ['チク'], kun: ['たけ'] },
  { char: '中', on: ['チュウ'], kun: ['なか'] },
  { char: '虫', on: ['チュウ'], kun: ['むし'] },
  { char: '町', on: ['チョウ'], kun: ['まち'] },
  { char: '天', on: ['テン'], kun: ['あめ', 'あま'] },
  { char: '田', on: ['デン'], kun: ['た'] },
  { char: '土', on: ['ド', 'ト'], kun: ['つち'] },
  { char: '二', on: ['ニ'], kun: ['ふた', 'ふた-つ'] },
  { char: '日', on: ['ニチ', 'ジツ'], kun: ['ひ', 'か'] },
  { char: '入', on: ['ニュウ'], kun: ['はい-る', 'い-る', 'い-れる'] },
  { char: '年', on: ['ネン'], kun: ['とし'] },
  { char: '白', on: ['ハク', 'ビャク'], kun: ['しろ', 'しろ-い'] },
  { char: '八', on: ['ハチ'], kun: ['や', 'や-つ', 'やっ-つ', 'よう'] },
  { char: '百', on: ['ヒャク'], kun: ['もも'] },
  { char: '文', on: ['ブン', 'モン'], kun: ['ふみ', 'あや'] },
  { char: '木', on: ['ボク', 'モク'], kun: ['き', 'こ'] },
  { char: '本', on: ['ホン'], kun: ['もと'] },
  { char: '名', on: ['メイ', 'ミョウ'], kun: ['な'] },
  { char: '目', on: ['モク', 'ボク'], kun: ['め', 'ま'] },
  { char: '立', on: ['リツ', 'リュウ'], kun: ['た-つ', 'た-てる'] },
  { char: '力', on: ['リョク', 'リキ'], kun: ['ち力'] },
  { char: '林', on: ['リン'], kun: ['はやし'] },
  { char: '六', on: ['ロク'], kun: ['む', 'む-つ', 'むっ-つ', 'むい'] }
];

function fetchSvg(hex) {
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url} (Status: ${res.statusCode})`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseKanjiSvg(svgContent) {
  // Remove StrokeNumbers section
  const strokePathSection = svgContent.replace(/<g id="kvg:StrokeNumbers_[\s\S]*?<\/g>/, '');
  
  // Extract all <path ... /> tags
  const pathTagRegex = /<path\b([^>]+)\/?>/g;
  const paths = [];
  let match;
  
  while ((match = pathTagRegex.exec(strokePathSection)) !== null) {
    const attrString = match[1];
    const dMatch = attrString.match(/\bd="([^"]+)"/);
    if (dMatch) {
      paths.push(dMatch[1]);
    }
  }
  
  // Extract stroke numbers
  const strokeNumRegex = /<text[^>]*?transform="matrix\([^)]*?\s([\d.-]+)\s([\d.-]+)\)"[^>]*?>(\d+)<\/text>/g;
  const numbers = [];
  while ((match = strokeNumRegex.exec(svgContent)) !== null) {
    numbers.push({
      num: parseInt(match[3], 10),
      x: parseFloat(match[1]),
      y: parseFloat(match[2])
    });
  }
  
  return { paths, numbers };
}

async function main() {
  console.log(`Starting to fetch KanjiVG data for ${GRADE1_KANJI.length} grade 1 kanji...`);
  const result = {};

  for (let i = 0; i < GRADE1_KANJI.length; i++) {
    const item = GRADE1_KANJI[i];
    const codePoint = item.char.codePointAt(0);
    const hex = codePoint.toString(16).padStart(5, '0');
    
    try {
      const svg = await fetchSvg(hex);
      const { paths, numbers } = parseKanjiSvg(svg);
      
      result[item.char] = {
        char: item.char,
        codePoint: hex,
        strokeCount: paths.length,
        on: item.on,
        kun: item.kun,
        paths: paths,
        numbers: numbers
      };
      console.log(`[${i+1}/${GRADE1_KANJI.length}] OK: ${item.char} (${paths.length} strokes, path sample: ${paths[0]?.substring(0, 15)}...)`);
    } catch (err) {
      console.error(`[${i+1}/${GRADE1_KANJI.length}] ERROR fetching ${item.char} (${hex}):`, err.message);
    }
    await new Promise(r => setTimeout(r, 40));
  }

  const outDir = path.join(__dirname, '..', 'data', 'kanji');
  fs.mkdirSync(outDir, { recursive: true });
  
  const jsonFile = path.join(outDir, 'grade1.json');
  fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2), 'utf-8');
  
  const jsFile = path.join(outDir, 'grade1.js');
  fs.writeFileSync(jsFile, `// Auto-generated Grade 1 Kanji Data\nwindow.GRADE1_KANJI = ${JSON.stringify(result, null, 2)};\n`, 'utf-8');

  console.log(`\nSuccessfully saved grade1.json and grade1.js!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
