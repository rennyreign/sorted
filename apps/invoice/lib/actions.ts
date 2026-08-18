"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBankAccount,
  createClient,
  createInvoice,
  deleteBankAccount,
  deleteClient,
  deleteInvoice,
  saveSettings,
  updateBankAccount,
  updateClient,
  updateInvoice,
  updateInvoiceStatus,
  type InvoiceInput,
  type LineItemInput,
} from "./data";
import { LINE_ITEM_UNITS, INVOICE_STATUSES } from "./types";
import { CURRENCY_CODES } from "./currencies";

function str(form: FormData, key: string): string {
  return (form.get(key) ?? "").toString().trim();
}

function num(form: FormData, key: string): number {
  const value = Number(form.get(key));
  return Number.isFinite(value) ? value : 0;
}

// ---------- Settings ----------

export async function saveSettingsAction(form: FormData): Promise<void> {
  const currency = str(form, "default_currency");
  saveSettings({
    company_name: str(form, "company_name"),
    company_email: str(form, "company_email"),
    company_address: str(form, "company_address"),
    company_registration: str(form, "company_registration"),
    company_logo: str(form, "company_logo"),
    default_currency: CURRENCY_CODES.includes(currency) ? currency : "USD",
    invoice_prefix: str(form, "invoice_prefix") || "INV",
    default_notes: str(form, "default_notes"),
    default_tax_rate: num(form, "default_tax_rate"),
  });
  revalidatePath("/settings");
  revalidatePath("/");
}

// ---------- Bank accounts ----------

function bankFromForm(form: FormData) {
  const currency = str(form, "currency");
  return {
    label: str(form, "label"),
    bank_name: str(form, "bank_name"),
    account_name: str(form, "account_name"),
    account_number: str(form, "account_number"),
    account_type: str(form, "account_type"),
    iban: str(form, "iban"),
    swift: str(form, "swift"),
    routing: str(form, "routing"),
    bank_address: str(form, "bank_address"),
    currency: CURRENCY_CODES.includes(currency) ? currency : "USD",
  };
}

export async function createBankAccountAction(form: FormData): Promise<void> {
  createBankAccount(bankFromForm(form));
  revalidatePath("/settings");
}

export async function updateBankAccountAction(form: FormData): Promise<void> {
  const id = num(form, "id");
  updateBankAccount(id, bankFromForm(form));
  revalidatePath("/settings");
}

export async function deleteBankAccountAction(form: FormData): Promise<void> {
  deleteBankAccount(num(form, "id"));
  revalidatePath("/settings");
}

// ---------- Clients ----------

function clientFromForm(form: FormData) {
  return {
    name: str(form, "name"),
    contact_name: str(form, "contact_name"),
    email: str(form, "email"),
    address: str(form, "address"),
    notes: str(form, "notes"),
  };
}

export async function createClientAction(form: FormData): Promise<void> {
  const data = clientFromForm(form);
  if (!data.name) throw new Error("Client name is required");
  const id = createClient(data);
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}

export async function updateClientAction(form: FormData): Promise<void> {
  const id = num(form, "id");
  const data = clientFromForm(form);
  if (!data.name) throw new Error("Client name is required");
  updateClient(id, data);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(form: FormData): Promise<void> {
  deleteClient(num(form, "id"));
  revalidatePath("/clients");
  redirect("/clients");
}

// ---------- Invoices ----------

function invoiceFromForm(form: FormData): InvoiceInput {
  const descriptions = form.getAll("item_description").map((v) => v.toString());
  const units = form.getAll("item_unit").map((v) => v.toString());
  const quantities = form.getAll("item_quantity").map((v) => Number(v));
  const prices = form.getAll("item_unit_price").map((v) => Number(v));

  const items: LineItemInput[] = descriptions
    .map((description, i) => {
      const unit = units[i] ?? "project";
      return {
        description: description.trim(),
        unit: LINE_ITEM_UNITS.includes(unit as never) ? unit : "project",
        quantity: Number.isFinite(quantities[i]) ? quantities[i] : 0,
        unit_price: Number.isFinite(prices[i]) ? prices[i] : 0,
      };
    })
    .filter((item) => item.description !== "" || item.unit_price !== 0);

  const status = str(form, "status");
  const currency = str(form, "currency");
  const bankId = num(form, "bank_account_id");

  return {
    client_id: num(form, "client_id"),
    status: INVOICE_STATUSES.includes(status as never) ? status : "draft",
    currency: CURRENCY_CODES.includes(currency) ? currency : "USD",
    issue_date: str(form, "issue_date"),
    due_date: str(form, "due_date"),
    tax_rate: num(form, "tax_rate"),
    notes: str(form, "notes"),
    bank_account_id: bankId > 0 ? bankId : null,
    show_company_name: form.get("show_company_name") ? 1 : 0,
    items,
  };
}

export async function createInvoiceAction(form: FormData): Promise<void> {
  const input = invoiceFromForm(form);
  if (!input.client_id) throw new Error("A client is required");
  if (input.items.length === 0) throw new Error("At least one line item is required");
  const id = createInvoice(input);
  revalidatePath("/");
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceAction(form: FormData): Promise<void> {
  const id = num(form, "id");
  const input = invoiceFromForm(form);
  if (!input.client_id) throw new Error("A client is required");
  if (input.items.length === 0) throw new Error("At least one line item is required");
  updateInvoice(id, input);
  revalidatePath("/");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatusAction(form: FormData): Promise<void> {
  const id = num(form, "id");
  const status = str(form, "status");
  if (!INVOICE_STATUSES.includes(status as never)) return;
  updateInvoiceStatus(id, status);
  revalidatePath("/");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoiceAction(form: FormData): Promise<void> {
  deleteInvoice(num(form, "id"));
  revalidatePath("/");
  redirect("/");
}
