import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CircleCheck, CircleExclamationPoint, Info, X } from 'lucide-react'

// ---------------------------------------------------------------------------
// Toast — notifikasi singkat setelah aksi (simpan, hapus, dll).
// Pakai: const toast = useToast(); toast('Tugas disimpan')
// ---------------------------------------------------------------------------

const ToastContext = createContext(() => {})

const IKON = { sukses: CircleCheck, galat: CircleExclamationPoint, info: Info }

export function ToastProvider({ children }) {
  const [daftar, setDaftar] = useState([])
  const idRef = useRef(0)

  const tutup = useCallback((id) => setDaftar((l) => l.filter((t) => t.id !== id)), [])

  const tampilkan = useCallback(
    (pesan, { jenis = 'sukses', durasi = 3500 } = {}) => {
      const id = ++idRef.current
      setDaftar((l) => [...l.slice(-2), { id, pesan, jenis }])
      setTimeout(() => tutup(id), durasi)
    },
    [tutup],
  )

  return (
    <ToastContext.Provider value={tampilkan}>
      {children}
      <div className="toast-wadah" role="status" aria-live="polite">
        {daftar.map((t) => {
          const Ikon = IKON[t.jenis] ?? Info
          return (
            <div key={t.id} className={`toast toast--${t.jenis}`}>
              <Ikon size={20} aria-hidden="true" className="toast-ikon" />
              <span>{t.pesan}</span>
              <button type="button" className="ikon-btn ikon-btn--kecil" onClick={() => tutup(t.id)} aria-label="Tutup notifikasi">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
