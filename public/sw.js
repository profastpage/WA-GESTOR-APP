const CACHE_NAME = 'wa-manager-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación - forzar actualización inmediata
self.addEventListener('install', event => {
  console.log('[SW] Instalando v6 - FORCE UPDATE...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación - limpiar TODO el caché viejo
self.addEventListener('activate', event => {
  console.log('[SW] Activando v6 - LIMPIANDO CACHE...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Borrando cache viejo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First (prioridad a contenido nuevo)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar en caché para uso offline
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si no hay internet, usar caché
        return caches.match(event.request);
      })
  );
});
