/**
 * service-worker.js
 * Custom service worker for the Offline Notes App.
 *
 * Responsibilities:
 *  1. install  - pre-cache the static files of the app (HTML, JS, CSS, icons).
 *  2. activate - delete caches left over from older versions of the app.
 *  3. fetch    - serve static files from the cache so the app opens offline.
 *
 * Note: the notes themselves are NOT stored here - they live in IndexedDB.
 * The service worker only caches the "app shell" (the files needed to load the UI).
 */

// Bump the version number whenever the caching logic changes.
const CACHE_VERSION = 'v1'
const STATIC_CACHE = `offline-notes-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `offline-notes-runtime-${CACHE_VERSION}`

// List of built static files, injected by vite-plugin-pwa at build time.
// Each entry looks like { url: 'assets/index-abc123.js', revision: null }.
// A Set removes duplicates, because cache.addAll() fails on duplicate URLs.
const PRECACHE_URLS = [
  ...new Set(self.__WB_MANIFEST.map((entry) => new URL(entry.url, self.location).href)),
]

// Page to show when the user navigates while offline.
const OFFLINE_FALLBACK = new URL('index.html', self.location).href

// The server sends "Vary: Origin", but the browser requests module scripts with an
// Origin header that the pre-cached copies do not have. Ignore Vary so they still match.
const MATCH_OPTIONS = { ignoreVary: true }

/* ---------- 1. INSTALL: cache the static files ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()), // activate the new worker immediately
  )
})

/* ---------- 2. ACTIVATE: remove old caches ---------- */
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE]
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()), // take control of open pages straight away
  )
})

/* ---------- 3. FETCH: serve files from the cache ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests made to our own origin.
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return
  }

  // Pre-cached static files -> "cache first" (fast, and works offline).
  if (PRECACHE_URLS.includes(request.url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Everything else -> "network first", falling back to the cache when offline.
  event.respondWith(networkFirst(request))
})

/**
 * Cache-first strategy: return the cached copy, or fetch it if it is missing.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
  const cached = await caches.match(request, MATCH_OPTIONS)
  return cached || fetch(request)
}

/**
 * Network-first strategy: try the network and keep a copy in the runtime cache.
 * If the network fails (offline), return the cached copy instead.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request, MATCH_OPTIONS)
    if (cached) return cached

    // Offline page navigation that is not cached -> show the app shell.
    if (request.mode === 'navigate') {
      const fallback = await caches.match(OFFLINE_FALLBACK, MATCH_OPTIONS)
      if (fallback) return fallback
    }
    throw error
  }
}
