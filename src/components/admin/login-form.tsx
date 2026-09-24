"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

export default function LoginForm({ showHint }: { showHint: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const passcode = String(new FormData(e.currentTarget).get("passcode") ?? "");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Sign-in failed");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-9">
      <label className="block border-b hairline-light pb-2 transition-colors focus-within:border-bronze">
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.26em] text-fog">
          Passcode
        </span>
        <input
          name="passcode"
          type="password"
          required
          autoFocus
          placeholder="••••••••"
          className="mt-2 w-full bg-transparent text-lg tracking-widest outline-none placeholder:text-fog/40"
        />
      </label>

      {error && (
        <p className="mt-4 rounded-xl bg-bronze/15 px-4 py-3 text-sm font-medium text-bronze">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-bronze py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-cream disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {busy ? "Checking…" : "Enter the studio"}
      </button>

      {showHint && (
        <p className="mt-5 text-center text-[0.8125rem] text-fog">
          Demo passcode: <span className="font-mono font-bold text-bronze">quashnarh2026</span> — set{" "}
          <span className="font-mono">ADMIN_PASSCODE</span> to change it.
        </p>
      )}
    </form>
  );
}
