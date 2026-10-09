import { useState, useMemo } from 'react'
import { 
  Search, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Inbox, 
  Calendar,
  XCircle,
  PlusCircle
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

export default function TransactionTable({ 
  transactions = [], 
  onEdit, 
  onDelete, 
  onOpenAddModal 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Ambil daftar unik kategori dari transaksi yang ada
  const availableCategories = useMemo(() => {
    const cats = new Set()
    transactions.forEach(tx => {
      if (tx.category) cats.add(tx.category)
    })
    return Array.from(cats).sort()
  }, [transactions])

  // Filter transaksi berdasarkan kriteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Filter tipe
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false
      }
      // Filter kategori
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false
      }
      // Filter rentang tanggal
      if (startDate && tx.date < startDate) {
        return false
      }
      if (endDate && tx.date > endDate) {
        return false
      }
      // Filter kata kunci pencarian
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const descMatch = (tx.description || '').toLowerCase().includes(query)
        const catMatch = (tx.category || '').toLowerCase().includes(query)
        if (!descMatch && !catMatch) return false
      }
      return true
    })
  }, [transactions, typeFilter, categoryFilter, startDate, endDate, searchTerm])

  const handleResetFilter = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setStartDate('')
    setEndDate('')
  }

  const handleDeleteConfirm = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const formatTxDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d)
  }

  const isFilterActive = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate

  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h2 className="table-card-title">Riwayat Transaksi</h2>
          <p className="table-card-subtitle">
            Daftar seluruh aktivitas pemasukan dan pengeluaran Anda.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        {/* Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari transaksi atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filter-controls">
          {/* Filter Tipe */}
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Hanya Pemasukan</option>
            <option value="expense">Hanya Pengeluaran</option>
          </select>

          {/* Filter Kategori */}
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Filter Tanggal */}
          <div className="date-filter-group">
            <input
              type="date"
              className="filter-date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Tanggal Mulai"
            />
            <span className="date-separator">s/d</span>
            <input
              type="date"
              className="filter-date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Tanggal Selesai"
            />
          </div>

          {isFilterActive && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilter}>
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data / Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state-title">
            {transactions.length === 0 
              ? 'Belum Ada Transaksi Tercatat' 
              : 'Tidak Ada Transaksi yang Cocok'}
          </h3>
          <p className="empty-state-desc">
            {transactions.length === 0
              ? 'Mulai kelola keuangan Anda dengan menambahkan transaksi pemasukan atau pengeluaran pertama.'
              : 'Coba ubah kata kunci pencarian atau reset filter untuk melihat data lainnya.'}
          </p>
          {transactions.length === 0 ? (
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <PlusCircle size={18} />
              <span>Tambah Transaksi Pertama</span>
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilter}>
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Tipe</th>
                <th className="text-right">Nominal</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income'
                return (
                  <tr key={tx.id} className="table-row">
                    <td className="cell-date">
                      <span className="date-badge">
                        <Calendar size={13} /> {formatTxDate(tx.date)}
                      </span>
                    </td>
                    <td className="cell-category">
                      <span className="category-pill">{tx.category || '-'}</span>
                    </td>
                    <td className="cell-desc">
                      <span className="desc-text" title={tx.description}>
                        {tx.description || <em className="text-muted">Tidak ada catatan</em>}
                      </span>
                    </td>
                    <td className="cell-type">
                      <span className={`type-badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                        {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="cell-amount text-right">
                      <span className={`amount-value ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="cell-actions text-center">
                      <div className="action-buttons">
                        <button
                          className="action-btn action-edit"
                          onClick={() => onEdit(tx)}
                          title="Edit Transaksi"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => handleDeleteConfirm(tx.id)}
                          disabled={deletingId === tx.id}
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="table-footer-info">
            Menampilkan {filteredTransactions.length} dari {transactions.length} total transaksi
          </div>
        </div>
      )}
    </div>
  )
}
