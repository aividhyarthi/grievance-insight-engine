import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '..', 'data', 'aeo.db');

// Ensure data directory exists
import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    plan TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    url TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    report_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS usage (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_audits_user ON audits(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, date);
`);

// Prepared statements for performance
// Admin emails get unlimited access (comma-separated in env)
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Auto-promote existing users with admin emails on startup
if (ADMIN_EMAILS.length > 0) {
  const promoteAdmin = db.prepare(`UPDATE users SET plan = 'admin', updated_at = datetime('now') WHERE email = ? AND plan != 'admin'`);
  for (const email of ADMIN_EMAILS) {
    const result = promoteAdmin.run(email);
    if (result.changes > 0) {
      console.log(`Promoted ${email} to admin`);
    }
  }
}

export const queries = {
  // Users
  createUser: db.prepare(
    `INSERT INTO users (id, email, password_hash, name, plan) VALUES (?, ?, ?, ?, ?)`
  ),
  getUserByEmail: db.prepare(
    `SELECT * FROM users WHERE email = ?`
  ),
  getUserById: db.prepare(
    `SELECT id, email, name, plan, stripe_customer_id, created_at FROM users WHERE id = ?`
  ),
  updateUserPlan: db.prepare(
    `UPDATE users SET plan = ?, stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?`
  ),
  updateStripeCustomer: db.prepare(
    `UPDATE users SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?`
  ),
  getUserByStripeCustomer: db.prepare(
    `SELECT * FROM users WHERE stripe_customer_id = ?`
  ),

  // Audits
  saveAudit: db.prepare(
    `INSERT INTO audits (id, user_id, url, overall_score, grade, report_json) VALUES (?, ?, ?, ?, ?, ?)`
  ),
  getAuditsByUser: db.prepare(
    `SELECT id, url, overall_score, grade, created_at FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ),
  getAuditById: db.prepare(
    `SELECT * FROM audits WHERE id = ? AND user_id = ?`
  ),
  countAuditsByUser: db.prepare(
    `SELECT COUNT(*) as total FROM audits WHERE user_id = ?`
  ),

  // Usage tracking
  getUsageToday: db.prepare(
    `SELECT count FROM usage WHERE user_id = ? AND date = ?`
  ),
  incrementUsage: db.prepare(
    `INSERT INTO usage (user_id, date, count) VALUES (?, ?, 1)
     ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1`
  ),
};

export default db;
