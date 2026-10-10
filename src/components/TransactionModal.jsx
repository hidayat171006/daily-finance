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

// Helper format angka dengan pemisah ribuan titik (contoh: 1000000 -> "1.000.000")
const formatDisplayAmount = (val) => {
  if (val === undefined || val === null || val === '') return ''
  const clean = String(val).replace(/\D/g, '').replace(/^0+(?!$)/, '')
  if (!clean) return ''
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTransaction = null 
}) {
  const [type, setType] = useState(() => editingTransaction?.type || 'expense')
  const [amount, setAmount] = useState(() => formatDisplayAmount(editingTransaction?.amount))
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

  const handleAmountChange = (e) => {
    const formatted = formatDisplayAmount(e.target.value)
    setAmount(formatted)
  }

  // Tambah nol otomatis (+000, +00.000, +000.000)
  const handleAddZeros = (zeros) => {
    const clean = amount.replace(/\D/g, '')
    if (!clean || clean === '0') {
      setAmount(formatDisplayAmount('1' + zeros))
      return
    }
    const newNum = clean + zeros
    if (newNum.length > 14) return
    setAmount(formatDisplayAmount(newNum))
  }

  // Tambah nominal instan (+10rb, +50rb, +100rb)
  const handleQuickAdd = (valueToAdd) => {
    const clean = amount.replace(/\D/g, '')
    const currentVal = parseFloat(clean) || 0
    const total = currentVal + valueToAdd
    setAmount(formatDisplayAmount(total))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanAmount = amount.replace(/\D/g, '')
    const numAmount = parseFloat(cleanAmount)
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
                type="text"
                inputMode="numeric"
                placeholder="0"
                className="form-input"
                value={amount}
                onChange={handleAmountChange}
                required
                autoFocus
              />
            </div>
            
            {/* Shortcut Cepat Tambah Nol & Nominal */}
            <div className="quick-amount-chips">
              <button
                type="button"
                className="chip-btn chip-zero"
                onClick={() => handleAddZeros('000')}
                title="Tambah 3 nol (Ribu)"
              >
                +000
              </button>
              <button
                type="button"
                className="chip-btn chip-zero"
                onClick={() => handleAddZeros('00000')}
                title="Tambah 5 nol"
              >
                +00.000
              </button>
              <button
                type="button"
                className="chip-btn chip-zero"
                onClick={() => handleAddZeros('000000')}
                title="Tambah 6 nol (Juta)"
              >
                +000.000
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleQuickAdd(10000)}
              >
                +10rb
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleQuickAdd(50000)}
              >
                +50rb
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleQuickAdd(100000)}
              >
                +100rb
              </button>
              {amount && (
                <button
                  type="button"
                  className="chip-btn chip-clear"
                  onClick={() => setAmount('')}
                  title="Hapus nominal"
                >
                  Hapus
                </button>
              )}
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
