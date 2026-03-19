const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfPath = path.join(__dirname, 'books to add', 'ar_tafseer_moyasser text.pdf');

async function debug() {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer, { max: 50 }); // Parse more pages
    const text = data.text;

    console.log('Text length:', text.length);

    // Find a candidate for [Surah: Val]
    // Let's search for the first ":" in the text and print the surrounding chars with codes
    const index = text.indexOf(':');
    if (index === -1) {
        console.log('No colon found!');
        return;
    }

    console.log('Found colon at index', index);
    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + 20);
    const snippet = text.slice(start, end);

    console.log('Snippet:', snippet);
    for (let i = 0; i < snippet.length; i++) {
        console.log(`char[${i}]: '${snippet[i]}' (U+${snippet.charCodeAt(i).toString(16).padStart(4, '0')})`);
    }

    // Try a very simple regex to find brackets
    const simpleRegex = /\[[^\]]*\]/g;
    let m;
    let count = 0;
    while ((m = simpleRegex.exec(text)) !== null && count < 10) {
        console.log('Bracket match:', m[0]);
        count++;
    }
}

debug().catch(console.error);
