import { QueryClient } from '@tanstack/react-query'
import { IS_REMOTE } from '../config/api'

// ---------------------------------------------------------------------------
// Query caching (TanStack Query), sama seperti modul praktikum.
//
// networkMode:
// - Mode lokal  -> 'always': data ada di perangkat, jadi query & mutasi tetap
//   dijalankan walau offline (default TanStack akan "pause" saat offline).
// - Mode API    -> 'offlineFirst': tetap mencoba request sekali supaya
//   service worker bisa menjawab dari cache saat offline.
// ---------------------------------------------------------------------------
const networkMode = IS_REMOTE ? 'offlineFirst' : 'always'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: IS_REMOTE ? 60 * 1000 : Infinity,
      gcTime: 10 * 60 * 1000,
      retry: IS_REMOTE ? 1 : false,
      refetchOnWindowFocus: false,
      networkMode,
    },
    mutations: { networkMode },
  },
})

// Query key terpusat supaya invalidasi cache konsisten di semua file.
export const tugasKeys = {
  semua: ['tugas'],
  daftar: ['tugas', 'daftar'],
  detail: (id) => ['tugas', 'detail', String(id)],
}
