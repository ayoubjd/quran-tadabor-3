const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfPath = path.join(__dirname, 'books to add', 'ar_tafseer_moyasser text.pdf');

async function debugAllBrackets() {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    fs.writeFileSync('tafseer_full_text.txt', text, 'utf-8');
    console.log('Text length:', text.length);

    const regex = /\[([^\]]+)\]/g;
    let m;
    const brackets = [];
    while ((m = regex.exec(text)) !== null) {
        brackets.push(m[0]);
    }

    console.log('Total brackets found:', brackets.length);
    console.log('First 50 brackets:', JSON.stringify(brackets.slice(0, 50), null, 2));

    // Check if ":" is present in these brackets
    const withColon = brackets.filter(b => b.includes(':'));
    console.log('Brackets with colon:', withColon.length);
    if (withColon.length > 0) {
        console.log('First 50 brackets with colon:', JSON.stringify(withColon.slice(0, 50), null, 2));
    }
}

debugAllBrackets().catch(console.error);
