const supabase = require('../config/supabase');

/**
 * GET /loans
 * Mengambil seluruh data peminjaman buku.
 * Mendukung filter query:
 * - ?status=Terlambat (contoh: /loans?status=Terlambat)
 * - ?member_name=...
 * - ?book_title=...
 */
const getAllLoans = async (req, res, next) => {
  try {
    const { status, member_name, book_title } = req.query;

    let query = supabase.from('loans').select('*').order('created_at', { ascending: false });

    // Filter query berdasarkan status peminjaman (contoh: Terlambat, Dipinjam, Kembali)
    if (status) {
      query = query.ilike('status', status.trim());
    }

    // Filter pencarian berdasarkan nama anggota
    if (member_name) {
      query = query.ilike('member_name', `%${member_name.trim()}%`);
    }

    // Filter pencarian berdasarkan judul buku
    if (book_title) {
      query = query.ilike('book_title', `%${book_title.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data peminjaman',
      data: data || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /loans/:id
 * Mengambil detail peminjaman buku berdasarkan ID
 */
const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;

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
      message: 'Berhasil mengambil detail peminjaman',
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

    if (!book_title || !member_name || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Field book_title, member_name, dan due_date wajib diisi'
      });
    }

    const newLoan = {
      book_title: book_title.trim(),
      member_name: member_name.trim(),
      borrow_date: borrow_date ? borrow_date.trim() : new Date().toISOString().split('T')[0],
      due_date: due_date.trim(),
      status: (status && status.trim()) ? status.trim() : 'Dipinjam'
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([newLoan])
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        return res.status(500).json({
          success: false,
          message: 'Supabase RLS memblokir insert. Jalankan: ALTER TABLE loans DISABLE ROW LEVEL SECURITY; di SQL Editor Supabase.'
        });
      }
      return next(error);
    }

    return res.status(201).json({
      success: true,
      message: 'Peminjaman buku berhasil dicatat',
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /loans/:id atau PATCH /loans/:id
 * Memperbarui data peminjaman buku
 */
const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { book_title, member_name, borrow_date, due_date, status } = req.body;

    const updates = {};
    if (book_title !== undefined) updates.book_title = book_title.trim();
    if (member_name !== undefined) updates.member_name = member_name.trim();
    if (borrow_date !== undefined) updates.borrow_date = borrow_date.trim();
    if (due_date !== undefined) updates.due_date = due_date.trim();
    if (status !== undefined) updates.status = status.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data pembaruan yang dikirim'
      });
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select()
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
      message: 'Data peminjaman berhasil diperbarui',
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /loans/:id
 * Menghapus data peminjaman buku
 */
const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .select()
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
      message: 'Data peminjaman berhasil dihapus'
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
