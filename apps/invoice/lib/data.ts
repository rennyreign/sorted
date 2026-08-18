import "server-only";
import { getDb } from "./db";
import { computeTotals } from "./format";
import type {
  BankAccount,
  Client,
  CompanySettings,
  FullInvoice,
  Invoice,
  InvoiceWithClient,
  LineItem,
} from "./types";

// ---------- Settings ----------

export function getSettings(): CompanySettings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    company_name: map.get("company_name") ?? "",
    company_email: map.get("company_email") ?? "",
    company_address: map.get("company_address") ?? "",
    company_registration: map.get("company_registration") ?? "",
    company_logo: map.get("company_logo") ?? "",
    default_currency: map.get("default_currency") ?? "USD",
    invoice_prefix: map.get("invoice_prefix") ?? "INV",
    default_notes: map.get("default_notes") ?? "",
    default_tax_rate: Number(map.get("default_tax_rate") ?? "0"),
  };
}

export function saveSettings(settings: CompanySettings): void {
  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  const entries: [string, string][] = [
    ["company_name", settings.company_name],
    ["company_email", settings.company_email],
    ["company_address", settings.company_address],
    ["company_registration", settings.company_registration],
    ["company_logo", settings.company_logo],
    ["default_currency", settings.default_currency],
    ["invoice_prefix", settings.invoice_prefix],
    ["default_notes", settings.default_notes],
    ["default_tax_rate", String(settings.default_tax_rate)],
  ];
  db.transaction(() => {
    for (const [key, value] of entries) upsert.run(key, value);
  })();
}

// ---------- Bank accounts ----------

export function getBankAccounts(): BankAccount[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM bank_accounts ORDER BY label COLLATE NOCASE")
    .all() as BankAccount[];
}

export function getBankAccount(id: number): BankAccount | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM bank_accounts WHERE id = ?").get(id) as
      | BankAccount
      | undefined) ?? null
  );
}

export function createBankAccount(data: Omit<BankAccount, "id">): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO bank_accounts
        (label, bank_name, account_name, account_number, account_type, iban, swift, routing, bank_address, currency)
       VALUES (@label, @bank_name, @account_name, @account_number, @account_type, @iban, @swift, @routing, @bank_address, @currency)`,
    )
    .run(data);
  return Number(result.lastInsertRowid);
}

export function updateBankAccount(id: number, data: Omit<BankAccount, "id">): void {
  const db = getDb();
  db.prepare(
    `UPDATE bank_accounts SET
       label = @label, bank_name = @bank_name, account_name = @account_name,
       account_number = @account_number, account_type = @account_type, iban = @iban, swift = @swift,
       routing = @routing, bank_address = @bank_address, currency = @currency
     WHERE id = @id`,
  ).run({ ...data, id });
}

export function deleteBankAccount(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM bank_accounts WHERE id = ?").run(id);
}

// ---------- Clients ----------

export function getClients(): (Client & { invoice_count: number })[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.*, COUNT(i.id) AS invoice_count
       FROM clients c
       LEFT JOIN invoices i ON i.client_id = c.id
       GROUP BY c.id
       ORDER BY c.name COLLATE NOCASE`,
    )
    .all() as (Client & { invoice_count: number })[];
}

export function getClient(id: number): Client | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM clients WHERE id = ?").get(id) as
      | Client
      | undefined) ?? null
  );
}

export function createClient(
  data: Omit<Client, "id" | "created_at">,
): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO clients (name, contact_name, email, address, notes)
       VALUES (@name, @contact_name, @email, @address, @notes)`,
    )
    .run(data);
  return Number(result.lastInsertRowid);
}

export function updateClient(
  id: number,
  data: Omit<Client, "id" | "created_at">,
): void {
  const db = getDb();
  db.prepare(
    `UPDATE clients SET name = @name, contact_name = @contact_name,
       email = @email, address = @address, notes = @notes
     WHERE id = @id`,
  ).run({ ...data, id });
}

export function deleteClient(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
}

export function clientHasInvoices(id: number): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) AS n FROM invoices WHERE client_id = ?")
    .get(id) as { n: number };
  return row.n > 0;
}

// ---------- Invoices ----------

export function getInvoices(): (InvoiceWithClient & { total: number })[] {
  const db = getDb();
  const invoices = db
    .prepare(
      `SELECT i.*, c.name AS client_name
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       ORDER BY i.issue_date DESC, i.id DESC`,
    )
    .all() as InvoiceWithClient[];

  return invoices.map((inv) => {
    const items = getLineItems(inv.id);
    const { total } = computeTotals(items, inv.tax_rate);
    return { ...inv, total };
  });
}

export function getInvoicesForClient(
  clientId: number,
): (Invoice & { total: number })[] {
  const db = getDb();
  const invoices = db
    .prepare(
      "SELECT * FROM invoices WHERE client_id = ? ORDER BY issue_date DESC, id DESC",
    )
    .all(clientId) as Invoice[];
  return invoices.map((inv) => {
    const items = getLineItems(inv.id);
    const { total } = computeTotals(items, inv.tax_rate);
    return { ...inv, total };
  });
}

export function getLineItems(invoiceId: number): LineItem[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM line_items WHERE invoice_id = ? ORDER BY position, id",
    )
    .all(invoiceId) as LineItem[];
}

export function getInvoice(id: number): Invoice | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
      | Invoice
      | undefined) ?? null
  );
}

export function getFullInvoice(id: number): FullInvoice | null {
  const invoice = getInvoice(id);
  if (!invoice) return null;
  const client = getClient(invoice.client_id);
  if (!client) return null;
  const items = getLineItems(id);
  const bankAccount = invoice.bank_account_id
    ? getBankAccount(invoice.bank_account_id)
    : null;
  const company = getSettings();
  const totals = computeTotals(items, invoice.tax_rate);
  return { invoice, client, items, bankAccount, company, totals };
}

export type LineItemInput = {
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceInput = {
  client_id: number;
  status: string;
  currency: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  notes: string;
  bank_account_id: number | null;
  show_company_name: number;
  items: LineItemInput[];
};

export function nextInvoiceNumber(): string {
  const db = getDb();
  const prefix =
    (db.prepare("SELECT value FROM settings WHERE key = 'invoice_prefix'").get() as
      | { value: string }
      | undefined)?.value ?? "INV";
  const year = new Date().getFullYear();
  const like = `${prefix}-${year}-%`;
  const row = db
    .prepare(
      "SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1",
    )
    .get(like) as { invoice_number: string } | undefined;
  let seq = 1;
  if (row) {
    const tail = row.invoice_number.split("-").pop();
    const parsed = Number(tail);
    if (!Number.isNaN(parsed)) seq = parsed + 1;
  }
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}

function insertItems(
  db: ReturnType<typeof getDb>,
  invoiceId: number,
  items: LineItemInput[],
): void {
  const insert = db.prepare(
    `INSERT INTO line_items (invoice_id, description, unit, quantity, unit_price, position)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  items.forEach((item, index) => {
    insert.run(
      invoiceId,
      item.description,
      item.unit,
      item.quantity,
      item.unit_price,
      index,
    );
  });
}

export function createInvoice(input: InvoiceInput): number {
  const db = getDb();
  const invoiceNumber = nextInvoiceNumber();
  return db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO invoices
          (invoice_number, client_id, status, currency, issue_date, due_date,
           tax_rate, notes, bank_account_id, show_company_name)
         VALUES (@invoice_number, @client_id, @status, @currency, @issue_date,
           @due_date, @tax_rate, @notes, @bank_account_id, @show_company_name)`,
      )
      .run({
        invoice_number: invoiceNumber,
        client_id: input.client_id,
        status: input.status,
        currency: input.currency,
        issue_date: input.issue_date,
        due_date: input.due_date,
        tax_rate: input.tax_rate,
        notes: input.notes,
        bank_account_id: input.bank_account_id,
        show_company_name: input.show_company_name,
      });
    const invoiceId = Number(result.lastInsertRowid);
    insertItems(db, invoiceId, input.items);
    return invoiceId;
  })();
}

export function updateInvoice(id: number, input: InvoiceInput): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `UPDATE invoices SET
         client_id = @client_id, status = @status, currency = @currency,
         issue_date = @issue_date, due_date = @due_date, tax_rate = @tax_rate,
         notes = @notes, bank_account_id = @bank_account_id,
         show_company_name = @show_company_name
       WHERE id = @id`,
    ).run({
      id,
      client_id: input.client_id,
      status: input.status,
      currency: input.currency,
      issue_date: input.issue_date,
      due_date: input.due_date,
      tax_rate: input.tax_rate,
      notes: input.notes,
      bank_account_id: input.bank_account_id,
      show_company_name: input.show_company_name,
    });
    db.prepare("DELETE FROM line_items WHERE invoice_id = ?").run(id);
    insertItems(db, id, input.items);
  })();
}

export function updateInvoiceStatus(id: number, status: string): void {
  const db = getDb();
  db.prepare("UPDATE invoices SET status = ? WHERE id = ?").run(status, id);
}

export function deleteInvoice(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
}

// ---------- Dashboard summary ----------

export type DashboardStats = {
  total: number;
  outstanding: number;
  paidCount: number;
  draftCount: number;
};

export function getDashboardStats(): DashboardStats {
  const invoices = getInvoices();
  let outstanding = 0;
  let paidCount = 0;
  let draftCount = 0;
  for (const inv of invoices) {
    if (inv.status === "paid") paidCount += 1;
    if (inv.status === "draft") draftCount += 1;
    if (inv.status === "sent" || inv.status === "overdue") {
      outstanding += inv.total;
    }
  }
  return {
    total: invoices.length,
    outstanding,
    paidCount,
    draftCount,
  };
}
