// lib/formatMoney.ts — display price formatting for the shop and cart.
// The authoritative price is always Selar's; this is the shelf label.

/** Formats an amount with its currency, e.g. 4500 NGN → "₦4,500". */
export function formatMoney(amount: number, currency = "NGN"): string {
  try {
    // Naira has no minor unit; other currencies keep their usual decimals.
    const maximumFractionDigits = currency.toUpperCase() === "NGN" ? 0 : 2;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits,
    }).format(amount);
  } catch {
    // Unknown ISO code — fall back to a plain, honest label.
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}
