/** Auto-format user input into the GHA-000000000-0 shape as they type. */
export function formatGhanaCard(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = clean.replace(/[^A-Z]/g, "").slice(0, 3);
  const digits = clean.replace(/[^0-9]/g, "").slice(0, 10);
  if (!letters) return "";
  let out = letters;
  if (letters.length === 3) {
    if (digits.length > 0) out += `-${digits.slice(0, 9)}`;
    if (digits.length > 9) out += `-${digits.slice(9)}`;
  }
  return out;
}
