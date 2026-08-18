import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.SORTEDINVOICE_DB ?? path.join(DATA_DIR, "sortedinvoice.db");

let db: Database.Database | null = null;

function init(database: Database.Database): void {
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL DEFAULT '',
      bank_name TEXT NOT NULL DEFAULT '',
      account_name TEXT NOT NULL DEFAULT '',
      account_number TEXT NOT NULL DEFAULT '',
      account_type TEXT NOT NULL DEFAULT '',
      iban TEXT NOT NULL DEFAULT '',
      swift TEXT NOT NULL DEFAULT '',
      routing TEXT NOT NULL DEFAULT '',
      bank_address TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'USD'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT NOT NULL DEFAULT 'USD',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      tax_rate REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
      show_company_name INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS line_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT 'project',
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
    CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON line_items(invoice_id);
  `);

  const bankColumns = database
    .prepare("PRAGMA table_info(bank_accounts)")
    .all() as { name: string }[];
  if (!bankColumns.some((c) => c.name === "account_type")) {
    database.exec(
      "ALTER TABLE bank_accounts ADD COLUMN account_type TEXT NOT NULL DEFAULT ''",
    );
  }

  const defaults: Record<string, string> = {
    company_name: "Sorted",
    company_email: "",
    company_address: "",
    company_registration: "",
    company_logo: "",
    default_currency: "USD",
    invoice_prefix: "INV",
    default_notes: "Payment due within 14 days of the invoice date.",
    default_tax_rate: "0",
  };

  const insertSetting = database.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  const seed = database.transaction(() => {
    for (const [key, value] of Object.entries(defaults)) {
      insertSetting.run(key, value);
    }
  });
  seed();
}

export function getDb(): Database.Database {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  db = new Database(DB_PATH);
  init(db);
  return db;
}
