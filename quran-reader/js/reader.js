// Reader App Logic
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. App State
    let currentBook = null;
    let currentPage = 1;
    let bookmarkManager = null;
    let observer = null;
    let isJumping = false; // Prevents intersection observer from fighting manual jumps

    // 2. DOM Elements
    const container = document.getElementById('readerContainer');
    const titleEl = document.getElementById('bookTitle');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const btnBack = document.getElementById('btnBack');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');

    // Zoom and Fullscreen
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    let currentZoom = 1;

    // Bookmarks UI
    const modal = document.getElementById('bookmarksModal');
    const btnBookmarks = document.getElementById('btnBookmarks');
    const btnSaveReadMark = document.getElementById('btnSaveReadMark');
    const btnCloseBookmarks = document.getElementById('btnCloseBookmarks');
    const formAddBkmk = document.getElementById('addBookmarkForm');
    const bookmarksList = document.getElementById('bookmarksList');
    const bkmkNameInput = document.getElementById('bookmarkNameInput');

    // Surah Index UI
    const surahModal = document.getElementById('surahIndexModal');
    const btnSurahIndex = document.getElementById('btnSurahIndex');
    const btnCloseSurahIndex = document.getElementById('btnCloseSurahIndex');
    const surahSearchInput = document.getElementById('surahSearchInput');
    const surahList = document.getElementById('surahList');

    // 3. Initialization
    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        let bookId = urlParams.get('book');

        // Fallback for npx serve stripping query parameters
        if (!bookId) {
            bookId = sessionStorage.getItem('selectedBook');
        }

        if (!bookId || !getBookById(bookId)) {
            alert('الكتاب غير موجود');
            window.location.href = '/';
            return;
        }

        currentBook = getBookById(bookId);
        bookmarkManager = new BookmarkManager(bookId);
        await bookmarkManager.init();

        // UI Setup
        titleEl.textContent = currentBook.title;
        totalPagesEl.textContent = currentBook.totalPages;

        // Show Surah Index button ONLY if reading the Quran or Surah Summaries
        if (btnSurahIndex) {
            if (currentBook.id === 'quran' || currentBook.id === 'surah-summary') {
                btnSurahIndex.style.display = 'inline-flex';
            } else {
                btnSurahIndex.style.display = 'none';
            }
        }

        // Handle RTL vs LTR layout direction
        document.documentElement.dir = currentBook.direction || 'rtl';

        // Determine starting page
        const lastRead = bookmarkManager.getLastRead();
        const targetPage = lastRead ? parseInt(lastRead) : 1;
        currentPage = targetPage;
        currentPageEl.textContent = targetPage; // Set UI text immediately in case updateCurrentPage early returns

        buildPages();
        bindEvents();
        setupObserver(); // We can set this up immediately now because isJumping protects it

        // Jump immediately, but safely bounded by a tiny delay so the browser finishes layout
        setTimeout(() => jumpToPage(targetPage, false), 50);
    }

    // 4. Build DOM pages
    function buildPages() {
        container.innerHTML = ''; // Clear

        // We create empty divs for all pages to allow native scrolling.
        // Images are lazy-loaded via IntersectionObserver.
        for (let i = 1; i <= currentBook.totalPages; i++) {
            const slide = document.createElement('div');
            slide.className = 'page-slide';
            slide.id = `page-${i}`;
            slide.dataset.page = i;

            // Add skeleton loader initially
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton';
            slide.appendChild(skeleton);

            container.appendChild(slide);
        }
    }

    // 5. Scroll Observation (Lazy loading & Page update)
    function setupObserver() {
        const options = {
            root: container,
            rootMargin: '100% 0px 100% 0px', // Load 1 page ahead/behind
            threshold: [0.1, 0.5] // Trigger when 50% is visible
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const pageNum = parseInt(entry.target.dataset.page);

                // If this page is mostly visible, it's the current page
                if (!isJumping && entry.isIntersecting && entry.intersectionRatio > 0.4) {
                    updateCurrentPage(pageNum);
                }

                // Lazy load image if not loaded yet and it's near viewport
                if (entry.isIntersecting && !entry.target.dataset.loaded) {
                    loadImage(entry.target, pageNum);
                }
            });
        }, options);

        // Observe all pages
        Array.from(container.children).forEach(slide => observer.observe(slide));
    }

    function loadImage(slideEl, pageNum) {
        slideEl.dataset.loaded = 'true';

        const img = new Image();
        // Path constructed from book config
        img.src = `${currentBook.folder}/(${pageNum}).webp`;
        img.className = 'page-image loading';
        img.alt = `صفحة ${pageNum}`;

        img.onload = () => {
            img.classList.remove('loading');

            img.style.width = `${100 * currentZoom}%`;
            img.style.height = `${100 * currentZoom}%`;
            if (currentZoom > 1) {
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                slideEl.classList.add('zoomed');
            }

            // Remove skeleton
            const skel = slideEl.querySelector('.skeleton');
            if (skel) skel.remove();
        };

        img.onerror = () => {
            img.alt = 'تعذر تحميل الصفحة';
            img.classList.remove('loading');
        };

        slideEl.appendChild(img);
    }

    function updateCurrentPage(num) {
        if (currentPage === num) return;

        currentPage = num;
        currentPageEl.textContent = num;

        // Auto save Read Bookmark is now REMOVED
        // User must click the manual save button
    }

    // 6. Navigation
    function jumpToPage(num, smooth = true) {
        if (num < 1 || num > currentBook.totalPages) return;

        isJumping = true; // Lock observer
        document.body.classList.add('is-jumping'); // Lock css snap
        updateCurrentPage(num);

        const targetSlide = document.getElementById(`page-${num}`);
        if (targetSlide) {
            // Using scrollLeft on the container directly is more reliable than scrollIntoView
            // especially when dealing with snap-scroll and flexbox.
            const containerWidth = container.clientWidth;

            // if smooth is false, we need to temporarily disable CSS scroll behavior
            if (!smooth) {
                container.style.scrollBehavior = 'auto';
            }

            if (currentBook.direction === 'rtl') {
                container.scrollLeft = -1 * (num - 1) * containerWidth;
            } else {
                container.scrollLeft = (num - 1) * containerWidth;
            }

            // Restore scrollBehavior
            if (!smooth) {
                // Force layout reflow before restoring
                void container.offsetWidth;
                container.style.scrollBehavior = 'smooth';
            }

            // Unlock observer after scroll finishes
            setTimeout(() => {
                isJumping = false;
                document.body.classList.remove('is-jumping');
                updateCurrentPage(num);
            }, smooth ? 600 : 50);
        } else {
            isJumping = false;
            document.body.classList.remove('is-jumping');
        }
    }

    function goNext() {
        jumpToPage(currentPage + 1);
    }

    function goPrev() {
        jumpToPage(currentPage - 1);
    }

    // 7. Event Binding
    function bindEvents() {
        // Handle Resize / Orientation Change to keep current page cleanly in view
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // If zoomed in via UI, do not violently snap the container back
                if (currentZoom === 1) {
                    jumpToPage(currentPage, false);
                }
            }, 100);
        });

        // Swipe logic
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartTime = 0;

        container.addEventListener('touchstart', (e) => {
            // Don't intercept swipe if zoomed in (via UI or native pinch-zoom)
            if (currentZoom > 1 || (window.visualViewport && window.visualViewport.scale > 1.01)) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            touchStartTime = Date.now();
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (currentZoom > 1 || (window.visualViewport && window.visualViewport.scale > 1.01)) return;
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            // Only consider it a swipe if it happened quickly (less than 400ms)
            if (Date.now() - touchStartTime < 400) {
                handleSwipe();
            }
        }, { passive: true });

        function handleSwipe() {
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Ensure swipe is horizontal and substantial enough
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                if (currentBook.direction === 'rtl') {
                    if (diffX > 0) goNext(); // Swipe Right
                    else goPrev();           // Swipe Left
                } else {
                    if (diffX < 0) goNext(); // Swipe Left
                    else goPrev();           // Swipe Right
                }
            }
        }

        // Toolbar
        btnBack.addEventListener('click', () => window.location.href = '/');

        // Navigation buttons (RTL: next page means going LEFT physically)
        if (currentBook.direction === 'rtl') {
            btnNext.addEventListener('click', goNext); // Left arrow
            btnPrev.addEventListener('click', goPrev); // Right arrow
        } else {
            btnNext.addEventListener('click', goNext); // Right arrow
            btnPrev.addEventListener('click', goPrev); // Left arrow
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('hidden') === false) return; // ignore if modal open

            if (currentBook.direction === 'rtl') {
                if (e.key === 'ArrowLeft') goNext();
                if (e.key === 'ArrowRight') goPrev();
            } else {
                if (e.key === 'ArrowRight') goNext();
                if (e.key === 'ArrowLeft') goPrev();
            }
        });

        // Bookmarks UI
        btnBookmarks.addEventListener('click', openBookmarksPanel);
        btnCloseBookmarks.addEventListener('click', closeBookmarksPanel);

        btnSaveReadMark.addEventListener('click', async () => {
            await bookmarkManager.saveLastRead(currentPage);
            renderBookmarksList();

            // Visual feedback
            const originalColor = btnSaveReadMark.style.color;
            btnSaveReadMark.style.color = 'var(--brand-accent)';
            setTimeout(() => {
                btnSaveReadMark.style.color = originalColor;
            }, 500);

            // Optional: tiny toast notification or just rely on color flash
            alert(`تم حفظ موضع القراءة: صفحة ${currentPage}`);
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeBookmarksPanel();
        });

        // Add Bookmark
        formAddBkmk.addEventListener('submit', async (e) => {
            e.preventDefault();
            let name = bkmkNameInput.value.trim();
            if (!name) {
                // If user didn't type a name, default to the page number
                name = `صفحة ${currentPage}`;
            }
            await bookmarkManager.addBookmark(currentPage, name);
            bkmkNameInput.value = '';
            renderBookmarksList();
        });

        // Zoom & Fullscreen
        const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');

        function applyZoom() {
            const slides = document.querySelectorAll('.page-slide');
            slides.forEach(slide => {
                const img = slide.querySelector('.page-image');
                if (img) {
                    img.style.width = `${100 * currentZoom}%`;
                    img.style.height = `${100 * currentZoom}%`;
                    if (currentZoom > 1) {
                        img.style.maxWidth = 'none';
                        img.style.maxHeight = 'none';
                        slide.classList.add('zoomed');
                    } else {
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '100%';
                        slide.classList.remove('zoomed');
                    }
                }
            });
            // Keep zoom level display in sync
            if (zoomLevelDisplay) zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
        }

        function zoomIn() {
            if (currentZoom < 3) { currentZoom += 0.5; applyZoom(); }
        }
        function zoomOut() {
            if (currentZoom > 1) { currentZoom -= 0.5; applyZoom(); }
        }

        // Toolbar zoom (desktop)
        if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
        if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);

        // Drawer zoom (mobile)
        const btnZoomInMobile = document.getElementById('btnZoomInMobile');
        const btnZoomOutMobile = document.getElementById('btnZoomOutMobile');
        if (btnZoomInMobile) btnZoomInMobile.addEventListener('click', zoomIn);
        if (btnZoomOutMobile) btnZoomOutMobile.addEventListener('click', zoomOut);

        // Fullscreen
        if (btnFullscreen) {
            const iconEnter = `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
            const iconExit = `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;

            function isFullscreen() {
                return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
            }

            function updateFullscreenIcon() {
                btnFullscreen.innerHTML = isFullscreen() ? iconExit : iconEnter;
            }

            btnFullscreen.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering the container click
                if (!isFullscreen()) {
                    const el = document.documentElement;
                    if (el.requestFullscreen) {
                        el.requestFullscreen().catch(err => {
                            console.error('Fullscreen error:', err);
                            alert('متصفحك لا يدعم وضع ملء الشاشة أو رفض الطلب');
                        });
                    } else if (el.webkitRequestFullscreen) {
                        el.webkitRequestFullscreen();
                    } else if (el.mozRequestFullScreen) {
                        el.mozRequestFullScreen();
                    } else {
                        alert('متصفحك لا يدعم وضع ملء الشاشة');
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                }
            });

            document.addEventListener('fullscreenchange', updateFullscreenIcon);
            document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
            document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
        }

        // Tap to toggle immersive reading mode (hide UI)
        container.addEventListener('click', (e) => {
            // Don't toggle if they are clicking a button or specific control
            if (!e.target.closest('button')) {
                document.body.classList.toggle('ui-hidden');
            }
        });
    }

    // 8. Bookmarks UI Logic
    function openBookmarksPanel() {
        modal.classList.remove('hidden');
        renderBookmarksList();
        bkmkNameInput.focus();
    }

    function closeBookmarksPanel() {
        modal.classList.add('hidden');
    }

    function renderBookmarksList() {
        bookmarksList.innerHTML = '';
        const list = bookmarkManager.bookmarks;

        // Reading mark
        const lastRead = bookmarkManager.getLastRead();

        const rmDiv = document.createElement('div');
        rmDiv.className = 'bookmark-item';
        rmDiv.style.borderRight = '4px solid var(--brand-accent)';
        rmDiv.style.borderLeft = '4px solid var(--brand-accent)';

        // Build Reading Mark block
        const rmContent = document.createElement('div');
        rmContent.style.display = 'flex';
        rmContent.style.flexDirection = 'column';
        rmContent.style.width = '100%';
        rmContent.style.gap = '0.5rem';

        const rmInfo = document.createElement('div');
        rmInfo.className = 'bookmark-info';
        rmInfo.style.width = '100%';
        rmInfo.innerHTML = `
            <h3 style="color: var(--brand-accent); display: flex; align-items: center; gap: 0.5rem;">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> 
                موضع القراءة التلقائي
            </h3>
            <p style="margin-top: 5px; font-weight: bold;">
                ${lastRead ? `مسجل عند صفحة ${lastRead}` : "غير مسجل بعد"}
            </p>
        `;
        rmInfo.addEventListener('click', () => {
            closeBookmarksPanel();
            jumpToPage(lastRead ? parseInt(lastRead) : 1, false);
        });

        const rmBtn = document.createElement('button');
        rmBtn.style.background = 'var(--brand-accent)';
        rmBtn.style.color = 'var(--brand-main)';
        rmBtn.style.border = 'none';
        rmBtn.style.padding = '0.4rem';
        rmBtn.style.borderRadius = 'var(--radius-md)';
        rmBtn.style.fontFamily = 'var(--font-ui)';
        rmBtn.style.cursor = 'pointer';
        rmBtn.style.fontWeight = 'bold';
        rmBtn.style.fontSize = '0.8rem';
        rmBtn.textContent = `تحديث للمكان الحالي (صفحة ${currentPage})`;

        rmBtn.addEventListener('click', async () => {
            await bookmarkManager.saveLastRead(currentPage);
            renderBookmarksList();
            alert(`تم حفظ موضع القراءة: صفحة ${currentPage}`);
        });

        rmContent.appendChild(rmInfo);
        rmContent.appendChild(rmBtn);
        rmDiv.appendChild(rmContent);
        bookmarksList.appendChild(rmDiv);

        const hr = document.createElement('hr');
        hr.style.border = '0';
        hr.style.borderTop = '1px dashed var(--brand-border)';
        hr.style.margin = '1rem 0';
        hr.style.opacity = '0.5';
        bookmarksList.appendChild(hr);

        if (list.length === 0) {
            bookmarksList.innerHTML += '<p style="text-align:center; color:gray; padding: 1rem;">لا توجد علامات مرجعية إضافية محفوظة.</p>';
            return;
        }

        list.forEach(bkmk => {
            const div = document.createElement('div');
            div.className = 'bookmark-item';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'bookmark-info';
            infoDiv.innerHTML = `
                <h3>${bkmk.name}</h3>
                <p>صفحة ${bkmk.page} • ${bkmk.date}</p>
            `;
            infoDiv.addEventListener('click', () => {
                closeBookmarksPanel();
                jumpToPage(bkmk.page, false);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'btn-delete-bk';
            delBtn.setAttribute('aria-label', 'حذف');
            delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            delBtn.addEventListener('click', async () => {
                if (confirm('هل أنت متأكد من حذف هذه العلامة المرجعية؟')) {
                    await bookmarkManager.removeBookmark(bkmk.id);
                    renderBookmarksList();
                }
            });

            div.appendChild(infoDiv);
            div.appendChild(delBtn);
            bookmarksList.appendChild(div);
        });
    }

    // 9. Surahs Index Logic
    if (btnSurahIndex && surahModal && btnCloseSurahIndex) {
        function openSurahIndex() {
            surahModal.classList.remove('hidden');
            surahSearchInput.value = ''; // clear previous search
            renderSurahList('');
            surahSearchInput.focus();
        }

        function closeSurahIndex() {
            surahModal.classList.add('hidden');
        }

        function renderSurahList(query) {
            surahList.innerHTML = '';

            // Filter by number (exact or starts-with) or by text (includes)
            const filtered = QURAN_SURAHS.filter(surah => {
                if (!query) return true;
                const q = query.trim().toLowerCase();
                return surah.name.includes(q) || String(surah.number).startsWith(q);
            });

            if (filtered.length === 0) {
                surahList.innerHTML = '<li style="text-align:center; padding: 2rem; color:var(--text-secondary);">لا توجد نتائج مطابقة</li>';
                return;
            }

            filtered.forEach(surah => {
                const li = document.createElement('li');
                li.className = 'surah-item';
                li.innerHTML = `
                    <div class="surah-item-info">
                        <span class="surah-number">${surah.number}</span>
                        <span class="surah-name">سورة ${surah.name}</span>
                    </div>
                    <span class="surah-page">ص ${surah.startPage}</span>
                `;
                li.addEventListener('click', () => {
                    closeSurahIndex();
                    
                    // If reading surah summaries, the page matches the surah number (1-114) instead of the actual Quran startPage
                    const targetPage = currentBook.id === 'surah-summary' ? surah.number : surah.startPage;
                    jumpToPage(targetPage, false);
                });
                surahList.appendChild(li);
            });
        }

        btnSurahIndex.addEventListener('click', openSurahIndex);
        btnCloseSurahIndex.addEventListener('click', closeSurahIndex);

        // Search filter matching
        if (surahSearchInput) {
            surahSearchInput.addEventListener('input', (e) => {
                renderSurahList(e.target.value);
            });
        }

        // Bottom close button
        const btnBottomCloseSurahs = document.getElementById('btnBottomCloseSurahs');
        if (btnBottomCloseSurahs) {
            btnBottomCloseSurahs.addEventListener('click', closeSurahIndex);
        }
    }

    // Bookmarks bottom close button
    const btnBottomCloseBookmarks = document.getElementById('btnBottomCloseBookmarks');
    if (btnBottomCloseBookmarks) {
        btnBottomCloseBookmarks.addEventListener('click', closeBookmarksPanel);
    }

    // Modal Background Clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });

    // Boot
    init();
});
