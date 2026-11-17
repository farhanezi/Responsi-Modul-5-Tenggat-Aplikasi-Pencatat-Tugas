import { BookOpen, Circle, CircleCheckBig, CircleExclamationPoint, Clock } from 'lucide-react'
import { BadgePrioritas } from './Badge'
import { useToast } from './Toast'
import { useToggleSelesai } from '../hooks/useTugas'
import { kedesakan, teksTenggat } from '../utils/tanggal'

/**
 * Satu baris tugas: tombol centang (tandai selesai) + judul yang membuka detail.
 * Seluruh kartu bisa diklik untuk membuka detail, kecuali tombol centang.
 */
export default function KartuTugas({ tugas, sekarang }) {
  const toast = useToast()
  const toggle = useToggleSelesai()
  const level = kedesakan(tugas, sekarang)
  const IkonTenggat = level === 'lewat' ? CircleExclamationPoint : Clock

  const ubahSelesai = () =>
    toggle.mutate(
      { id: tugas.id, selesai: !tugas.selesai },
      {
        onSuccess: (t) => toast(t.selesai ? 'Tugas ditandai selesai.' : 'Tugas dikembalikan ke daftar aktif.'),
        onError: (err) => toast(err.message, { jenis: 'galat' }),
      },
    )

  return (
    <li className={`kartu-tugas${tugas.selesai ? ' kartu-tugas--selesai' : ''}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={tugas.selesai}
        className="centang"
        onClick={ubahSelesai}
        aria-label={`Selesai: ${tugas.judul}`}
      >
        {tugas.selesai ? <CircleCheckBig size={24} aria-hidden="true" /> : <Circle size={24} aria-hidden="true" />}
      </button>

      <div className="kartu-tugas-isi">
        <a href={`#/tugas/${encodeURIComponent(tugas.id)}`} className="kartu-tugas-judul">
          {tugas.judul}
        </a>
        <div className="kartu-tugas-meta">
          <span className="meta-item">
            <BookOpen size={14} aria-hidden="true" />
            {tugas.mataKuliah}
          </span>
          <span className={`meta-item tenggat tenggat--${level}`}>
            <IkonTenggat size={14} aria-hidden="true" />
            {tugas.selesai ? 'Sudah selesai' : teksTenggat(tugas.tenggat, sekarang)}
          </span>
        </div>
      </div>

      <div className="kartu-tugas-badge">
        <BadgePrioritas prioritas={tugas.prioritas} />
      </div>
    </li>
  )
}
