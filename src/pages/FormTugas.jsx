import { useId, useRef, useState } from 'react'
import { ArrowLeft, Save, SearchX } from 'lucide-react'
import { KeadaanKosong, Memuat } from '../components/KeadaanKosong'
import { useToast } from '../components/Toast'
import { PRIORITAS, SARAN_MATA_KULIAH } from '../data/tugas'
import { navigasi } from '../hooks/useRute'
import { useDaftarTugas, useSimpanTugas, useTugas } from '../hooks/useTugas'
import { BATAS_CATATAN, BATAS_JUDUL, validasiTugas } from '../services/tugasService'
import { dariNilaiInput, keNilaiInput, tanggalDariHariLagi } from '../utils/tanggal'

const URUTAN_FIELD = ['judul', 'mataKuliah', 'tenggat', 'prioritas', 'catatan']

/** Satu field form: label, kontrol, hint/pesan error yang terhubung lewat aria. */
function Field({ id, label, hint, error, opsional, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id} className="label">
        {label}
        {opsional && <span className="teks-subtle"> (opsional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-pesan`} className="field-error">{error}</p>
      ) : (
        hint && <p id={`${id}-pesan`} className="field-hint">{hint}</p>
      )}
    </div>
  )
}

function IsiForm({ awal }) {
  const modeUbah = Boolean(awal)
  const toast = useToast()
  const simpan = useSimpanTugas()
  const { tugas: semuaTugas } = useDaftarTugas()
  const idDatalist = useId()

  const [nilai, setNilai] = useState(() => ({
    judul: awal?.judul ?? '',
    mataKuliah: awal?.mataKuliah ?? '',
    tenggat: keNilaiInput(awal?.tenggat ?? tanggalDariHariLagi(1, '23:59')),
    prioritas: awal?.prioritas ?? 'sedang',
    catatan: awal?.catatan ?? '',
    selesai: awal?.selesai ?? false,
  }))
  const [errors, setErrors] = useState({})
  const [sudahDicoba, setSudahDicoba] = useState(false)
  const refs = {
    judul: useRef(null),
    mataKuliah: useRef(null),
    tenggat: useRef(null),
    prioritas: useRef(null),
    catatan: useRef(null),
  }

  const saranMatkul = [...new Set([...SARAN_MATA_KULIAH, ...semuaTugas.map((t) => t.mataKuliah)])].filter(Boolean)
  const keData = (n) => ({
    judul: n.judul,
    mataKuliah: n.mataKuliah,
    tenggat: dariNilaiInput(n.tenggat),
    prioritas: n.prioritas,
    catatan: n.catatan,
    ...(modeUbah ? { selesai: n.selesai } : {}),
  })

  const ubah = (field, v) => {
    const baru = { ...nilai, [field]: v }
    setNilai(baru)
    // Setelah tombol simpan pernah ditekan, pesan error ikut diperbarui saat mengetik.
    if (sudahDicoba) setErrors(validasiTugas(keData(baru)))
  }

  const kirim = async (e) => {
    e.preventDefault()
    setSudahDicoba(true)
    const data = keData(nilai)
    const errs = validasiTugas(data)
    setErrors(errs)
    const pertama = URUTAN_FIELD.find((f) => errs[f])
    if (pertama) {
      refs[pertama].current?.focus()
      return
    }
    try {
      const hasil = await simpan.mutateAsync({ id: awal?.id, data })
      toast(modeUbah ? 'Perubahan disimpan.' : 'Tugas baru ditambahkan.')
      navigasi(`/tugas/${encodeURIComponent(hasil.id)}`, { ganti: true })
    } catch (err) {
      toast(err.message, { jenis: 'galat' })
    }
  }

  const ariaField = (field) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': `f-${field}-pesan`,
  })
  const batalHref = modeUbah ? `#/tugas/${encodeURIComponent(awal.id)}` : '#/tugas'

  return (
    <div className="halaman halaman--sempit">
      <a href={batalHref} className="tautan tautan--ikon tautan-kembali">
        <ArrowLeft size={16} aria-hidden="true" />
        {modeUbah ? 'Kembali ke detail' : 'Semua tugas'}
      </a>

      <div className="kepala-halaman">
        <div>
          <h1 className="h1">{modeUbah ? 'Ubah tugas' : 'Tambah tugas'}</h1>
          <p className="teks-muted">
            {modeUbah ? 'Perbarui detail tugas lalu simpan.' : 'Catat tugas baru beserta tenggatnya.'}
          </p>
        </div>
      </div>

      <form className="kartu form" onSubmit={kirim} noValidate>
        <Field
          id="f-judul"
          label="Judul tugas"
          error={errors.judul}
          hint={`${nilai.judul.trim().length}/${BATAS_JUDUL} karakter`}
        >
          <input
            ref={refs.judul}
            id="f-judul"
            className="input"
            value={nilai.judul}
            onChange={(e) => ubah('judul', e.target.value)}
            placeholder="Contoh: Laporan praktikum Modul 5"
            maxLength={BATAS_JUDUL + 20}
            autoComplete="off"
            {...ariaField('judul')}
          />
        </Field>

        <Field id="f-mataKuliah" label="Mata kuliah" error={errors.mataKuliah} hint="Pilih dari saran atau ketik sendiri.">
          <input
            ref={refs.mataKuliah}
            id="f-mataKuliah"
            className="input"
            list={idDatalist}
            value={nilai.mataKuliah}
            onChange={(e) => ubah('mataKuliah', e.target.value)}
            placeholder="Contoh: Praktikum PPB"
            autoComplete="off"
            {...ariaField('mataKuliah')}
          />
          <datalist id={idDatalist}>
            {saranMatkul.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>

        <Field id="f-tenggat" label="Tenggat" error={errors.tenggat} hint="Tanggal dan jam pengumpulan.">
          <input
            ref={refs.tenggat}
            id="f-tenggat"
            type="datetime-local"
            className="input"
            value={nilai.tenggat}
            onChange={(e) => ubah('tenggat', e.target.value)}
            {...ariaField('tenggat')}
          />
        </Field>

        <fieldset className={`field${errors.prioritas ? ' field--error' : ''}`} aria-describedby="f-prioritas-pesan">
          <legend className="label">Prioritas</legend>
          <div className="segmen" ref={refs.prioritas} tabIndex={-1}>
            {PRIORITAS.map((p) => (
              <label key={p.value} className="segmen-opsi">
                <input
                  type="radio"
                  name="prioritas"
                  value={p.value}
                  checked={nilai.prioritas === p.value}
                  onChange={() => ubah('prioritas', p.value)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
          {errors.prioritas && <p id="f-prioritas-pesan" className="field-error">{errors.prioritas}</p>}
        </fieldset>

        <Field
          id="f-catatan"
          label="Catatan"
          opsional
          error={errors.catatan}
          hint={`${nilai.catatan.length}/${BATAS_CATATAN} karakter`}
        >
          <textarea
            ref={refs.catatan}
            id="f-catatan"
            className="input textarea"
            rows={4}
            value={nilai.catatan}
            onChange={(e) => ubah('catatan', e.target.value)}
            placeholder="Format pengumpulan, bab yang dikerjakan, atau link materi."
            {...ariaField('catatan')}
          />
        </Field>

        {modeUbah && (
          <label className="checkbox">
            <input type="checkbox" checked={nilai.selesai} onChange={(e) => ubah('selesai', e.target.checked)} />
            <span>Tugas ini sudah selesai</span>
          </label>
        )}

        <div className="form-aksi">
          <a href={batalHref} className="btn btn--sekunder">Batal</a>
          <button type="submit" className="btn btn--primer" disabled={simpan.isPending}>
            <Save size={16} aria-hidden="true" />
            {simpan.isPending ? 'Menyimpan…' : modeUbah ? 'Simpan perubahan' : 'Simpan tugas'}
          </button>
        </div>
      </form>
    </div>
  )
}

/** CREATE (tanpa id) dan UPDATE (dengan id) memakai form yang sama. */
export default function FormTugas({ id }) {
  const { tugas, loading, error } = useTugas(id)

  if (!id) return <IsiForm />
  if (loading) return <Memuat teks="Memuat tugas…" />
  if (error || !tugas) {
    return (
      <div className="halaman halaman--sempit">
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
  return <IsiForm key={tugas.id} awal={tugas} />
}
