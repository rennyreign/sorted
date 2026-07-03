export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

// Currencies SortedInvoice can bill in. Extend this list as needed.
export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

// Currencies with no minor unit (whole-number amounts only).
const ZERO_DECIMAL = new Set(["JPY"]);

export function formatMoney(amount: number, code: string): string {
  const currency = getCurrency(code);
  const fractionDigits = ZERO_DECIMAL.has(currency.code) ? 0 : 2;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${currency.symbol}${formatted}`;
}
