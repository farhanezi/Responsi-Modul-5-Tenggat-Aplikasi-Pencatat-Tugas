# Tenggat — Pencatat Tugas Kuliah (PWA)

Responsi Modul 5 Praktikum Pemrograman Perangkat Bergerak.
Farhan Fahrezi · 21120124130092 · Kelompok 8

Tenggat adalah Progressive Web App untuk mencatat tugas kuliah, memantau tenggatnya, dan menandai yang sudah selesai. Aplikasi bisa di-install ke HP/laptop dan tetap berjalan tanpa internet.

## Pemenuhan syarat responsi

| Syarat | Implementasi |
| --- | --- |
| Minimal 3 halaman yang bisa dinavigasi | **Beranda** (`#/`), **Tugas** (`#/tugas`), **Profil** (`#/profil`), ditambah Detail (`#/tugas/:id`) dan Form (`#/tugas/baru`, `#/tugas/:id/ubah`). Navigasi bawah di HP, navbar di desktop. |
| Halaman profil berisi nama, NIM, kelompok | `src/pages/Profil.jsx`, datanya di `src/data/profil.js`. |
| Minimal satu halaman CRUD fungsional | Halaman Tugas: **Create** (form tambah), **Read** (daftar + detail, dengan cari, filter, urut), **Update** (form ubah + tandai selesai), **Delete** (dengan dialog konfirmasi). Logika di `src/services/tugasService.js`. |
| PWA bisa di-install dan bekerja offline | `vite-plugin-pwa`: manifest + ikon (termasuk maskable), service worker Workbox yang menyimpan semua file aplikasi dan font. Data disimpan di perangkat, jadi tambah/ubah/hapus tetap jalan saat offline. |
| Deploy ke Vercel | Lihat bagian Deploy di bawah. |

## Teknologi (sama dengan modul praktikum)

React 19 + Vite, `vite-plugin-pwa` (Workbox), TanStack Query, axios, lucide-react. Tampilan memakai sistem desain **Samudra** (biru royal, aksen amber, Plus Jakarta Sans, pola ombak) dengan tema terang dan gelap.

## Menjalankan di laptop

```bash
npm install
npm run dev        # mode pengembangan, http://localhost:5173
npm run build      # build produksi ke folder dist/
npm run preview    # coba hasil build (service worker aktif), http://localhost:4173
```

## Penyimpanan data

- **Mode lokal (default).** Data awal ada di `src/data/tugas.js`, lalu setiap perubahan disimpan di `localStorage` browser. Tidak perlu server, dan CRUD tetap jalan saat offline.
- **Mode API (opsional).** Isi `VITE_API_BASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` (lihat `.env.example`) lalu jalankan `supabase/schema.sql` di Supabase. Service yang sama otomatis beralih ke API tanpa mengubah halaman.

## Deploy ke Vercel

**Cara A — lewat GitHub (disarankan)**

1. Buat repository baru di GitHub, lalu dari folder ini:
   ```bash
   git init
   git add .
   git commit -m "Responsi Modul 5: Tenggat PWA"
   git branch -M main
   git remote add origin https://github.com/<username>/<nama-repo>.git
   git push -u origin main
   ```
2. Buka https://vercel.com/new, pilih repository tersebut. Vercel otomatis mendeteksi **Vite** (build `npm run build`, output `dist`). Klik **Deploy**.

**Cara B — lewat Vercel CLI**

```bash
npx vercel login
npx vercel --prod
```

Setelah deploy, buka link Vercel di Chrome HP: menu ⋮ → **Install aplikasi** / **Tambahkan ke layar utama**. Untuk menguji offline, buka aplikasi sekali saat online, lalu nyalakan mode pesawat dan buka lagi.

## Struktur folder

```
src/
  config/api.js            axios + mode lokal/API
  data/                    data profil & data awal tugas
  services/tugasService.js CRUD (localStorage atau Supabase)
  hooks/                   useTugas (TanStack Query), useRute (router hash), usePWA, useTema
  components/              navigasi, kartu tugas, badge, dialog, toast, banner PWA
  pages/                   Beranda, DaftarTugas, DetailTugas, FormTugas, Profil
  styles/                  token Samudra + gaya aplikasi
public/                    ikon PWA (dibuat dari favicon.svg lewat npm run generate-pwa-assets)
```
