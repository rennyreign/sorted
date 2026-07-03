// Demo seed for local preview only (not committed). Run after the app has
// created the schema at least once (e.g. after hitting any page).
import Database from "better-sqlite3";
import path from "node:path";

const db = new Database(path.join(process.cwd(), "data", "sortedinvoice.db"));

db.prepare(
  "INSERT INTO settings (key,value) VALUES ('company_name',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
).run("ADX Engine");
db.prepare(
  "UPDATE settings SET value=? WHERE key='company_email'",
).run("renaldo@adxengine.net");
db.prepare(
  "UPDATE settings SET value=? WHERE key='company_address'",
).run("Brussels, Belgium");

const bank = db
  .prepare(
    `INSERT INTO bank_accounts (label,bank_name,account_name,account_number,iban,swift,routing,bank_address,currency)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  )
  .run(
    "EUR account (Wise)",
    "Wise",
    "Renaldo Lee Edmondson",
    "",
    "BE42 9671 7255 2454",
    "TRWIBEB1XXX",
    "",
    "Rue du Trône 100, Brussels, 1050, Belgium",
    "EUR",
  ).lastInsertRowid;

const client = db
  .prepare(
    "INSERT INTO clients (name,contact_name,email,address,notes) VALUES (?,?,?,?,?)",
  )
  .run(
    "Party World",
    "Natasha",
    "hello@partyworld.example",
    "12 High Street\nDublin, Ireland",
    "Shopify store build.",
  ).lastInsertRowid;

const client2 = db
  .prepare(
    "INSERT INTO clients (name,contact_name,email,address,notes) VALUES (?,?,?,?,?)",
  )
  .run("Savannah Villegas", "Savannah", "savannah@example.com", "Austin, TX, USA", "")
  .lastInsertRowid;

function makeInvoice(num, clientId, status, currency, issue, due, taxRate, items, showCo = 1) {
  const id = db
    .prepare(
      `INSERT INTO invoices (invoice_number,client_id,status,currency,issue_date,due_date,tax_rate,notes,bank_account_id,show_company_name)
       VALUES (@invoice_number,@client_id,@status,@currency,@issue_date,@due_date,@tax_rate,@notes,@bank_account_id,@show_company_name)`,
    )
    .run({
      invoice_number: num,
      client_id: Number(clientId),
      status,
      currency,
      issue_date: issue,
      due_date: due,
      tax_rate: taxRate,
      notes: "Payment due within 14 days of the invoice date.",
      bank_account_id: Number(bank),
      show_company_name: showCo,
    })
    .lastInsertRowid;
  items.forEach((it, i) =>
    db
      .prepare(
        "INSERT INTO line_items (invoice_id,description,unit,quantity,unit_price,position) VALUES (?,?,?,?,?,?)",
      )
      .run(id, it[0], it[1], it[2], it[3], i),
  );
  return id;
}

makeInvoice("INV-2026-0001", client, "sent", "EUR", "2026-06-02", "2026-06-16", 0, [
  ["Store design", "project", 1, 1200],
  ["Shopify development", "hours", 24, 45],
  ["Product catalogue setup", "units", 60, 3.5],
]);
makeInvoice("INV-2026-0002", client2, "paid", "USD", "2026-05-10", "2026-05-24", 0, [
  ["Website refresh", "project", 1, 2500],
  ["Copywriting", "hours", 8, 60],
]);
makeInvoice("INV-2026-0003", client, "draft", "GBP", "2026-06-28", "2026-07-12", 20, [
  ["Landing page build", "project", 1, 900],
]);

console.log("Seeded demo data.");
