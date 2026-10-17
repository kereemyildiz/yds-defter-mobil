// Keeps the app shell available offline. Network first, so a new version shows up on the next open;
// the cached copy is used only without internet. GitHub API calls are never cached here.
const CACHE = 'yds-defter-20261017064930';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (ev) => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== 'GET' || url.origin !== location.origin) return;
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(ev.request);
      if (res.ok) cache.put(ev.request, res.clone());
      return res;
    } catch {
      return (await cache.match(ev.request, { ignoreSearch: true })) ?? Response.error();
    }
  })());
});
