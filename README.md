# 📚 REST API Layanan Pencatatan Peminjaman Buku Perpustakaan
> **Responsi Modul 1 - Praktikum Pemrograman Bergerak (PPB)**

REST API sederhana, cepat, dan andal untuk sistem pencatatan peminjaman buku perpustakaan. Dibangun menggunakan **Node.js**, **Express.js**, dan database **Supabase (PostgreSQL)**, serta siap di-deploy secara serverless ke **Vercel**.

---

## 🔗 Tautan Pengumpulan (Output)

- **Link Repository GitHub:** [https://github.com/Kiarawulan/Responsi-Mod-1-PPB-Library](https://github.com/Kiarawulan/Responsi-Mod-1-PPB-Library)
- **Link Base URL Deployment Vercel:** [https://responsi-mod-1-ppb-library.vercel.app](https://responsi-mod-1-ppb-library.vercel.app) *(atau URL Vercel hasil deployment proyek Anda)*

---

## 🎯 1. Deskripsi Umum & Tujuan Proyek

Proyek ini dibangun untuk memenuhi ketentuan tugas Responsi Modul 1 PPB dengan fitur utama:
1. **Pencatatan Peminjaman Buku (Create):** Menambahkan data peminjaman baru oleh anggota perpustakaan.
2. **Pengambilan Data Peminjaman (Read):** Menampilkan seluruh data peminjaman atau detail berdasarkan ID peminjaman.
3. **Filter Query Status (Filter):** Fitur filter query status peminjaman (contoh: `GET /loans?status=Terlambat`, `?status=Dipinjam`, `?status=Kembali`).
4. **Pembaruan Data (Update):** Memperbarui data peminjaman (seperti mengubah status buku menjadi `Kembali` atau mengubah tanggal jatuh tempo).
5. **Penghapusan Data (Delete):** Menghapus catatan peminjaman berdasarkan ID.

---

## 🛠️ 2. Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL Cloud)
- **Database Client:** `@supabase/supabase-js`
- **Deployment:** [Vercel](https://vercel.com/) (Serverless Functions)

---

## 🗄️ 3. Struktur Data / Schema Database

Tabel utama yang digunakan bernama `loans` pada database PostgreSQL Supabase:

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, otomatis dibuat (`gen_random_uuid()`) |
| `book_title` | `TEXT` | Judul buku yang dipinjam (Wajib / NOT NULL) |
| `member_name` | `TEXT` | Nama anggota peminjam (Wajib / NOT NULL) |
| `borrow_date` | `DATE` | Tanggal pinjam (`YYYY-MM-DD`, Default: `CURRENT_DATE`) |
| `due_date` | `DATE` | Batas waktu pengembalian (`YYYY-MM-DD`, Wajib) |
| `status` | `TEXT` | Status (`Dipinjam`, `Kembali`, `Terlambat`, Default: `Dipinjam`) |
| `created_at` | `TIMESTAMPTZ`| Waktu pembuatan data (Default: `now()`) |

### Skrip SQL DDL & Data Awal (database.sql)

Jalankan query ini di **SQL Editor** Supabase Dashboard:

```sql
-- 1. Buat Tabel loans
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_title TEXT NOT NULL,
    member_name TEXT NOT NULL,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Dipinjam',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Nonaktifkan Row Level Security (RLS) agar API publik/anonim dapat melakukan CRUD
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;

-- 3. Data Awal Dummy untuk Pengujian
INSERT INTO loans (book_title, member_name, borrow_date, due_date, status)
VALUES
    ('Laskar Pelangi', 'Ahmad Fauzi', '2026-09-10', '2026-09-24', 'Terlambat'),
    ('Bumi Manusia', 'Siti Aminah', '2026-10-01', '2026-10-15', 'Dipinjam'),
    ('Filosofi Teras', 'Budi Santoso', '2026-09-20', '2026-10-04', 'Kembali'),
    ('Negeri 5 Menara', 'Dewi Lestari', '2026-08-15', '2026-08-29', 'Terlambat');
```

> **PENTING:** Pastikan perintah `ALTER TABLE loans DISABLE ROW LEVEL SECURITY;` dijalankan agar operasi `INSERT`, `UPDATE`, dan `DELETE` tidak dicegah oleh RLS Supabase.

---

## 📖 4. Contoh Request dan Response

### A. Root Endpoint (Cek Status API)
- **Method:** `GET`
- **URL:** `/`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Library Loan API is running"
}
```

---

### B. Mendapatkan Semua Data Peminjaman (Read)
- **Method:** `GET`
- **URL:** `/loans`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data peminjaman",
  "data": [
    {
      "id": "e30e12d3-a456-4266-9e6b-001234567890",
      "book_title": "Bumi Manusia",
      "member_name": "Siti Aminah",
      "borrow_date": "2026-10-01",
      "due_date": "2026-10-15",
      "status": "Dipinjam",
      "created_at": "2026-10-01T08:00:00.000Z"
    }
  ]
}
```

---

### C. Filter Query Berdasarkan Status (Fitur Utama)
- **Method:** `GET`
- **URL:** `/loans?status=Terlambat`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data peminjaman",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "book_title": "Laskar Pelangi",
      "member_name": "Ahmad Fauzi",
      "borrow_date": "2026-09-10",
      "due_date": "2026-09-24",
      "status": "Terlambat",
      "created_at": "2026-09-10T08:30:00.000Z"
    }
  ]
}
```

---

### D. Mendapatkan Detail Peminjaman Berdasarkan ID
- **Method:** `GET`
- **URL:** `/loans/:id`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil detail peminjaman",
  "data": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "book_title": "Laskar Pelangi",
    "member_name": "Ahmad Fauzi",
    "borrow_date": "2026-09-10",
    "due_date": "2026-09-24",
    "status": "Terlambat",
    "created_at": "2026-09-10T08:30:00.000Z"
  }
}
```

---

### E. Menambahkan Data Peminjaman Baru (Create)
- **Method:** `POST`
- **URL:** `/loans`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "book_title": "Atomic Habits",
  "member_name": "Rian Pratama",
  "borrow_date": "2026-10-10",
  "due_date": "2026-10-24",
  "status": "Dipinjam"
}
```
*(Catatan: `borrow_date` opsional, default hari ini. `status` opsional, default "Dipinjam".)*

- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Peminjaman buku berhasil dicatat",
  "data": {
    "id": "f8e7d6c5-b4a3-2109-8765-43210fedcba9",
    "book_title": "Atomic Habits",
    "member_name": "Rian Pratama",
    "borrow_date": "2026-10-10",
    "due_date": "2026-10-24",
    "status": "Dipinjam",
    "created_at": "2026-10-10T09:00:00.000Z"
  }
}
```

---

### F. Memperbarui Data Peminjaman (Update)
- **Method:** `PUT` atau `PATCH`
- **URL:** `/loans/:id`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "status": "Kembali"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Data peminjaman berhasil diperbarui",
  "data": {
    "id": "f8e7d6c5-b4a3-2109-8765-43210fedcba9",
    "book_title": "Atomic Habits",
    "member_name": "Rian Pratama",
    "borrow_date": "2026-10-10",
    "due_date": "2026-10-24",
    "status": "Kembali",
    "created_at": "2026-10-10T09:00:00.000Z"
  }
}
```

---

### G. Menghapus Data Peminjaman (Delete)
- **Method:** `DELETE`
- **URL:** `/loans/:id`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Data peminjaman berhasil dihapus"
}
```

---

## 💻 5. Panduan Instalasi & Cara Menjalankan Lokal

### 1. Clone Repository
```bash
git clone https://github.com/Kiarawulan/Responsi-Mod-1-PPB-Library.git
cd Responsi-Mod-1-PPB-Library
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable (.env)
Buat file `.env` di root folder dengan isi:
```env
SUPABASE_URL=https://vgizetmhfdmfqjrcchdm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaXpldG1oZmRtZnFqcmNjaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTkwNTcsImV4cCI6MjEwNzE5NTA1N30.8MQove7kjN9wM0I58KZ7_WxxdVM3TJa-PZpRVKd1ywg
PORT=3000
```

### 4. Menjalankan Server Lokal
```bash
npm run dev
# atau
npm start
```
Akses di browser / Postman: `http://localhost:3000/loans`

---

## ☁️ 6. Panduan Deployment ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/) dan login.
2. Klik tombol **"Add New"** > **"Project"**.
3. Pilih repository **`Responsi-Mod-1-PPB-Library`** dari akun GitHub Anda.
4. Buka tab **Environment Variables** dan tambahkan:
   - `SUPABASE_URL`: `https://vgizetmhfdmfqjrcchdm.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaXpldG1oZmRtZnFqcmNjaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTkwNTcsImV4cCI6MjEwNzE5NTA1N30.8MQove7kjN9wM0I58KZ7_WxxdVM3TJa-PZpRVKd1ywg`
5. Klik **"Deploy"**. Selesai! Vercel akan menghasilkan link Base URL yang dapat diakses publik.
