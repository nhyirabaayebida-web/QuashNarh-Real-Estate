"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { Property } from "@/db/schema";
import { formatCedis, formatPrice, listingLabel, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";

type Row = Property;

export default function PropertiesTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [flash, setFlash] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.city.toLowerCase().includes(s) ||
        r.address.toLowerCase().includes(s),
    );
  }, [rows, q]);

  async function patch(id: number, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setRows((rs) => rs.map((r) => (r.id === id ? data.data : r)));
      setFlash("Saved — live on the site.");
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
      setEditingId(null);
      setTimeout(() => setFlash(""), 2600);
    }
  }

  async function remove(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      setRows((rs) => rs.filter((r) => r.id !== id));
      setFlash("Listing removed.");
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
      setTimeout(() => setFlash(""), 2600);
    }
  }

  function savePrice(id: number) {
    const price = Number(priceDraft.replace(/[^\d]/g, ""));
    if (!price) {
      setFlash("Enter a cedi amount");
      setTimeout(() => setFlash(""), 2000);
      return;
    }
    patch(id, { price });
  }

  return (
    <div className="mt-8">
      {/* search + flash */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-w-56 flex-1 items-center gap-2.5 rounded-full border hairline bg-cream px-4.5 py-3 transition-colors focus-within:border-bronze sm:max-w-80">
          <Search className="h-4 w-4 shrink-0 text-fog" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, area or address…"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-fog/60"
          />
        </label>
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
        {filtered.map((p) => (
          <article
            key={p.id}
            className="flex flex-wrap items-center gap-5 rounded-3xl border hairline bg-cream p-4 sm:p-5"
          >
            {/* cover */}
            <Link
              href={`/properties/${p.slug}`}
              className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-parchment"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.images[0]}
                alt={p.title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <span className="absolute bottom-1 right-1 rounded-md bg-ink/70 px-1.5 py-0.5 text-[0.5625rem] font-bold text-cream">
                {p.images.length} photo{p.images.length === 1 ? "" : "s"}
              </span>
            </Link>

            {/* title block */}
            <div className="min-w-44 flex-1">
              <Link
                href={`/properties/${p.slug}`}
                className="font-display text-lg font-semibold leading-tight hover:text-bronze-deep"
              >
                {p.title}
              </Link>
              <p className="mt-0.5 text-[0.8125rem] text-fog">
                {p.city} · {titleCase(p.propertyType)} · {p.bedrooms}bd/{p.bathrooms}ba
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.14em]",
                    p.listingType === "rent"
                      ? "bg-moss/12 text-moss"
                      : "bg-ink/8 text-espresso",
                  )}
                >
                  {listingLabel(p.listingType)}
                </span>
                <button
                  onClick={() => patch(p.id, { featured: !p.featured })}
                  disabled={busyId === p.id}
                  title="Toggle featured on homepage"
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.14em] transition-colors",
                    p.featured
                      ? "bg-bronze text-ink"
                      : "bg-parchment text-fog hover:text-bronze-deep",
                  )}
                >
                  <Star className={cn("h-3 w-3", p.featured && "fill-current")} />
                  Featured
                </button>
              </div>
            </div>

            {/* price editor */}
            <div className="w-44">
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-fog">
                Price (cedis)
              </p>
              {editingId === p.id ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={priceDraft}
                    onChange={(e) => setPriceDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") savePrice(p.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    inputMode="numeric"
                    className="w-full rounded-lg border hairline bg-cream px-2.5 py-2 text-sm font-bold outline-none focus:border-bronze"
                  />
                  <button
                    onClick={() => savePrice(p.id)}
                    disabled={busyId === p.id}
                    aria-label="Save price"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-moss text-cream transition-colors hover:bg-ink"
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-parchment text-espresso transition-colors hover:bg-sand"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setPriceDraft(String(p.price));
                  }}
                  className="group mt-1.5 flex items-center gap-2 font-display text-xl font-semibold hover:text-bronze-deep"
                >
                  {p.listingType === "rent" ? formatPrice(p.price, "rent") : formatCedis(p.price)}
                  <Pencil className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )}
            </div>

            {/* status */}
            <div>
              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-fog">
                Status
              </p>
              <select
                value={p.status}
                disabled={busyId === p.id}
                onChange={(e) => patch(p.id, { status: e.target.value })}
                className={cn(
                  "mt-1.5 cursor-pointer appearance-none rounded-lg border px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] outline-none transition-colors",
                  p.status === "available"
                    ? "border-moss/40 bg-moss/10 text-moss"
                    : p.status === "pending"
                      ? "border-bronze/50 bg-bronze/15 text-bronze-deep"
                      : "border-ink/30 bg-ink/8 text-espresso",
                )}
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold / Let</option>
              </select>
            </div>

            {/* actions */}
            <div className="ml-auto flex items-center gap-2">
              <Link
                href={`/admin/properties/${p.id}`}
                className="flex h-10 items-center gap-2 rounded-full border hairline px-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] transition-colors hover:border-ink hover:bg-ink hover:text-cream"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit & photos
              </Link>
              {confirmDeleteId === p.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => remove(p.id)}
                    disabled={busyId === p.id}
                    className="flex h-10 items-center rounded-full bg-[#8f2d22] px-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-cream transition-opacity hover:opacity-85"
                  >
                    {busyId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-parchment text-espresso"
                    aria-label="Cancel delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(p.id)}
                  aria-label={`Delete ${p.title}`}
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
            No listings match &ldquo;{q}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
