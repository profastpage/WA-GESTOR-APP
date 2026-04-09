const CACHE_NAME = 'wa-manager-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación
self.addEventListener('install', event => {
  console.log('[SW] Instalando v4...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .then(() => console.log('[SW] Instalación completada'))
  );
});

// Activación
self.addEventListener('activate', event => {
  console.log('[SW] Activando v4...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Eliminando cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
      .then(() => console.log('[SW] Activación completada'))
  );
});

// Fetch - estrategia Cache First, luego Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});
