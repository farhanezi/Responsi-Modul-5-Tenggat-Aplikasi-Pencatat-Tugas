import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Service worker baru langsung aktif begitu ada versi baru di server.
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        id: '/',
        name: 'Tenggat — Pencatat Tugas Kuliah',
        short_name: 'Tenggat',
        description: 'Catat tugas kuliah, pantau tenggatnya, dan tandai yang sudah selesai. Tetap bisa dipakai tanpa internet.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#2563eb',
        categories: ['education', 'productivity'],
        icons: [
          { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Tambah tugas',
            short_name: 'Tambah',
            url: '/#/tugas/baru',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        // Semua file hasil build (JS, CSS, HTML, ikon, font) disimpan saat
        // service worker dipasang, jadi aplikasi tetap terbuka tanpa internet.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // Bila nanti memakai API (Supabase), respons GET terakhir disimpan
        // sehingga daftar tugas masih tampil saat offline.
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/rest/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tenggat-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
