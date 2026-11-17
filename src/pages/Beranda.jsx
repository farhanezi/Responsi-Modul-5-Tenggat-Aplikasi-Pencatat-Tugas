import { CalendarClock, ChevronRight, CircleCheck, CircleExclamationPoint, ListTodo, Plus, Sparkles } from 'lucide-react'
import KartuTugas from '../components/KartuTugas'
import { KeadaanKosong, Memuat } from '../components/KeadaanKosong'
import profil from '../data/profil'
import { useSekarang } from '../hooks/useRute'
import { useDaftarTugas } from '../hooks/useTugas'
import { formatHariIni, ringkasan, urutkanTugas } from '../utils/tanggal'

function kalimatRingkas(r) {
  if (r.total === 0) return 'Belum ada tugas yang dicatat. Mulai dengan menambahkan tugas pertamamu.'
  if (r.aktif === 0 && r.terlambat === 0) return 'Semua tugas sudah selesai. Kerja bagus, nikmati waktu luangmu.'
  const bagian = []
  if (r.mingguIni > 0) bagian.push(`${r.mingguIni} tugas jatuh tempo minggu ini`)
  if (r.terlambat > 0) bagian.push(`${r.terlambat} sudah lewat tenggat`)
  if (bagian.length === 0) return `Ada ${r.aktif} tugas aktif, belum ada yang mendesak minggu ini.`
  return `Ada ${bagian.join(' dan ')}.`
}

function KartuStat({ href, Ikon, angka, label, nada = 'primer' }) {
  return (
    <a href={href} className={`stat stat--${nada}`}>
      <span className="stat-ikon" aria-hidden="true">
        <Ikon size={20} />
      </span>
      <span className="stat-angka">{angka}</span>
      <span className="stat-label">{label}</span>
    </a>
  )
}

export default function Beranda() {
  const sekarang = useSekarang()
  const { tugas, loading, error } = useDaftarTugas()
  const r = ringkasan(tugas, sekarang)
  const terdekat = urutkanTugas(tugas.filter((t) => !t.selesai)).slice(0, 4)
  const persen = r.total ? Math.round((r.selesai / r.total) * 100) : 0
  const namaDepan = profil.nama.split(' ')[0]

  return (
    <div className="halaman">
      <section className="hero" aria-labelledby="judul-beranda">
        <div className="hero-teks">
          <p className="overline hero-eyebrow">{formatHariIni(sekarang)}</p>
          <h1 id="judul-beranda" className="hero-judul">Halo, {namaDepan}</h1>
          <p className="hero-lede">{loading ? 'Menyiapkan ringkasan tugasmu…' : kalimatRingkas(r)}</p>

          <div className="progres">
            <div className="progres-label">
              <span>{r.selesai} dari {r.total} tugas selesai</span>
              <span>{persen}%</span>
            </div>
            <div
              className="progres-track"
              role="progressbar"
              aria-label="Tugas selesai"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={persen}
            >
              <div className="progres-isi" style={{ width: `${persen}%` }} />
            </div>
          </div>
        </div>
        <div className="hero-pola pola-ombak" aria-hidden="true" />
      </section>

      <section aria-label="Ringkasan tugas">
        <div className="grid-stat">
          <KartuStat href="#/tugas?filter=aktif" Ikon={ListTodo} angka={r.aktif} label="Aktif" />
          <KartuStat href="#/tugas?filter=minggu-ini" Ikon={CalendarClock} angka={r.mingguIni} label="Minggu ini" nada="amber" />
          <KartuStat href="#/tugas?filter=terlambat" Ikon={CircleExclamationPoint} angka={r.terlambat} label="Terlambat" nada="bahaya" />
          <KartuStat href="#/tugas?filter=selesai" Ikon={CircleCheck} angka={r.selesai} label="Selesai" nada="sukses" />
        </div>
      </section>

      {r.terlambat > 0 && (
        <div className="alert alert--bahaya">
          <CircleExclamationPoint size={20} aria-hidden="true" />
          <p>
            <strong>{r.terlambat} tugas sudah lewat tenggat.</strong> Selesaikan sekarang atau perbarui tenggatnya.
          </p>
          <a href="#/tugas?filter=terlambat" className="tautan">Lihat</a>
        </div>
      )}

      <section className="bagian" aria-labelledby="judul-terdekat">
        <div className="bagian-kepala">
          <h2 id="judul-terdekat" className="h3">Tenggat terdekat</h2>
          <a href="#/tugas" className="tautan tautan--ikon">
            Lihat semua
            <ChevronRight size={16} aria-hidden="true" />
          </a>
        </div>

        {loading ? (
          <Memuat teks="Memuat tugas…" />
        ) : error ? (
          <div className="alert alert--bahaya" role="alert">
            <CircleExclamationPoint size={20} aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : terdekat.length === 0 ? (
          <KeadaanKosong
            Ikon={Sparkles}
            judul="Semua tugas beres"
            aksi={
              <a href="#/tugas/baru" className="btn btn--primer">
                <Plus size={16} aria-hidden="true" />
                Tambah tugas
              </a>
            }
          >
            Belum ada tugas yang perlu dikejar. Catat tugas baru begitu dosen memberikannya.
          </KeadaanKosong>
        ) : (
          <ul className="daftar-tugas">
            {terdekat.map((t) => (
              <KartuTugas key={t.id} tugas={t} sekarang={sekarang} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
