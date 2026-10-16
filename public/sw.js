const CACHE_NAME = "svarp-lms-cache-v2";
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
      console.log("[Service Worker] Pre-caching core assets");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[Service Worker] Pre-cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - clear old cache versions
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

  // 1. Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Skip non-GET requests, socket connections, chrome extensions, and API endpoints
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/learner/") ||
    url.pathname.startsWith("/admin/") ||
    url.pathname.startsWith("/instructor/") ||
    url.pathname.startsWith("/course-payments/") ||
    url.pathname.startsWith("/public/") ||
    url.pathname.startsWith("/media/") ||
    url.pathname.startsWith("/static/") ||
    url.pathname.startsWith("/webhooks/") ||
    url.pathname.includes("/ws") ||
    url.protocol.startsWith("chrome-extension")
  ) {
    return;
  }

  // 3. Navigation & HTML Document Requests -> Network First (with Cache Fallback for offline)
  // This guarantees that after a new deployment, users always fetch fresh index.html pointing to new asset hashes
  const isHtmlRequest =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") &&
      event.request.headers.get("accept").includes("text/html"));

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              cache.put("/index.html", responseToCache.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cachedHtml =
            (await caches.match(event.request)) || (await caches.match("/index.html"));
          if (cachedHtml) {
            return cachedHtml;
          }
          return new Response("Application is offline. Please check your internet connection.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" }
          });
        })
    );
    return;
  }

  // 4. Static Assets (CSS, JS, Fonts, Images) -> Cache First, fallback to Network
  // CRITICAL: Never return index.html for missing static assets!
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If asset is missing or offline, return standard error response
          return new Response("Resource not found", {
            status: 404,
            statusText: "Not Found",
            headers: { "Content-Type": "text/plain" }
          });
        });
    })
  );
});
