import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database(process.env.DB_FILE || "fintech.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('entrada','saida')),
  category TEXT NOT NULL DEFAULT 'Geral',
  date TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by INTEGER REFERENCES users(id),
  updated_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  deleted_by INTEGER REFERENCES users(id),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tx_deleted_date ON transactions(deleted, date);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);
`);

// Admin padrão (troque a senha via variável de ambiente)
const adminEmail = process.env.ADMIN_EMAIL || "admin@fintechflow.com";
if (!db.prepare("SELECT 1 FROM users WHERE email = ?").get(adminEmail)) {
  db.prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'admin')").run(
    "Administrador",
    adminEmail,
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10)
  );
}

export default db;
