// Bookmarks Management Logic
class BookmarkManager {
    constructor(bookId) {
        this.bookId = bookId;
        this.bookmarks = [];
        this.lastRead = null;
    }

    async init() {
        this.lastRead = await window.DB.getLastRead(this.bookId);
        this.bookmarks = await window.DB.getBookmarksForBook(this.bookId);
        // Sort by page number
        this.bookmarks.sort((a, b) => a.page - b.page);
    }

    async addBookmark(page, name) {
        const newBookmark = {
            id: Date.now().toString(),
            bookId: this.bookId,
            page: parseInt(page),
            name: name,
            date: new Date().toLocaleDateString('ar-MA')
        };
        this.bookmarks.push(newBookmark);
        this.bookmarks.sort((a, b) => a.page - b.page);

        await window.DB.saveBookmark(newBookmark);
        return newBookmark;
    }

    async removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        await window.DB.deleteBookmark(id);
    }

    async saveLastRead(page) {
        this.lastRead = page;
        await window.DB.saveLastRead(this.bookId, page);
    }

    getLastRead() {
        return this.lastRead;
    }
}
