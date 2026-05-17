// Service worker for FP Notes PWA.
// Responsibilities (Wave 2): install/activate lifecycle, empty fetch listener
// (required for Chrome installability — no caching), push + notificationclick.

const DEFAULT_ICON = "/static/icons/icon-192.png"
const DEFAULT_BADGE = "/static/icons/badge-72.png"

self.addEventListener("install", (e) => self.skipWaiting())
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()))
self.addEventListener("fetch", () => {})

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {}
      if (event.data) {
        try {
          payload = event.data.json()
        } catch (_e) {
          try {
            payload = { body: event.data.text() }
          } catch (_e2) {
            payload = {}
          }
        }
      }

      const title = payload.title || "The Forgotten Pillar Notes"
      const body = payload.body || ""
      const url = payload.url || "/"
      const tag = payload.tag || "fp-notes"
      const icon = payload.icon || DEFAULT_ICON
      const badge = payload.badge || DEFAULT_BADGE

      await self.registration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        data: { url },
      })
    })(),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || "/"
  event.waitUntil(
    (async () => {
      const absoluteUrl = new URL(targetUrl, self.location.origin).href
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      for (const client of allClients) {
        if (client.url === absoluteUrl && "focus" in client) {
          return client.focus()
        }
      }
      for (const client of allClients) {
        if ("navigate" in client && "focus" in client) {
          try {
            await client.navigate(absoluteUrl)
            return client.focus()
          } catch (_e) {
            // fall through to openWindow
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absoluteUrl)
      }
    })(),
  )
})
