import { useEffect, useState, useSyncExternalStore } from 'react'

// ---------------------------------------------------------------------------
// Router sederhana berbasis hash (#/...).
//
// Dipilih karena tidak butuh library tambahan dan tidak butuh pengaturan
// rewrite di Vercel: server selalu menyajikan index.html, sisanya diatur di
// browser. Tombol back/forward browser & HP tetap berfungsi.
//
//   #/                  -> beranda
//   #/tugas?filter=...  -> daftar tugas (CRUD)
//   #/tugas/baru        -> form tambah
//   #/tugas/:id         -> detail
//   #/tugas/:id/ubah    -> form ubah
//   #/profil            -> profil
// ---------------------------------------------------------------------------

function parseHash(hash) {
  const raw = hash.replace(/^#/, '') || '/'
  const [path, search = ''] = raw.split('?')
  const query = Object.fromEntries(new URLSearchParams(search))
  const bagian = path.split('/').filter(Boolean).map(decodeURIComponent)

  if (bagian.length === 0) return { nama: 'beranda', query }
  if (bagian[0] === 'tugas') {
    if (bagian.length === 1) return { nama: 'tugas', query }
    if (bagian[1] === 'baru' && bagian.length === 2) return { nama: 'tugas-baru', query }
    if (bagian.length === 2) return { nama: 'tugas-detail', id: bagian[1], query }
    if (bagian[2] === 'ubah' && bagian.length === 3) return { nama: 'tugas-ubah', id: bagian[1], query }
  }
  if (bagian[0] === 'profil' && bagian.length === 1) return { nama: 'profil', query }
  return { nama: 'tidak-ditemukan', query }
}

const subscribe = (cb) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const getHash = () => window.location.hash

/** Rute aktif: { nama, id?, query } */
export function useRute() {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')
  return parseHash(hash)
}

/**
 * Pindah halaman. `ganti: true` = menimpa entri riwayat saat ini (dipakai
 * setelah simpan/hapus supaya tombol back tidak kembali ke form lama).
 */
export function navigasi(path, { ganti = false } = {}) {
  const target = `#${path}`
  if (window.location.hash === target) return
  if (ganti) {
    window.history.replaceState(null, '', target)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = path
  }
}

/** Waktu sekarang yang diperbarui tiap menit, supaya teks "2 jam lagi" tetap akurat. */
export function useSekarang(intervalMs = 60 * 1000) {
  const [sekarang, setSekarang] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setSekarang(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return sekarang
}
