// ============================================
// BOOKS REGISTRY
// ============================================
const BOOKS_REGISTRY = [
    // ---- القرآن الكريم category ----
    {
        id: 'quran',
        category: 'quran',
        title: 'القرآن الكريم',
        description: 'نسخة بدقة عالية (604 صفحة) للقراءة والتلاوة.',
        folder: 'books/quran',
        totalPages: 604,
        cover: 'books/quran/(1).webp',
        direction: 'rtl',
        type: 'webp'
    },
    {
        id: 'moajam',
        category: 'quran',
        title: 'المعجم المفهرس لمواضيع القرآن الكريم',
        description: 'نسخة بدقة عالية (22 صفحة) للبحث عن مواضيع القرآن.',
        folder: 'books/moajam',
        totalPages: 22,
        cover: 'books/moajam/(1).webp',
        direction: 'rtl',
        type: 'webp'
    },
    {
        id: 'betaqat',
        category: 'quran',
        title: 'بطاقات التعريف بسور المصحف الشريف',
        description: 'بطاقات تعريفية تشمل كل سور القرآن الكريم.',
        pdfPath: 'resources/بطاقات التعريف.pdf',
        cover: null,
        type: 'pdf',
        emoji: '📋'
    },

    // ---- منوعات category ----
    {
        id: 'adkar-sabah',
        category: 'mounawaat',
        title: 'أذكار الصباح',
        description: 'أذكار الصباح المأثورة المصوّرة.',
        folder: 'books/adkar-sabah',
        totalPages: 28,
        cover: 'books/adkar-sabah/(1).webp',
        direction: 'rtl',
        type: 'webp'
    },
    {
        id: 'adkar-masa',
        category: 'mounawaat',
        title: 'أذكار المساء',
        description: 'أذكار المساء المأثورة المصوّرة.',
        folder: 'books/adkar-masa',
        totalPages: 27,
        cover: 'books/adkar-masa/(1).webp',
        direction: 'rtl',
        type: 'webp'
    },
    {
        id: 'seerah-graph',
        category: 'mounawaat',
        title: 'مختصر السيرة النبوية (إنفوجراف)',
        description: 'السيرة النبوية مختصرة في إنفوجراف بصري مميز.',
        folder: 'books/seerah-graph',
        totalPages: 68,
        cover: 'books/seerah-graph/(1).webp',
        direction: 'rtl',
        type: 'webp'
    },
    {
        id: 'al-ruqya',
        category: 'mounawaat',
        title: 'الرقية الشرعية من الكتاب والسنة',
        description: 'الرقية الشرعية الثابتة من القرآن والسنة النبوية.',
        folder: 'books/al-ruqya',
        totalPages: 8,
        cover: 'books/al-ruqya/(1).webp',
        direction: 'rtl',
        type: 'webp'
    },
    {
        id: 'surah-summary',
        category: 'quran',
        title: 'بطاقات التعريف بسور المصحف الشريف',
        description: 'بطاقات تعريفية تشمل كل سور القرآن الكريم.',
        folder: 'books/surah-summary',
        totalPages: 114,
        cover: 'books/surah-summary/(1).webp',
        direction: 'rtl',
        type: 'webp'
    }
];

// Helper: get book by ID
function getBookById(id) {
    return BOOKS_REGISTRY.find(book => book.id === id);
}

// Helper: get books by category
function getBooksByCategory(category) {
    return BOOKS_REGISTRY.filter(book => book.category === category);
}
