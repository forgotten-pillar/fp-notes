// Wave 1 placeholder service worker.
// Wave 2 will replace this file with the real push-capable SW.
// The empty fetch listener is required so Chrome treats the site as installable.

self.addEventListener("install", (e) => self.skipWaiting())
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()))
self.addEventListener("fetch", () => {})
