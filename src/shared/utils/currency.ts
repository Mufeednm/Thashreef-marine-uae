const aedFormatter = new Intl.NumberFormat("en-AE", {
  currency: "AED",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

export function formatAedFromCents(amountInCents: number): string {
  return aedFormatter.format(amountInCents / 100);
}
