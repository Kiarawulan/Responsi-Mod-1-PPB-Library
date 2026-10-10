-- ========================================================
-- Skrip Database Supabase untuk Library Book Loan REST API
-- ========================================================

-- 1. Membuat tabel 'loans' jika belum ada
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_title TEXT NOT NULL,
    member_name TEXT NOT NULL,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Dipinjam',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Nonaktifkan Row Level Security (RLS) agar REST API anonim dapat melakukan CRUD (Create, Read, Update, Delete)
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;

-- OPSI ALTERNATIF:
-- Jika RLS tetap ingin diaktifkan, buat policy izin akses penuh untuk role anon & authenticated:
-- ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Akses Penuh Anonim loans" ON loans
--     FOR ALL
--     TO anon, authenticated
--     USING (true)
--     WITH CHECK (true);

-- 3. Data Awal (Dummy Data) untuk Pengujian Filter & CRUD
INSERT INTO loans (book_title, member_name, borrow_date, due_date, status)
VALUES
    ('Laskar Pelangi', 'Ahmad Fauzi', '2026-09-10', '2026-09-24', 'Terlambat'),
    ('Bumi Manusia', 'Siti Aminah', '2026-10-01', '2026-10-15', 'Dipinjam'),
    ('Filosofi Teras', 'Budi Santoso', '2026-09-20', '2026-10-04', 'Kembali'),
    ('Negeri 5 Menara', 'Dewi Lestari', '2026-08-15', '2026-08-29', 'Terlambat'),
    ('Atomic Habits', 'Rian Pratama', '2026-10-05', '2026-10-19', 'Dipinjam');
