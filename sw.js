"use strict";
/* ElectroMind service worker: makes the app work offline.
   When you change any file, bump CACHE (v9 -> v10) and the ?v= numbers in index.html AND here. */
const CACHE = 'electromind-v9';
const CORE = [
  './', 'index.html', 'manifest.json', 'css/style.css?v=6',
  'js/i18n.js?v=6', 'js/engine.js?v=5', 'js/core.js?v=4',
  'js/mod-backup.js?v=4', 'js/mod-wire.js?v=4', 'js/mod-fuse.js?v=4', 'js/mod-ohm.js?v=5', 'js/mod-sp.js?v=7', 'js/mod-res.js?v=3',
  'js/app.js?v=5', 'js/pwa.js?v=2'
];
const OPTIONAL = ['icons/icon.svg', 'icons/icon-maskable.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(CORE).then(() => Promise.all(OPTIONAL.map(u => c.add(u).catch(() => {}))))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Opening the app: try the network first (gets updates), fall back to the saved copy.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Our own files: saved copy first.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // Google Fonts: show the saved copy, refresh it in the background.
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req).then(hit => {
        const net = fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
  }
});
