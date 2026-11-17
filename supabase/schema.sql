-- ===========================================================================
-- Tenggat — skema database (OPSIONAL, untuk mode API Supabase)
--
-- Aplikasi sudah berjalan tanpa file ini (mode lokal: localStorage).
-- Pakai hanya bila ingin data tersimpan di server:
--   1. Buat project di https://supabase.com, buka SQL Editor -> New query,
--      tempel seluruh isi file ini, lalu Run.
--   2. Isi .env (dan Environment Variables di Vercel):
--        VITE_API_BASE_URL=https://<project>.supabase.co
--        VITE_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
--   3. Build ulang. tugasService.js otomatis memakai tabel public.tugas.
--
-- Script ini aman dijalankan ulang (idempotent).
-- ===========================================================================

create table if not exists public.tugas (
  id          uuid        primary key default gen_random_uuid(),
  judul       text        not null check (char_length(judul) between 3 and 80),
  mata_kuliah text        not null check (char_length(mata_kuliah) > 0),
  tenggat     timestamptz not null,
  prioritas   text        not null default 'sedang' check (prioritas in ('rendah', 'sedang', 'tinggi')),
  catatan     text        not null default '' check (char_length(catatan) <= 500),
  selesai     boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tugas_tenggat_idx on public.tugas (tenggat);

-- Akses publik (tanpa login), sama seperti pola modul praktikum.
alter table public.tugas enable row level security;

drop policy if exists "tugas_select_publik" on public.tugas;
drop policy if exists "tugas_insert_publik" on public.tugas;
drop policy if exists "tugas_update_publik" on public.tugas;
drop policy if exists "tugas_delete_publik" on public.tugas;

create policy "tugas_select_publik" on public.tugas for select using (true);
create policy "tugas_insert_publik" on public.tugas for insert with check (true);
create policy "tugas_update_publik" on public.tugas for update using (true) with check (true);
create policy "tugas_delete_publik" on public.tugas for delete using (true);
