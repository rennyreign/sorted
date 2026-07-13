import type { InvoiceStatus, LineItem, InvoiceTotals } from "./types";

export function computeTotals(items: LineItem[], taxRate: number): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const tax = subtotal * (taxRate / 100);
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

// Monochrome-friendly status treatments (design system has no accent colour).
export const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-black/[0.04] text-[#737373] border-black/[0.08]",
  sent: "bg-[#0A0A0A] text-[#FAFAFA] border-[#0A0A0A]",
  paid: "bg-white text-[#0A0A0A] border-[#0A0A0A]",
  overdue: "bg-white text-[#0A0A0A] border-black/[0.25] border-dashed",
  cancelled: "bg-black/[0.03] text-[#A3A3A3] border-black/[0.06] line-through",
};
