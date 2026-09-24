import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "quashnarh_admin";

export function adminToken(): string {
  const passcode = process.env.ADMIN_PASSCODE ?? "quashnarh2026";
  return createHash("sha256").update(`quashnarh:${passcode}`).digest("hex");
}

export function checkPasscode(passcode: string): boolean {
  const expected = process.env.ADMIN_PASSCODE ?? "quashnarh2026";
  return passcode === expected;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === adminToken();
}

/** True when no custom passcode is configured (demo mode). */
export function usingDefaultPasscode(): boolean {
  return !process.env.ADMIN_PASSCODE;
}
