// ============================================
// Fox Valley Weather — Service Worker
// Cache-first for app shell, network-first for API
// ============================================

const CACHE_NAME = "fvw-v23";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./glossary.js",
  "./manifest.json",
  "./appleton-bg.jpg",
];

// Install: cache app shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: nuke ALL old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  );
  self.clients.claim();
});

// Fetch strategy: network-first for everything, cache as fallback
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
