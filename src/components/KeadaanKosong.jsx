import { LoaderCircle } from 'lucide-react'

/** Empty state: ikon 32px, judul, penjelasan, dan (opsional) satu aksi. */
export function KeadaanKosong({ Ikon, judul, children, aksi }) {
  return (
    <div className="kosong">
      {Ikon && (
        <span className="kosong-ikon" aria-hidden="true">
          <Ikon size={32} />
        </span>
      )}
      <h2 className="h4">{judul}</h2>
      {children && <p className="teks-muted">{children}</p>}
      {aksi}
    </div>
  )
}

export function Memuat({ teks = 'Memuat…' }) {
  return (
    <div className="memuat" role="status">
      <LoaderCircle size={24} className="putar" aria-hidden="true" />
      <span>{teks}</span>
    </div>
  )
}
