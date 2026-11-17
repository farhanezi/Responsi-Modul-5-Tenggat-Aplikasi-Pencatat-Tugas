// ---------------------------------------------------------------------------
// Data awal tugas (mode lokal).
//
// Dipakai sekali saat aplikasi pertama dibuka, lalu disalin ke localStorage.
// Tenggat ditulis relatif ("hariLagi" dari hari pertama dibuka) supaya contoh
// datanya selalu terasa baru, tidak semuanya sudah lewat tenggat.
// ---------------------------------------------------------------------------
export const TUGAS_AWAL = [
  {
    judul: 'Laporan praktikum Modul 5',
    mataKuliah: 'Praktikum PPB',
    hariLagi: 2,
    jam: '23:59',
    prioritas: 'tinggi',
    catatan: 'Lampirkan screenshot saat aplikasi di-install dan saat dibuka tanpa internet.',
    selesai: false,
  },
  {
    judul: 'Deploy responsi ke Vercel',
    mataKuliah: 'Praktikum PPB',
    hariLagi: 4,
    jam: '21:00',
    prioritas: 'tinggi',
    catatan: 'Kumpulkan link Vercel lewat form yang disediakan asisten.',
    selesai: false,
  },
  {
    judul: 'Kuis bab 4: routing',
    mataKuliah: 'Jaringan Komputer',
    hariLagi: 6,
    jam: '08:00',
    prioritas: 'sedang',
    catatan: 'Materi routing statis dan dinamis. Bawa kalkulator.',
    selesai: false,
  },
  {
    judul: 'Resume jurnal sistem tertanam',
    mataKuliah: 'Sistem Tertanam',
    hariLagi: -1,
    jam: '23:59',
    prioritas: 'sedang',
    catatan: 'Minimal dua halaman, sitasi format IEEE.',
    selesai: false,
  },
  {
    judul: 'Latihan soal distribusi peluang',
    mataKuliah: 'Probabilitas dan Statistik',
    hariLagi: 10,
    jam: '12:00',
    prioritas: 'rendah',
    catatan: 'Soal nomor 1 sampai 15 di modul 3.',
    selesai: false,
  },
  {
    judul: 'Proposal proyek kelompok',
    mataKuliah: 'Rekayasa Perangkat Lunak',
    hariLagi: -3,
    jam: '17:00',
    prioritas: 'tinggi',
    catatan: 'Sudah dikirim ke dosen lewat e-learning.',
    selesai: true,
  },
]

/** Daftar mata kuliah untuk saran isian di form. */
export const SARAN_MATA_KULIAH = [
  'Praktikum PPB',
  'Jaringan Komputer',
  'Sistem Tertanam',
  'Probabilitas dan Statistik',
  'Rekayasa Perangkat Lunak',
]

export const PRIORITAS = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'tinggi', label: 'Tinggi' },
]
