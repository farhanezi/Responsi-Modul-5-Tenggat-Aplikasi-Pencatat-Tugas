import { useState } from 'react'
import { WifiOff, X } from 'lucide-react'
import { IS_REMOTE } from '../config/api'
import { pasangAplikasi, usePWA } from '../hooks/usePWA'

const KEY_TUTUP = 'tenggat:install-ditutup'

/** Pita kuning di bawah header saat perangkat tidak terhubung ke internet. */
export function BannerOffline() {
  const { online } = usePWA()
  if (online) return null
  return (
    <div className="banner-offline" role="status">
      <div className="wadah banner-offline-isi">
        <WifiOff size={18} aria-hidden="true" />
        <span>
          {IS_REMOTE
            ? 'Kamu sedang offline. Data yang tampil berasal dari simpanan terakhir.'
            : 'Kamu sedang offline. Semua perubahan tetap tersimpan di perangkat ini.'}
        </span>
      </div>
    </div>
  )
}

/** Ajakan install, muncul saat browser mengizinkan (event beforeinstallprompt). */
export function BannerInstall() {
  const { installPrompt, terpasang } = usePWA()
  const [ditutup, setDitutup] = useState(() => {
    try {
      return sessionStorage.getItem(KEY_TUTUP) === '1'
    } catch {
      return false
    }
  })

  if (!installPrompt || terpasang || ditutup) return null

  const tutup = () => {
    setDitutup(true)
    try {
      sessionStorage.setItem(KEY_TUTUP, '1')
    } catch {
      /* abaikan */
    }
  }

  return (
    <div className="wadah">
      <aside className="banner-install" aria-label="Install aplikasi">
        <img src="/pwa-64x64.png" alt="" width="40" height="40" />
        <div className="banner-install-teks">
          <strong>Install Tenggat</strong>
          <span>Buka dari layar utama, tetap jalan tanpa internet.</span>
        </div>
        <button type="button" className="btn btn--primer btn--kecil" onClick={() => pasangAplikasi()}>
          Install
        </button>
        <button type="button" className="ikon-btn" onClick={tutup} aria-label="Tutup ajakan install">
          <X size={18} aria-hidden="true" />
        </button>
      </aside>
    </div>
  )
}
