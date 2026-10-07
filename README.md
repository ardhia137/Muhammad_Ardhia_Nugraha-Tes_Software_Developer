# Dokumentasi — Aplikasi Manajemen Entity Geo-Lokasi

Aplikasi web monorepo untuk menampilkan dan mengelola entity berkoordinat (kendaraan, perangkat IoT, fasilitas) di atas peta. Dokumen ini menjelaskan cara menjalankan program, alasan pemilihan library, dan sejauh mana workflow Agentic AI dipakai pada pengerjaan test ini.

Referensi kebutuhan: [`PRD.md`](./PRD.md) dan panduan agent: [`AGENT.md`](./AGENT.md).

Link website yang sudah jalan : https://takehometest-len.ngodingin.my.id/

## Daftar isi

1. [Cara menjalankan program](#1-cara-menjalankan-program)
2. [Alasan pemilihan library](#2-alasan-pemilihan-library)
3. [Workflow penggunaan Agentic AI](#3-workflow-penggunaan-agentic-ai)

---

## 1. Cara menjalankan program

### 1.1 Prasyarat

| Kebutuhan | Versi yang dipakai |
|---|---|
| Go | 1.27+ |
| Node.js + npm | Node 24+, npm 11+ |
| MySQL | 8.0 (di proyek ini via **Laragon**, bukan Docker) |

Catatan: MySQL dijalankan lokal via **Laragon**. Backend murni dikonfigurasi lewat environment variable sehingga mudah dipindah ke DSN lain tanpa ubah kode.

### 1.2 Siapkan MySQL (Laragon)

1. Jalankan Laragon lalu **Start All** (atau start service MySQL saja) sehingga MySQL mendengarkan `127.0.0.1:3306`.
   - Default Laragon: user `root`, tanpa password, port `3306`.
2. Buat database (se Kali saja):

   ```sql
   CREATE DATABASE geo_entities CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   Bisa lewat HeidiSQL/phpMyAdmin bawaan Laragon, atau CLI:

   ```powershell
   & "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS geo_entities CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

3. Tabel `entities` **tidak perlu dibuat manual** — GORM `AutoMigrate` membuatnya otomatis saat backend pertama kali dijalankan.

### 1.3 Jalankan backend

```powershell
cd backend
go run .
```

- Server berjalan di `http://localhost:8080`.
- Backend menunggu MySQL siap: koneksi di-retry hingga 30 kali dengan jeda 2 detik.
- Build dan pemeriksaan statis: `go build ./...` dan `go vet ./...`.

**Di mana konfigurasi berada:**

| Yang ingin diubah | Lokasi | Cara |
|---|---|---|
| Koneksi MySQL & port backend | `backend/internal/config/config.go` | Nilai default ada di file ini; override lewat environment variable (tabel di bawah) |
| DSN penuh (mis. host/port berbeda) | `backend/internal/config/config.go` | Set env `DB_DSN` (menimpa seluruh pengaturan DB lain) |
| Target API dari frontend | `frontend/vite.config.ts` | Ubah `server.proxy["/api"].target` |
| Port dev server frontend | `frontend/vite.config.ts` | Ubah `server.port` (default `5173`) |
| URL dasar API di kode frontend | `frontend/src/api.ts` | Memakai path relatif `/api/v1`, jadi otomatis ikut proxy — tidak perlu diubah |

Konfigurasi backend seluruhnya lewat environment variable (semua opsional; default di `config.go` sudah cocok untuk Laragon, jadi tidak ada yang wajib diubah):

| Env | Default | Keterangan |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | Host MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_USER` | `root` | User MySQL |
| `DB_PASSWORD` | _(kosong)_ | Password MySQL |
| `DB_NAME` | `geo_entities` | Nama database |
| `DB_DSN` | _(kosong)_ | Jika diisi, menimpa seluruh konfigurasi DB di atas |
| `PORT` | `8080` | Port HTTP backend |

Contoh mengubahnya di PowerShell sebelum menjalankan backend:

```powershell
$env:DB_HOST = "127.0.0.1"
$env:DB_NAME = "geo_entities"
$env:PORT = "8080"
go run .
```

Atau langsung satu DSN penuh:

```powershell
$env:DB_DSN = "root:@tcp(127.0.0.1:3306)/geo_entities?charset=utf8mb4&parseTime=True&loc=Local"
go run .
```

### 1.4 Jalankan frontend

```powershell
cd frontend
npm install
npm run dev
```

- Buka `http://localhost:5173`.
- Vite mem-proxy semua request `/api` ke `http://localhost:8080` (lihat `frontend/vite.config.ts`), sehingga browser tidak kena masalah CORS dan tidak ada URL API yang di-hardcode. Jika port backend diubah, sesuaikan `server.proxy["/api"].target` di file tersebut.
- Build produksi + TypeScript check: `npm run build`.

### 1.5 Urutan singkat

1. Laragon **Start All** (MySQL jalan).
2. Buat database `geo_entities`.
3. `cd backend && go run .`
4. `cd frontend && npm install && npm run dev` → buka `http://localhost:5173`.

### 1.6 Endpoint API (base path `/api/v1`)

| Method | Path | Fungsi | Kode sukses |
|---|---|---|---|
| GET | `/entities` | Daftar entity; query opsional `q`, `status`, `type` | 200 |
| GET | `/entities/:id` | Detail entity | 200 |
| POST | `/entities` | Tambah entity | 201 |
| PUT | `/entities/:id` | Ubah entity | 200 |
| DELETE | `/entities/:id` | Hapus entity | 204 |

Error validasi memakai format `{"errors": {"<field>": "<pesan>"}}`; error lain memakai `{"error": "<pesan>"}` dengan kode `404` (tidak ditemukan) atau `500` (kesalahan server).

### 1.7 Struktur repo

```
backend/
  main.go                        # entry point, retry koneksi DB, AutoMigrate, register route
  internal/
    config/      config.go       # konfigurasi DB/HTTP dari environment
    model/       entity.go       # model GORM (enum, decimal) + tag JSON
    dto/         entity.go       # request DTO + tag validasi binding
    repository/  entity_repository.go   # satu-satunya layer yang memakai GORM
    service/     entity_service.go      # aturan bisnis
    handler/     entity_handler.go      # HTTP handler + routing
                 validation.go          # pemetaan error validator -> format errors
frontend/
  vite.config.ts                 # proxy /api -> :8080
  src/
    api.ts                       # HTTP client + parsing error backend
    hooks.ts                     # TanStack Query (list + mutation)
    validation.ts                # skema Zod identik dengan backend
    types.ts, status.ts          # tipe & label/warna status
    App.tsx                      # komposisi state & panel
    components/                  # MapView, Sidebar, DetailPanel, EntityFormPanel, ConfirmDialog
```

---

## 2. Alasan pemilihan library

### 2.1 Backend

| Library | Alasan |
|---|---|
| **Go + Gin** | Framework HTTP ringan dan cepat, cocok untuk REST API kecil. Fitur `binding` bawaan (berbasis `go-playground/validator`) memungkinkan validasi deklaratif lewat struct tag, persis kebutuhan PRD. |
| **GORM + `gorm.io/driver/mysql`** | ORM dengan `AutoMigrate` dari struct, sehingga skema `entities` (termasuk `enum` dan `decimal`) konsisten dan tidak perlu SQL migrasi manual. GORM **hanya dipakai di layer repository** sesuai batasan PRD, jadi layer service/handler tidak bergantung pada ORM. |
| **go-playground/validator** (via Gin) | Validasi `required`, `max`, `oneof`, `min/max` angka. Tag `oneof` cocok untuk enum `type` dan `status`. |
| **`go-sql-driver/mysql`** | Driver MySQL resmi yang dipakai GORM; mendukung `parseTime` agar `created_at`/`updated_at` terbaca sebagai waktu. |

Keputusan desain terkait:

- **Layering handler → service → repository** memisahkan transport (HTTP), aturan bisnis, dan akses data. Repository bisa diganti/di-mock tanpa menyentuh handler, dan GORM tidak bocor ke atas.
- **Koordinat `*float64`** (bukan `float64`) supaya nilai `0` tetap dianggap terisi. `required` pada pointer hanya gagal saat `null`/tidak dikirim, bukan saat bernilai `0` — memenuhi acceptance criteria "latitude/longitude 0 valid".
- **Tag `binding` ditaruh di DTO**, bukan di model, agar aturan validasi request terpisah dari skema database.
- **Retry koneksi + health ping** di `main.go` supaya backend tidak crash ketika MySQL (Laragon) belum siap dinyalakan.

### 2.2 Frontend

| Library | Alasan |
|---|---|
| **React + TypeScript** | Komponen UI yang terdekomposisi (sidebar, peta, panel) dan tipe statis yang ikut menjaga kesesuaian kontrak API. |
| **Vite** | Dev server cepat, dan fitur `server.proxy` menghilangkan kebutuhan konfigurasi CORS di backend serta menghindari hardcode base URL API. |
| **Leaflet + react-leaflet** | Peta open-source **tanpa API key** (berbeda dengan Google Maps), mendukung marker, popup, dan event klik peta — semua yang dibutuhkan PRD. `react-leaflet` menyediakan binding deklaratif ke React. |
| **TanStack Query** | Mengelola *server state*: caching daftar entity, status `loading`/`error`, dan invalidasi otomatis setelah create/update/delete sehingga peta & sidebar ikut ter-refresh tanpa reload. Menggantikan kebutuhan state global manual. |
| **React Hook Form** | Form uncontrolled yang ringan; integrasi langsung dengan resolver Zod dan menampilkan error per field. |
| **Zod** | Skema validasi TypeScript-first yang dipakai juga untuk meng-infer tipe form. Aturan dan pesan dibuat identik dengan validasi backend (`required` → "wajib diisi", rentang koordinat, enum, dsb.). |
| **@hookform/resolvers** | Menghubungkan skema Zod sebagai resolver validasi React Hook Form. |

Keputusan desain terkait:

- **Tanpa global state library** (Redux/Zustand): state yang bersifat UI lokal (filter, entity terpilih, mode panel) kecil dan cukup dengan `useState`; sisanya adalah server state yang sudah ditangani TanStack Query.
- **Error backend ditampilkan per field**: `ApiRequestError` mem-parsing `{"errors": {...}}` dari backend, lalu pesan dipasang ke field yang sesuai lewat `setError` — jadi pesan validasi server dan klien tampil seragam.
- **Pencarian di-debounce 300 ms** agar tidak membanjiri backend saat mengetik, sementara filter status/type langsung diterapkan.

---

## 3. Workflow penggunaan Agentic AI

### 3.1 Pembagian peran

Sesuai `AGENT.md`, pemilik repo menulis bagian inti: keputusan stack, desain API, skema database, aturan validasi, dan dokumentasi. Agent AI membantu bagian turunannya lalu hasilnya direview pemilik repo.

### 3.2 Yang dikerjakan agent

- **Scaffolding backend**: struktur folder berlapis, `go.mod`, dan pemasangan dependensi.
- **Implementasi backend**: model GORM, DTO + tag validasi, repository GORM, service, handler + routing, pemetaan error validasi ke format `{"errors": {...}}`, retry koneksi MySQL, `AutoMigrate`.
- **Setup database lokal**: membuat database `geo_entities` di MySQL Laragon.
- **Scaffolding & implementasi frontend**: struktur Vite React+TS, API client, hooks TanStack Query, skema Zod, dan seluruh komponen (peta, sidebar, detail panel, form tambah/ubah, dialog konfirmasi hapus, styling).
- **Verifikasi**: menjalankan `go build`/`go vet`, `tsc`/`vite build`, serta uji end-to-end dengan `curl` ke MySQL Laragon (create, list + filter, detail, update, delete, 404, dan respons `400` berformat `errors`).

### 3.3 Alur kerja

1. **Konteks**: agent membaca `AGENT.md` dan `PRD.md` sebagai sumber aturan dan acceptance criteria.
2. **Persiapan**: cek tooling (Go, Node, MySQL Laragon), buat database, scaffold modul.
3. **Implementasi bertahap** per lapisan (backend dulu, divalidasi lewat HTTP, baru frontend), mengikuti konvensi yang sudah ditetapkan pemilik repo.
4. **Verifikasi otomatis + manual** setiap tahap sebelum lanjut; error diperbaiki lalu diulang.
5. **Review pemilik repo** atas hasil agent, termasuk keputusan-keputusan yang berada di luar PRD.

### 3.4 Batasan

- Agent tidak mengubah keputusan inti (stack, desain API, skema DB, aturan validasi) tanpa arahan pemilik repo.
- **Unit test backend** sempat dibuat agent (validasi DTO + handler) untuk memverifikasi perilaku, namun atas permintaan pemilik repo test tersebut dihapus. `AGENT.md` dan `PRD.md` sudah disesuaikan: tidak ada unit test, verifikasi backend dilakukan lewat build, `go vet`, dan uji manual endpoint.
- Realtime/websocket berada di luar cakupan dan tidak dikerjakan.
