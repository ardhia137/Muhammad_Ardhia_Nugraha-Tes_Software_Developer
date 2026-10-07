# PRD: Aplikasi Manajemen Entity Geo-Lokasi

## 1. Ringkasan

Aplikasi web untuk menampilkan dan mengelola entity yang memiliki lokasi geografis di atas peta. Entity dapat merepresentasikan objek dunia nyata seperti kendaraan, perangkat IoT, atau fasilitas. Setiap entity memiliki identitas, atribut dasar, status, dan koordinat.

## 2. Tujuan

- Menampilkan seluruh entity sebagai marker di peta.
- Mengelola entity (tambah, ubah, hapus) langsung dari aplikasi.
- Menampilkan detail entity dengan cepat tanpa meninggalkan peta.
- Menjamin kualitas data lewat validasi di frontend dan backend.

## 3. Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React + TypeScript, Vite, Leaflet + react-leaflet, TanStack Query, React Hook Form + Zod |
| Backend | Go, Gin, GORM |
| Database | MySQL 8 |
| Infrastruktur | MySQL lokal via Laragon (backend dan frontend dijalankan manual) |

Repo berbentuk monorepo: `/backend` dan `/frontend`.

## 4. Pengguna dan User Story

Pengguna tunggal: operator yang memantau dan mengelola entity (tanpa autentikasi).

- Sebagai operator, saya ingin melihat semua entity di peta agar tahu posisinya.
- Sebagai operator, saya ingin melihat warna marker sesuai status agar bisa mengenali kondisi entity sekilas.
- Sebagai operator, saya ingin klik marker untuk melihat ringkasan, dan membuka detail lengkap di side panel.
- Sebagai operator, saya ingin menambah entity dengan klik di peta atau mengisi koordinat manual.
- Sebagai operator, saya ingin mengubah data entity (termasuk lokasi) lewat form edit.
- Sebagai operator, saya ingin menghapus entity yang sudah tidak diperlukan.
- Sebagai operator, saya ingin mencari entity berdasarkan nama dan memfilter berdasarkan status atau type.
- Sebagai operator, saya ingin melihat daftar entity di sidebar agar mudah menemukan dan memilihnya.
- Sebagai operator, saya ingin mendapat pesan error yang jelas saat input tidak valid.

## 5. Model Data

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | uint, auto-increment | Primary key |
| `name` | string (maks 100) | Wajib |
| `type` | enum | `vehicle`, `iot`, `facility` |
| `status` | enum | `active`, `inactive`, `maintenance` |
| `latitude` | decimal(10,7) | Wajib, -90 sampai 90 |
| `longitude` | decimal(11,7) | Wajib, -180 sampai 180 |
| `description` | string | Opsional |
| `created_at` | timestamp | Diisi otomatis |
| `updated_at` | timestamp | Diisi otomatis |

## 6. Fitur Fungsional

### F1. Tampilan peta dan marker
- Semua entity ditampilkan sebagai marker di peta Leaflet.
- Warna marker mengikuti status (active, inactive, maintenance).
- Peta dapat di-zoom dan di-pan.

### F2. Detail entity
- Klik marker membuka popup ringkas (nama, type, status).
- Popup memiliki aksi untuk membuka side panel berisi detail lengkap (semua field, termasuk koordinat dan waktu dibuat/diubah) serta tombol edit dan hapus.

### F3. Tambah entity
- Pengguna dapat mengklik titik di peta, dan koordinat terisi otomatis di form.
- Pengguna juga dapat mengisi latitude dan longitude secara manual.
- Setelah berhasil, marker baru langsung muncul di peta.

### F4. Ubah entity
- Semua field, termasuk lokasi, diubah lewat form edit.
- Perpindahan marker (drag) tidak termasuk cakupan.

### F5. Hapus entity
- Penghapusan meminta konfirmasi sebelum dijalankan.
- Setelah berhasil, marker dan item sidebar hilang.

### F6. Sidebar, pencarian, dan filter
- Sidebar menampilkan daftar entity.
- Pencarian berdasarkan nama (substring, tidak peka huruf besar/kecil).
- Filter berdasarkan status dan type; dapat dikombinasikan dengan pencarian.
- Memilih item di sidebar menyorot marker dan membuka detailnya.

### F7. Validasi
- Frontend (Zod + React Hook Form): pesan error tampil per field sebelum request dikirim.
- Backend (binding tag Gin): validasi ulang semua input, tidak mengandalkan frontend.
- Aturan di frontend dan backend harus identik.

## 7. Aturan Validasi

| Field | Aturan |
|---|---|
| `name` | Wajib, 1 sampai 100 karakter |
| `type` | Wajib, salah satu dari `vehicle`, `iot`, `facility` |
| `status` | Wajib, salah satu dari `active`, `inactive`, `maintenance` |
| `latitude` | Wajib, angka, -90 sampai 90 (nilai 0 valid) |
| `longitude` | Wajib, angka, -180 sampai 180 (nilai 0 valid) |
| `description` | Opsional, maks 500 karakter |

## 8. Desain API

Base path: `/api/v1`

| Method | Path | Fungsi |
|---|---|---|
| GET | `/entities` | Daftar entity. Query opsional: `q` (nama), `status`, `type` |
| GET | `/entities/:id` | Detail entity |
| POST | `/entities` | Tambah entity |
| PUT | `/entities/:id` | Ubah entity |
| DELETE | `/entities/:id` | Hapus entity |

Contoh body `POST` / `PUT`:
```json
{
  "name": "Truk 01",
  "type": "vehicle",
  "status": "active",
  "latitude": -6.9175,
  "longitude": 107.6191,
  "description": "Armada distribusi"
}
```

Kode respons:
- `200` sukses (GET, PUT), `201` sukses (POST), `204` sukses (DELETE)
- `400` validasi gagal, `404` entity tidak ditemukan, `500` kesalahan server

Format error validasi:
```json
{ "errors": { "latitude": "harus antara -90 dan 90" } }
```

## 9. Acceptance Criteria

1. Saat aplikasi dibuka, semua entity tersimpan tampil sebagai marker dengan warna sesuai status.
2. Klik marker membuka popup ringkas, dan side panel menampilkan semua field entity.
3. Klik titik di peta mengisi latitude dan longitude di form tambah; mengisi manual juga berfungsi.
4. Menyimpan entity valid menambah marker tanpa reload halaman.
5. Mengubah entity lewat form memperbarui marker, popup, dan side panel.
6. Menghapus entity setelah konfirmasi menghilangkan marker dan item sidebar; membatalkan konfirmasi tidak menghapus apa pun.
7. Input tidak valid (misalnya latitude 100, name kosong, status di luar enum) ditolak di frontend dengan pesan per field.
8. Request langsung ke API dengan data tidak valid dijawab `400` dengan format `errors` di atas.
9. Latitude atau longitude bernilai `0` diterima sebagai nilai valid.
10. Pencarian nama dan filter status/type menyaring marker dan daftar sidebar secara konsisten.
11. Menjalankan backend (`cd backend && go run .`) dan frontend (`cd frontend && npm run dev`) sesuai README menampilkan aplikasi yang terhubung ke MySQL, tanpa langkah manual lain selain menyiapkan database.

## 10. Non-Fungsional

- Backend berlapis: handler → service → repository; GORM hanya di layer repository.
- Backend menunggu MySQL siap (retry koneksi hingga 30 kali).
- Tidak ada unit test; verifikasi backend dilakukan lewat build, `go vet`, dan uji manual endpoint.

## 11. Di Luar Cakupan

- Realtime / websocket

## 12. Belum Diputuskan

- Pagination, marker clustering, dan autentikasi. Tentukan sebelum implementasi, lalu pindahkan ke "Di Luar Cakupan" atau jadikan fitur.
