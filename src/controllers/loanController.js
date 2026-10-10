const supabase = require('../config/supabase');

// Regex validator untuk UUID v4 / PostgreSQL UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Regex validator untuk format tanggal YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (dateStr) => {
  if (!DATE_REGEX.test(dateStr)) return false;
  const parsed = new Date(dateStr);
  return parsed instanceof Date && !isNaN(parsed.getTime());
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * GET /loans
 * Mendapatkan daftar peminjaman dengan fitur filter query:
 * - ?status=Terlambat / ?status=Dipinjam
 * - ?member_name=Budi
 * - ?book_title=Laskar
 * - ?sortBy=due_date&order=asc
 * - ?page=1&limit=10
 */
const getAllLoans = async (req, res, next) => {
  try {
    const { status, member_name, book_title, sortBy = 'created_at', order = 'desc', page, limit } = req.query;

    let query = supabase.from('loans').select('*', { count: 'exact' });

    // Filter berdasarkan status
    if (status) {
      query = query.ilike('status', status.trim());
    }

    // Filter pencarian nama anggota
    if (member_name) {
      query = query.ilike('member_name', `%${member_name.trim()}%`);
    }

    // Filter pencarian judul buku
    if (book_title) {
      query = query.ilike('book_title', `%${book_title.trim()}%`);
    }

    // Sorting
    const validSortColumns = ['id', 'created_at', 'book_title', 'member_name', 'borrow_date', 'due_date', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const isAscending = order.toLowerCase() === 'asc';
    query = query.order(sortColumn, { ascending: isAscending });

    // Pagination opsional
    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        const parsedPage = parseInt(page, 10) || 1;
        const offset = (parsedPage - 1) * parsedLimit;
        query = query.range(offset, offset + parsedLimit - 1);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: 'Data peminjaman berhasil diambil',
      total: count !== null ? count : data.length,
      filters: {
        status: status || null,
        member_name: member_name || null,
        book_title: book_title || null,
        sortBy: sortColumn,
        order: isAscending ? 'asc' : 'desc'
      },
      data: data || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /loans/:id
 * Mendapatkan detail peminjaman berdasarkan ID (UUID)
 */
const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID tidak valid. ID harus berupa UUID yang valid.'
      });
    }

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID '${id}' tidak ditemukan`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data peminjaman berhasil ditemukan',
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /loans
 * Menambahkan data peminjaman buku baru
 * Body: { book_title, member_name, borrow_date?, due_date, status? }
 */
const createLoan = async (req, res, next) => {
  try {
    const { book_title, member_name, borrow_date, due_date, status } = req.body;

    const errors = [];

    // Validasi judul buku
    if (!book_title || typeof book_title !== 'string' || !book_title.trim()) {
      errors.push('Field "book_title" wajib diisi dan berupa string');
    }

    // Validasi nama anggota
    if (!member_name || typeof member_name !== 'string' || !member_name.trim()) {
      errors.push('Field "member_name" wajib diisi dan berupa string');
    }

    // Validasi due_date
    if (!due_date || typeof due_date !== 'string' || !due_date.trim()) {
      errors.push('Field "due_date" wajib diisi (format: YYYY-MM-DD)');
    } else if (!isValidDate(due_date.trim())) {
      errors.push('Format "due_date" harus berupa tanggal valid (YYYY-MM-DD)');
    }

    // Validasi borrow_date jika disertakan
    let finalBorrowDate = getTodayDate();
    if (borrow_date) {
      if (typeof borrow_date !== 'string' || !isValidDate(borrow_date.trim())) {
        errors.push('Format "borrow_date" harus berupa tanggal valid (YYYY-MM-DD)');
      } else {
        finalBorrowDate = borrow_date.trim();
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors
      });
    }

    // Status default adalah 'Dipinjam'
    const finalStatus = (status && typeof status === 'string' && status.trim())
      ? status.trim()
      : 'Dipinjam';

    const newLoan = {
      book_title: book_title.trim(),
      member_name: member_name.trim(),
      borrow_date: finalBorrowDate,
      due_date: due_date.trim(),
      status: finalStatus
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([newLoan])
      .select()
      .single();

    if (error) {
      // Penanganan khusus jika RLS (Row Level Security) aktif di Supabase tanpa policy INSERT
      if (error.code === '42501') {
        return res.status(500).json({
          success: false,
          message: 'Gagal menambahkan peminjaman karena Row Level Security (RLS) di Supabase memblokir operasi insert.',
          solution: 'Jalankan perintah SQL ini di Supabase SQL Editor: "ALTER TABLE loans DISABLE ROW LEVEL SECURITY;" atau tambahkan policy INSERT untuk role anon.',
          error: error.message
        });
      }
      return next(error);
    }

    return res.status(201).json({
      success: true,
      message: 'Data peminjaman buku berhasil dibuat',
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /loans/:id atau PATCH /loans/:id
 * Memperbarui data peminjaman buku berdasarkan ID
 */
const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID tidak valid. ID harus berupa UUID yang valid.'
      });
    }

    const { book_title, member_name, borrow_date, due_date, status } = req.body;
    const updates = {};
    const errors = [];

    if (book_title !== undefined) {
      if (typeof book_title !== 'string' || !book_title.trim()) {
        errors.push('Field "book_title" harus berupa string dan tidak boleh kosong');
      } else {
        updates.book_title = book_title.trim();
      }
    }

    if (member_name !== undefined) {
      if (typeof member_name !== 'string' || !member_name.trim()) {
        errors.push('Field "member_name" harus berupa string dan tidak boleh kosong');
      } else {
        updates.member_name = member_name.trim();
      }
    }

    if (borrow_date !== undefined) {
      if (typeof borrow_date !== 'string' || !isValidDate(borrow_date.trim())) {
        errors.push('Format "borrow_date" harus berupa tanggal valid (YYYY-MM-DD)');
      } else {
        updates.borrow_date = borrow_date.trim();
      }
    }

    if (due_date !== undefined) {
      if (typeof due_date !== 'string' || !isValidDate(due_date.trim())) {
        errors.push('Format "due_date" harus berupa tanggal valid (YYYY-MM-DD)');
      } else {
        updates.due_date = due_date.trim();
      }
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || !status.trim()) {
        errors.push('Field "status" harus berupa string dan tidak boleh kosong');
      } else {
        updates.status = status.trim();
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data pembaruan yang dikirimkan. Minimal sertakan salah satu dari: book_title, member_name, borrow_date, due_date, status'
      });
    }

    // Pastikan data peminjaman ada terlebih dahulu
    const { data: existing, error: findError } = await supabase
      .from('loans')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) return next(findError);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID '${id}' tidak ditemukan`
      });
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        return res.status(500).json({
          success: false,
          message: 'Gagal memperbarui peminjaman karena Row Level Security (RLS) di Supabase memblokir operasi update.',
          solution: 'Jalankan perintah SQL ini di Supabase SQL Editor: "ALTER TABLE loans DISABLE ROW LEVEL SECURITY;"',
          error: error.message
        });
      }
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: 'Data peminjaman berhasil diperbarui',
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /loans/:id
 * Menghapus data peminjaman buku berdasarkan ID
 */
const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID tidak valid. ID harus berupa UUID yang valid.'
      });
    }

    // Cek apakah data peminjaman ada
    const { data: existing, error: findError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError) return next(findError);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID '${id}' tidak ditemukan`
      });
    }

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus peminjaman karena Row Level Security (RLS) di Supabase memblokir operasi delete.',
          solution: 'Jalankan perintah SQL ini di Supabase SQL Editor: "ALTER TABLE loans DISABLE ROW LEVEL SECURITY;"',
          error: error.message
        });
      }
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: 'Data peminjaman berhasil dihapus',
      deletedData: existing
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan
};
