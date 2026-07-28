/* CARDEX service worker
   Offline shell caching + a safe update flow.

   Your dex (entries + photos) lives in IndexedDB and never passes through
   here — clearing or replacing this cache cannot touch your data. */

const VERSION = 'v5';
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
  // Take over as soon as we're cached. This MUST NOT wait for permission from
  // the running page: older builds of this app have no update-handling code at
  // all, so a "waiting" worker would sit there forever while the old cached
  // app.js kept being served — the update would download and never land.
  // Activating ourselves is what makes every deploy self-healing.
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
    )).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const stale = keys.filter(k => k !== CACHE && k.startsWith('cardex-'));
    await Promise.all(stale.map(k => caches.delete(k)));
    await self.clients.claim();

    // An upgrade leaves open tabs running the code they loaded before we took
    // over. Tell them to reload so the new build runs immediately.
    //
    // This is deliberately fire-and-forget: awaiting a client reload here
    // would deadlock, because the reload can't be served until activation
    // finishes, and activation can't finish until the reload completes.
    if (stale.length) {
      self.clients.matchAll({ type: 'window' }).then(list => {
        for (const c of list) {
          // postMessage covers modern builds; navigate() also rescues pages
          // running code too old to listen for it. Both are fire-and-forget.
          try { c.postMessage({ type: 'RELOAD' }); } catch {}
          try { c.navigate(c.url); } catch {}
        }
      }).catch(() => {});
    }
  })());
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
