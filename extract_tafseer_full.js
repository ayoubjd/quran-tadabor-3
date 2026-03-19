const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfPath = path.join(__dirname, 'books to add', 'ar_tafseer_moyasser text.pdf');
const outPath = path.join(__dirname, 'quran-reader', 'resources', 'tafseer.json');

// Even if they are diacritics, let's keep them as "digits" for display as they look correct
// but we might want to normalize them for sorting later if needed.

async function extract() {
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    console.log('Searching for verses with very broad regex...');
    // Broad regex: [ anything : anything ]
    const regex = /\[([^\]\:]+)\:\s*([^\]]+)\]/g;
    const items = [];
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
        const surahRaw = match[1].trim();
        const ayahNumberRaw = match[2].trim();

        // Skip obvious non-verse brackets if any
        if (surahRaw.length > 50 || ayahNumberRaw.length > 30) continue;

        if (items.length > 0) {
            const content = text.slice(lastIndex, match.index).trim();
            items[items.length - 1].content = content;
        }

        items.push({
            surah: surahRaw,
            ayah_number: ayahNumberRaw,
            index: match.index
        });

        lastIndex = regex.lastIndex;
    }

    if (items.length > 0) {
        items[items.length - 1].content = text.slice(lastIndex).trim().slice(0, 2000);
    }

    console.log(`Found ${items.length} raw matches.`);

    const finalData = items
        .filter(item => item.content && item.content.length > 10)
        .map(item => {
            // Remove decorative characters and artifacts
            // U+f000 to U+f0ff are private use area often used for icons/decorations in fonts
            let cleaned = item.content
                .replace(/[\uf000-\uf0ff]/g, '')
                .replace(/[\u0000-\u001F]/g, '')
                .replace(/\n\s*\d+\s*\n/g, '\n')
                .trim();

            return {
                surah: item.surah,
                ayah_number: item.ayah_number,
                text: cleaned
            };
        });

    console.log(`Final processed entries: ${finalData.length}`);
    if (finalData.length > 0) {
        console.log('Sample entry:', JSON.stringify(finalData[0], null, 2));
    }

    fs.writeFileSync(outPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log('Saved to', outPath);
}

extract().catch(console.error);
