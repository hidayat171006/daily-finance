import { supabase, isSupabaseConfigured } from '../lib/supabase'

const LOCAL_STORAGE_KEY = 'daily_finance_transactions'

// Ambil data transaksi dari LocalStorage
const getLocalTransactions = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('Gagal membaca LocalStorage:', err)
    return []
  }
}

// Simpan data transaksi ke LocalStorage
const saveLocalTransactions = (transactions) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions))
  } catch (err) {
    console.error('Gagal menyimpan ke LocalStorage:', err)
  }
}

export const transactionService = {
  // Mengambil seluruh transaksi
  async getAll() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error:', error)
        throw new Error(error.message)
      }
      return data || []
    }

    // Fallback LocalStorage (kosong secara default tanpa data palsu)
    return getLocalTransactions().sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // Menambah transaksi baru
  async create(transaction) {
    const newTx = {
      ...transaction,
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTx])
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw new Error(error.message)
      }
      return data
    }

    // Simpan ke LocalStorage
    const localTx = {
      ...newTx,
      id: crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}`
    }
    const current = getLocalTransactions()
    const updated = [localTx, ...current]
    saveLocalTransactions(updated)
    return localTx
  },

  // Memperbarui transaksi yang ada
  async update(id, updatedFields) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw new Error(error.message)
      }
      return data
    }

    // Update di LocalStorage
    const current = getLocalTransactions()
    const index = current.findIndex(tx => tx.id === id)
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }
    const updatedTx = { ...current[index], ...updatedFields }
    current[index] = updatedTx
    saveLocalTransactions(current)
    return updatedTx
  },

  // Menghapus transaksi
  async delete(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete error:', error)
        throw new Error(error.message)
      }
      return true
    }

    // Hapus dari LocalStorage
    const current = getLocalTransactions()
    const filtered = current.filter(tx => tx.id !== id)
    saveLocalTransactions(filtered)
    return true
  }
}
