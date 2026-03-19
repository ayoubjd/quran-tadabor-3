// Extract pages one by one from Tafseer PDF to avoid memory issues
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'books to add', 'ar_tafseer_moyasser text.pdf');
const outPath = path.join(__dirname, 'quran-reader', 'resources', 'tafseer.json');

(async () => {
    const pdfParse = require('pdf-parse');

    // Read first 2 pages only just to inspect structure
    const buf = fs.readFileSync(pdfPath);
    console.log('File size:', buf.length, 'bytes');

    const data = await pdfParse(buf, {
        max: 5  // Only parse first 5 pages to see structure
    });

    console.log('Pages parsed (sample):', data.numpages);
    console.log('\n=== TEXT SAMPLE (first 4000 chars) ===');
    console.log(data.text.slice(0, 4000));

    fs.writeFileSync('tafseer_sample.txt', data.text, 'utf-8');
    console.log('\nSample saved.');
})().catch(e => console.error('Error:', e.message));
