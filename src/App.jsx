import { lazy, Suspense, useEffect, useRef } from 'react'
import { Compass } from 'lucide-react'
import { KeadaanKosong, Memuat } from './components/KeadaanKosong'
import { HeaderAtas, NavBawah, TombolTambahMengambang } from './components/Navigasi'
import { BannerInstall, BannerOffline } from './components/StatusPWA'
import { useToast } from './components/Toast'
import { useRute } from './hooks/useRute'
import { usePWA } from './hooks/usePWA'
import Beranda from './pages/Beranda'

// ---------------------------------------------------------------------------
// Lazy load (code splitting), sama seperti modul praktikum: Beranda dimuat
// langsung karena layar pertama, halaman lain diunduh saat pertama dibuka.
// Semua chunk tetap di-precache service worker, jadi aman saat offline.
// ---------------------------------------------------------------------------
const DaftarTugas = lazy(() => import('./pages/DaftarTugas'))
const DetailTugas = lazy(() => import('./pages/DetailTugas'))
const FormTugas = lazy(() => import('./pages/FormTugas'))
const Profil = lazy(() => import('./pages/Profil'))

const JUDUL = {
  beranda: 'Beranda',
  tugas: 'Tugas',
  'tugas-baru': 'Tambah tugas',
  'tugas-detail': 'Detail tugas',
  'tugas-ubah': 'Ubah tugas',
  profil: 'Profil',
  'tidak-ditemukan': 'Halaman tidak ditemukan',
}

function Halaman({ rute }) {
  switch (rute.nama) {
    case 'beranda':
      return <Beranda />
    case 'tugas':
      return <DaftarTugas query={rute.query} />
    case 'tugas-baru':
      return <FormTugas />
    case 'tugas-detail':
      return <DetailTugas key={rute.id} id={rute.id} />
    case 'tugas-ubah':
      return <FormTugas key={rute.id} id={rute.id} />
    case 'profil':
      return <Profil />
    default:
      return (
        <KeadaanKosong
          Ikon={Compass}
          judul="Halaman tidak ditemukan"
          aksi={<a href="#/" className="btn btn--primer">Ke beranda</a>}
        >
          Alamat yang kamu buka tidak ada di Tenggat.
        </KeadaanKosong>
      )
  }
}

export default function App() {
  const rute = useRute()
  const pwa = usePWA()
  const toast = useToast()
  const mainRef = useRef(null)
  const pertamaRef = useRef(true)
  const kunciHalaman = `${rute.nama}:${rute.id ?? ''}`

  // Pindah halaman: judul tab diperbarui, scroll ke atas, fokus ke konten
  // (supaya pengguna pembaca layar tahu halaman sudah berganti).
  useEffect(() => {
    document.title = `${JUDUL[rute.nama] ?? 'Tenggat'} · Tenggat`
    if (pertamaRef.current) {
      pertamaRef.current = false
      return
    }
    window.scrollTo({ top: 0 })
    mainRef.current?.focus({ preventScroll: true })
  }, [kunciHalaman, rute.nama])

  // Notifikasi sekali saat aplikasi pertama kali selesai disimpan untuk offline.
  useEffect(() => {
    if (pwa.baruSiapOffline) toast('Tenggat siap dipakai tanpa internet.', { jenis: 'info', durasi: 5000 })
  }, [pwa.baruSiapOffline, toast])

  const tampilFab = rute.nama === 'beranda' || rute.nama === 'tugas'

  return (
    <div className="app">
      <button type="button" className="lewati" onClick={() => mainRef.current?.focus()}>
        Lewati ke konten
      </button>
      <HeaderAtas rute={rute} />
      <BannerOffline />
      <BannerInstall />

      <main ref={mainRef} tabIndex={-1} className="wadah konten">
        <Suspense fallback={<Memuat teks="Membuka halaman…" />}>
          <Halaman rute={rute} />
        </Suspense>
      </main>

      {tampilFab && <TombolTambahMengambang />}
      <NavBawah rute={rute} />
    </div>
  )
}
