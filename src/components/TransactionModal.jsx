import { useState } from 'react'
import { X, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react'

const INCOME_CATEGORIES = [
  'Gaji',
  'Bonus',
  'Bisnis & Penjualan',
  'Investasi',
  'Freelance / Proyek',
  'Hadiah / Hibah',
  'Pemasukan Lainnya'
]

const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi & Bensin',
  'Belanja Kebutuhan',
  'Tagihan & Utilitas (Listrik/Air/Internet)',
  'Tempat Tinggal / Sewa',
  'Kesehatan & Medis',
  'Pendidikan & Kursus',
  'Hiburan & Rekreasi',
  'Keluarga & Anak',
  'Pengeluaran Lainnya'
]

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTransaction = null 
}) {
  const [type, setType] = useState(() => editingTransaction?.type || 'expense')
  const [amount, setAmount] = useState(() => (editingTransaction?.amount ? String(editingTransaction.amount) : ''))
  const [category, setCategory] = useState(() => {
    if (editingTransaction?.category) return editingTransaction.category
    return editingTransaction?.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
  })
  const [date, setDate] = useState(() => {
    if (editingTransaction?.date) return editingTransaction.date.split('T')[0]
    return new Date().toISOString().split('T')[0]
  })
  const [description, setDescription] = useState(() => editingTransaction?.description || '')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Harap masukkan nominal yang valid dan lebih dari 0.')
      return
    }

    if (!category.trim()) {
      setErrorMsg('Harap pilih kategori.')
      return
    }

    if (!date) {
      setErrorMsg('Harap pilih tanggal transaksi.')
      return
    }

    setSubmitting(true)
    try {
      await onSave({
        type,
        amount: numAmount,
        category,
        date,
        description: description.trim()
      })
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan transaksi.')
    } finally {
      setSubmitting(false)
    }
  }

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup Modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && (
            <div className="form-alert form-alert-error">
              {errorMsg}
            </div>
          )}

          {/* Pemilihan Tipe Transaksi */}
          <div className="form-group">
            <label className="form-label">Tipe Transaksi</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn type-expense ${type === 'expense' ? 'selected' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <ArrowDownRight size={18} />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                className={`type-toggle-btn type-income ${type === 'income' ? 'selected' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <ArrowUpRight size={18} />
                <span>Pemasukan</span>
              </button>
            </div>
          </div>

          {/* Nominal */}
          <div className="form-group">
            <label className="form-label" htmlFor="amount-input">Nominal (Rp)</label>
            <div className="input-with-prefix">
              <span className="input-prefix">Rp</span>
              <input
                id="amount-input"
                type="number"
                min="1"
                step="any"
                placeholder="0"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label" htmlFor="category-select">Kategori</label>
            <select
              id="category-select"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div className="form-group">
            <label className="form-label" htmlFor="date-input">Tanggal</label>
            <input
              id="date-input"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Catatan / Keterangan */}
          <div className="form-group">
            <label className="form-label" htmlFor="desc-input">Catatan / Keterangan (Opsional)</label>
            <textarea
              id="desc-input"
              rows="3"
              className="form-textarea"
              placeholder="Contoh: Makan siang dengan tim, bayar tagihan wifi bulanan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Check size={18} />
              <span>{submitting ? 'Menyimpan...' : (editingTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
