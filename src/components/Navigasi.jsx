import { House, ListChecks, Plus, UserRound } from 'lucide-react'

const MENU = [
  { nama: 'beranda', href: '#/', label: 'Beranda', Ikon: House },
  { nama: 'tugas', href: '#/tugas', label: 'Tugas', Ikon: ListChecks },
  { nama: 'profil', href: '#/profil', label: 'Profil', Ikon: UserRound },
]

// Semua halaman tugas (daftar, detail, form) menyorot menu "Tugas".
const isAktif = (rute, nama) => (nama === 'tugas' ? rute.nama.startsWith('tugas') : rute.nama === nama)

/** Header atas: logo + menu (desktop) + tombol tambah (desktop). */
export function HeaderAtas({ rute }) {
  return (
    <header className="header">
      <div className="wadah header-isi">
        <a href="#/" className="brand" aria-label="Tenggat, ke beranda">
          <img src="/favicon.svg" alt="" width="32" height="32" />
          <span>Tenggat</span>
        </a>

        <nav className="nav-atas" aria-label="Navigasi utama">
          {MENU.map(({ nama, href, label, Ikon }) => (
            <a key={nama} href={href} className="nav-atas-link" aria-current={isAktif(rute, nama) ? 'page' : undefined}>
              <Ikon size={18} aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>

        <a href="#/tugas/baru" className="btn btn--primer header-tambah">
          <Plus size={16} aria-hidden="true" />
          Tambah tugas
        </a>
      </div>
    </header>
  )
}

/** Navigasi bawah ala aplikasi HP (hanya tampil di layar kecil). */
export function NavBawah({ rute }) {
  return (
    <nav className="nav-bawah" aria-label="Navigasi utama">
      {MENU.map(({ nama, href, label, Ikon }) => (
        <a key={nama} href={href} className="nav-bawah-link" aria-current={isAktif(rute, nama) ? 'page' : undefined}>
          <span className="nav-bawah-ikon">
            <Ikon size={24} aria-hidden="true" />
          </span>
          {label}
        </a>
      ))}
    </nav>
  )
}

/** Tombol bulat "Tambah tugas" di atas navigasi bawah (layar kecil). */
export function TombolTambahMengambang() {
  return (
    <a href="#/tugas/baru" className="fab" aria-label="Tambah tugas">
      <Plus size={24} aria-hidden="true" />
    </a>
  )
}
