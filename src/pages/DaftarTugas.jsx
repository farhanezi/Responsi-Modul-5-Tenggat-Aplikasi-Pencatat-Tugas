import { useState } from 'react'
import { ArrowUpDown, CircleExclamationPoint, Inbox, Plus, Search, SearchX, X } from 'lucide-react'
import KartuTugas from '../components/KartuTugas'
import { KeadaanKosong, Memuat } from '../components/KeadaanKosong'
import { navigasi, useSekarang } from '../hooks/useRute'
import { useDaftarTugas } from '../hooks/useTugas'
import { jatuhTempoMingguIni, ringkasan, statusTugas, urutkanTugas } from '../utils/tanggal'

const FILTER = [
  { nilai: 'semua', label: 'Semua' },
  { nilai: 'aktif', label: 'Aktif' },
  { nilai: 'minggu-ini', label: 'Minggu ini' },
  { nilai: 'terlambat', label: 'Terlambat' },
  { nilai: 'selesai', label: 'Selesai' },
]

const KOSONG = {
  semua: ['Belum ada tugas', 'Catat tugas pertamamu supaya tenggatnya tidak terlewat.'],
  aktif: ['Tidak ada tugas aktif', 'Semua tugas sudah selesai atau sudah lewat tenggat.'],
  'minggu-ini': ['Tidak ada tenggat minggu ini', 'Minggu ini aman. Cek tab Semua untuk tugas berikutnya.'],
  terlambat: ['Tidak ada tugas terlambat', 'Mantap, semua tugas masih sesuai jadwal.'],
  selesai: ['Belum ada tugas selesai', 'Tandai tugas sebagai selesai lewat tombol bulat di kiri tiap tugas.'],
}

function cocokFilter(tugas, filter, sekarang) {
  switch (filter) {
    case 'aktif':
    case 'terlambat':
      return statusTugas(tugas, sekarang) === filter
    case 'minggu-ini':
      return jatuhTempoMingguIni(tugas, sekarang)
    case 'selesai':
      return tugas.selesai
    default:
      return true
  }
}

export default function DaftarTugas({ query }) {
  const sekarang = useSekarang()
  const { tugas, loading, error } = useDaftarTugas()
  const [cari, setCari] = useState('')
  const [urutan, setUrutan] = useState('tenggat')

  const filter = FILTER.some((f) => f.nilai === query.filter) ? query.filter : 'semua'
  const pilihFilter = (nilai) => navigasi(nilai === 'semua' ? '/tugas' : `/tugas?filter=${nilai}`, { ganti: true })

  const kataKunci = cari.trim().toLowerCase()
  const hasil = urutkanTugas(
    tugas.filter(
      (t) =>
        cocokFilter(t, filter, sekarang) &&
        (!kataKunci || t.judul.toLowerCase().includes(kataKunci) || t.mataKuliah.toLowerCase().includes(kataKunci)),
    ),
    urutan,
  )
  const r = ringkasan(tugas, sekarang)

  return (
    <div className="halaman">
      <div className="kepala-halaman">
        <div>
          <h1 className="h1">Tugas</h1>
          <p className="teks-muted">
            {r.total} tugas tercatat · {r.aktif + r.terlambat} belum selesai
          </p>
        </div>
        <a href="#/tugas/baru" className="btn btn--primer hanya-desktop">
          <Plus size={16} aria-hidden="true" />
          Tambah tugas
        </a>
      </div>

      <div className="alat">
        <div className="field-cari">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="cari-tugas" className="sr-only">Cari tugas</label>
          <input
            id="cari-tugas"
            type="search"
            className="input"
            placeholder="Cari judul atau mata kuliah"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            autoComplete="off"
          />
          {cari && (
            <button type="button" className="ikon-btn ikon-btn--kecil" onClick={() => setCari('')} aria-label="Hapus pencarian">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="field-urut">
          <ArrowUpDown size={16} aria-hidden="true" />
          <label htmlFor="urut-tugas" className="sr-only">Urutkan</label>
          <select id="urut-tugas" className="input" value={urutan} onChange={(e) => setUrutan(e.target.value)}>
            <option value="tenggat">Tenggat terdekat</option>
            <option value="prioritas">Prioritas tertinggi</option>
            <option value="terbaru">Terakhir ditambah</option>
          </select>
        </div>
      </div>

      <div className="tabs" role="group" aria-label="Filter status tugas">
        {FILTER.map((f) => (
          <button
            key={f.nilai}
            type="button"
            className="tab"
            aria-pressed={filter === f.nilai}
            onClick={() => pilihFilter(f.nilai)}
          >
            {f.label}
            <span className="tab-jumlah">{tugas.filter((t) => cocokFilter(t, f.nilai, sekarang)).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <Memuat teks="Memuat tugas…" />
      ) : error ? (
        <div className="alert alert--bahaya" role="alert">
          <CircleExclamationPoint size={20} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : hasil.length === 0 ? (
        kataKunci ? (
          <KeadaanKosong
            Ikon={SearchX}
            judul="Tidak ada tugas yang cocok"
            aksi={
              <button type="button" className="btn btn--sekunder" onClick={() => setCari('')}>
                Hapus pencarian
              </button>
            }
          >
            Tidak ada tugas dengan kata “{cari.trim()}”. Coba kata kunci lain atau ganti filter.
          </KeadaanKosong>
        ) : (
          <KeadaanKosong
            Ikon={Inbox}
            judul={KOSONG[filter][0]}
            aksi={
              filter === 'semua' && (
                <a href="#/tugas/baru" className="btn btn--primer">
                  <Plus size={16} aria-hidden="true" />
                  Tambah tugas
                </a>
              )
            }
          >
            {KOSONG[filter][1]}
          </KeadaanKosong>
        )
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            Menampilkan {hasil.length} tugas
          </p>
          <ul className="daftar-tugas">
            {hasil.map((t) => (
              <KartuTugas key={t.id} tugas={t} sekarang={sekarang} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
