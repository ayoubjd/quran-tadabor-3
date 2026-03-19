// IndexedDB Wrapper
const DB_NAME = 'QuranReaderDB';
const DB_VERSION = 1;
const STORE_LAST_READ = 'lastRead';
const STORE_BOOKMARKS = 'bookmarks';

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
        console.error("IndexedDB Error:", event.target.error);
        reject(event.target.error);
    };

    request.onsuccess = (event) => {
        resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store for last read page: { bookId: "quran", page: 1 }
        if (!db.objectStoreNames.contains(STORE_LAST_READ)) {
            db.createObjectStore(STORE_LAST_READ, { keyPath: 'bookId' });
        }

        // Store for bookmarks: { id: "timestamp", bookId: "quran", page: 1, name: "Intro", date: "..." }
        if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
            const bkmkStore = db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' });
            bkmkStore.createIndex('bookId', 'bookId', { unique: false });
        }
    };
});

window.DB = {
    // --- Last Read Operations ---
    async saveLastRead(bookId, page) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_LAST_READ, 'readwrite');
            const store = tx.objectStore(STORE_LAST_READ);
            const request = store.put({ bookId, page });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getLastRead(bookId) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_LAST_READ, 'readonly');
            const store = tx.objectStore(STORE_LAST_READ);
            const request = store.get(bookId);
            request.onsuccess = () => resolve(request.result ? request.result.page : null);
            request.onerror = () => reject(request.error);
        });
    },

    // --- Bookmark Operations ---
    async saveBookmark(bookmark) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
            const store = tx.objectStore(STORE_BOOKMARKS);
            const request = store.put(bookmark);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getBookmarksForBook(bookId) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_BOOKMARKS, 'readonly');
            const store = tx.objectStore(STORE_BOOKMARKS);
            const index = store.index('bookId');
            const request = index.getAll(bookId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteBookmark(id) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
            const store = tx.objectStore(STORE_BOOKMARKS);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
