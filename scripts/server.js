const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = path.join(__dirname, '..');
const REVIEW_FILE = path.join(ROOT_DIR, 'data', 'review_status.json');

// Ensure data/review_status.json exists
if (!fs.existsSync(REVIEW_FILE)) {
  fs.mkdirSync(path.dirname(REVIEW_FILE), { recursive: true });
  fs.writeFileSync(REVIEW_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // ── API: Get Review Status ──────────────────────────────────────────
  if (pathname === '/api/review-status' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(REVIEW_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // ── API: Save Review Status ─────────────────────────────────────────
  if (pathname === '/api/review-status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        // If updating a single char: { char: "地", state: "warn", note: "つくりが小さい" }
        // If state is 'none', it removes/clears the entry
        const currentData = JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf-8') || '{}');

        if (payload.char) {
          if (payload.state === 'none' && !payload.note) {
            delete currentData[payload.char];
          } else {
            currentData[payload.char] = {
              state: payload.state || 'none',
              note: payload.note || '',
              updatedAt: new Date().toISOString()
            };
          }
        } else if (payload.fullSync) {
          Object.assign(currentData, payload.fullSync);
        }

        fs.writeFileSync(REVIEW_FILE, JSON.stringify(currentData, null, 2), 'utf-8');
        console.log(`[Sync] Saved review for ${payload.char || 'batch'} -> state: ${payload.state || 'none'}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: Object.keys(currentData).length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── API: Save Stroke Data ──────────────────────────────────────────
  if (pathname === '/api/save-stroke' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { char, grade, paths, numbers } = JSON.parse(body);
        if (!char || !grade || !paths) throw new Error('Missing char, grade, or paths');

        const gradeFile = path.join(ROOT_DIR, 'data', 'kanji', `grade${grade}.json`);
        const data = JSON.parse(fs.readFileSync(gradeFile, 'utf-8'));

        if (!data[char]) throw new Error(`Character "${char}" not found in grade${grade}.json`);

        data[char].paths = paths;
        if (numbers) data[char].numbers = numbers;

        fs.writeFileSync(gradeFile, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[Editor] Saved ${char} strokes to grade${grade}.json`);

        // Auto-run sync-data.js
        const { execSync } = require('child_process');
        execSync('node scripts/sync-data.js', { cwd: ROOT_DIR, stdio: 'pipe' });
        console.log(`[Editor] Synced all grade data files.`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── API: Save Batch Strokes ─────────────────────────────────────────
  if (pathname === '/api/save-batch-strokes' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { items } = JSON.parse(body);
        if (!Array.isArray(items) || items.length === 0) throw new Error('Items array required');

        // Group by grade
        const byGrade = {};
        for (const item of items) {
          if (!item.char || !item.grade || !item.paths) continue;
          if (!byGrade[item.grade]) byGrade[item.grade] = [];
          byGrade[item.grade].push(item);
        }

        let updatedCount = 0;
        for (const grade of Object.keys(byGrade)) {
          const gradeFile = path.join(ROOT_DIR, 'data', 'kanji', `grade${grade}.json`);
          if (!fs.existsSync(gradeFile)) continue;
          const data = JSON.parse(fs.readFileSync(gradeFile, 'utf-8'));

          for (const item of byGrade[grade]) {
            if (data[item.char]) {
              data[item.char].paths = item.paths;
              if (item.numbers) data[item.char].numbers = item.numbers;
              updatedCount++;
            }
          }
          fs.writeFileSync(gradeFile, JSON.stringify(data, null, 2), 'utf-8');
          console.log(`[Editor] Batch updated ${byGrade[grade].length} characters in grade${grade}.json`);
        }

        // Run sync-data.js once
        const { execSync } = require('child_process');
        execSync('node scripts/sync-data.js', { cwd: ROOT_DIR, stdio: 'pipe' });
        console.log(`[Editor] Synced all grade data files after batch save (${updatedCount} items).`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: updatedCount }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── API: Refetch Char from KanjiVG ─────────────────────────────────
  if (pathname === '/api/refetch-char' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { char } = JSON.parse(body);
        if (!char) throw new Error('Missing char');

        const hex = char.codePointAt(0).toString(16).padStart(5, '0');
        const https = require('https');

        // Fetch SVG from KanjiVG
        const svgContent = await new Promise((resolve, reject) => {
          const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
          https.get(url, (r) => {
            if (r.statusCode !== 200) return reject(new Error('Status ' + r.statusCode));
            let d = ''; r.on('data', c => d += c); r.on('end', () => resolve(d));
          }).on('error', reject);
        });

        // Parse SVG
        const strokeSection = svgContent.replace(/<g id="kvg:StrokeNumbers_[\s\S]*?<\/g>/, '');
        const pathRegex = /<path\b([^>]+)\/?\>/g;
        const paths = [];
        let m;
        while ((m = pathRegex.exec(strokeSection)) !== null) {
          const dMatch = m[1].match(/\bd="([^"]+)"/);
          if (dMatch) paths.push(dMatch[1]);
        }
        const numRegex = /<text[^>]*?transform="matrix\([^)]*?\s([\d.-]+)\s([\d.-]+)\)"[^>]*?>(\d+)<\/text>/g;
        const numbers = [];
        while ((m = numRegex.exec(svgContent)) !== null) {
          numbers.push({ num: parseInt(m[3], 10), x: parseFloat(m[1]), y: parseFloat(m[2]) });
        }
        if (numbers.length === 0) {
          const r2 = /<text[^>]*?x="([\d.-]+)"[^>]*?y="([\d.-]+)"[^>]*?>(\d+)<\/text>/g;
          while ((m = r2.exec(svgContent)) !== null) {
            numbers.push({ num: parseInt(m[3], 10), x: parseFloat(m[1]), y: parseFloat(m[2]) });
          }
        }

        // Find grade and update
        const KANJI_BY_GRADE = {
          1: "一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六",
          2: "引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪折組船走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読南肉馬買売麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話",
          3: "悪安暗医委意育員院飲運泳駅央横屋温化界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和",
          4: "愛案以衣位囲胃印英栄塩億加果貨課芽改械害街各覚完官管関観願希季紀喜旗器機議求泣救給挙漁共協鏡競極訓軍郡径型景芸欠結建健験固功好候航康告差最菜材昨札刷殺察参産散残士氏史司試児治辞失借種周祝順初松笑唱焼象照賞臣信成省清静席積折節説浅戦選然争倉巣束側続卒孫帯隊達単置仲貯兆腸低底停的典伝徒努灯堂働特得毒熱念敗梅博飯飛費必票標不夫付府副粉兵別辺変便包法望牧末満未脈無約勇要養浴利陸良料量輪類令冷例歴連老労録",
          5: "圧移因永営衛易益液演応往桜恩可仮価河過賀快解格確額刊幹慣眼基寄規技義逆久旧居許境均禁句群経潔件券険検限現減故個護効厚耕鉱構興講混査再災妻採際在財罪雑酸賛支志枝師資飼示似識質舎謝授修述術準序招承証条状常情織職制性政勢精製税責績接設舌絶銭祖素総造増測属率損退貸態団断築張提程適敵統銅導徳独任燃能破犯判版比肥非備俵評貧布婦富武復複仏編弁保墓報豊防貿暴務夢迷綿輸余預容略留領",
          6: "異遺域宇映延沿我灰拡革閣割株干巻看簡危机揮貴疑吸供胸郷勤筋系敬警劇激穴絹権憲後厳己庁座裁策冊蚕至私姿視詞誌磁射捨尺若樹収宗就衆従縦縮熟純処署諸除将傷障城蒸針仁垂推寸盛聖誠宣専泉洗染善奏窓創装層操蔵臓存尊退誕担探暖段庁頂潮賃痛展討党糖届難乳認納脳派拝背肺俳班晩否批秘腹奮並陛閉片補暮宝訪亡忘棒枚幕密盟模訳郵優幼欲翌乱卵覧裏律臨朗論"
        };

        let grade = null;
        for (let g = 1; g <= 6; g++) {
          if (KANJI_BY_GRADE[g].includes(char)) { grade = g; break; }
        }
        if (!grade) throw new Error(`Character "${char}" not found in any grade`);

        const gradeFile = path.join(ROOT_DIR, 'data', 'kanji', `grade${grade}.json`);
        const data = JSON.parse(fs.readFileSync(gradeFile, 'utf-8'));
        data[char] = { char, grade, codePoint: hex, strokeCount: paths.length, paths, numbers };
        fs.writeFileSync(gradeFile, JSON.stringify(data, null, 2), 'utf-8');

        // Auto sync
        const { execSync } = require('child_process');
        execSync('node scripts/sync-data.js', { cwd: ROOT_DIR, stdio: 'pipe' });
        console.log(`[Editor] Refetched ${char} from KanjiVG and synced.`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, grade, paths, numbers, strokeCount: paths.length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── Static Files Delivery ───────────────────────────────────────────
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'viewer.html' : pathname);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('500 Server Error');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Review Sync Server running at http://localhost:${PORT}/viewer.html`);
  console.log(`📁 Saving review results directly to: data/review_status.json\n`);
});
