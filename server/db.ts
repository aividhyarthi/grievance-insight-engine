import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/compliance.db';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'publisher',
    plan TEXT NOT NULL DEFAULT 'free',
    organization TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    file_name TEXT,
    file_path TEXT,
    source_url TEXT,
    mime_type TEXT,
    file_size INTEGER,
    text_content TEXT,
    publisher_name TEXT,
    platform_name TEXT,
    labels TEXT,
    detection_json TEXT NOT NULL,
    compliance_json TEXT NOT NULL,
    overall_verdict TEXT NOT NULL,
    overall_confidence REAL NOT NULL,
    compliance_status TEXT NOT NULL,
    compliance_score REAL NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS usage (
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);
  CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at);
  CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(compliance_status);
  CREATE INDEX IF NOT EXISTS idx_scans_verdict ON scans(overall_verdict);
`);

// ─── Prepared Statements ─────────────────────────────────────────────────────

export const queries = {
  // Users
  createUser: db.prepare(`
    INSERT INTO users (email, password_hash, name, role, organization)
    VALUES (?, ?, ?, ?, ?)
  `),
  getUserByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  getUserById: db.prepare(`SELECT * FROM users WHERE id = ?`),
  updateUserRole: db.prepare(`UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?`),

  // Scans
  createScan: db.prepare(`
    INSERT INTO scans (id, user_id, content_type, file_name, file_path, source_url,
      mime_type, file_size, text_content, publisher_name, platform_name, labels,
      detection_json, compliance_json, overall_verdict, overall_confidence,
      compliance_status, compliance_score, processing_time_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getScanById: db.prepare(`SELECT * FROM scans WHERE id = ?`),
  getScansByUser: db.prepare(`
    SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `),
  getScanCountByUser: db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ?`),

  // Dashboard
  getTotalScans: db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ?`),
  getStatusCounts: db.prepare(`
    SELECT compliance_status, COUNT(*) as count FROM scans WHERE user_id = ? GROUP BY compliance_status
  `),
  getContentTypeCounts: db.prepare(`
    SELECT content_type, COUNT(*) as count FROM scans WHERE user_id = ? GROUP BY content_type
  `),
  getScansByDay: db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM scans WHERE user_id = ? AND created_at >= date('now', '-30 days')
    GROUP BY date(created_at) ORDER BY date
  `),
  getRecentScans: db.prepare(`
    SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
  `),
  getTopViolations: db.prepare(`
    SELECT compliance_json FROM scans
    WHERE user_id = ? AND compliance_status = 'non_compliant'
    ORDER BY created_at DESC LIMIT 100
  `),

  // Usage tracking
  incrementUsage: db.prepare(`
    INSERT INTO usage (user_id, date, count) VALUES (?, date('now'), 1)
    ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1
  `),
  getUsageToday: db.prepare(`
    SELECT count FROM usage WHERE user_id = ? AND date = date('now')
  `),
};

export default db;
