// Normalize hadeeths.json - map ugly __EMPTY keys to proper field names
const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, 'quran-reader', 'resources', 'hadeeths.json');
const outPath = path.join(__dirname, 'quran-reader', 'resources', 'hadeeths.json');

const raw = JSON.parse(fs.readFileSync(inPath, 'utf-8'));

// Skip the first row (header row)
const LONG_KEY = Object.keys(raw[0])[0]; // the ugly comment key

const normalized = raw
    .slice(1) // skip header row
    .filter(r => r[LONG_KEY] && typeof r[LONG_KEY] === 'number') // only valid hadeeth rows
    .map(r => ({
        id: r[LONG_KEY],
        title: r['__EMPTY'] || '',
        hadith_text: r['__EMPTY_1'] || '',
        explanation: r['__EMPTY_2'] || '',
        word_meanings: r['__EMPTY_3'] || '',
        benefits: r['__EMPTY_4'] || '',
        grade: r['__EMPTY_5'] || '',
        takhrij: r['__EMPTY_6'] || '',
        link: r['__EMPTY_7'] || ''
    }));

fs.writeFileSync(outPath, JSON.stringify(normalized), 'utf-8');
console.log(`Normalized! ${normalized.length} hadeeths saved.`);
console.log('Sample:', JSON.stringify(normalized[0], null, 2).slice(0, 400));
