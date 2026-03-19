const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'books to add');
const destDir = path.join(__dirname, 'quran-reader', 'books');

// Mapping for Surahs exactly as named in the source directory
const surahMap = [
    "الفَاتِحَة", "البَقَرَة", "آل عِمرَان", "النِّسَاء", "المَائدة", "الأنعَام", "الأعرَاف", "الأنفَال",
    "التوبَة", "يُونس", "هُود", "يُوسُف", "الرَّعْد", "إبراهِيم", "الحِجْر", "النَّحْل",
    "الإسْرَاء", "الكهْف", "مَريَم", "طه", "الأنبيَاء", "الحَج", "المُؤمنون", "النُّور",
    "الفُرْقان", "الشُّعَرَاء", "النَّمْل", "القَصَص", "العَنكبوت", "الرُّوم", "لقمَان", "السَّجدَة",
    "الأحزَاب", "سَبَأ", "فَاطِر", "يس", "الصَّافات", "ص", "الزُّمَر", "غَافِر",
    "فُصِّلَتْ", "الشُّورَى", "الزُّخْرُف", "الدُّخان", "الجاثِية", "الأحقاف", "مُحَمّد", "الفَتْح",
    "الحُجُرات", "ق", "الذَّاريَات", "الطُّور", "النَّجْم", "القَمَر", "الرَّحمن", "الواقِعَة",
    "الحَديد", "المُجادَلة", "الحَشْر", "المُمتَحَنة", "الصَّف", "الجُّمُعة", "المُنافِقُون", "التَّغابُن",
    "الطَّلاق", "التَّحْريم", "المُلْك", "القَلـََم", "الحَاقّـَة", "المَعارِج", "نُوح", "الجِنّ",
    "المُزَّمّـِل", "المُدَّثــِّر", "القِيامَة", "الإنسان", "المُرسَلات", "النـَّبأ", "النـّازِعات", "عَبَس",
    "التـَّكْوير", "الإنفِطار", "المُطـَفِّفين", "الإنشِقاق", "البُروج", "الطّارق", "الأعلی", "الغاشِيَة",
    "الفَجْر", "البَـلـَد", "الشــَّمْس", "اللـَّيل", "الضُّحی", "الشَّرْح", "التـِّين", "العَلـَق",
    "القـَدر", "البَيِّنَة", "الزلزَلة", "العَادِيات", "القارِعَة", "التَكاثـُر", "العَصْر", "الهُمَزَة",
    "الفِيل", "قـُرَيْش", "المَاعُون", "الكَوْثَر", "الكَافِرُون", "النـَّصر", "المَسَد", "الإخْلَاص",
    "الفَلَق", "النَّاس"
];

const books = [
    {
        src: 'adkar al masa2',
        dest: 'adkar-masa',
        prefix: 'adkar masa2 M_'
    },
    {
        src: 'adkar sabah webp',
        dest: 'adkar-sabah',
        prefix: 'adkar sabah M_'
    },
    {
        src: 'sera nabaweya graph',
        dest: 'seerah-graph',
        prefix: 'graphمختصر السيرة النبوية_'
    },
    {
        src: 'الرقية الشرعية من الكتاب',
        dest: 'al-ruqya',
        prefix: 'الرقية الشرعية من الكتاب والسنة_'
    }
];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 1. Handle prefixed books
books.forEach(b => {
    const sDir = path.join(srcDir, b.src);
    const dDir = path.join(destDir, b.dest);
    ensureDir(dDir);

    if (fs.existsSync(sDir)) {
        const files = fs.readdirSync(sDir).filter(f => f.endsWith('.webp'));
        console.log(`Copying ${files.length} files for ${b.dest}...`);
        
        files.forEach(file => {
            // Extract number from prefix
            const numMatch = file.match(new RegExp(`${b.prefix}(\\d+)\\.webp`));
            if (numMatch) {
                const num = numMatch[1];
                const newName = `(${num}).webp`;
                fs.copyFileSync(path.join(sDir, file), path.join(dDir, newName));
            } else {
                console.log(`Skipping file with unrecognized pattern: ${file}`);
            }
        });
    } else {
        console.log(`Source dir not found: ${sDir}`);
    }
});

// 2. Handle Surah summary
const surahSrcDir = path.join(srcDir, 'surah summary');
const surahDestDir = path.join(destDir, 'surah-summary');
ensureDir(surahDestDir);

if (fs.existsSync(surahSrcDir)) {
    console.log(`Copying surah summary...`);
    surahMap.forEach((surahName, index) => {
        const pageNum = index + 1;
        const fileName = `${surahName}.webp`;
        const srcFile = path.join(surahSrcDir, fileName);
        const destFile = path.join(surahDestDir, `(${pageNum}).webp`);

        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, destFile);
        } else {
            console.log(`WARNING: Missing surah file: ${fileName}`);
        }
    });
} else {
    console.log(`Source dir not found: ${surahSrcDir}`);
}

console.log('Copy complete!');
