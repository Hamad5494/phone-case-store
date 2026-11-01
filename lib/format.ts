/** Prices are stored as integer "paisa" (1 PKR = 100). Shown as e.g. "Rs 1,499". */
export function formatPrice(paisa: number): string {
  const rupees = Math.round(paisa / 100);
  return `Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(rupees)}`;
}
