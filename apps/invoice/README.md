# SortedInvoice

Internal invoicing portal for digital service work — by project, by hours, or by units. Built on the Sorted monochrome design system.

Create invoices, keep a log of everything you've raised, track manual payment statuses, and export clean PDFs. Client accounts hold a record of every invoice they've received.

> **Location:** lives in the sorted monorepo at `apps/invoice`. It is a **self-contained, dynamic Next.js app** (Server Actions + local SQLite) and is intentionally **excluded from the root sorted static export** (`apps/**` is excluded in the root `tsconfig.json`; the root `next build` only compiles the top-level `app/`). Run and deploy it independently of the main sorted site. See "Getting started" below — all commands run from `apps/invoice`.

## Features

- **Invoice log** — every invoice in one place with status and totals.
- **Client accounts** — per-client details and their full invoice history.
- **Line items** — bill by `project` (flat fee), `hours`, or `units` (quantity × rate).
- **Multiple currencies** — pick the billing currency per invoice.
- **Bank details** — store multiple bank accounts, choose which to show per invoice.
- **Company name** — toggle whether your company name appears on each invoice.
- **Manual payment statuses** — `draft`, `sent`, `paid`, `overdue`, `cancelled`. Set by hand; nothing is automated.
- **PDF export** — one click opens the browser print dialog on a print-optimised invoice; save as PDF.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — Sorted design system (`#FAFAFA` / `#0A0A0A`, no accent colour), Plus Jakarta Sans + DM Mono
- SQLite via `better-sqlite3` — zero-config local file at `data/sortedinvoice.db`
- Server Actions for all mutations, Lucide icons

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

The SQLite database is created automatically on first run under `data/` (gitignored). Set `SORTEDINVOICE_DB` to override the path.

First run: open **Settings** to set your company name, default currency, and bank accounts. Then add a **Client** and create your first **Invoice**.

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

## Data model

- `settings` — company name, address, default currency, invoice prefix, default tax/notes.
- `clients` — name, contact, email, address, notes.
- `bank_accounts` — label, bank name, account name/number, IBAN, SWIFT, routing, currency.
- `invoices` — number, client, status, currency, issue/due dates, tax rate, notes, chosen bank account, show-company-name flag.
- `line_items` — description, unit (`project` / `hours` / `units`), quantity, unit price.

Invoice numbers auto-increment per year: `INV-2026-0001`.

## PDF export

Export uses the browser's native print-to-PDF against a dedicated print stylesheet, so the PDF matches the on-screen invoice exactly (A4, no app chrome). Click **Export PDF** on an invoice and choose "Save as PDF".
