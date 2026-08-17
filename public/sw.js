const CACHE_NAME = "svarp-lms-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/company/svarp-logo-192.webp",
  "/company/svarp-logo-512.webp"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell and core assets");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[Service Worker] Cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Skip cross-origin requests (e.g. backend services running on different ports or domains)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Skip non-GET requests, socket connections, chrome extensions, and API endpoints
  if (
    event.request.method !== "GET" || 
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/learner/") ||
    url.pathname.startsWith("/admin/") ||
    url.pathname.startsWith("/course-payments/") ||
    url.pathname.startsWith("/public/") ||
    url.pathname.includes("/ws") ||
    url.protocol.startsWith("chrome-extension")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, and update in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background update failures (e.g. offline)
          });
        return cachedResponse;
      }

      // Network fallback
      return fetch(event.request)
        .then((networkResponse) => {
          // Check if response is valid to cache
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(async () => {
          // If offline and requesting document, return the main index.html (SPA routing)
          if (event.request.headers.get("accept")?.includes("text/html")) {
            const indexResponse = await caches.match("/index.html");
            if (indexResponse) {
              return indexResponse;
            }
          }
          // MUST return a valid Response object (never undefined)
          return new Response("Service Unavailable", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" }
          });
        });
    })
  );
});
