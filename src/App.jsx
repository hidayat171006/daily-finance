import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import TransactionTable from './components/TransactionTable'
import FinanceCharts from './components/FinanceCharts'
import ReportView from './components/ReportView'
import TransactionModal from './components/TransactionModal'
import DatabaseGuideModal from './components/DatabaseGuideModal'
import { transactionService } from './services/transactionService'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isDbConnected, setIsDbConnected] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message: string }

  // Tampilkan notifikasi toast sesaat
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }, [])

  // Muat transaksi dari service (MySQL XAMPP atau LocalStorage)
  const refreshTransactions = useCallback(async () => {
    try {
      const conn = await transactionService.checkConnection()
      setIsDbConnected(conn.connected)

      const data = await transactionService.getAll()
      setTransactions(data || [])
    } catch (err) {
      console.error('Error memuat transaksi:', err)
      showToast('Gagal memuat transaksi: ' + err.message, 'error')
    }
  }, [showToast])

  useEffect(() => {
    let active = true
    async function initData() {
      try {
        const conn = await transactionService.checkConnection()
        if (active) {
          setIsDbConnected(conn.connected)
        }

        const data = await transactionService.getAll()
        if (active) {
          setTransactions(data || [])
        }
      } catch (err) {
        if (active) {
          console.error('Init error:', err)
          showToast('Gagal memuat transaksi: ' + err.message, 'error')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initData()
    return () => {
      active = false
    }
  }, [showToast])

  // Tambah atau perbarui transaksi
  const handleSaveTransaction = async (formData) => {
    if (editingTransaction) {
      await transactionService.update(editingTransaction.id, formData)
      showToast('Transaksi berhasil diperbarui!')
    } else {
      await transactionService.create(formData)
      showToast('Transaksi baru berhasil ditambahkan!')
    }
    await refreshTransactions()
    setEditingTransaction(null)
  }

  // Hapus transaksi
  const handleDeleteTransaction = async (id) => {
    try {
      await transactionService.delete(id)
      showToast('Transaksi berhasil dihapus!')
      await refreshTransactions()
    } catch (err) {
      showToast('Gagal menghapus transaksi: ' + err.message, 'error')
    }
  }

  // Buka modal untuk edit
  const handleEdit = (tx) => {
    setEditingTransaction(tx)
    setIsModalOpen(true)
  }

  // Buka modal untuk tambah baru
  const handleOpenAdd = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  return (
    <div className="app-layout">
      {/* Sidebar Modern */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenDatabaseGuide={() => setIsGuideOpen(true)}
        isDbConnected={isDbConnected}
      />

      {/* Konten Utama */}
      <div className="main-viewport">
        <Header onOpenAddModal={handleOpenAdd} />

        {/* Notifikasi Toast */}
        {toast && (
          <div className={`toast-notification toast-${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="toast-icon text-green" />
            ) : (
              <AlertTriangle size={18} className="toast-icon text-rose" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Banner XAMPP jika database MySQL belum terhubung */}
        {!isDbConnected && (
          <div className="app-banner-notice" onClick={() => setIsGuideOpen(true)} role="button" tabIndex={0}>
            <div className="banner-content">
              <strong>Info Penyimpanan:</strong> MySQL XAMPP belum terhubung (berjalan di mode cadangan <em>LocalStorage</em>). Ingin menyambungkan ke MySQL?
            </div>
            <span className="banner-link">Lihat Panduan XAMPP &rarr;</span>
          </div>
        )}

        <main className="content-container">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={36} />
              <p>Memuat data keuangan Anda...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="tab-dashboard">
                  <SummaryCards transactions={transactions} />
                  
                  <div className="dashboard-grid-dual">
                    <div className="dashboard-charts-preview">
                      <FinanceCharts transactions={transactions} />
                    </div>
                    <div className="dashboard-recent-table">
                      <TransactionTable
                        transactions={transactions}
                        onEdit={handleEdit}
                        onDelete={handleDeleteTransaction}
                        onOpenAddModal={handleOpenAdd}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="tab-transactions">
                  <SummaryCards transactions={transactions} />
                  <TransactionTable
                    transactions={transactions}
                    onEdit={handleEdit}
                    onDelete={handleDeleteTransaction}
                    onOpenAddModal={handleOpenAdd}
                  />
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="tab-charts">
                  <FinanceCharts transactions={transactions} />
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="tab-reports">
                  <ReportView transactions={transactions} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal CRUD Transaksi */}
      {isModalOpen && (
        <TransactionModal
          key={editingTransaction ? editingTransaction.id : 'new-tx'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTransaction(null)
          }}
          onSave={handleSaveTransaction}
          editingTransaction={editingTransaction}
        />
      )}

      {/* Modal Panduan Database XAMPP */}
      <DatabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => {
          setIsGuideOpen(false)
          refreshTransactions()
        }}
      />
    </div>
  )
}

export default App
