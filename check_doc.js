const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, 'books to add', 'التفسير الميسر ملف ورد.doc');

try {
    const buffer = fs.readFileSync(docPath);
    const signature = buffer.slice(0, 8).toString('hex').toUpperCase();
    console.log('Signature:', signature);

    if (signature === 'D0CF11E0A1B11AE1') {
        console.log('Format: Legacy Word (.doc)');
    } else if (signature.startsWith('504B0304')) {
        console.log('Format: Word XML (.docx)');
    } else {
        console.log('Format: Unknown');
    }
} catch (e) {
    console.error('Error:', e.message);
}
