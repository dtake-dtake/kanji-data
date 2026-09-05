const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchSvg(hex) {
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseKanjiSvg(svgContent) {
  const strokePathSection = svgContent.replace(/<g id="kvg:StrokeNumbers_[\s\S]*?<\/g>/, '');
  const pathTagRegex = /<path\b([^>]+)\/?\>/g;
  const paths = [];
  let match;
  while ((match = pathTagRegex.exec(strokePathSection)) !== null) {
    const attrString = match[1];
    const dMatch = attrString.match(/\bd="([^"]+)"/);
    if (dMatch) paths.push(dMatch[1]);
  }
  const strokeNumRegex = /<text[^>]*?transform="matrix\([^)]*?\s([\d.-]+)\s([\d.-]+)\)"[^>]*?>(\d+)<\/text>/g;
  const numbers = [];
  while ((match = strokeNumRegex.exec(svgContent)) !== null) {
    numbers.push({ num: parseInt(match[3], 10), x: parseFloat(match[1]), y: parseFloat(match[2]) });
  }
  if (numbers.length === 0) {
    const r2 = /<text[^>]*?x="([\d.-]+)"[^>]*?y="([\d.-]+)"[^>]*?>(\d+)<\/text>/g;
    while ((match = r2.exec(svgContent)) !== null) {
      numbers.push({ num: parseInt(match[3], 10), x: parseFloat(match[1]), y: parseFloat(match[2]) });
    }
  }
  return { paths, numbers };
}

async function main() {
  const chars = process.argv.slice(2);
  if (chars.length === 0) {
    console.log('Usage: node refetch-chars.js 万 心 考 折');
    process.exit(1);
  }

  // Determine which grade file(s) to update
  const gradeMap = {};
  const KANJI_BY_GRADE = {
    1: "一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六",
    2: "引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪折組船走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読南肉馬買売麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話",
    3: "悪安暗医委意育員院飲運泳駅央横屋温化界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和",
    4: "愛案以衣位囲胃印英栄塩億加果貨課芽改械害街各覚完官管関観願希季紀喜旗器機議求泣救給挙漁共協鏡競極訓軍郡径型景芸欠結建健験固功好候航康告差最菜材昨札刷殺察参産散残士氏史司試児治辞失借種周祝順初松笑唱焼象照賞臣信成省清静席積折節説浅戦選然争倉巣束側続卒孫帯隊達単置仲貯兆腸低底停的典伝徒努灯堂働特得毒熱念敗梅博白飯飛費必票標不夫付府副粉兵別辺変便包法望牧末満未脈無約勇要養浴利陸良料量輪類令冷例歴連老労録",
    5: "圧移因永営衛易益液演応往桜恩可仮価河過賀快解格確額刊幹慣眼基寄規技義逆久旧居許境均禁句群経潔件券険検限現減故個護効厚耕鉱構興講混査再災妻採際在財罪雑酸賛支志枝師資飼示似識質舎謝授修述術準序招承証条状常情織職制性政勢精製税責績接設舌絶銭祖素総造増測属率損退貸態団断築張提程適敵統銅導徳独任燃能破犯判版比肥非備俵評貧布婦富武復複仏編弁保墓報豊防貿暴務夢迷綿輸余預容略留領",
    6: "異遺域宇映延沿我灰拡革閣割株干巻看簡危机揮貴疑吸供胸郷勤筋系敬警劇激穴絹権憲後厳己庁座裁策冊蚕至私姿視詞誌磁射捨尺若樹収宗就衆従縦縮熟純処署諸除将傷障城蒸針仁垂推寸盛聖誠宣専泉洗染善奏窓創装層操蔵臓存尊退誕担探暖段庁頂潮賃痛展討党糖届難乳認納脳派拝背肺俳班晩否批秘腹奮並陛閉片補暮宝訪亡忘棒枚幕密盟模訳郵優幼欲翌乱卵覧裏律臨朗論"
  };

  for (const c of chars) {
    for (let g = 1; g <= 6; g++) {
      if (KANJI_BY_GRADE[g].includes(c)) {
        if (!gradeMap[g]) gradeMap[g] = [];
        gradeMap[g].push(c);
        break;
      }
    }
  }

  for (const [grade, charList] of Object.entries(gradeMap)) {
    const gradeFile = path.join(__dirname, '..', 'data', 'kanji', `grade${grade}.json`);
    const data = JSON.parse(fs.readFileSync(gradeFile, 'utf8'));

    for (const c of charList) {
      const hex = c.codePointAt(0).toString(16).padStart(5, '0');
      console.log(`Fetching ${c} (${hex}) for grade ${grade}...`);
      const svg = await fetchSvg(hex);
      const { paths, numbers } = parseKanjiSvg(svg);
      data[c] = { char: c, grade: parseInt(grade), codePoint: hex, strokeCount: paths.length, paths, numbers };
      console.log(`  -> ${paths.length} strokes OK`);
      await new Promise(r => setTimeout(r, 100));
    }

    fs.writeFileSync(gradeFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`grade${grade}.json updated: ${charList.join(', ')}`);
  }

  console.log('\nDone! Run "node scripts/sync-data.js" to sync.');
}

main().catch(e => console.error(e));
