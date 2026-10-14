import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10)
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'daily_finance'

let pool = null

export async function initDatabase() {
  try {
    // 1. Koneksi awal ke MySQL server (tanpa memilih database)
    const initConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    })

    // 2. Buat database jika belum ada
    await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`)
    await initConnection.end()

    // 3. Inisialisasi pool koneksi dengan database yang sudah ada
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true // Format tanggal dikembalikan sebagai string YYYY-MM-DD
    })

    // 4. Buat tabel transactions jika belum ada
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
    await pool.query(createTableQuery)

    console.log(`[MySQL XAMPP] Berhasil terhubung ke database "${DB_NAME}"`)
    return { success: true, pool }
  } catch (err) {
    console.error('[MySQL XAMPP] Gagal terhubung ke MySQL:', err.message)
    return { success: false, error: err.message }
  }
}

export function getPool() {
  return pool
}
