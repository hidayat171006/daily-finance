import { PlusCircle, Calendar } from 'lucide-react'

export default function Header({ onOpenAddModal }) {
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="greeting-wrapper">
          <h1 className="header-title">Kelola Keuangan Anda</h1>
          <p className="header-subtitle">
            <Calendar size={15} className="inline-icon" /> {todayFormatted}
          </p>
        </div>
      </div>

      <div className="header-right">
        <button 
          className="btn btn-primary"
          onClick={onOpenAddModal}
        >
          <PlusCircle size={18} />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </header>
  )
}
