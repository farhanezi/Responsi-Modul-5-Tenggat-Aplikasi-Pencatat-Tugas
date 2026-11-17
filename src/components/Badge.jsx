import { ChevronDown, ChevronsUp, CircleCheck, CircleExclamationPoint, Clock, Equal } from 'lucide-react'

// Status & prioritas selalu ditampilkan dengan ikon + kata, bukan warna saja.

const PRIORITAS = {
  tinggi: { label: 'Tinggi', kelas: 'badge--amber', Ikon: ChevronsUp },
  sedang: { label: 'Sedang', kelas: 'badge--info', Ikon: Equal },
  rendah: { label: 'Rendah', kelas: 'badge--netral', Ikon: ChevronDown },
}

const STATUS = {
  aktif: { label: 'Aktif', kelas: 'badge--info', Ikon: Clock },
  terlambat: { label: 'Terlambat', kelas: 'badge--bahaya', Ikon: CircleExclamationPoint },
  selesai: { label: 'Selesai', kelas: 'badge--sukses', Ikon: CircleCheck },
}

export function BadgePrioritas({ prioritas }) {
  const p = PRIORITAS[prioritas] ?? PRIORITAS.sedang
  return (
    <span className={`badge ${p.kelas}`}>
      <p.Ikon size={14} aria-hidden="true" />
      <span className="sr-only">Prioritas </span>
      {p.label}
    </span>
  )
}

export function BadgeStatus({ status }) {
  const s = STATUS[status] ?? STATUS.aktif
  return (
    <span className={`badge ${s.kelas}`}>
      <s.Ikon size={14} aria-hidden="true" />
      {s.label}
    </span>
  )
}
