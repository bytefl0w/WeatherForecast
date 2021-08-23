const OFFLINE_VERSION = 1;
const CACHE_PREFIX = 'offline';
const CACHE_NAME = `${CACHE_PREFIX}${OFFLINE_VERSION}`;
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', event => event.waitUntil(onInstall(event)));
self.addEventListener('activate', event => event.waitUntil(onActivate(event)));
self.addEventListener('fetch', event => event.respondWith(onFetch(event)));

// Opens the indicated cache, if cache does not yet exist, create cache and open it.
// After opened cache, add indicated request/response pair to cache
async function onInstall(event) {
    console.info('Service worker: Install');
    const cache = await caches.open(CACHE_NAME);
    await cache.add(new Request(OFFLINE_URL));
}
// fetches the names of all of the caches. Caches that do not match the name of the indicated cache
// are deleted
async function onActivate(event) {
    console.info('Service worker: Activate');
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.filter(key => key.startsWith(CACHE_PREFIX)
        && key !== CACHE_NAME)
        .map(key => caches.delete(key)));
}

// If fetch fails, cache is opened and previously cached offline page is served
async function onFetch(event) {
    if (event.request.method === 'GET') {
        try {
            return await fetch(event.request);
        } catch (error) {
            const cache = await caches.open(CACHE_NAME);
            return await cache.match(OFFLINE_URL);
        };
    };
}