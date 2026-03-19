const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfPath = path.join(__dirname, 'books to add', 'ar_tafseer_moyasser text.pdf');
const outPath = path.join(__dirname, 'quran-reader', 'resources', 'tafseer.json');

function reverseArabic(str) {
    if (!str) return '';
    return str.split('').reverse().join('');
}

// Common mangled mappings found in this specific PDF's extraction
const MAPPINGS = [
    [/ب٧/g, 'مح'],
    [/ب٢/g, 'الح'],
    [/ب٣/g, 'ال'],
    [/ب٤/g, 'الم'],
    [/ب٥/g, 'الم'],
    [/ب٦/g, 'الم'],
    [/بًا/g, 'مًا'],
    [/بْب/g, 'بين'],
    [/بًا/g, 'مًا'],
    [/بْنمؤب٤ا/g, 'المؤمنون'],
    [/ئ/g, 'ل'], // In many places ئ looks like it should be ل
    [/ؽ/g, 'ص'],
    [/ؿ/g, 'ن'],
    [/بِ/g, 'بن'],
    [/بٍ/g, 'و'],
    [/فأ/g, 'أن'],
    [/أـ/g, 'أم'],
    [/بُ/g, 'في'],
    [/بُو/g, 'فيو'],
    [/وه/g, 'هو'],
    [/وب/g, 'به'],
    [/وة/g, 'وه'],
    [/بًا/g, 'من'],
    [/فآرقلا/g, 'القرآن'],
    [/اب٢ير/g, 'الحديث'],
    [/رَّسيملا/g, 'الميسر'],
    [/ريسفتلا/g, 'التفسير'],
    [/روطلا/g, 'الطور'],
    [/ةلبقلا/g, 'القبلة']
];

function cleanAndUnmangle(text) {
    if (!text) return '';

    // First, handle the PUA characters
    let cleaned = text.replace(/[\uf000-\uf0ff]/g, '');

    // Apply common mappings
    for (const [regex, replacement] of MAPPINGS) {
        cleaned = cleaned.replace(regex, replacement);
    }

    // Remove control chars and normalize whitespace
    cleaned = cleaned.replace(/[\u0000-\u001F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned;
}

async function extract() {
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    console.log('Segmenting by markers...');
    // \uf0e2 = start of Ayah, \uf0e1 = end of Ayah
    const regex = /\uf0e2(.*?)\uf0e1(.*?)(?=\uf0e2|$)/gs;
    const finalData = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        let ayahPart = match[1].trim();
        let tafseerPart = match[2].trim();

        // Clean both parts
        ayahPart = cleanAndUnmangle(ayahPart);
        tafseerPart = cleanAndUnmangle(tafseerPart);

        // Sometimes the Ayah number remains in the Tafseer as (Num)
        const numMatch = tafseerPart.match(/^\s*\((\d+|[\u0660-\u0669]+)\)/);
        let ayahNum = '';
        if (numMatch) {
            ayahNum = numMatch[1];
            tafseerPart = tafseerPart.replace(/^\s*\(([^)]+)\)/, '').trim();
        }

        if (tafseerPart.length > 20) {
            finalData.push({
                ayah: ayahPart,
                tafseer: tafseerPart,
                ayah_number: ayahNum
            });
        }
    }

    console.log(`Extracted ${finalData.length} entries.`);
    if (finalData.length > 0) {
        console.log('Sample entry:', JSON.stringify(finalData[Math.min(100, finalData.length - 1)], null, 2));
    }

    fs.writeFileSync(outPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log('Saved to', outPath);
}

extract().catch(console.error);
