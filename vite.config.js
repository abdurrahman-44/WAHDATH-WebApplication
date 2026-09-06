import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// WAHDATH — A Digital Muslim Companion for Muslims in Sri Lanka
export default defineConfig({
  server: {
    // Forwards /api/* to the Express backend in ./server during local dev
    // (`npm run dev:server`), so the frontend can just call fetch('/api/ask')
    // with no CORS/base-URL juggling. In production, deploy the backend
    // separately and point this at it (or serve both behind one reverse
    // proxy) — see README.
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      // injectManifest (not generateSW) because real push notification
      // handling (section 25) needs a custom 'push'/'notificationclick'
      // listener — see src/sw.js, which Workbox precaching is injected into.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        // Same reasoning as before: don't force the ~2.4MB Qur'an dataset
        // (or the Hadith sample) into the install-time precache.
        globPatterns: ['**/*.{js,css,html,svg,png}']
      },
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg'],
      manifest: {
        name: 'WAHDATH — Your Muslim Companion',
        short_name: 'WAHDATH',
        description: 'A Digital Muslim Companion for Muslims in Sri Lanka',
        theme_color: '#0F3D2E',
        background_color: '#F6F8F5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
