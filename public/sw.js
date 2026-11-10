const SHELL_CACHE = "ynk-shell-v1";
const DATA_CACHE = "ynk-data-v1";
const TILE_CACHE = "ynk-tiles-v1";
const TILE_LIMIT = 180;
const TILE_HOSTS = new Set([
  "mesonet.agron.iastate.edu",
  "tilecache.rainviewer.com",
  "server.arcgisonline.com",
]);
const SHELL = ["/", "/index.html", "/manifest.json", "/icon.svg", "/privacy.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== DATA_CACHE && key !== TILE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function trimCache(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

async function tileCache(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
        await trimCache(cache, TILE_LIMIT);
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (TILE_HOSTS.has(url.hostname)) {
    event.respondWith(tileCache(request));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  const sameOriginApi = url.origin === self.location.origin && url.pathname.startsWith("/api/");
  const weatherData =
    url.hostname === "api.open-meteo.com" ||
    url.hostname === "geocoding-api.open-meteo.com" ||
    (url.hostname === "api.weather.gov" && url.pathname.startsWith("/alerts"));
  if (sameOriginApi || weatherData) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, SHELL_CACHE).catch(() => caches.match("/index.html"))
    );
  }
});
