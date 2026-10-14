const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const LOCAL_STORAGE_KEY = 'daily_finance_transactions'

// Ambil data transaksi dari LocalStorage sebagai fallback
const getLocalTransactions = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('Gagal membaca LocalStorage:', err)
    return []
  }
}

// Simpan data transaksi ke LocalStorage sebagai fallback
const saveLocalTransactions = (transactions) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions))
  } catch (err) {
    console.error('Gagal menyimpan ke LocalStorage:', err)
  }
}

export const transactionService = {
  // Cek koneksi ke database MySQL XAMPP via backend API
  async checkConnection() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        return { connected: false, message: errorData.message || 'MySQL belum aktif di XAMPP' }
      }
      const data = await res.json()
      return { connected: Boolean(data.connected), message: data.message, database: data.database }
    } catch {
      return { connected: false, message: 'Server backend belum berjalan atau tidak terjangkau' }
    }
  },

  // Mengambil seluruh transaksi
  async getAll() {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`)
      if (res.ok) {
        const data = await res.json()
        return Array.isArray(data) ? data : []
      }
      console.warn('API gagal dimuat, beralih ke LocalStorage:', res.statusText)
    } catch (err) {
      console.warn('Koneksi ke backend MySQL gagal, beralih ke LocalStorage:', err.message)
    }

    // Fallback ke LocalStorage jika backend/MySQL belum aktif
    return getLocalTransactions().sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // Menambah transaksi baru
  async create(transaction) {
    const newTx = {
      ...transaction,
      id: crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}`
    }

    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      })

      if (res.ok) {
        const data = await res.json()
        return data
      }
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Gagal menyimpan transaksi ke database MySQL.')
    } catch (err) {
      // Jika kegagalan adalah koneksi server, fallback simpan ke LocalStorage agar user tidak kehilangan data
      console.warn('Gagal menyimpan ke MySQL API, menyimpan ke LocalStorage:', err.message)
      const current = getLocalTransactions()
      const localItem = {
        ...newTx,
        created_at: new Date().toISOString()
      }
      saveLocalTransactions([localItem, ...current])
      return localItem
    }
  },

  // Memperbarui transaksi yang ada
  async update(id, updatedFields) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      })

      if (res.ok) {
        const data = await res.json()
        return data
      }
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Gagal memperbarui transaksi di database MySQL.')
    } catch (err) {
      console.warn('Gagal memperbarui di MySQL API, memperbarui di LocalStorage:', err.message)
      const current = getLocalTransactions()
      const index = current.findIndex(tx => tx.id === id)
      if (index === -1) {
        throw new Error('Transaksi tidak ditemukan.')
      }
      const updatedTx = { ...current[index], ...updatedFields }
      current[index] = updatedTx
      saveLocalTransactions(current)
      return updatedTx
    }
  },

  // Menghapus transaksi
  async delete(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        return true
      }
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Gagal menghapus transaksi dari database MySQL.')
    } catch (err) {
      console.warn('Gagal menghapus di MySQL API, menghapus di LocalStorage:', err.message)
      const current = getLocalTransactions()
      const filtered = current.filter(tx => tx.id !== id)
      saveLocalTransactions(filtered)
      return true
    }
  }
}
