# 📚 Library Loan API (Layanan Pencatatan Peminjaman Buku Perpustakaan)

REST API sederhana, modern, dan andal untuk sistem pencatatan peminjaman buku perpustakaan. Dibangun menggunakan **Node.js**, **Express.js**, dan **Supabase (PostgreSQL)**, serta dirancang agar siap dideploy secara serverless ke **Vercel**.

---

## 🌐 Link Deployment Vercel

- **Production URL:** `https://library-loan-api-kiarawulan.vercel.app` *(atau URL Vercel hasil deployment proyek Anda)*
- **API Status & Root Documentation:** `GET /`
- **Loans Endpoint:** `GET /loans`

---

## 🎯 Deskripsi Umum & Tujuan Proyek

Proyek ini bertujuan menyediakan backend API yang terstruktur dan mudah diintegrasikan untuk kebutuhan administrasi perpustakaan, meliputi:
1. **Pencatatan Peminjaman Buku:** Memudahkan staf perpustakaan mencatat buku yang dipinjam oleh anggota.
2. **Pelacakan Status & Keterlambatan:** Memantau status peminjaman (`Dipinjam`, `Kembali`, `Terlambat`) melalui fitur filter query yang fleksibel.
3. **Manajemen Penuh (CRUD):** Memungkinkan staf membaca, menambah, mengubah, dan menghapus catatan peminjaman dengan validasi data yang ketat.
4. **Cloud-Native & Serverless:** Menggunakan Supabase sebagai database PostgreSQL di cloud dan Vercel sebagai hosting platform tanpa perlu memelihara server fisik.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/) (v5)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL Database)
- **Database Client:** `@supabase/supabase-js`
- **Deployment Platform:** [Vercel](https://vercel.com/) (Serverless Functions)
- **Utilitas:** `dotenv`, `cors`

---

## 🗄️ Struktur Data & Schema Database

API ini menggunakan tabel utama bernama `loans` pada Supabase PostgreSQL:

### Definisi Kolom Tabel `loans`

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, otomatis di-generate (`gen_random_uuid()`) |
| `book_title` | `TEXT` | Judul buku yang dipinjam (Wajib / NOT NULL) |
| `member_name` | `TEXT` | Nama anggota perpustakaan yang meminjam (Wajib / NOT NULL) |
| `borrow_date` | `DATE` | Tanggal peminjaman (Format: `YYYY-MM-DD`, Default: `CURRENT_DATE`) |
| `due_date` | `DATE` | Tanggal jatuh tempo pengembalian (Format: `YYYY-MM-DD`, Wajib) |
| `status` | `TEXT` | Status peminjaman: `Dipinjam`, `Kembali`, `Terlambat` (Default: `Dipinjam`) |
| `created_at` | `TIMESTAMPTZ`| Waktu data dibuat dalam UTC (Default: `now()`) |

### Skrip SQL DDL (Supabase)

Anda dapat menjalankan skrip berikut di menu **SQL Editor** pada Dashboard Supabase (file juga tersedia di [`database.sql`](./database.sql)):

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

-- 2. Nonaktifkan RLS agar REST API dapat melakukan operasi CRUD secara penuh
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
```

> **Catatan Penting Row Level Security (RLS):**  
> Supabase mengaktifkan RLS secara default pada setiap tabel baru. Agar API publik/anonim dapat melakukan operasi **INSERT, UPDATE, dan DELETE**, Anda wajib menonaktifkan RLS (`ALTER TABLE loans DISABLE ROW LEVEL SECURITY;`) atau menambahkan policy `FOR ALL TO anon USING (true) WITH CHECK (true);`.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- Pastikan telah menginstal [Node.js](https://nodejs.org/) (versi 18 atau lebih baru) dan npm.
- Memiliki akun [Supabase](https://supabase.com/) dengan project aktif.

### 2. Kloning Repository
```bash
git clone https://github.com/Kiarawulan/library-loan-api.git
cd library-loan-api
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variable
Buat file `.env` di root direktori proyek (salin dari `.env.example`):

```bash
cp .env.example .env
```

Isi variabel berikut:
```env
SUPABASE_URL=https://vgizetmhfdmfqjrcchdm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

### 5. Menjalankan Server Lokal
Jalankan server Express:
```bash
npm run dev
# atau
npm start
```

Server akan aktif pada:
```
🚀 Server perpustakaan berjalan di http://localhost:3000
📚 Endpoint Loans: http://localhost:3000/loans
```

---

## 📖 Dokumentasi Endpoint & Contoh Request / Response

Semua response dikembalikan dalam format standard JSON.

### 1. Root
- **Method:** `GET`
- **URL:** `/`
- **Response (200 OK):**
```json
{
  "message": "Library Loan API is running"
}
```

---

### 2. Mendapatkan Semua Data Peminjaman (Filter: ?status=Terlambat)
- **Method:** `GET`
- **URL:** `/loans?status=Terlambat`

#### Contoh Response (200 OK):
```json
[
  {
    "id": "e30e12d3-a456-4266-9e6b-001234567890",
    "book_title": "Laskar Pelangi",
    "member_name": "Ahmad Fauzi",
    "borrow_date": "2026-09-10",
    "due_date": "2026-09-24",
    "status": "Terlambat",
    "created_at": "2026-09-10T08:30:00.000Z"
  }
]
```

---

### 3. Mendapatkan Detail Peminjaman Berdasarkan ID
- **Method:** `GET`
- **URL:** `/loans/:id`

#### Contoh Response (200 OK):
```json
{
  "id": "e30e12d3-a456-4266-9e6b-001234567890",
  "book_title": "Laskar Pelangi",
  "member_name": "Ahmad Fauzi",
  "borrow_date": "2026-09-10",
  "due_date": "2026-09-24",
  "status": "Terlambat",
  "created_at": "2026-09-10T08:30:00.000Z"
}
```

#### Response jika tidak ditemukan (404 Not Found):
```json
{
  "message": "Data tidak ditemukan"
}
```

---

### 4. Menambahkan Catatan Peminjaman Buku Baru (Create)
- **Method:** `POST`
- **URL:** `/loans`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "book_title": "Bumi Manusia",
  "member_name": "Siti Aminah",
  "borrow_date": "2026-10-10",
  "due_date": "2026-10-24",
  "status": "Dipinjam"
}
```
*Catatan: `borrow_date` bersifat opsional (default: tanggal saat request dibuat). `status` bersifat opsional (default: `"Dipinjam"`).*

#### Contoh Request:
```bash
curl -X POST "http://localhost:3000/loans" \
  -H "Content-Type: application/json" \
  -d '{
    "book_title": "Bumi Manusia",
    "member_name": "Siti Aminah",
    "due_date": "2026-10-24"
  }'
```

#### Contoh Response (201 Created):
```json
{
  "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "book_title": "Bumi Manusia",
  "member_name": "Siti Aminah",
  "borrow_date": "2026-10-10",
  "due_date": "2026-10-24",
  "status": "Dipinjam",
  "created_at": "2026-10-10T09:20:00.000Z"
}
```

---

### 5. Memperbarui Data Peminjaman (Update)
- **Method:** `PUT` atau `PATCH`
- **URL:** `/loans/:id`
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "status": "Kembali"
}
```

#### Contoh Response (200 OK):
```json
{
  "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "book_title": "Bumi Manusia",
  "member_name": "Siti Aminah",
  "borrow_date": "2026-10-10",
  "due_date": "2026-10-24",
  "status": "Kembali",
  "created_at": "2026-10-10T09:20:00.000Z"
}
```

---

### 6. Menghapus Data Peminjaman (Delete)
- **Method:** `DELETE`
- **URL:** `/loans/:id`

#### Contoh Response (200 OK):
```json
{
  "message": "Data berhasil dihapus"
}
```

---

## ☁️ Panduan Deployment ke Vercel

Aplikasi ini telah dikonfigurasi dengan file [`vercel.json`](./vercel.json) dan adapter serverless di [`api/index.js`](./api/index.js), sehingga dapat dideploy ke Vercel secara instan.

### Cara 1: Deploy Melalui Vercel Dashboard (Rekomendasi)
1. **Push source code ke GitHub Repository:**
   ```bash
   git add .
   git commit -m "feat: initial library loan rest api"
   git branch -M main
   git remote add origin https://github.com/Kiarawulan/library-loan-api.git
   git push -u origin main
   ```
2. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **"Add New"** > **"Project"**.
3. Pilih repository `library-loan-api` dari GitHub Anda.
4. Pada bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL`: `https://vgizetmhfdmfqjrcchdm.supabase.co`
   - `SUPABASE_ANON_KEY`: *[Anon Key Supabase Anda]*
5. Klik **"Deploy"**. Vercel akan otomatis melakukan proses build dan memberikan URL publik.

### Cara 2: Deploy Melalui Vercel CLI
1. Jalankan perintah login:
   ```bash
   npx vercel login
   ```
2. Deploy ke lingkungan production:
   ```bash
   npx vercel --prod
   ```
3. Set environment variables di Vercel:
   ```bash
   npx vercel env add SUPABASE_URL
   npx vercel env add SUPABASE_ANON_KEY
   ```

---

## 📁 Struktur Direktori Proyek

```
library-loan-api/
├── api/
│   └── index.js              # Entry point serverless function untuk Vercel
├── src/
│   ├── config/
│   │   └── supabase.js       # Inisialisasi koneksi client Supabase
│   ├── controllers/
│   │   └── loanController.js # Logika CRUD dan filter peminjaman buku
│   ├── middlewares/
│   │   └── errorHandler.js   # Middleware penanganan error 404 & 500
│   ├── routes/
│   │   └── loanRoutes.js     # Definisi routing endpoint /loans
│   └── app.js                # Konfigurasi Express, middleware, & root route
├── .env                      # Variabel lingkungan lokal (diabaikan oleh git)
├── .env.example              # Template variabel lingkungan
├── .gitignore                # File & direktori yang diabaikan git
├── database.sql              # Skrip SQL skema tabel & data sampel
├── package.json              # Definisi dependensi & skrip npm
├── server.js                 # Entry point untuk menjalankan server lokal
├── vercel.json               # Konfigurasi rewrite routing serverless Vercel
└── README.md                 # Dokumentasi komprehensif proyek
```

---

## 📝 Lisensi
Proyek ini dibuat untuk keperluan pengujian dan pembelajaran di bawah lisensi [ISC](https://opensource.org/licenses/ISC).
