// A minimal service worker: the page is installable, and always the network's copy when there is one.
// Never cache-first: the page is code that holds each daemon's key, so a stale copy must not outlive a
// fix. The cache is only the fallback when the phone is offline, so the page still opens and shows
// each daemon's last snapshot.
const CACHE = 'switchyard-phone';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit ?? Promise.reject(new Error('offline')))),
  );
});

// Push (SPEC › Phone view › Push). Each daemon sends the Declarative Web Push shape: iOS 18.4+ shows
// it itself, and the event carries it as `notification` if it fires at all; on Android and older iOS
// it's shown here. A push is always shown, since a silent one isn't allowed. Its `tag` is one per
// session, gate or pull request, so a later push for the same one replaces the earlier notification.
self.addEventListener('push', (e) => {
  if (e.notification) return;
  let p = null;
  try {
    p = e.data ? e.data.json() : null;
  } catch {
    p = null;
  }
  const n = (p && typeof p === 'object' && p.notification) || {};
  const text = (v, fallback) => (typeof v === 'string' && v ? v : fallback);
  const options = {
    body: text(n.body, 'Something needs you'),
    icon: './icon-192.png',
    data: { navigate: text(n.navigate, self.registration.scope) },
  };
  if (typeof n.tag === 'string' && n.tag) Object.assign(options, { tag: n.tag, renotify: true });
  e.waitUntil(self.registration.showNotification(text(n.title, 'Switchyard'), options));
});

// A tap opens what needs you: a page of the phone view in its open window, or a fresh one; a pull
// request at its own link, which opens in the forge's app.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const scope = self.registration.scope;
  const asked = e.notification.data && e.notification.data.navigate;
  const url = typeof asked === 'string' && asked.startsWith('https://') ? asked : scope;
  e.waitUntil(
    (async () => {
      if (url.startsWith(scope)) {
        const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const win = open.find((c) => c.url.startsWith(scope));
        if (win) {
          await win.focus();
          win.postMessage({ type: 'navigate', hash: new URL(url).hash });
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
