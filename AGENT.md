# AGENT.md

Panduan untuk agent AI yang membantu di repository ini.

## Proyek

Aplikasi untuk menampilkan dan mengelola entity yang memiliki lokasi geografis (misalnya kendaraan, perangkat IoT, fasilitas) di atas peta. Fitur utama: tampil di peta, tambah, ubah, hapus, dan lihat detail entity, dengan validasi input di frontend dan backend.

## Stack

- **Backend** (`/backend`): Go, Gin, GORM, MySQL 8
- **Frontend** (`/frontend`): React + TypeScript, Vite, Leaflet + react-leaflet, TanStack Query, React Hook Form + Zod
- **Infrastruktur**: MySQL lokal via Laragon; backend dan frontend dijalankan manual
- Struktur repo: monorepo dengan folder `backend/` dan `frontend/`

## Perintah

- Prasyarat: MySQL (Laragon) aktif dan database `geo_entities` sudah dibuat.
- Backend: `cd backend && go run .`
- Verifikasi backend: `cd backend && go build ./... && go vet ./...`
- Frontend dev: `cd frontend && npm run dev`

## Model data

Entity memakai primary key auto-increment `uint`. Field: `id`, `name`, `type` (vehicle/iot/facility), `status` (active/inactive/maintenance), `latitude`, `longitude`, `description`, `created_at`, `updated_at`.

## Konvensi

- Backend berlapis: handler → service → repository. GORM hanya dipakai di layer repository.
- Validasi backend memakai tag `binding` Gin. Koordinat memakai `*float64` agar nilai `0` tetap valid.
- Rentang koordinat: latitude -90..90, longitude -180..180.
- Aturan validasi di frontend (Zod) harus identik dengan backend.
- Format error validasi: `{"errors": {"<field>": "<pesan>"}}`.

## Pembagian peran

Pemilik repo menulis bagian inti (keputusan stack, desain API, skema DB, aturan validasi, README). Agent membantu bagian lainnya, seperti boilerplate, scaffolding, dan komponen UI, lalu hasilnya direview oleh pemilik repo.

## Aturan untuk agent

- Pastikan build dan vet lolos sebelum menyatakan pekerjaan selesai.

## Test

- Tidak ada unit test. Verifikasi backend dilakukan lewat `go build ./...`, `go vet ./...`, dan uji manual endpoint.

## Di luar cakupan

- Realtime / websocket
