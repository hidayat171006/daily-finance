import { useState, useMemo } from 'react'
import { formatCurrency } from '../utils/formatters'
import { Download, CalendarRange } from 'lucide-react'

export default function ReportView({ transactions = [] }) {
  const [reportType, setReportType] = useState('monthly') // 'daily', 'weekly', 'monthly'

  // Kelompokkan data transaksi berdasarkan periode
  const groupedReports = useMemo(() => {
    const groups = {}

    transactions.forEach(tx => {
      if (!tx.date) return
      const d = new Date(tx.date)
      let key
      let label

      if (reportType === 'daily') {
        key = tx.date
        label = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(d)
      } else if (reportType === 'weekly') {
        // Ambil minggu ke berapa dalam tahun
        const startOfYear = new Date(d.getFullYear(), 0, 1)
        const pastDays = Math.floor((d - startOfYear) / 86400000)
        const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7)
        key = `${d.getFullYear()}-W${weekNum}`
        label = `Minggu ke-${weekNum}, ${d.getFullYear()}`
      } else {
        // Bulanan
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        label = new Intl.DateTimeFormat('id-ID', {
          month: 'long',
          year: 'numeric'
        }).format(d)
      }

      if (!groups[key]) {
        groups[key] = {
          key,
          label,
          income: 0,
          expense: 0,
          count: 0
        }
      }

      const amt = Number(tx.amount) || 0
      if (tx.type === 'income') {
        groups[key].income += amt
      } else if (tx.type === 'expense') {
        groups[key].expense += amt
      }
      groups[key].count += 1
    })

    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key))
  }, [transactions, reportType])

  // Fungsi unduh CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.')
      return
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Keterangan', 'Waktu Dibuat']
    const rows = transactions.map(tx => [
      `"${tx.id || ''}"`,
      `"${tx.date || ''}"`,
      `"${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
      `"${tx.category || ''}"`,
      tx.amount || 0,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${tx.created_at || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `daily-finance-report-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="report-view">
      <div className="table-card">
        <div className="table-card-header flex-between">
          <div>
            <h2 className="table-card-title">Laporan Rekapitulasi Keuangan</h2>
            <p className="table-card-subtitle">
              Ringkasan arus kas secara harian, mingguan, dan bulanan.
            </p>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
          >
            <Download size={16} />
            <span>Ekspor CSV</span>
          </button>
        </div>

        {/* Filter Periode */}
        <div className="report-period-tabs">
          <button 
            className={`period-tab-btn ${reportType === 'monthly' ? 'active' : ''}`}
            onClick={() => setReportType('monthly')}
          >
            Bulanan
          </button>
          <button 
            className={`period-tab-btn ${reportType === 'weekly' ? 'active' : ''}`}
            onClick={() => setReportType('weekly')}
          >
            Mingguan
          </button>
          <button 
            className={`period-tab-btn ${reportType === 'daily' ? 'active' : ''}`}
            onClick={() => setReportType('daily')}
          >
            Harian
          </button>
        </div>

        {groupedReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CalendarRange size={48} />
            </div>
            <h3 className="empty-state-title">Belum Ada Transaksi untuk Laporan</h3>
            <p className="empty-state-desc">
              Laporan periode akan terisi secara otomatis begitu Anda menambahkan catatan transaksi keuangan.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Periode</th>
                  <th className="text-right">Total Pemasukan</th>
                  <th className="text-right">Total Pengeluaran</th>
                  <th className="text-right">Selisih Bersih (Cashflow)</th>
                  <th className="text-center">Jumlah Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {groupedReports.map((grp) => {
                  const net = grp.income - grp.expense
                  const isPositive = net >= 0
                  return (
                    <tr key={grp.key} className="table-row">
                      <td className="font-semibold text-dark">{grp.label}</td>
                      <td className="text-right text-green font-medium">
                        + {formatCurrency(grp.income)}
                      </td>
                      <td className="text-right text-rose font-medium">
                        - {formatCurrency(grp.expense)}
                      </td>
                      <td className="text-right">
                        <span className={`font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                          {isPositive ? '+ ' : ''}
                          {formatCurrency(net)}
                        </span>
                      </td>
                      <td className="text-center text-muted">
                        {grp.count} transaksi
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
