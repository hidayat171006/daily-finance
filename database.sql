-- =======================================================
-- Daily Finance - Skema Database MySQL (XAMPP / phpMyAdmin)
-- =======================================================

-- 1. Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS `daily_finance`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `daily_finance`;

-- 2. Buat tabel transaksi
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_date` (`date`),
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catatan:
-- Saat Anda menjalankan aplikasi dengan "npm run dev", database dan tabel 
-- di atas akan otomatis dibuat ke MySQL XAMPP Anda.
