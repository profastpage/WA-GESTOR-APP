const CACHE_NAME = 'wa-manager-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación - borrar caches viejos inmediatamente
self.addEventListener('install', event => {
  console.log('[SW] Instalando v8 - FORCE CLEAR CACHE...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Borrando cache viejo:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Cache First para assets estáticos, Network para todo lo demás
self.addEventListener('fetch', event => {
  // No cachear POST requests
  if (event.request.method === 'POST') return;
  
  // No cachear Firebase ni APIs
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('firestore') ||
      event.request.url.includes('googleapis')) {
    return;
  }

  // Solo cachear navegación y assets estáticos
  const shouldCache = event.request.destination === 'document' ||
                      event.request.destination === 'script' ||
                      event.request.destination === 'style' ||
                      event.request.destination === 'image';

  if (!shouldCache) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        });
      }).catch(() => fetch(event.request))
  );
});
