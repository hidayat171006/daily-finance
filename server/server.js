import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { initDatabase, getPool } from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Cek status koneksi MySQL
app.get('/api/health', async (req, res) => {
  const pool = getPool()
  if (!pool) {
    // Coba inisialisasi ulang jika MySQL baru saja dinyalakan
    const initRes = await initDatabase()
    if (!initRes.success) {
      return res.status(503).json({
        connected: false,
        message: 'MySQL XAMPP belum menyala atau belum terhubung.',
        error: initRes.error
      })
    }
  }

  try {
    const currentPool = getPool()
    await currentPool.query('SELECT 1')
    return res.json({
      connected: true,
      message: 'Terhubung ke MySQL XAMPP',
      database: process.env.DB_NAME || 'daily_finance'
    })
  } catch (err) {
    return res.status(503).json({
      connected: false,
      message: 'Gagal terhubung ke MySQL XAMPP',
      error: err.message
    })
  }
})

// Middleware helper untuk memastikan koneksi database aktif
async function ensureDb(req, res, next) {
  let pool = getPool()
  if (!pool) {
    const initRes = await initDatabase()
    if (!initRes.success) {
      return res.status(503).json({
        error: 'MySQL XAMPP belum menyala. Silakan nyalakan MySQL di XAMPP Control Panel.'
      })
    }
    pool = getPool()
  }
  req.db = pool
  next()
}

// 1. Ambil semua transaksi
app.get('/api/transactions', ensureDb, async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT id, type, amount, category, date, description, created_at FROM transactions ORDER BY date DESC, created_at DESC'
    )
    
    // Pastikan amount bertipe angka
    const formatted = rows.map(r => ({
      ...r,
      amount: Number(r.amount)
    }))
    
    res.json(formatted)
  } catch (err) {
    console.error('Error GET /api/transactions:', err)
    res.status(500).json({ error: err.message })
  }
})

// 2. Tambah transaksi baru
app.post('/api/transactions', ensureDb, async (req, res) => {
  try {
    const { type, amount, category, date, description } = req.body

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: 'Data transaksi tidak lengkap.' })
    }

    const id = req.body.id || crypto.randomUUID()
    const query = `
      INSERT INTO transactions (id, type, amount, category, date, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `
    await req.db.query(query, [id, type, Number(amount), category, date, description || ''])

    const [createdRows] = await req.db.query(
      'SELECT id, type, amount, category, date, description, created_at FROM transactions WHERE id = ?',
      [id]
    )

    if (createdRows.length > 0) {
      const item = createdRows[0]
      return res.status(201).json({ ...item, amount: Number(item.amount) })
    }

    res.status(201).json({ id, type, amount: Number(amount), category, date, description })
  } catch (err) {
    console.error('Error POST /api/transactions:', err)
    res.status(500).json({ error: err.message })
  }
})

// 3. Perbarui transaksi
app.put('/api/transactions/:id', ensureDb, async (req, res) => {
  try {
    const { id } = req.params
    const { type, amount, category, date, description } = req.body

    const query = `
      UPDATE transactions 
      SET type = ?, amount = ?, category = ?, date = ?, description = ?
      WHERE id = ?
    `
    const [result] = await req.db.query(query, [type, Number(amount), category, date, description || '', id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' })
    }

    const [updatedRows] = await req.db.query(
      'SELECT id, type, amount, category, date, description, created_at FROM transactions WHERE id = ?',
      [id]
    )

    const item = updatedRows[0]
    res.json({ ...item, amount: Number(item?.amount || amount) })
  } catch (err) {
    console.error('Error PUT /api/transactions/:id:', err)
    res.status(500).json({ error: err.message })
  }
})

// 4. Hapus transaksi
app.delete('/api/transactions/:id', ensureDb, async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await req.db.query('DELETE FROM transactions WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' })
    }

    res.json({ success: true, message: 'Transaksi berhasil dihapus.' })
  } catch (err) {
    console.error('Error DELETE /api/transactions/:id:', err)
    res.status(500).json({ error: err.message })
  }
})

// Jalankan server
app.listen(PORT, async () => {
  console.log(`[Backend Server] Berjalan di http://localhost:${PORT}`)
  await initDatabase()
})
