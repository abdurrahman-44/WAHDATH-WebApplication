// pushNotifications.js
//
// Handles the browser-side half of real Adhan push notifications: register
// the service worker, ask for permission, subscribe via the Push API using
// the server's VAPID public key, and send that subscription + the user's
// prayer/offset preferences to the backend (server/index.js), which is
// what actually sends notifications on a schedule — including when this
// tab isn't open.

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

async function getVapidPublicKey() {
  const res = await fetch('/api/notifications/vapid-public-key')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Push notifications are not configured on this server.')
  }
  const { publicKey } = await res.json()
  return publicKey
}

/**
 * Requests permission, subscribes to push, and registers the preferences
 * with the backend. Throws with a user-readable message on failure.
 */
export async function enableAdhanNotifications(preferences) {
  if (!isPushSupported()) {
    throw new Error("This browser doesn't support push notifications.")
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  const publicKey = await getVapidPublicKey()
  const registration = await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })
  }

  const res = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ subscription, preferences })
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Could not save your notification settings.')
  }

  return subscription
}

export async function disableAdhanNotifications() {
  if (!isPushSupported()) return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return

  await fetch('/api/notifications/unsubscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint })
  }).catch(() => {})

  await subscription.unsubscribe()
}

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready.catch(() => null)
  if (!registration) return null
  return registration.pushManager.getSubscription()
}
