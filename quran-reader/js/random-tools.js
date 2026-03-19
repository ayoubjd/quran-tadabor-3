// ============================================
// Random Tools: Ayah & Hadeeth
// ============================================

// ========== RANDOM HADEETH ==========
let _hadeethData = null;

async function loadHadeeths() {
    if (_hadeethData) return _hadeethData;
    const resp = await fetch('resources/hadeeths.json');
    if (!resp.ok) throw new Error('فشل تحميل بيانات الأحاديث');
    _hadeethData = await resp.json();
    return _hadeethData;
}

window.generateRandomHadeeth = async function () {
    const card = document.getElementById('hadeethCard');
    const loading = document.getElementById('hadeethLoading');
    const error = document.getElementById('hadeethError');
    const btn = document.getElementById('generateHadeethBtn');

    card.classList.add('hidden');
    error.classList.add('hidden');
    loading.classList.remove('hidden');
    if (btn) btn.disabled = true;

    try {
        const data = await loadHadeeths();
        const item = data[Math.floor(Math.random() * data.length)];

        document.getElementById('hadeethGrade').textContent = item.grade || 'حديث شريف';
        document.getElementById('hadeethTakhrij').textContent = item.takhrij || '';
        document.getElementById('hadeethArabic').textContent = item.hadith_text || item.title || '';
        document.getElementById('hadeethSharh').textContent = item.explanation || '';

        const benefitsBox = document.getElementById('hadeethBenefits');
        const benefitsText = document.getElementById('hadeethBenefitsText');
        if (item.benefits && item.benefits.trim() && item.benefits !== '...') {
            benefitsText.textContent = item.benefits;
            benefitsBox.classList.remove('hidden');
        } else {
            benefitsBox.classList.add('hidden');
        }

        const linkEl = document.getElementById('hadeethLink');
        if (item.link) {
            linkEl.href = item.link;
            linkEl.style.display = '';
        } else {
            linkEl.style.display = 'none';
        }

        loading.classList.add('hidden');
        card.classList.remove('hidden');
    } catch (err) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.textContent = 'حدث خطأ أثناء تحميل البيانات: ' + err.message;
    } finally {
        if (btn) btn.disabled = false;
    }
};

// ========== RANDOM AYAH ==========
let _tafseerData = null;

async function loadTafseer() {
    if (_tafseerData) return _tafseerData;
    try {
        const resp = await fetch('resources/tafseer.json');
        if (!resp.ok) throw new Error('فشل تحميل بيانات التفسير');
        _tafseerData = await resp.json();
        return _tafseerData;
    } catch (e) {
        throw new Error('ملف التفسير غير متوفر بعد. يرجى المحاولة لاحقاً.');
    }
}

window.generateRandomAyah = async function () {
    const card = document.getElementById('ayahCard');
    const loading = document.getElementById('ayahLoading');
    const error = document.getElementById('ayahError');
    const btn = document.getElementById('generateAyahBtn');

    card.classList.add('hidden');
    error.classList.add('hidden');
    loading.classList.remove('hidden');
    if (btn) btn.disabled = true;

    try {
        const data = await loadTafseer();
        const item = data[Math.floor(Math.random() * data.length)];

        document.getElementById('ayahSurahInfo').textContent =
            (item.surah ? `سورة ${item.surah}` : '') +
            (item.ayah_number ? ` - الآية ${item.ayah_number}` : '');

        const cleanedAyah = item.ayah || item.text || '';

        document.getElementById('ayahArabic').textContent = cleanedAyah;
        document.getElementById('ayahTafseer').textContent = item.tafseer || item.explanation || '';

        loading.classList.add('hidden');
        card.classList.remove('hidden');
    } catch (err) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.textContent = err.message;
    } finally {
        if (btn) btn.disabled = false;
    }
};
