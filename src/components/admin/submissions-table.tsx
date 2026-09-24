"use client";

import { useState } from "react";
import {
  ChevronDown,
  CircleCheck,
  Eye,
  FileCheck2,
  Loader2,
  MapPin,
  Phone,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type { Submission } from "@/db/schema";
import { formatCedis, formatNumber, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-bronze/15 text-bronze-deep border-bronze/40",
  reviewing: "bg-parchment text-espresso border-fog/40",
  approved: "bg-moss/12 text-moss border-moss/40",
  rejected: "bg-[#8f2d22]/10 text-[#8f2d22] border-[#8f2d22]/30",
};

export default function SubmissionsTable({ initial }: { initial: Submission[] }) {
  const [rows, setRows] = useState(initial);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [flash, setFlash] = useState("");

  function note(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2600);
  }

  async function setStatus(id: number, status: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setRows((rs) => rs.map((r) => (r.id === id ? data.data : r)));
      note(
        status === "approved"
          ? "Documents verified — ready to create the listing."
          : status === "rejected"
            ? "Submission rejected."
            : "Updated.",
      );
    } catch (err) {
      note(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      setRows((rs) => rs.filter((r) => r.id !== id));
      note("Submission removed.");
    } catch (err) {
      note(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="mt-8 rounded-3xl border hairline bg-cream px-6 py-16 text-center text-sm text-fog">
        No sell requests yet. When owners submit properties with their
        documents, they&rsquo;ll appear here for verification.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <p
        aria-live="polite"
        className={cn(
          "mb-4 inline-block rounded-full bg-moss px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-cream transition-opacity duration-300",
          flash ? "opacity-100" : "opacity-0",
        )}
      >
        {flash || "…"}
      </p>

      <div className="space-y-4">
        {rows.map((s) => {
          const open = expanded === s.id;
          return (
            <article key={s.id} className="rounded-3xl border hairline bg-cream">
              {/* Summary row */}
              <div className="flex flex-wrap items-center gap-5 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/6 text-espresso">
                  <FileCheck2 className="h-5 w-5" />
                </span>
                <div className="min-w-48 flex-1">
                  <p className="font-display text-lg font-semibold leading-tight">
                    {titleCase(s.propertyType)} · {s.address}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[0.8125rem] text-fog">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {s.city}
                      {s.region ? `, ${s.region}` : ""}
                    </span>
                    <span>
                      {s.bedrooms}bd / {s.bathrooms}ba
                    </span>
                    <span className="font-mono text-[0.75rem]">{s.ghanaCard}</span>
                    <span className="font-semibold text-bronze-deep">
                      {s.ownerName}
                    </span>
                  </p>
                </div>
                {s.askingPrice ? (
                  <p className="font-display text-xl font-semibold">
                    {formatCedis(s.askingPrice)}
                  </p>
                ) : null}
                <span
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em]",
                    STATUS_STYLES[s.status],
                  )}
                >
                  {s.status}
                </span>
                <button
                  onClick={() => setExpanded(open ? null : s.id)}
                  aria-expanded={open}
                  className="flex items-center gap-2 rounded-full border hairline px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] transition-colors hover:border-ink"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {open ? "Hide" : "Documents"}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
                  />
                </button>
              </div>

              {/* Expanded detail */}
              {open && (
                <div className="border-t hairline p-5">
                  <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    {/* Owner + property */}
                    <div>
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-fog">
                        Owner
                      </p>
                      <div className="mt-2 space-y-1.5 text-[0.875rem]">
                        <p className="font-semibold">{s.ownerName}</p>
                        <a
                          href={`tel:${s.ownerPhone.replace(/\s/g, "")}`}
                          className="flex items-center gap-1.5 font-medium text-bronze-deep hover:text-ink"
                        >
                          <Phone className="h-3 w-3" />
                          {s.ownerPhone}
                        </a>
                        {s.ownerEmail && <p className="text-fog">{s.ownerEmail}</p>}
                        <p className="font-mono text-[0.8125rem] text-fog">{s.ghanaCard}</p>
                      </div>
                      {s.areaSqft ? (
                        <p className="mt-4 text-[0.8125rem] text-fog">
                          Living area: {formatNumber(s.areaSqft)} sqft
                        </p>
                      ) : null}
                      <p className="mt-4 rounded-xl bg-parchment/60 px-4 py-3 text-[0.875rem] leading-relaxed text-espresso/85">
                        {s.description}
                      </p>
                    </div>

                    {/* Documents */}
                    <div>
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-fog">
                        Documents ({s.documents.length})
                      </p>
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        {s.documents.map((doc) => (
                          <a
                            key={doc.path}
                            href={doc.path}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[0.8125rem] font-semibold transition-colors",
                              doc.type === "permit"
                                ? "hairline text-espresso hover:border-ink"
                                : "border-moss/40 bg-moss/8 text-moss hover:bg-moss/15",
                            )}
                          >
                            <FileCheck2 className="h-4 w-4 shrink-0" />
                            <span className="truncate">{doc.label}</span>
                          </a>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap items-center gap-2">
                        {busyId === s.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-fog" />
                        )}
                        {s.status === "pending" && (
                          <button
                            onClick={() => setStatus(s.id, "reviewing")}
                            disabled={busyId === s.id}
                            className="rounded-full border hairline px-5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-espresso transition-colors hover:border-ink"
                          >
                            Mark reviewing
                          </button>
                        )}
                        {s.status !== "approved" && (
                          <button
                            onClick={() => setStatus(s.id, "approved")}
                            disabled={busyId === s.id}
                            className="flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-cream transition-opacity hover:opacity-85"
                          >
                            <CircleCheck className="h-3.5 w-3.5" />
                            Verify &amp; approve
                          </button>
                        )}
                        {s.status !== "rejected" && (
                          <button
                            onClick={() => setStatus(s.id, "rejected")}
                            disabled={busyId === s.id}
                            className="flex items-center gap-2 rounded-full border border-[#8f2d22]/40 px-5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#8f2d22] transition-colors hover:bg-[#8f2d22] hover:text-cream"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}
                        {confirmDeleteId === s.id ? (
                          <span className="flex items-center gap-1.5">
                            <button
                              onClick={() => remove(s.id)}
                              className="flex h-10 items-center rounded-full bg-[#8f2d22] px-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-cream hover:opacity-85"
                            >
                              Confirm delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              aria-label="Cancel"
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-parchment text-espresso"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(s.id)}
                            aria-label="Delete submission"
                            className="flex h-10 w-10 items-center justify-center rounded-full border hairline text-fog transition-colors hover:border-[#8f2d22] hover:bg-[#8f2d22] hover:text-cream"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
