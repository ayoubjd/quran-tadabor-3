// ============================================
// Library App Logic
// Handles both WebP image books and PDF books
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Render Quran tab books
    const quranGrid = document.getElementById('booksGrid-quran');
    const quranBooks = getBooksByCategory('quran');

    for (const book of quranBooks) {
        if (book.type === 'webp') {
            await renderWebpBook(book, quranGrid);
        }
    }

    // Render Mounawaat tab books
    const mounawaatGrid = document.getElementById('booksGrid-mounawaat');
    const mounawaatBooks = getBooksByCategory('mounawaat');

    for (const book of mounawaatBooks) {
        if (book.type === 'webp') {
            await renderWebpBook(book, mounawaatGrid);
        }
    }
});

// ------------------------------------
// Render a WebP (image-based) book card
// ------------------------------------
async function renderWebpBook(book, grid) {
    const lastRead = await window.DB.getLastRead(book.id);
    const isCached = await window.BookDownloader.isBookCached(book.id, book.folder);

    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.cursor = 'default';

    const coverSrc = book.cover || 'assets/placeholder-cover.webp';

    let badgeHtml = '';
    if (lastRead) {
        badgeHtml = `
            <div class="last-read-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                صفحة ${lastRead}
            </div>
        `;
    }

    card.innerHTML = `
        <a href="reader.html?book=${book.id}" class="book-cover-link" onclick="sessionStorage.setItem('selectedBook', '${book.id}')" style="display:block; text-decoration:none; color:inherit;">
            <img src="${coverSrc}" alt="غلاف ${book.title}" class="book-cover" loading="lazy">
        </a>
        <div class="book-info">
            <a href="reader.html?book=${book.id}" onclick="sessionStorage.setItem('selectedBook', '${book.id}')" style="text-decoration:none; color:inherit;">
                <h2 class="book-title">${book.title}</h2>
            </a>
            <p class="book-desc">${book.description}</p>
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-top: 1rem;">
                <button class="btn-download ${isCached ? 'success' : ''}" id="btn-dl-${book.id}">
                    ${isCached
            ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> متاح`
            : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> تحميل`
        }
                </button>
                <span style="flex:1;"></span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${book.totalPages} صفحة</span>
            </div>

            <div class="book-meta" style="margin-top: 0.5rem; padding-top: 0.5rem;">
                ${badgeHtml}
            </div>
            
            <!-- Progress Container (Hidden by default) -->
            <div class="download-progress-container" id="progress-container-${book.id}">
                <div class="download-progress-bar" id="progress-bar-${book.id}"></div>
            </div>
        </div>
    `;

    grid.appendChild(card);

    // Wire download button
    const dlBtn = document.getElementById(`btn-dl-${book.id}`);
    const pContainer = document.getElementById(`progress-container-${book.id}`);
    const pBar = document.getElementById(`progress-bar-${book.id}`);

    dlBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (dlBtn.classList.contains('success') || dlBtn.classList.contains('loading')) return;

        dlBtn.classList.add('loading');
        dlBtn.innerHTML = `جاري التحميل...`;

        pContainer.style.display = 'block';
        pBar.style.width = '0%';

        const success = await window.BookDownloader.downloadBook(book, (percent) => {
            pBar.style.width = `${percent}%`;
        });

        if (success) {
            dlBtn.classList.remove('loading');
            dlBtn.classList.add('success');
            dlBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> متاح`;
            setTimeout(() => { pContainer.style.display = 'none'; }, 1000);
        } else {
            dlBtn.classList.remove('loading');
            dlBtn.innerHTML = `⚠️ فشل`;
            pContainer.style.display = 'none';
            setTimeout(() => {
                dlBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> إعادة`;
            }, 2000);
        }
    });
}

