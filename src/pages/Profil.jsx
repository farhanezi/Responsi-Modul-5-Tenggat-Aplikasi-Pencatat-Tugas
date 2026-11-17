import { useState } from 'react'
import {
  CloudOff,
  Database,
  Download,
  Hash,
  IdCard,
  Monitor,
  Moon,
  RotateCcw,
  Smartphone,
  Sun,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import { useToast } from '../components/Toast'
import { BASE_URL, IS_REMOTE } from '../config/api'
import profil from '../data/profil'
import { pasangAplikasi, usePWA } from '../hooks/usePWA'
import { useTema } from '../hooks/useTema'
import { useResetData } from '../hooks/useTugas'

const PILIHAN_TEMA = [
  { nilai: 'sistem', label: 'Sistem', Ikon: Monitor },
  { nilai: 'light', label: 'Terang', Ikon: Sun },
  { nilai: 'dark', label: 'Gelap', Ikon: Moon },
]

function BarisInfo({ Ikon, judul, children, aksi }) {
  return (
    <li className="info-baris">
      <span className="info-ikon" aria-hidden="true">
        <Ikon size={20} />
      </span>
      <div className="info-teks">
        <strong>{judul}</strong>
        <span>{children}</span>
      </div>
      {aksi}
    </li>
  )
}

const hostApi = () => {
  try {
    return new URL(BASE_URL).host
  } catch {
    return BASE_URL
  }
}

export default function Profil() {
  const pwa = usePWA()
  const toast = useToast()
  const [tema, setTema] = useTema()
  const reset = useResetData()
  const [konfirmasiReset, setKonfirmasiReset] = useState(false)

  const inisial = profil.nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join('')

  const install = async () => {
    const hasil = await pasangAplikasi()
    if (hasil === 'accepted') toast('Tenggat berhasil di-install.')
  }

  const kembalikanData = async () => {
    try {
      await reset.mutateAsync()
      setKonfirmasiReset(false)
      toast('Data contoh dikembalikan.')
    } catch (err) {
      toast(err.message, { jenis: 'galat' })
    }
  }

  return (
    <div className="halaman halaman--sempit">
      <div className="kepala-halaman">
        <div>
          <h1 className="h1">Profil</h1>
          <p className="teks-muted">Identitas pembuat aplikasi dan pengaturan.</p>
        </div>
      </div>

      <section className="kartu profil" aria-labelledby="judul-profil">
        <div className="profil-pola pola-ombak" aria-hidden="true" />
        <div className="profil-kepala">
          <span className="avatar" aria-hidden="true">{inisial}</span>
          <div>
            <p className="overline teks-primer">{profil.praktikum}</p>
            <h2 id="judul-profil" className="h3">{profil.nama}</h2>
            <p className="teks-muted">{profil.tugas}</p>
          </div>
        </div>

        <dl className="profil-data">
          <div>
            <dt>
              <IdCard size={20} aria-hidden="true" />
              Nama
            </dt>
            <dd>{profil.nama}</dd>
          </div>
          <div>
            <dt>
              <Hash size={20} aria-hidden="true" />
              NIM
            </dt>
            <dd className="angka-tabular">{profil.nim}</dd>
          </div>
          <div>
            <dt>
              <Users size={20} aria-hidden="true" />
              Kelompok
            </dt>
            <dd>Kelompok {profil.kelompok}</dd>
          </div>
        </dl>
      </section>

      <section className="kartu" aria-labelledby="judul-aplikasi">
        <h2 id="judul-aplikasi" className="h4">Aplikasi</h2>
        <ul className="info-daftar">
          <BarisInfo
            Ikon={Smartphone}
            judul="Instalasi"
            aksi={
              !pwa.terpasang &&
              pwa.installPrompt && (
                <button type="button" className="btn btn--primer btn--kecil" onClick={install}>
                  <Download size={16} aria-hidden="true" />
                  Install
                </button>
              )
            }
          >
            {pwa.terpasang
              ? 'Sedang berjalan sebagai aplikasi yang ter-install.'
              : pwa.installPrompt
                ? 'Belum di-install di perangkat ini.'
                : 'Belum di-install. Buka menu browser lalu pilih "Install aplikasi" atau "Tambahkan ke layar utama".'}
          </BarisInfo>
          <BarisInfo Ikon={pwa.online ? Wifi : WifiOff} judul="Koneksi">
            {pwa.online ? 'Online' : 'Offline. Aplikasi tetap bisa dipakai.'}
          </BarisInfo>
          <BarisInfo Ikon={CloudOff} judul="Mode offline">
            {pwa.siapOffline
              ? 'Siap. Semua file aplikasi sudah tersimpan di perangkat.'
              : pwa.adaSW
                ? 'Sedang menyiapkan file untuk dipakai tanpa internet…'
                : 'Browser ini tidak mendukung service worker.'}
          </BarisInfo>
          <BarisInfo Ikon={Database} judul="Penyimpanan data">
            {IS_REMOTE ? `API Supabase (${hostApi()})` : 'Lokal di perangkat ini (localStorage)'}
          </BarisInfo>
        </ul>
      </section>

      <section className="kartu" aria-labelledby="judul-tampilan">
        <h2 id="judul-tampilan" className="h4">Tampilan</h2>
        <fieldset className="field">
          <legend className="label">Tema</legend>
          <div className="segmen">
            {PILIHAN_TEMA.map(({ nilai, label, Ikon }) => (
              <label key={nilai} className="segmen-opsi">
                <input type="radio" name="tema" value={nilai} checked={tema === nilai} onChange={() => setTema(nilai)} />
                <span>
                  <Ikon size={16} aria-hidden="true" />
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {!IS_REMOTE && (
        <section className="kartu" aria-labelledby="judul-data">
          <h2 id="judul-data" className="h4">Data</h2>
          <p className="teks-muted">
            Kembalikan daftar tugas ke data contoh awal. Tugas yang kamu tambahkan atau ubah akan hilang.
          </p>
          <button type="button" className="btn btn--garis-bahaya" onClick={() => setKonfirmasiReset(true)}>
            <RotateCcw size={16} aria-hidden="true" />
            Kembalikan data contoh
          </button>
        </section>
      )}

      <p className="catatan-kaki">Tenggat v1.0 · {profil.tugas}</p>

      <DialogKonfirmasi
        buka={konfirmasiReset}
        judul="Kembalikan data contoh?"
        pesan="Semua tugas saat ini akan diganti dengan data contoh awal. Langkah ini tidak bisa dibatalkan."
        labelKonfirmasi="Kembalikan"
        labelMemproses="Memproses…"
        memproses={reset.isPending}
        onKonfirmasi={kembalikanData}
        onBatal={() => setKonfirmasiReset(false)}
      />
    </div>
  )
}
