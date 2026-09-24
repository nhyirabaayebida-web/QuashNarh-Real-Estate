/** All prices on the platform are Ghana cedis (GHS). */
export function formatPrice(
  price: number,
  listingType: string,
  opts: { compact?: boolean } = {},
): string {
  if (listingType === "rent") {
    return `₵${price.toLocaleString("en-US")}/mo`;
  }
  if (opts.compact && price >= 1_000_000) {
    const m = price / 1_000_000;
    const str = m >= 10 ? m.toFixed(1) : m.toFixed(2);
    return `₵${str.replace(/\.?0+$/, "")}M`;
  }
  return `₵${price.toLocaleString("en-US")}`;
}

/** ₵1,250,000 */
export function formatCedis(n: number): string {
  return `₵${n.toLocaleString("en-US")}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function listingLabel(listingType: string): string {
  return listingType === "rent" ? "For Rent" : "For Sale";
}

export function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
