import { Wallet, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

export default function SummaryCards({ transactions = [] }) {
  const summary = transactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount) || 0
      if (tx.type === 'income') {
        acc.income += amount
      } else if (tx.type === 'expense') {
        acc.expense += amount
      }
      return acc
    },
    { income: 0, expense: 0 }
  )

  const balance = summary.income - summary.expense

  return (
    <div className="summary-grid">
      {/* Kartu Saldo */}
      <div className="summary-card card-balance">
        <div className="card-top">
          <span className="card-label">Total Saldo</span>
          <div className="card-icon-bubble bg-emerald-light">
            <Wallet size={20} className="text-emerald" />
          </div>
        </div>
        <div className="card-value">{formatCurrency(balance)}</div>
        <div className="card-footer-info">
          {balance >= 0 ? (
            <span className="text-positive font-medium">Kondisi keuangan sehat</span>
          ) : (
            <span className="text-negative font-medium">Pengeluaran melebihi pemasukan</span>
          )}
        </div>
      </div>

      {/* Kartu Pemasukan */}
      <div className="summary-card card-income">
        <div className="card-top">
          <span className="card-label">Total Pemasukan</span>
          <div className="card-icon-bubble bg-green-light">
            <ArrowUpRight size={20} className="text-green" />
          </div>
        </div>
        <div className="card-value text-green-dark">{formatCurrency(summary.income)}</div>
        <div className="card-footer-info">
          <span className="text-muted">Akumulasi seluruh pemasukan</span>
        </div>
      </div>

      {/* Kartu Pengeluaran */}
      <div className="summary-card card-expense">
        <div className="card-top">
          <span className="card-label">Total Pengeluaran</span>
          <div className="card-icon-bubble bg-rose-light">
            <ArrowDownRight size={20} className="text-rose" />
          </div>
        </div>
        <div className="card-value text-rose-dark">{formatCurrency(summary.expense)}</div>
        <div className="card-footer-info">
          <span className="text-muted">Akumulasi seluruh pengeluaran</span>
        </div>
      </div>

      {/* Kartu Jumlah Transaksi */}
      <div className="summary-card card-count">
        <div className="card-top">
          <span className="card-label">Total Transaksi</span>
          <div className="card-icon-bubble bg-blue-light">
            <Layers size={20} className="text-blue" />
          </div>
        </div>
        <div className="card-value">{transactions.length}</div>
        <div className="card-footer-info">
          <span className="text-muted">Transaksi tercatat</span>
        </div>
      </div>
    </div>
  )
}
