// Extract Tafseer from ar_tafseer_moyasser text.pdf into JSON
// The PDF contains tafseer for each ayah, and we'll extract them into an array of objects
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'books to add', 'ar_tafseer_moyasser text.pdf');
const outPath = path.join(__dirname, 'quran-reader', 'resources', 'tafseer.json');

(async () => {
    try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(pdfPath);
        console.log('Parsing PDF...');
        const data = await pdfParse(dataBuffer);

        console.log(`PDF has ${data.numpages} pages, ${data.text.length} chars`);

        // Print a sample of the text so we can understand the structure
        console.log('\n=== FIRST 3000 CHARS ===');
        console.log(data.text.slice(0, 3000));
        console.log('\n=== CHARS 3000-6000 ===');
        console.log(data.text.slice(3000, 6000));
        console.log('\n=== CHARS 6000-9000 ===');
        console.log(data.text.slice(6000, 9000));

        // Write raw text to inspect
        fs.writeFileSync('tafseer_raw.txt', data.text, 'utf-8');
        console.log('\nRaw text saved to tafseer_raw.txt for inspection.');

    } catch (err) {
        console.error('Error:', err.message);
        console.error(err.stack);
    }
})();
