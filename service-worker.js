const CACHE_NAME = "tournyx-cache-v2";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/404.html",
  "/manifest.json",
  "/style.css",
  "/app.js",
  "/favicon-192x192.png",
  "/favicon-512x512.png"
];

// 1. Install & Cache Essential Offline Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// 2. Clean Up Outdated Caches on Activation
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

// 3. Unified Fetch Handler (Fixes Duplicate Event Conflicts)
self.addEventListener("fetch", (event) => {
  // Page navigations: Attempt network fetch; fallback to cached 404.html if offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached404 = await cache.match("/404.html");
        return cached404 || new Response("<h1>Offline</h1>", { 
          status: 503, 
          headers: { "Content-Type": "text/html" } 
        });
      })
    );
    return;
  }

  // Static assets (CSS, JS, Images): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
