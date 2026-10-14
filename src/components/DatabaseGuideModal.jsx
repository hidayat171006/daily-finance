import { useState, useEffect } from 'react'
import { X, Database, Copy, Check, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { transactionService } from '../services/transactionService'

export default function DatabaseGuideModal({ isOpen, onClose }) {
  const [copiedSql, setCopiedSql] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({ loading: false, connected: false, message: '' })

  const checkStatus = async () => {
    setConnectionStatus(prev => ({ ...prev, loading: true }))
    const res = await transactionService.checkConnection()
    setConnectionStatus({
      loading: false,
      connected: res.connected,
      message: res.message || (res.connected ? 'Terhubung ke database daily_finance' : 'Belum terhubung ke MySQL XAMPP')
    })
  }

  useEffect(() => {
    if (isOpen) {
      checkStatus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sqlSchema = `-- 1. Buat database daily_finance di phpMyAdmin
CREATE DATABASE IF NOT EXISTS \`daily_finance\`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`daily_finance\`;

-- 2. Buat tabel transactions
CREATE TABLE IF NOT EXISTS \`transactions\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`type\` ENUM('income', 'expense') NOT NULL,
  \`amount\` DECIMAL(15, 2) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`date\` DATE NOT NULL,
  \`description\` TEXT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_date\` (\`date\`),
  INDEX \`idx_type\` (\`type\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <Database size={22} className="text-emerald" />
            <h3>Panduan Database XAMPP (MySQL)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-scroll">
          <div className="guide-status-alert">
            <div className="flex-row items-center justify-between">
              <div>
                <span className="font-semibold">Status Koneksi: </span>
                {connectionStatus.connected ? (
                  <span className="badge badge-success">
                    <CheckCircle2 size={13} /> MySQL XAMPP Terhubung
                  </span>
                ) : (
                  <span className="badge badge-warning">
                    <AlertCircle size={13} /> Belum Terhubung (Mode Lokal)
                  </span>
                )}
              </div>
              <button 
                type="button"
                className="btn btn-secondary btn-sm flex-row items-center gap-1"
                onClick={checkStatus}
                disabled={connectionStatus.loading}
              >
                <RefreshCw size={13} className={connectionStatus.loading ? 'animate-spin' : ''} />
                <span>{connectionStatus.loading ? 'Mengecek...' : 'Cek Status'}</span>
              </button>
            </div>
            <p className="text-sm mt-2 text-muted">
              {connectionStatus.connected
                ? 'Database aktif dan terhubung. Semua data transaksi tersimpan langsung di MySQL XAMPP Anda.'
                : 'Aplikasi saat ini menggunakan LocalStorage sebagai cadangan. Ikuti langkah di bawah ini untuk mengaktifkan MySQL di XAMPP.'}
            </p>
          </div>

          <div className="guide-steps">
            {/* Langkah 1 */}
            <div className="guide-step-item">
              <div className="step-badge">1</div>
              <div className="step-content">
                <h4>Nyalakan MySQL di XAMPP Control Panel</h4>
                <p>
                  Buka aplikasi <strong>XAMPP Control Panel</strong> di komputer Anda, lalu klik tombol <strong>Start</strong> pada modul <strong>MySQL</strong> (dan modul <strong>Apache</strong> jika ingin membuka phpMyAdmin).
                </p>
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="guide-step-item">
              <div className="step-badge">2</div>
              <div className="step-content">
                <h4>Database & Tabel Otomatis Dibuat</h4>
                <p>
                  Sistem backend Node.js aplikasi ini sudah dilengkapi fitur <em>auto-initialize</em>. Begitu server berjalan dan MySQL XAMPP aktif, database <code>daily_finance</code> beserta tabel <code>transactions</code> akan otomatis dibuat tanpa perlu mengetik manual.
                </p>
                <p className="text-sm text-muted mt-1">
                  Ingin melihat tabel di phpMyAdmin? Buka{' '}
                  <a href="http://localhost/phpmyadmin" target="_blank" rel="noreferrer" className="link-ext">
                    http://localhost/phpmyadmin <ExternalLink size={13} />
                  </a>
                </p>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="guide-step-item">
              <div className="step-badge">3</div>
              <div className="step-content">
                <h4>Jalankan Aplikasi</h4>
                <p>
                  Buka terminal di folder project, lalu cukup ketik:
                </p>
                <div className="code-box">
                  <pre className="code-snippet"><code>npm run dev</code></pre>
                </div>
                <p className="text-sm text-muted mt-1">
                  Perintah ini akan menyalakan server backend (port 5000) dan antarmuka web Vite sekaligus.
                </p>
              </div>
            </div>

            {/* Langkah 4 (Opsional) */}
            <div className="guide-step-item">
              <div className="step-badge">4</div>
              <div className="step-content">
                <h4>Skema SQL Manual (Opsional)</h4>
                <p>
                  Jika Anda ingin membuat tabel sendiri secara manual di tab SQL phpMyAdmin, salin query berikut:
                </p>
                <div className="code-box">
                  <div className="code-box-header">
                    <span>database.sql</span>
                    <button className="btn-copy" onClick={handleCopySql}>
                      {copiedSql ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                      <span>{copiedSql ? 'Tersalin' : 'Salin SQL'}</span>
                    </button>
                  </div>
                  <pre className="code-snippet"><code>{sqlSchema}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  )
}
