const WordExtractor = require("word-extractor");
const fs = require('fs');
const path = require('path');

async function extract() {
    const extractor = new WordExtractor();
    const docPath = path.join(__dirname, 'books to add', 'التفسير الميسر ملف ورد.doc');
    const outPath = path.join(__dirname, 'tafseer_extracted_v2.txt');

    console.log('Extracting from', docPath);
    try {
        const extracted = await extractor.extract(docPath);
        const text = extracted.getBody();
        fs.writeFileSync(outPath, text, 'utf-8');
        console.log('Successfully extracted', text.length, 'characters to', outPath);
        console.log('Sample text:', text.substring(0, 500));
    } catch (e) {
        console.error('Extraction failed:', e);
    }
}

extract();
