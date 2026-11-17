import { useState } from 'react'
import { ArrowLeft, CalendarClock, CircleCheckBig, Clock, NotebookPen, Pencil, RotateCcw, SearchX, Trash } from 'lucide-react'
import { BadgePrioritas, BadgeStatus } from '../components/Badge'
import DialogKonfirmasi from '../components/DialogKonfirmasi'
import { KeadaanKosong, Memuat } from '../components/KeadaanKosong'
import { useToast } from '../components/Toast'
import { navigasi, useSekarang } from '../hooks/useRute'
import { useHapusTugas, useToggleSelesai, useTugas } from '../hooks/useTugas'
import { formatTanggalLengkap, kedesakan, statusTugas, teksTenggat } from '../utils/tanggal'

function TautanKembali() {
  return (
    <a href="#/tugas" className="tautan tautan--ikon tautan-kembali">
      <ArrowLeft size={16} aria-hidden="true" />
      Semua tugas
    </a>
  )
}

export default function DetailTugas({ id }) {
  const sekarang = useSekarang()
  const toast = useToast()
  const { tugas, loading, error } = useTugas(id)
  const toggle = useToggleSelesai()
  const hapus = useHapusTugas()
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false)

  if (loading) return <Memuat teks="Memuat tugas…" />

  if (error || !tugas) {
    return (
      <div className="halaman halaman--sempit">
        <TautanKembali />
        <KeadaanKosong
          Ikon={SearchX}
          judul="Tugas tidak ditemukan"
          aksi={<a href="#/tugas" className="btn btn--sekunder">Buka daftar tugas</a>}
        >
          {error ?? 'Tugas ini mungkin sudah dihapus.'}
        </KeadaanKosong>
      </div>
    )
  }

  const status = statusTugas(tugas, sekarang)
  const level = kedesakan(tugas, sekarang)

  const ubahSelesai = () =>
    toggle.mutate(
      { id: tugas.id, selesai: !tugas.selesai },
      {
        onSuccess: (t) => toast(t.selesai ? 'Tugas ditandai selesai.' : 'Tugas dikembalikan ke daftar aktif.'),
        onError: (err) => toast(err.message, { jenis: 'galat' }),
      },
    )

  const hapusTugas = async () => {
    try {
      await hapus.mutateAsync(tugas.id)
      setKonfirmasiHapus(false)
      toast('Tugas dihapus.')
      navigasi('/tugas', { ganti: true })
    } catch (err) {
      toast(err.message, { jenis: 'galat' })
    }
  }

  return (
    <div className="halaman halaman--sempit">
      <TautanKembali />

      <article className="kartu detail">
        <p className="overline teks-primer">{tugas.mataKuliah}</p>
        <h1 className="h2 detail-judul">{tugas.judul}</h1>
        <div className="baris-badge">
          <BadgeStatus status={status} />
          <BadgePrioritas prioritas={tugas.prioritas} />
        </div>

        <dl className="detail-info">
          <div>
            <dt>
              <CalendarClock size={20} aria-hidden="true" />
              Tenggat
            </dt>
            <dd>
              {formatTanggalLengkap(tugas.tenggat)}
              {!tugas.selesai && (
                <span className={`tenggat tenggat--${level} detail-relatif`}>{teksTenggat(tugas.tenggat, sekarang)}</span>
              )}
            </dd>
          </div>
          <div>
            <dt>
              <Clock size={20} aria-hidden="true" />
              Terakhir diubah
            </dt>
            <dd>{tugas.diubahPada ? formatTanggalLengkap(tugas.diubahPada) : '-'}</dd>
          </div>
        </dl>

        <section className="detail-catatan" aria-labelledby="judul-catatan">
          <h2 id="judul-catatan" className="label-kecil">
            <NotebookPen size={16} aria-hidden="true" />
            Catatan
          </h2>
          {tugas.catatan ? <p>{tugas.catatan}</p> : <p className="teks-subtle">Tidak ada catatan.</p>}
        </section>

        <div className="detail-aksi">
          <button type="button" className={`btn ${tugas.selesai ? 'btn--sekunder' : 'btn--primer'}`} onClick={ubahSelesai}>
            {tugas.selesai ? <RotateCcw size={16} aria-hidden="true" /> : <CircleCheckBig size={16} aria-hidden="true" />}
            {tugas.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
          </button>
          <a href={`#/tugas/${encodeURIComponent(tugas.id)}/ubah`} className="btn btn--sekunder">
            <Pencil size={16} aria-hidden="true" />
            Ubah
          </a>
          <button type="button" className="btn btn--garis-bahaya" onClick={() => setKonfirmasiHapus(true)}>
            <Trash size={16} aria-hidden="true" />
            Hapus
          </button>
        </div>
      </article>

      <DialogKonfirmasi
        buka={konfirmasiHapus}
        judul="Hapus tugas ini?"
        pesan={`"${tugas.judul}" akan dihapus permanen dan tidak bisa dikembalikan.`}
        labelKonfirmasi="Hapus tugas"
        memproses={hapus.isPending}
        onKonfirmasi={hapusTugas}
        onBatal={() => setKonfirmasiHapus(false)}
      />
    </div>
  )
}
