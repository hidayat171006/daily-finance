import { 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  FileSpreadsheet, 
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, onOpenDatabaseGuide, isDbConnected = false }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: ReceiptText },
    { id: 'charts', label: 'Grafik Keuangan', icon: PieChart },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <ReceiptText className="brand-icon" size={24} />
        </div>
        <div className="brand-text">
          <h2>Daily Finance</h2>
          <span>Smart Money Tracker</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">MENU UTAMA</div>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-card" onClick={onOpenDatabaseGuide} role="button" tabIndex={0}>
          <div className="status-header">
            <Database size={16} />
            <span className="status-title">Status Database</span>
          </div>
          <div className="status-badge-container">
            {isDbConnected ? (
              <span className="badge badge-success">
                <CheckCircle2 size={13} /> MySQL XAMPP Aktif
              </span>
            ) : (
              <span className="badge badge-warning">
                <AlertCircle size={13} /> Mode Lokal (Klik Setup)
              </span>
            )}
          </div>
          <p className="status-desc">
            {isDbConnected 
              ? 'Data tersimpan di database MySQL XAMPP.' 
              : 'Klik untuk panduan koneksi MySQL XAMPP.'}
          </p>
        </div>
        <div className="sidebar-version">
          <span>Daily Finance v1.0</span>
        </div>
      </div>
    </aside>
  )
}
