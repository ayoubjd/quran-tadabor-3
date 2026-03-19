const CACHE_NAME = 'quran-reader-v14';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/reader.html',
    '/css/main.css',
    '/css/library.css',
    '/css/reader.css',
    '/css/tabs.css',
    '/js/books.js',
    '/js/library.js',
    '/js/reader.js',
    '/js/bookmarks.js',
    '/js/tabs.js',
    '/js/random-tools.js',
    '/js/db.js',
    '/js/downloader.js',
    '/resources/hadeeths.json',
    '/resources/tafseer.json',
    '/manifest.json'
];

// Install Event - Precache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// Fetch Event - Stale While Revalidate for assets, Network First for Images
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Dynamic Image Caching (Books)
    if (requestUrl.pathname.includes('/books/')) {
        event.respondWith(
            caches.open('quran-images-v1').then((cache) => {
                return cache.match(event.request).then((response) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => {
                        // Offline and not cached
                        return new Response('Offline image not available', { status: 503, statusText: 'Service Unavailable' });
                    });

                    // Return cached response immediately if available, while fetching in background
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // Default Cache Strategy for App Shell: Network First (prevents dev cache nightmares)
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Clone and cache the new response so it's ready for offline use
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If network fails (offline), fall back to cache
                return caches.match(event.request, { ignoreSearch: true });
            })
    );
});
