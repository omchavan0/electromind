"use strict";
/* Registers the service worker so the app works offline. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW not registered:', err));
  });
}
