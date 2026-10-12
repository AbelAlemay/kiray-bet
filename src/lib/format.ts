export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", options);
}

export function formatPrice(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}
