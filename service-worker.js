const CACHE_NAME = "tournyx-cache-v1";

const URLS_TO_CACHE = [
  "/tournyx/",
  "/tournyx/index.html",
  "/tournyx/manifest.json",
  "/tournyx/style.css",
  "/tournyx/app.js",
  "/tournyx/favicon-192x192.png",
  "/tournyx/favicon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match('404.html');
        })
    );
});
