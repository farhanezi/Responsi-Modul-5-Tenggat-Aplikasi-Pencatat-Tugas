// ---------------------------------------------------------------------------
// Utilitas tanggal & status tugas. Semua tanggal disimpan sebagai string
// ISO 8601 (UTC) dan ditampilkan dalam zona waktu perangkat (id-ID).
// ---------------------------------------------------------------------------

const MS_JAM = 60 * 60 * 1000
const MS_HARI = 24 * MS_JAM

const fmtJam = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })
const fmtTanggalPendek = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const fmtTanggalPanjang = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const fmtHariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

const awalHari = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Selisih hari kalender (bukan 24 jam) antara `tanggal` dan `sekarang`. */
export function selisihHari(tanggal, sekarang = new Date()) {
  const a = awalHari(new Date(tanggal))
  const b = awalHari(sekarang)
  return Math.round((a - b) / MS_HARI)
}

/** Tanggal ISO untuk "N hari dari sekarang pada jam HH:MM" (dipakai data awal). */
export function tanggalDariHariLagi(hariLagi, jam = '23:59') {
  const [h, m] = jam.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() + hariLagi)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

/** 'selesai' | 'terlambat' | 'aktif' */
export function statusTugas(tugas, sekarang = new Date()) {
  if (tugas.selesai) return 'selesai'
  return new Date(tugas.tenggat) < sekarang ? 'terlambat' : 'aktif'
}

/** Tugas aktif yang tenggatnya dalam 7 hari ke depan. */
export function jatuhTempoMingguIni(tugas, sekarang = new Date()) {
  if (tugas.selesai) return false
  const t = new Date(tugas.tenggat)
  return t >= sekarang && t - sekarang <= 7 * MS_HARI
}

/** Tingkat kedesakan untuk pewarnaan: 'lewat' | 'dekat' | 'normal' | 'selesai'. */
export function kedesakan(tugas, sekarang = new Date()) {
  if (tugas.selesai) return 'selesai'
  const t = new Date(tugas.tenggat)
  if (t < sekarang) return 'lewat'
  return selisihHari(t, sekarang) <= 1 ? 'dekat' : 'normal'
}

/** Teks tenggat singkat: "Hari ini, 23.59", "Besok, 21.00", "3 hari lagi", "Lewat 2 hari". */
export function teksTenggat(tenggat, sekarang = new Date()) {
  const t = new Date(tenggat)
  const hari = selisihHari(t, sekarang)

  if (t < sekarang) {
    const lewatMs = sekarang - t
    if (lewatMs < MS_JAM) return `Lewat ${Math.max(1, Math.round(lewatMs / 60000))} menit`
    if (hari === 0) return `Lewat ${Math.round(lewatMs / MS_JAM)} jam`
    return `Lewat ${Math.abs(hari)} hari`
  }
  if (hari === 0) return `Hari ini, ${fmtJam.format(t)}`
  if (hari === 1) return `Besok, ${fmtJam.format(t)}`
  if (hari < 7) return `${hari} hari lagi`
  return fmtTanggalPendek.format(t)
}

/** "Kamis, 19 November 2026 pukul 23.59" */
export function formatTanggalLengkap(tanggal) {
  const t = new Date(tanggal)
  return `${fmtTanggalPanjang.format(t)} pukul ${fmtJam.format(t)}`
}

/** "Selasa, 17 November" untuk sapaan di Beranda. */
export function formatHariIni(sekarang = new Date()) {
  return fmtHariIni.format(sekarang)
}

// ---------------------------------------------------------------------------
// Ringkasan & urutan daftar tugas
// ---------------------------------------------------------------------------

/** Hitung jumlah tugas per status untuk Beranda dan halaman Tugas. */
export function ringkasan(daftar, sekarang = new Date()) {
  const r = { total: daftar.length, aktif: 0, terlambat: 0, selesai: 0, mingguIni: 0 }
  for (const t of daftar) {
    r[statusTugas(t, sekarang)] += 1
    if (jatuhTempoMingguIni(t, sekarang)) r.mingguIni += 1
  }
  return r
}

const BOBOT_PRIORITAS = { tinggi: 0, sedang: 1, rendah: 2 }
const banding = {
  tenggat: (a, b) => new Date(a.tenggat) - new Date(b.tenggat),
  prioritas: (a, b) =>
    (BOBOT_PRIORITAS[a.prioritas] ?? 1) - (BOBOT_PRIORITAS[b.prioritas] ?? 1) ||
    new Date(a.tenggat) - new Date(b.tenggat),
  terbaru: (a, b) => new Date(b.dibuatPada) - new Date(a.dibuatPada),
}

/** Urutkan salinan daftar. Tugas yang sudah selesai selalu di bawah. */
export function urutkanTugas(daftar, cara = 'tenggat') {
  const fn = banding[cara] ?? banding.tenggat
  return [...daftar].sort((a, b) => Number(a.selesai) - Number(b.selesai) || fn(a, b))
}

const duaDigit = (n) => String(n).padStart(2, '0')

/** ISO -> nilai untuk <input type="datetime-local"> ("2026-11-20T23:59"). */
export function keNilaiInput(tanggal) {
  const d = new Date(tanggal)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${duaDigit(d.getMonth() + 1)}-${duaDigit(d.getDate())}T${duaDigit(d.getHours())}:${duaDigit(d.getMinutes())}`
}

/** Nilai <input type="datetime-local"> -> ISO, atau null bila tidak valid. */
export function dariNilaiInput(nilai) {
  if (!nilai) return null
  const d = new Date(nilai) // tanpa zona waktu = waktu lokal perangkat
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}
