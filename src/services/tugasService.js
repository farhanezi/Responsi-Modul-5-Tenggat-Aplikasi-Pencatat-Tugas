import { apiClient, IS_REMOTE } from '../config/api'
import { TUGAS_AWAL } from '../data/tugas'
import { tanggalDariHariLagi } from '../utils/tanggal'

// ---------------------------------------------------------------------------
// TugasService — semua operasi CRUD tugas ada di sini.
//
// MODE LOKAL (default, VITE_API_BASE_URL kosong):
//   data awal dari src/data/tugas.js, lalu disimpan di localStorage.
//   CRUD tetap jalan walau perangkat offline.
// MODE API (VITE_API_BASE_URL diisi):
//   memakai Supabase PostgREST, tabel public.tugas (supabase/schema.sql).
//
// Bentuk satu tugas di aplikasi:
//   { id, judul, mataKuliah, tenggat (ISO), prioritas, catatan, selesai,
//     dibuatPada (ISO), diubahPada (ISO) }
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'tenggat:tugas:v1'
export const NILAI_PRIORITAS = ['rendah', 'sedang', 'tinggi']
export const BATAS_JUDUL = 80
export const BATAS_CATATAN = 500

const buatId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const galat = (message, status = null) => Object.assign(new Error(message), { status })

// ---------------------------------------------------------------------------
// Validasi — dipakai form (pesan per field) dan service (penjaga terakhir).
// ---------------------------------------------------------------------------
export function validasiTugas(input) {
  const errors = {}
  const judul = String(input.judul ?? '').trim()
  const mataKuliah = String(input.mataKuliah ?? '').trim()

  if (!judul) errors.judul = 'Judul tugas belum diisi.'
  else if (judul.length < 3) errors.judul = 'Judul terlalu pendek. Tulis minimal 3 karakter.'
  else if (judul.length > BATAS_JUDUL) errors.judul = `Judul terlalu panjang. Maksimal ${BATAS_JUDUL} karakter.`

  if (!mataKuliah) errors.mataKuliah = 'Mata kuliah belum diisi.'

  if (!input.tenggat || Number.isNaN(new Date(input.tenggat).getTime())) {
    errors.tenggat = 'Tenggat belum diisi. Pilih tanggal dan jamnya.'
  }

  if (!NILAI_PRIORITAS.includes(input.prioritas)) errors.prioritas = 'Pilih salah satu prioritas.'

  if (String(input.catatan ?? '').length > BATAS_CATATAN) {
    errors.catatan = `Catatan terlalu panjang. Maksimal ${BATAS_CATATAN} karakter.`
  }
  return errors
}

/** Ambil hanya field yang dikenal, sudah dirapikan. Field yang tidak ada dilewati. */
function rapikan(input) {
  const out = {}
  if ('judul' in input) out.judul = String(input.judul ?? '').trim()
  if ('mataKuliah' in input) out.mataKuliah = String(input.mataKuliah ?? '').trim()
  if ('tenggat' in input) out.tenggat = new Date(input.tenggat).toISOString()
  if ('prioritas' in input) out.prioritas = input.prioritas
  if ('catatan' in input) out.catatan = String(input.catatan ?? '').trim()
  if ('selesai' in input) out.selesai = Boolean(input.selesai)
  return out
}

function pastikanValid(data) {
  const errors = validasiTugas(data)
  const pesan = Object.values(errors)[0]
  if (pesan) throw galat(pesan, 422)
}

// ---------------------------------------------------------------------------
// Penyimpanan lokal (localStorage, dengan cadangan memori bila diblokir)
// ---------------------------------------------------------------------------
let cadanganMemori = null

function buatDataAwal() {
  const now = new Date().toISOString()
  return TUGAS_AWAL.map(({ hariLagi, jam, ...sisa }) => ({
    id: buatId(),
    ...sisa,
    tenggat: tanggalDariHariLagi(hariLagi, jam),
    dibuatPada: now,
    diubahPada: now,
  }))
}

function tulisLokal(daftar) {
  cadanganMemori = daftar
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(daftar))
  } catch {
    // Mode privat / penyimpanan penuh: data tetap ada di memori sampai tab ditutup.
  }
}

function bacaLokal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    if (cadanganMemori) return cadanganMemori
  }
  // Pertama kali dibuka (atau data rusak): isi dengan data awal.
  const awal = buatDataAwal()
  tulisLokal(awal)
  return awal
}

// ---------------------------------------------------------------------------
// Pemetaan baris Supabase (snake_case) <-> objek aplikasi (camelCase)
// ---------------------------------------------------------------------------
const dariBaris = (row) => ({
  id: row.id,
  judul: row.judul,
  mataKuliah: row.mata_kuliah,
  tenggat: row.tenggat,
  prioritas: row.prioritas,
  catatan: row.catatan ?? '',
  selesai: Boolean(row.selesai),
  dibuatPada: row.created_at,
  diubahPada: row.updated_at,
})

const keBaris = (data) => {
  const row = {}
  if ('judul' in data) row.judul = data.judul
  if ('mataKuliah' in data) row.mata_kuliah = data.mataKuliah
  if ('tenggat' in data) row.tenggat = data.tenggat
  if ('prioritas' in data) row.prioritas = data.prioritas
  if ('catatan' in data) row.catatan = data.catatan
  if ('selesai' in data) row.selesai = data.selesai
  return row
}

const RETURN_REP = { headers: { Prefer: 'return=representation' } }

// ---------------------------------------------------------------------------
// Operasi CRUD
// ---------------------------------------------------------------------------
class TugasService {
  /** READ — semua tugas. */
  async getAll() {
    if (IS_REMOTE) {
      const rows = await apiClient.get('/rest/v1/tugas?select=*&order=tenggat.asc')
      return Array.isArray(rows) ? rows.map(dariBaris) : []
    }
    return bacaLokal()
  }

  /** READ — satu tugas berdasarkan id. */
  async getById(id) {
    if (IS_REMOTE) {
      const rows = await apiClient.get(`/rest/v1/tugas?id=eq.${encodeURIComponent(id)}&select=*`)
      if (Array.isArray(rows) && rows.length > 0) return dariBaris(rows[0])
      throw galat('Tugas tidak ditemukan. Mungkin sudah dihapus.', 404)
    }
    const tugas = bacaLokal().find((t) => t.id === id)
    if (!tugas) throw galat('Tugas tidak ditemukan. Mungkin sudah dihapus.', 404)
    return tugas
  }

  /** CREATE — tambah tugas baru. */
  async create(input) {
    const data = rapikan({ catatan: '', selesai: false, ...input })
    pastikanValid(data)

    if (IS_REMOTE) {
      const rows = await apiClient.post('/rest/v1/tugas', keBaris(data), RETURN_REP)
      return dariBaris(Array.isArray(rows) ? rows[0] : rows)
    }
    const now = new Date().toISOString()
    const baru = { id: buatId(), ...data, dibuatPada: now, diubahPada: now }
    tulisLokal([baru, ...bacaLokal()])
    return baru
  }

  /** UPDATE — ubah sebagian atau semua field tugas. */
  async update(id, input) {
    const perubahan = rapikan(input)

    if (IS_REMOTE) {
      const lama = await this.getById(id)
      pastikanValid({ ...lama, ...perubahan })
      const rows = await apiClient.patch(
        `/rest/v1/tugas?id=eq.${encodeURIComponent(id)}`,
        { ...keBaris(perubahan), updated_at: new Date().toISOString() },
        RETURN_REP,
      )
      const row = Array.isArray(rows) ? rows[0] : rows
      if (!row) throw galat('Tugas tidak ditemukan. Mungkin sudah dihapus.', 404)
      return dariBaris(row)
    }

    const daftar = bacaLokal()
    const idx = daftar.findIndex((t) => t.id === id)
    if (idx === -1) throw galat('Tugas tidak ditemukan. Mungkin sudah dihapus.', 404)
    const diubah = { ...daftar[idx], ...perubahan, diubahPada: new Date().toISOString() }
    pastikanValid(diubah)
    const baru = [...daftar]
    baru[idx] = diubah
    tulisLokal(baru)
    return diubah
  }

  /** DELETE — hapus tugas. */
  async remove(id) {
    if (IS_REMOTE) {
      await apiClient.delete(`/rest/v1/tugas?id=eq.${encodeURIComponent(id)}`)
      return { id }
    }
    const daftar = bacaLokal()
    if (!daftar.some((t) => t.id === id)) throw galat('Tugas tidak ditemukan. Mungkin sudah dihapus.', 404)
    tulisLokal(daftar.filter((t) => t.id !== id))
    return { id }
  }

  /** Kembalikan data contoh (hanya mode lokal). */
  async resetDataAwal() {
    if (IS_REMOTE) throw galat('Data contoh hanya tersedia di mode lokal.')
    const awal = buatDataAwal()
    tulisLokal(awal)
    return awal
  }
}

export default new TugasService()
