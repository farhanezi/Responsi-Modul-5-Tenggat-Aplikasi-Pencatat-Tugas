import { useEffect, useId, useRef } from 'react'
import { TriangleExclamationPoint } from 'lucide-react'

/**
 * Dialog konfirmasi memakai elemen <dialog> bawaan browser: fokus otomatis
 * terkunci di dalam dialog, tombol Esc menutup, dan latar di belakangnya inert.
 */
export default function DialogKonfirmasi({
  buka,
  judul,
  pesan,
  labelKonfirmasi = 'Hapus',
  labelMemproses = 'Menghapus…',
  memproses = false,
  onKonfirmasi,
  onBatal,
}) {
  const ref = useRef(null)
  const idJudul = useId()
  const idPesan = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (buka && !dialog.open) dialog.showModal()
    if (!buka && dialog.open) dialog.close()
  }, [buka])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={idJudul}
      aria-describedby={idPesan}
      onClose={() => buka && onBatal()}
      onClick={(e) => {
        // Klik di area gelap (di luar kotak) = batal.
        if (e.target === e.currentTarget && !memproses) onBatal()
      }}
    >
      <div className="dialog-isi">
        <span className="dialog-ikon" aria-hidden="true">
          <TriangleExclamationPoint size={24} />
        </span>
        <h2 id={idJudul} className="h4">{judul}</h2>
        <p id={idPesan} className="teks-muted">{pesan}</p>
        <div className="dialog-aksi">
          <button type="button" className="btn btn--sekunder" onClick={onBatal} disabled={memproses} autoFocus>
            Batal
          </button>
          <button type="button" className="btn btn--bahaya" onClick={onKonfirmasi} disabled={memproses}>
            {memproses ? labelMemproses : labelKonfirmasi}
          </button>
        </div>
      </div>
    </dialog>
  )
}
