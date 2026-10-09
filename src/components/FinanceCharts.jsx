import { useMemo } from 'react'
import { formatCurrency } from '../utils/formatters'
import { PieChart, TrendingUp, BarChart3 } from 'lucide-react'

export default function FinanceCharts({ transactions = [] }) {
  // Hitung perbandingan pemasukan vs pengeluaran
  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0
      if (tx.type === 'income') income += amt
      if (tx.type === 'expense') expense += amt
    })
    return { income, expense, total: income + expense }
  }, [transactions])

  // Breakdown kategori pengeluaran
  const expenseByCategory = useMemo(() => {
    const map = {}
    let totalExpense = 0
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const amt = Number(tx.amount) || 0
        map[tx.category] = (map[tx.category] || 0) + amt
        totalExpense += amt
      }
    })

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // Tren 7 hari terakhir
  const last7DaysData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(d)
      days.push({ dateStr, label, income: 0, expense: 0 })
    }

    transactions.forEach(tx => {
      const match = days.find(d => d.dateStr === tx.date)
      if (match) {
        const amt = Number(tx.amount) || 0
        if (tx.type === 'income') match.income += amt
        if (tx.type === 'expense') match.expense += amt
      }
    })

    const maxVal = Math.max(...days.map(d => Math.max(d.income, d.expense)), 1)
    return { days, maxVal }
  }, [transactions])

  const incomePercent = totals.total > 0 ? ((totals.income / totals.total) * 100).toFixed(1) : 0
  const expensePercent = totals.total > 0 ? ((totals.expense / totals.total) * 100).toFixed(1) : 0

  if (transactions.length === 0) {
    return (
      <div className="table-card empty-chart-card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <PieChart size={48} />
          </div>
          <h3 className="empty-state-title">Data Grafik Belum Tersedia</h3>
          <p className="empty-state-desc">
            Visualisasi grafik dan distribusi kategori akan otomatis muncul setelah Anda mencatat transaksi keuangan.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-container">
      {/* Rasio Pemasukan vs Pengeluaran */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="flex-row items-center gap-2">
            <BarChart3 size={20} className="text-emerald" />
            <h3>Rasio Arus Kas</h3>
          </div>
        </div>

        <div className="chart-card-body">
          <div className="ratio-bar-container">
            <div 
              className="ratio-bar-income" 
              style={{ width: `${incomePercent}%` }}
              title={`Pemasukan: ${incomePercent}%`}
            />
            <div 
              className="ratio-bar-expense" 
              style={{ width: `${expensePercent}%` }}
              title={`Pengeluaran: ${expensePercent}%`}
            />
          </div>

          <div className="ratio-legend">
            <div className="legend-item">
              <span className="legend-dot dot-income" />
              <div>
                <span className="legend-title">Pemasukan ({incomePercent}%)</span>
                <p className="legend-value text-green">{formatCurrency(totals.income)}</p>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-expense" />
              <div>
                <span className="legend-title">Pengeluaran ({expensePercent}%)</span>
                <p className="legend-value text-rose">{formatCurrency(totals.expense)}</p>
              </div>
            </div>
          </div>

          {/* Bar Chart 7 Hari Terakhir */}
          <div className="recent-trend-section">
            <h4 className="section-subtitle">Aktivitas 7 Hari Terakhir</h4>
            <div className="trend-bars">
              {last7DaysData.days.map((item, idx) => {
                const incomeHeight = (item.income / last7DaysData.maxVal) * 100
                const expenseHeight = (item.expense / last7DaysData.maxVal) * 100

                return (
                  <div key={idx} className="trend-bar-column">
                    <div className="bar-track">
                      {item.income > 0 && (
                        <div 
                          className="bar-fill bar-fill-income" 
                          style={{ height: `${Math.max(incomeHeight, 8)}%` }}
                          title={`Pemasukan: ${formatCurrency(item.income)}`}
                        />
                      )}
                      {item.expense > 0 && (
                        <div 
                          className="bar-fill bar-fill-expense" 
                          style={{ height: `${Math.max(expenseHeight, 8)}%` }}
                          title={`Pengeluaran: ${formatCurrency(item.expense)}`}
                        />
                      )}
                    </div>
                    <span className="trend-bar-label">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Distribusi Kategori Pengeluaran */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="flex-row items-center gap-2">
            <TrendingUp size={20} className="text-emerald" />
            <h3>Distribusi Kategori Pengeluaran</h3>
          </div>
        </div>

        <div className="chart-card-body">
          {expenseByCategory.length === 0 ? (
            <p className="text-muted text-sm py-4">Belum ada data pengeluaran yang tercatat.</p>
          ) : (
            <div className="category-progress-list">
              {expenseByCategory.map((item, idx) => (
                <div key={idx} className="category-progress-item">
                  <div className="category-progress-header">
                    <span className="font-medium text-dark">{item.category}</span>
                    <span className="category-amount">
                      {formatCurrency(item.amount)} 
                      <span className="text-muted text-xs ml-1">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
