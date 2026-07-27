/* CARDEX service worker
   Offline shell caching + a safe update flow.

   Your dex (entries + photos) lives in IndexedDB and never passes through
   here — clearing or replacing this cache cannot touch your data. */

const VERSION = 'v3';
const CACHE = `cardex-${VERSION}`;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/data.js',
  './js/store.js',
  './js/achievements.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  // Precache the new shell, but do NOT take over yet. The open page keeps
  // running the old version until the user taps "Update" (or reopens the app),
  // which avoids a half-old/half-new mismatch mid-session.
  //
  // cache:'reload' is essential: without it these fetches can be served from
  // the browser's own HTTP cache, which would bake the OLD files into the NEW
  // cache bucket and make a fresh deploy look like it never shipped.
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      SHELL.map(url =>
        fetch(new Request(url, { cache: 'reload' }))
          .then(res => (res && res.ok) ? c.put(url, res) : null)
          .catch(() => null)
      )
    )).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks us to activate immediately when the user accepts an update.
self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data.type === 'VERSION') {
    const reply = { type: 'VERSION', version: VERSION };
    if (e.ports && e.ports[0]) e.ports[0].postMessage(reply);
    else if (e.source) e.source.postMessage(reply);
  }
});

function networkFirst(req, timeoutMs = 3000) {
  return new Promise(resolve => {
    let settled = false;
    const done = r => { if (!settled) { settled = true; resolve(r); } };

    const timer = setTimeout(() => {
      caches.match(req, { ignoreSearch: true }).then(hit => hit && done(hit));
    }, timeoutMs);

    fetch(req).then(res => {
      clearTimeout(timer);
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      done(res);
    }).catch(() => {
      clearTimeout(timer);
      caches.match(req, { ignoreSearch: true })
        .then(hit => done(hit || caches.match('./index.html')))
        .then(hit => hit && done(hit));
    });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Always try the network first for the page itself, so a fresh deploy is
  // picked up as soon as you're online — with a fast fall back to cache.
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req));
    return;
  }

  // Everything else: serve instantly from cache, refresh in the background.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const fresh = fetch(req).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null);
      return hit || fresh.then(r => r || caches.match('./index.html'));
    })
  );
});
