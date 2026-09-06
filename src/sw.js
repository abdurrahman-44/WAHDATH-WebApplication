// sw.js — custom service worker source for vite-plugin-pwa's injectManifest
// strategy. Workbox injects the precache manifest at build time via
// self.__WB_MANIFEST; everything else here is our own code, mainly the
// real push notification handling that generateSW mode can't provide.

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => /\/quran\/.*\.json$/.test(url.pathname),
  new CacheFirst({ cacheName: 'wahdath-quran', plugins: [new ExpirationPlugin({ maxEntries: 5 })] })
)
registerRoute(
  ({ url }) => /\/hadith\/.*\.json$/.test(url.pathname),
  new CacheFirst({ cacheName: 'wahdath-hadith', plugins: [new ExpirationPlugin({ maxEntries: 5 })] })
)
registerRoute(
  ({ url }) => /\/data\/.*\.json$/.test(url.pathname),
  new CacheFirst({ cacheName: 'wahdath-data' })
)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// --- Real Adhan push notifications (section 25) ---
// The backend (server/notificationScheduler.js) sends a JSON payload:
// { title, body, prayerKey }. This is what actually shows the OS-level
// notification, including when the app/tab isn't open — the part a
// foreground-only setTimeout scheduler could never do.

self.addEventListener('push', (event) => {
  let payload = { title: 'WAHDATH', body: "It's prayer time." }
  try {
    if (event.data) payload = event.data.json()
  } catch {
    // Non-JSON push payload — fall back to the default text above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: payload.prayerKey ? `wahdath-${payload.prayerKey}` : 'wahdath',
      data: { url: '/prayer' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    })
  )
})
