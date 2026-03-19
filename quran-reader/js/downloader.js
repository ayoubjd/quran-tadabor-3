// Background Downloader Logic
window.BookDownloader = {
    cacheName: 'quran-images-v1',

    // Check if the book's download was fully completed
    async isBookCached(bookId, folder) {
        if (!('caches' in window)) return false;
        try {
            const cache = await caches.open(this.cacheName);
            // Check for the "complete" token file
            const response = await cache.match(`${window.location.origin}/${folder}/${bookId}_complete.json`);
            return !!response;
        } catch (e) {
            console.error('Error checking cache status', e);
            return false;
        }
    },

    // Download all pages for a book
    async downloadBook(book, progressCallback) {
        if (!('caches' in window)) {
            alert('متصفحك لا يدعم التحميل للاستخدام بدون إنترنت (Caches API غير متوفرة).');
            return false;
        }

        try {
            const cache = await caches.open(this.cacheName);
            const total = book.totalPages;
            let downloaded = 0;

            const batchSize = 10; // Download in batches to avoid overwhelming the browser/network
            for (let i = 1; i <= total; i += batchSize) {
                const batchPromises = [];
                for (let j = 0; j < batchSize && (i + j) <= total; j++) {
                    const pageNum = i + j;
                    const url = `${window.location.origin}/${book.folder}/(${pageNum}).webp`;

                    batchPromises.push(
                        fetch(url).then(response => {
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            return cache.put(url, response);
                        }).then(() => {
                            downloaded++;
                            const percent = Math.floor((downloaded / total) * 100);
                            progressCallback(percent, downloaded, total);
                        }).catch(e => {
                            console.error(`Failed to cache ${url}`, e);
                            // We don't hard fail the whole batch, but we log it
                        })
                    );
                }
                // Wait for current batch to finish before starting the next
                await Promise.all(batchPromises);
            }

            // If we successfully reached here, write a completion token
            const tokenUrl = `${window.location.origin}/${book.folder}/${book.id}_complete.json`;
            await cache.put(tokenUrl, new Response(JSON.stringify({
                completed: true,
                timestamp: Date.now()
            }), {
                headers: { 'Content-Type': 'application/json' }
            }));

            return true;
        } catch (error) {
            console.error('Error downloading book', error);
            alert('حدث خطأ أثناء تحميل الكتاب.');
            return false;
        }
    }
};
