const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, 'books to add', 'Hadeethrandom_ar-v1.7.0.xlsx');
const outPath = path.join(__dirname, 'quran-reader', 'resources', 'hadeeths.json');

console.log('Reading Excel file...');
const wb = XLSX.readFile(excelPath);
const sheets = wb.SheetNames;
console.log('Sheet names:', sheets);

// Take first sheet
const ws = wb.Sheets[sheets[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log(`Total rows: ${data.length}`);
console.log('Sample row keys:', Object.keys(data[0] || {}));
console.log('Sample row:', JSON.stringify(data[0], null, 2));
console.log('Sample row 2:', JSON.stringify(data[1], null, 2));

// Write the full JSON
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Done! Wrote ${data.length} hadeeths to ${outPath}`);
