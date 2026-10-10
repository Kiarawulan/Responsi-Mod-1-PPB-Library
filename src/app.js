require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loanRoutes = require('./routes/loanRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Endpoint - Dokumentasi Ringkas & Info Status API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Library Book Loan REST API',
    description: 'REST API sederhana untuk layanan pencatatan peminjaman buku perpustakaan',
    status: 'online',
    version: '1.0.0',
    documentation: {
      endpoints: [
        {
          method: 'GET',
          path: '/loans (atau /api/loans)',
          description: 'Mendapatkan semua riwayat peminjaman buku dengan opsi filter dan sorting',
          query_parameters: {
            status: 'Filter status (contoh: ?status=Terlambat, ?status=Dipinjam, ?status=Kembali)',
            member_name: 'Pencarian nama anggota (contoh: ?member_name=Budi)',
            book_title: 'Pencarian judul buku (contoh: ?book_title=Laskar)',
            sortBy: 'Kolom pengurutan (created_at, due_date, status, member_name, book_title)',
            order: 'Arah pengurutan (asc atau desc)',
            page: 'Halaman data (contoh: ?page=1)',
            limit: 'Jumlah data per halaman (contoh: ?limit=10)'
          }
        },
        {
          method: 'GET',
          path: '/loans/:id',
          description: 'Mendapatkan detail peminjaman berdasarkan UUID'
        },
        {
          method: 'POST',
          path: '/loans',
          description: 'Menambahkan data peminjaman buku baru',
          body: {
            book_title: 'string (wajib)',
            member_name: 'string (wajib)',
            due_date: 'YYYY-MM-DD (wajib)',
            borrow_date: 'YYYY-MM-DD (opsional, default: tanggal hari ini)',
            status: 'string (opsional, default: "Dipinjam")'
          }
        },
        {
          method: 'PUT / PATCH',
          path: '/loans/:id',
          description: 'Memperbarui data peminjaman buku berdasarkan ID'
        },
        {
          method: 'DELETE',
          path: '/loans/:id',
          description: 'Menghapus data peminjaman buku berdasarkan ID'
        }
      ]
    }
  });
});

// Endpoint Routes (mendukung /loans dan /api/loans)
app.use('/loans', loanRoutes);
app.use('/api/loans', loanRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
