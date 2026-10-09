import { useState } from 'react'
import { X, Database, Copy, Check, ExternalLink } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

export default function SupabaseGuideModal({ isOpen, onClose }) {
  const [copiedSql, setCopiedSql] = useState(false)
  const [copiedEnv, setCopiedEnv] = useState(false)

  if (!isOpen) return null

  const sqlSchema = `-- 1. Buat tabel transaksi di Supabase SQL Editor
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan akses anonim publik (atau sesuaikan dengan kebutuhan auth Anda)
CREATE POLICY "Akses publik penuh transaksi" 
ON transactions 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);`

  const envTemplate = `VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'sql') {
      setCopiedSql(true)
      setTimeout(() => setCopiedSql(false), 2000)
    } else {
      setCopiedEnv(true)
      setTimeout(() => setCopiedEnv(false), 2000)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <Database size={22} className="text-emerald" />
            <h3>Panduan Integrasi Database Supabase</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-scroll">
          <div className="guide-status-alert">
            <span className="font-semibold">Status Saat Ini: </span>
            {isSupabaseConfigured ? (
              <span className="badge badge-success">Terhubung ke Supabase</span>
            ) : (
              <span className="badge badge-warning">Mode Penyimpanan Lokal (LocalStorage)</span>
            )}
            <p className="text-sm mt-1 text-muted">
              {isSupabaseConfigured
                ? 'Aplikasi saat ini langsung membaca dan menyimpan data ke database Supabase Anda.'
                : 'Aplikasi saat ini aman berjalan menggunakan LocalStorage browser. Ikuti langkah di bawah ini untuk menghubungkan database cloud Supabase.'}
            </p>
          </div>

          <div className="guide-steps">
            {/* Langkah 1 */}
            <div className="guide-step-item">
              <div className="step-badge">1</div>
              <div className="step-content">
                <h4>Buat Project Baru di Supabase</h4>
                <p>
                  Buka situs resmi{' '}
                  <a href="https://supabase.com" target="_blank" rel="noreferrer" className="link-ext">
                    supabase.com <ExternalLink size={13} />
                  </a>
                  , masuk atau daftar akun, lalu klik <strong>New Project</strong>. Tentukan nama project (contoh: <code>daily-finance</code>) dan password database Anda.
                </p>
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="guide-step-item">
              <div className="step-badge">2</div>
              <div className="step-content">
                <h4>Jalankan Script SQL Tabel Transaksi</h4>
                <p>
                  Di dashboard Supabase, buka menu <strong>SQL Editor</strong> (ikon terminal/kode di sidebar kiri), klik <strong>New Query</strong>, tempelkan query SQL di bawah ini, lalu klik <strong>Run</strong>:
                </p>
                <div className="code-box">
                  <div className="code-box-header">
                    <span>SQL Editor Script (Schema & Policy)</span>
                    <button 
                      className="btn-copy" 
                      onClick={() => handleCopy(sqlSchema, 'sql')}
                    >
                      {copiedSql ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                      <span>{copiedSql ? 'Tersalin' : 'Salin SQL'}</span>
                    </button>
                  </div>
                  <pre className="code-snippet"><code>{sqlSchema}</code></pre>
                </div>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="guide-step-item">
              <div className="step-badge">3</div>
              <div className="step-content">
                <h4>Salin Project URL dan Anon Key</h4>
                <p>
                  Buka menu <strong>Project Settings</strong> (ikon gerigi) &rarr; <strong>API</strong>. Cari bagian <strong>Project URL</strong> dan <strong>Project API Keys (anon / public)</strong>.
                </p>
              </div>
            </div>

            {/* Langkah 4 */}
            <div className="guide-step-item">
              <div className="step-badge">4</div>
              <div className="step-content">
                <h4>Simpan ke File <code>.env</code> di Root Project</h4>
                <p>
                  Buat atau perbarui file <code>.env</code> di dalam folder project <code>c:\Users\ACER\daily-finance\</code> dengan nilai yang Anda dapatkan:
                </p>
                <div className="code-box">
                  <div className="code-box-header">
                    <span>.env</span>
                    <button 
                      className="btn-copy" 
                      onClick={() => handleCopy(envTemplate, 'env')}
                    >
                      {copiedEnv ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                      <span>{copiedEnv ? 'Tersalin' : 'Salin Contoh'}</span>
                    </button>
                  </div>
                  <pre className="code-snippet"><code>{envTemplate}</code></pre>
                </div>
                <p className="text-sm text-muted mt-2">
                  * Setelah menyimpan file <code>.env</code>, restart server Vite (<code>npm.cmd run dev</code>) agar variabel lingkungan termuat.
                </p>
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
