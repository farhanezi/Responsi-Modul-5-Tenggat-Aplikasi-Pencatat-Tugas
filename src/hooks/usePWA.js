import { useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'

// ---------------------------------------------------------------------------
// Status PWA bersama: install prompt, terpasang/tidak, online/offline, dan
// apakah service worker sudah menyimpan aplikasi untuk dipakai offline.
//
// Event `beforeinstallprompt` bisa muncul sebelum komponen React dipasang,
// jadi listener didaftarkan sekali di main.jsx lewat mulaiPWA().
// ---------------------------------------------------------------------------

const modeStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

let state = {
  online: navigator.onLine,
  installPrompt: null,
  terpasang: modeStandalone(),
  siapOffline: false,
  baruSiapOffline: false,
  adaSW: 'serviceWorker' in navigator,
}

const listeners = new Set()
const setState = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

let sudahMulai = false

export function mulaiPWA() {
  if (sudahMulai) return
  sudahMulai = true

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // tampilkan tombol install sendiri, bukan mini-infobar browser
    setState({ installPrompt: e })
  })
  window.addEventListener('appinstalled', () => setState({ installPrompt: null, terpasang: true }))
  window.addEventListener('online', () => setState({ online: true }))
  window.addEventListener('offline', () => setState({ online: false }))

  // Daftarkan service worker (dibuat otomatis oleh vite-plugin-pwa).
  // onOfflineReady hanya terpanggil sekali: saat pertama kali semua file
  // selesai disimpan. Dipakai untuk menampilkan notifikasi "siap offline".
  registerSW({
    immediate: true,
    onOfflineReady() {
      setState({ siapOffline: true, baruSiapOffline: true })
    },
  })
  // Kunjungan berikutnya: SW sudah aktif sejak awal = aplikasi sudah tersimpan.
  navigator.serviceWorker?.ready.then(() => setState({ siapOffline: true }))
}

export function usePWA() {
  return useSyncExternalStore(subscribe, () => state)
}

/** Tampilkan dialog install bawaan browser. Mengembalikan 'accepted' | 'dismissed' | 'tidak-tersedia'. */
export async function pasangAplikasi() {
  const prompt = state.installPrompt
  if (!prompt) return 'tidak-tersedia'
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  setState({ installPrompt: null, terpasang: outcome === 'accepted' || state.terpasang })
  return outcome
}
