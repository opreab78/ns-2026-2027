const CACHE_NAME = 'ns-calendar-cache-v1';

// Când instalezi app-ul pe telefon
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Curăță cache-urile vechi la activare
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Strategie "Network First" pentru a garanta actualizările în timp real
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Dacă obținem un răspuns din internet, îl salvăm în cache pentru offline
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Dacă utilizatorul nu are internet, returnăm versiunea salvată în cache
                return caches.match(event.request);
            })
    );
});