"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CircleCheck,
  Fingerprint,
  Loader2,
  PauseCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { Artisan } from "@/db/schema";
import { formatCedis } from "@/lib/format";
import { tradeLabel } from "@/lib/trades";
import { cn } from "@/lib/utils";

const TABS = [
  ["all", "All"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["suspended", "Suspended"],
] as const;

export default function ArtisansTable({ initial }: { initial: Artisan[] }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState<string>("pending");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [flash, setFlash] = useState("");

  const filtered = rows.filter((r) => tab === "all" || r.status === tab);

  function note(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2600);
  }

  async function setStatus(id: number, status: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/artisans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setRows((rs) => rs.map((r) => (r.id === id ? data.data : r)));
      note(status === "approved" ? "Artisan is live in the directory." : "Updated.");
    } catch (err) {
      note(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/artisans/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      setRows((rs) => rs.filter((r) => r.id !== id));
      note("Artisan removed.");
    } catch (err) {
      note(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full border hairline bg-cream p-1">
          {TABS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className={cn(
                "rounded-full px-5 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] transition-all",
                tab === val ? "bg-ink text-cream" : "text-espresso hover:text-bronze-deep",
              )}
            >
              {label}
              {val !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {rows.filter((r) => r.status === val).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <p
          aria-live="polite"
          className={cn(
            "rounded-full bg-moss px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-cream transition-opacity duration-300",
            flash ? "opacity-100" : "opacity-0",
          )}
        >
          {flash || "…"}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {filtered.map((a) => (
          <article
            key={a.id}
            className="flex flex-wrap items-center gap-5 rounded-3xl border hairline bg-cream p-5"
          >
            {a.passportPhoto ? (
              <a
                href={a.passportPhoto}
                target="_blank"
                rel="noreferrer"
                title="View passport photo"
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.passportPhoto}
                  alt={`${a.name} passport photo`}
                  className="rounded-full border-2 border-moss/40 object-cover transition-transform hover:scale-105"
                  style={{ height: 52, width: 52 }}
                />
              </a>
            ) : (
              <span
                className="flex shrink-0 items-center justify-center rounded-full bg-moss font-display text-base font-semibold italic text-cream"
                style={{ height: 52, width: 52 }}
              >
                {a.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            )}
            <div className="min-w-52 flex-1">
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                {a.name}
                {a.status === "approved" && <BadgeCheck className="h-4 w-4 text-moss" />}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-fog">
                {tradeLabel(a.trade)} · {a.location} · {a.years} yrs
                {a.dayRate ? ` · ${formatCedis(a.dayRate)}/day` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {a.ghanaCard ? (
                  <span className="flex items-center gap-1.5 rounded-md bg-moss/10 px-2 py-1 font-mono text-[0.6875rem] font-bold tracking-wider text-moss">
                    <Fingerprint className="h-3 w-3" />
                    {a.ghanaCard}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-md bg-[#8f2d22]/10 px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#8f2d22]">
                    <ShieldAlert className="h-3 w-3" />
                    No Ghana Card — request it
                  </span>
                )}
                {a.passportPhoto && (
                  <a
                    href={a.passportPhoto}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-md bg-bronze/15 px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-bronze-deep transition-colors hover:bg-bronze/30"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    View ID photo
                  </a>
                )}
              </div>
              <p className="mt-1 truncate text-[0.8125rem] text-espresso/70">{a.bio}</p>
              <a
                href={`tel:${a.phone.replace(/\s/g, "")}`}
                className="mt-1 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-bronze-deep hover:text-ink"
              >
                <Phone className="h-3 w-3" />
                {a.phone}
                {a.email ? ` · ${a.email}` : ""}
              </a>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {busyId === a.id && <Loader2 className="h-4 w-4 animate-spin text-fog" />}
              {a.status !== "approved" && (
                <button
                  onClick={() => setStatus(a.id, "approved")}
                  disabled={busyId === a.id}
                  className="flex items-center gap-2 rounded-full bg-moss px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-cream transition-opacity hover:opacity-85"
                >
                  <CircleCheck className="h-3.5 w-3.5" />
                  Approve
                </button>
              )}
              {a.status === "approved" && (
                <button
                  onClick={() => setStatus(a.id, "suspended")}
                  disabled={busyId === a.id}
                  className="flex items-center gap-2 rounded-full border hairline px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-espresso transition-colors hover:border-ink"
                >
                  <PauseCircle className="h-3.5 w-3.5" />
                  Suspend
                </button>
              )}
              {a.status === "suspended" && (
                <button
                  onClick={() => setStatus(a.id, "pending")}
                  disabled={busyId === a.id}
                  className="flex items-center gap-2 rounded-full border hairline px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-espresso transition-colors hover:border-ink"
                >
                  Back to pending
                </button>
              )}
              {confirmDeleteId === a.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => remove(a.id)}
                    className="flex h-10 items-center rounded-full bg-[#8f2d22] px-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-cream hover:opacity-85"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    aria-label="Cancel"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-parchment text-espresso"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(a.id)}
                  aria-label={`Remove ${a.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border hairline text-fog transition-colors hover:border-[#8f2d22] hover:bg-[#8f2d22] hover:text-cream"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="rounded-3xl border hairline bg-cream px-6 py-16 text-center text-sm text-fog">
            Nothing in &ldquo;{tab}&rdquo; right now.
          </p>
        )}
      </div>
    </div>
  );
}
