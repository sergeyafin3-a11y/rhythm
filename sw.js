/* Offline cache: the app opens with no connection.

   Same-origin files are network-first, so updates arrive and the cache is the
   offline fallback. Google Fonts are cached so the app keeps its typography
   offline. Everything else cross-origin — YouTube thumbnails above all — is
   left entirely to the browser: intercepting them bought nothing and risked
   serving back opaque responses that never render. */
const CACHE = 'ritm-v5';
const SHELL = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== location.origin) {
    if (!FONT_HOSTS.includes(url.hostname)) return;          // hands off images and the rest
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit))
    );
    return;
  }

  /* Network-first, but only briefly. Airline and hotel wifi answers a TCP
     connection and then never finishes the request; without a deadline the app
     would sit on a blank screen. Three seconds, then the cache wins. */
  e.respondWith(
    Promise.race([
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 3000))
    ]).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
