import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import tugasService from '../services/tugasService'
import { tugasKeys } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// Hook data tugas (TanStack Query). Halaman cukup memanggil hook ini tanpa
// perlu tahu data berasal dari localStorage atau API.
// ---------------------------------------------------------------------------

const pesanError = (error, cadangan) => (error ? error.message || cadangan : null)

/** READ — daftar semua tugas. */
export function useDaftarTugas() {
  const query = useQuery({
    queryKey: tugasKeys.daftar,
    queryFn: () => tugasService.getAll(),
  })
  return {
    tugas: query.data ?? [],
    loading: query.isPending,
    error: pesanError(query.error, 'Daftar tugas gagal dimuat. Coba muat ulang halaman.'),
    refetch: query.refetch,
  }
}

/** READ — satu tugas. Memakai data dari daftar (bila sudah ada) supaya tampil instan. */
export function useTugas(id) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: tugasKeys.detail(id),
    queryFn: () => tugasService.getById(id),
    enabled: Boolean(id),
    retry: false,
    initialData: () => queryClient.getQueryData(tugasKeys.daftar)?.find((t) => t.id === id),
  })
  return {
    tugas: query.data ?? null,
    loading: query.isPending,
    error: pesanError(query.error, 'Tugas gagal dimuat.'),
  }
}

/** CREATE & UPDATE — `{ id?, data }`. Tanpa id = tugas baru. */
export function useSimpanTugas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => (id ? tugasService.update(id, data) : tugasService.create(data)),
    onSuccess: (tugas) => {
      queryClient.setQueryData(tugasKeys.detail(tugas.id), tugas)
      queryClient.invalidateQueries({ queryKey: tugasKeys.daftar })
    },
  })
}

/** UPDATE cepat — tandai selesai / belum, dengan pembaruan optimistis. */
export function useToggleSelesai() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, selesai }) => tugasService.update(id, { selesai }),
    onMutate: async ({ id, selesai }) => {
      await queryClient.cancelQueries({ queryKey: tugasKeys.semua })
      const daftarLama = queryClient.getQueryData(tugasKeys.daftar)
      const detailLama = queryClient.getQueryData(tugasKeys.detail(id))
      queryClient.setQueryData(tugasKeys.daftar, (lama) =>
        lama?.map((t) => (t.id === id ? { ...t, selesai } : t)),
      )
      if (detailLama) queryClient.setQueryData(tugasKeys.detail(id), { ...detailLama, selesai })
      return { daftarLama, detailLama }
    },
    onError: (_err, { id }, ctx) => {
      if (ctx?.daftarLama) queryClient.setQueryData(tugasKeys.daftar, ctx.daftarLama)
      if (ctx?.detailLama) queryClient.setQueryData(tugasKeys.detail(id), ctx.detailLama)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: tugasKeys.semua }),
  })
}

/** DELETE */
export function useHapusTugas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => tugasService.remove(id),
    onSuccess: (_hasil, id) => {
      queryClient.removeQueries({ queryKey: tugasKeys.detail(id) })
      queryClient.setQueryData(tugasKeys.daftar, (lama) => lama?.filter((t) => t.id !== id))
      queryClient.invalidateQueries({ queryKey: tugasKeys.daftar })
    },
  })
}

/** Kembalikan data contoh (mode lokal). */
export function useResetData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tugasService.resetDataAwal(),
    onSuccess: (daftar) => {
      queryClient.removeQueries({ queryKey: tugasKeys.semua })
      queryClient.setQueryData(tugasKeys.daftar, daftar)
    },
  })
}
