/* Penguin Suite service worker · v1
   Deliberately conservative. It caches the app shell so the icon opens
   instantly and the UI paints without signal; it never caches Supabase
   responses, so every figure on screen is live. Offline DRAFT mode —
   saving edits with no signal and syncing later — is a separate piece
   of work and is NOT what this does. */
const VERSION = 'pgs-shell-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // never touch API or auth traffic
  if (u.hostname.endsWith('supabase.co') || u.pathname.startsWith('/auth') || e.request.method !== 'GET') return;
  // app shell: network first, cache fallback — so a new deploy wins
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
  }
});
