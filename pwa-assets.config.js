import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Membuat semua ikon PWA (favicon.ico, pwa-*.png, maskable, apple-touch-icon)
// dari satu file SVG. Jalankan: npm run generate-pwa-assets
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: '#2563eb', fit: 'contain' },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: '#2563eb', fit: 'contain' },
    },
  },
  images: ['public/favicon.svg'],
})
