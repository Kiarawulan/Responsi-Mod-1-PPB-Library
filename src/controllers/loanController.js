const supabase = require('../config/supabase');

// GET /loans (dengan filter ?status=...)
const getAllLoans = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabase.from('loans').select('*');

    if (status) {
      query = query.ilike('status', status.trim());
    }

    const { data, error } = await query;
    if (error) return next(error);

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// GET /loans/:id
const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// POST /loans
const createLoan = async (req, res, next) => {
  try {
    const { book_title, member_name, borrow_date, due_date, status } = req.body;

    if (!book_title || !member_name || !due_date) {
      return res.status(400).json({ message: 'book_title, member_name, dan due_date wajib diisi' });
    }

    const newLoan = {
      book_title,
      member_name,
      borrow_date: borrow_date || new Date().toISOString().split('T')[0],
      due_date,
      status: status || 'Dipinjam'
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([newLoan])
      .select()
      .single();

    if (error) return next(error);

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// PUT / PATCH /loans/:id
const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// DELETE /loans/:id
const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });

    return res.status(200).json({ message: 'Data berhasil dihapus' });
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
