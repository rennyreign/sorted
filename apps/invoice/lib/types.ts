export type Client = {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  address: string;
  notes: string;
  created_at: string;
};

export type BankAccount = {
  id: number;
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift: string;
  routing: string;
  bank_address: string;
  currency: string;
};

export type CompanySettings = {
  company_name: string;
  company_email: string;
  company_address: string;
  company_registration: string;
  default_currency: string;
  invoice_prefix: string;
  default_notes: string;
  default_tax_rate: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
];

export type LineItemUnit = "project" | "hours" | "units";

export const LINE_ITEM_UNITS: LineItemUnit[] = ["project", "hours", "units"];

export type LineItem = {
  id: number;
  invoice_id: number;
  description: string;
  unit: LineItemUnit;
  quantity: number;
  unit_price: number;
  position: number;
};

export type Invoice = {
  id: number;
  invoice_number: string;
  client_id: number;
  status: InvoiceStatus;
  currency: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  notes: string;
  bank_account_id: number | null;
  show_company_name: number;
  created_at: string;
};

export type InvoiceWithClient = Invoice & {
  client_name: string;
};

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

export type FullInvoice = {
  invoice: Invoice;
  client: Client;
  items: LineItem[];
  bankAccount: BankAccount | null;
  company: CompanySettings;
  totals: InvoiceTotals;
};
