const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'tafseer_extracted_v2.txt');
const outputPath = path.join(__dirname, 'quran-reader', 'resources', 'tafseer.json');

function parseTafseer() {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const entries = [];

    // Pattern for Ayah: ends with (number)
    const ayahRegex = /^(.*?)\s*\((\d+|[\u0660-\u0669]+)\)\s*$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const match = line.match(ayahRegex);
        if (match) {
            const ayahText = match[1].trim();
            const ayahNum = match[2].trim();

            // The next non-empty line is usually the tafseer
            let j = i + 1;
            while (j < lines.length && !lines[j].trim()) j++;

            if (j < lines.length) {
                let tafseerText = lines[j].trim();

                // If the next line is just a marker like (1/11), skip it or find if tafseer continues
                if (tafseerText.match(/^\(\d+\/\d+\)$/)) {
                    // This was just a page marker, skip it and check if tafseer is actually the next one
                    j++;
                    while (j < lines.length && !lines[j].trim()) j++;
                    if (j < lines.length) {
                        tafseerText = lines[j].trim();
                    }
                }

                // Final check: if it's not another ayah and not a marker, it's the tafseer
                if (tafseerText && !tafseerText.match(ayahRegex) && !tafseerText.match(/^\(\d+\/\d+\)$/)) {
                    entries.push({
                        ayah: ayahText,
                        tafseer: tafseerText,
                        ayah_number: ayahNum
                    });
                    i = j; // Skip the tafseer line in the next iteration
                }
            }
        }
    }

    console.log(`Parsed ${entries.length} entries.`);
    if (entries.length > 0) {
        console.log('Sample:', JSON.stringify(entries[Math.floor(entries.length / 2)], null, 2));
    }

    fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2), 'utf-8');
}

parseTafseer();
