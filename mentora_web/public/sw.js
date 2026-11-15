// Mentora Service Worker · v3.0
// Designed to prevent stale HTML / missing JS chunk caching issues on new deployments.

const CACHE_NAME = 'mentora-v3';

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all open clients immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      // Purge all old and stale caches to prevent chunk mismatch
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // For navigation requests (HTML pages): ALWAYS use Network-First.
  // Never serve stale HTML that references deleted JS chunk hashes!
  if (req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req).catch(() => {
        // Only if network completely fails (e.g. offline) try cache, or let browser handle it
        return caches.match(req);
      })
    );
    return;
  }

  // Non-navigation requests: Network first, with silent fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
