// storage.js
// Guest-mode local persistence (section 26: guest mode always available,
// no login required for basic functionality). Keys are namespaced so a
// future auth/database sync layer can adopt the same shape.

const NAMESPACE = 'wahdath:'

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(NAMESPACE + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private browsing, quota) — fail silently,
    // the app must keep working without persistence per section 39.
  }
}
