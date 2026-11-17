import axios from 'axios'

// ---------------------------------------------------------------------------
// Konfigurasi API (sama polanya dengan modul praktikum)
//
// Selama VITE_API_BASE_URL kosong, aplikasi berjalan di MODE LOKAL: data
// awal dari src/data/tugas.js lalu disimpan di localStorage.
// Bila diisi URL project Supabase + key, service otomatis memakai API.
// ---------------------------------------------------------------------------
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

/** true = data diambil dari API, false = data lokal (kode + localStorage). */
const IS_REMOTE = Boolean(BASE_URL)

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Header wajib Supabase (apikey + Bearer) dipasang di setiap request.
apiClient.interceptors.request.use((config) => {
  if (SUPABASE_KEY) {
    config.headers.apikey = SUPABASE_KEY
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${SUPABASE_KEY}`
    }
  }
  return config
})

// Respons dibuka langsung ke `data`; error diseragamkan jadi { message, status }.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan yang tidak terduga. Coba lagi sebentar.'
    if (error.response) {
      const data = error.response.data || {}
      message = data.message || data.msg || data.error || `Server menolak permintaan (${error.response.status}).`
    } else if (error.request) {
      message = 'Server tidak bisa dihubungi. Periksa koneksi internet kamu lalu coba lagi.'
    }
    return Promise.reject({ message, status: error.response?.status ?? null })
  },
)

export { apiClient, BASE_URL, IS_REMOTE }
