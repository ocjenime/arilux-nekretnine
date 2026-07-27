/* ═══════════════════════════════════════════════════════════════
   ARILUX NEKRETNINE - Service Worker v1
   Cache-first for static assets, network-first for HTML
   ═══════════════════════════════════════════════════════════════ */
var CACHE_NAME = 'arilux-v21';
var PRECACHE_URLS = [
  '/',
  '/index.html',
  '/kviz.html',
  '/investicije.html',
  '/assets/css/styles.css',
  '/assets/css/kviz.css',
  '/assets/css/invest.css',
  '/assets/js/main.js',
  '/assets/js/kviz.js',
  '/assets/img/favicon.svg',
  '/assets/catalog/arilux-amor.pdf',
  '/assets/catalog/arilux-park.pdf',
  '/assets/catalog/arilux-centar.pdf',
  '/assets/catalog/arilux-panorama.pdf',
  '/data/site.json',
  '/manifest.json'
];

/* Install - precache critical static assets */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* Activate - clean up old caches */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; })
             .map(function (n) { return caches.delete(n); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Fetch - network-first for HTML, cache-first for assets */
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  /* Skip non-GET requests */
  if (e.request.method !== 'GET') return;

  /* Skip cross-origin requests (Leaflet, Unsplash, Google Fonts, ESRI tiles) */
  if (url.origin !== self.location.origin) return;

  /* HTML pages - network-first */
  if (e.request.headers.get('accept') &&
      e.request.headers.get('accept').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(e.request).then(function (resp) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(e.request, clone); });
        return resp;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }

  /* Static assets - cache-first */
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(e.request, clone); });
        return resp;
      });
    })
  );
});
