"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  FileCheck2,
  FileText,
  Fingerprint,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { DOCUMENT_REQUIREMENTS } from "@/lib/documents";
import { formatGhanaCard } from "@/lib/ghana-card";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

const PROPERTY_TYPES = [
  "house",
  "villa",
  "apartment",
  "condo",
  "townhouse",
  "cottage",
  "penthouse",
  "loft",
];

export default function SubmissionForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [ghanaCard, setGhanaCard] = useState("GHA-");
  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const [open, setOpen] = useState(false);

  function attach(type: string, file: File | null) {
    if (!file) return;
    const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type)) {
      setError("Documents must be PDF, JPG, PNG or WEBP files");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Each document must be under 8 MB");
      return;
    }
    setError("");
    setDocs((d) => ({ ...d, [type]: file }));
  }

  const missingRequired = DOCUMENT_REQUIREMENTS.filter(
    (r) => r.required && !docs[r.type],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (missingRequired.length > 0) {
      setError(`Please attach: ${missingRequired.map((r) => r.short).join(", ")}`);
      return;
    }
    setStatus("sending");
    setError("");

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.set("ghanaCard", ghanaCard);
    for (const r of DOCUMENT_REQUIREMENTS) {
      const file = docs[r.type];
      if (file) fd.set(`doc_${r.type}`, file);
    }

    try {
      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("sent");
      formEl.reset();
      setGhanaCard("GHA-");
      setDocs({});
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border hairline bg-cream">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center px-8 py-16 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-moss text-cream"
            >
              <Check className="h-7 w-7" />
            </motion.span>
            <h3 className="mt-6 font-display text-2xl font-medium">
              Documents received, {`we'll`} take it from here.
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fog">
              Our compliance team verifies every title, site plan and ID within
              72 hours, then calls to confirm valuation and next steps. Nothing
              lists until it&rsquo;s proven.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-bronze-deep link-sweep"
            >
              Submit another property
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className="p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bronze/15 text-bronze-deep">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold">Submit your property</h3>
                <p className="text-[0.8125rem] text-fog">
                  Strict verification — a listing that buyers can trust
                </p>
              </div>
            </div>

            {/* Owner */}
            <div className="mt-6 space-y-5">
              <Field label="Owner's full name">
                <input name="ownerName" required minLength={2} placeholder="Narh Quarshie" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone (WhatsApp line)">
                  <input name="ownerPhone" required type="tel" placeholder="+233 24 000 0000" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
                <Field label="Email (optional)">
                  <input name="ownerEmail" type="email" placeholder="you@example.com" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
              </div>
              <label className="block border-b hairline transition-colors focus-within:border-bronze">
                <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                  Owner&rsquo;s Ghana Card number
                </span>
                <span className="mt-1.5 flex items-center gap-2.5 pb-2">
                  <Fingerprint className="h-4.5 w-4.5 shrink-0 text-bronze-deep" />
                  <input
                    value={ghanaCard}
                    onChange={(e) => setGhanaCard(formatGhanaCard(e.target.value))}
                    required
                    pattern="GHA-\d{9}-\d"
                    title="Format: GHA-123456789-0"
                    placeholder="GHA-000000000-0"
                    className="w-full bg-transparent font-mono text-[0.9375rem] font-semibold tracking-wider outline-none placeholder:text-fog/50"
                  />
                </span>
              </label>
            </div>

            {/* Property */}
            <div className="mt-7 space-y-5">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-bronze-deep">
                The property
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField label="Property type" name="propertyType" options={PROPERTY_TYPES} />
                <Field label="City / area">
                  <input name="city" required placeholder="East Legon" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
              </div>
              <Field label="Street address">
                <input name="address" required placeholder="12 Baobab Close" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Region (optional)">
                  <input name="region" placeholder="Greater Accra" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
                <Field label="Bedrooms">
                  <input name="bedrooms" required type="number" min={0} max={50} placeholder="4" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
                <Field label="Bathrooms">
                  <input name="bathrooms" required type="number" min={0} max={50} placeholder="3" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Living area (sqft, optional)">
                  <input name="areaSqft" inputMode="numeric" placeholder="2,800" className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50" />
                </Field>
                <Field label="Asking price in cedis (₵)">
                  <input name="askingPrice" inputMode="numeric" placeholder="2,400,000" className="w-full bg-transparent pb-2 text-xl font-bold outline-none placeholder:text-fog/50" />
                </Field>
              </div>
              <Field label="Tell buyers about the home">
                <textarea
                  name="description"
                  required
                  minLength={30}
                  rows={4}
                  placeholder="The story, the finishes, the neighbourhood — why it's worth a viewing…"
                  className="w-full resize-y rounded-xl border hairline bg-cream p-4 text-[0.9375rem] leading-relaxed outline-none transition-colors focus:border-bronze placeholder:text-fog/50"
                />
              </Field>
            </div>

            {/* Documents */}
            <div className="mt-7 rounded-2xl border border-bronze/40 bg-bronze/8 p-5">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <FileCheck2 className="h-4.5 w-4.5 text-bronze-deep" />
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-bronze-deep">
                    Required documents ({Object.values(docs).filter(Boolean).length}/
                    {DOCUMENT_REQUIREMENTS.filter((r) => r.required).length})
                  </span>
                </span>
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-bronze-deep">
                  {open ? "Hide" : "Show"}
                </span>
              </button>

              <div className={cn("grid transition-all duration-500", open ? "mt-5" : "pointer-events-none h-0 overflow-hidden opacity-0")}>
                <div className="space-y-4">
                  {DOCUMENT_REQUIREMENTS.map((req) => (
                    <DocUpload
                      key={req.type}
                      label={req.label}
                      note={req.note}
                      required={req.required}
                      file={docs[req.type] ?? null}
                      onFile={(f) => attach(req.type, f)}
                      onClear={() =>
                        setDocs((d) => {
                          const next = { ...d };
                          delete next[req.type];
                          return next;
                        })
                      }
                    />
                  ))}
                </div>
              </div>
              {!open && missingRequired.length > 0 && (
                <p className="mt-3 text-[0.75rem] font-medium text-bronze-deep">
                  Attach the {DOCUMENT_REQUIREMENTS.filter((r) => r.required).length} required
                  documents to submit — tap show to upload.
                </p>
              )}
            </div>

            {status === "error" || error ? (
              <p className="mt-4 rounded-xl bg-bronze/15 px-4 py-3 text-sm font-medium text-bronze-deep">
                {error || "Could not submit — please try again."}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-ink py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-all duration-300 hover:bg-bronze-deep disabled:opacity-60"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <FileCheck2 className="h-4 w-4" />
                  Submit for verification
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-fog">
              Your documents are reviewed by our compliance team only, and are
              never published with your listing.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function DocUpload({
  label,
  note,
  required,
  file,
  onFile,
  onClear,
}: {
  label: string;
  note: string;
  required: boolean;
  file: File | null;
  onFile: (f: File | null) => void;
  onClear: () => void;
}) {
  const inputId = `doc-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border bg-cream p-3.5 transition-colors",
        file ? "border-moss/50" : required ? "border-bronze/40" : "hairline",
      )}
    >
      <div className="min-w-48 flex-1">
        <p className="text-[0.8125rem] font-bold">
          {label}
          {required && <span className="ml-1 text-bronze-deep">*</span>}
        </p>
        <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-fog">{note}</p>
      </div>
      {file ? (
        <div className="flex items-center gap-2.5">
          <span className="flex max-w-52 items-center gap-1.5 truncate rounded-lg bg-moss/10 px-3 py-2 text-[0.6875rem] font-bold text-moss">
            <Paperclip className="h-3 w-3 shrink-0" />
            <span className="truncate">{file.name}</span>
          </span>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-parchment text-espresso transition-colors hover:bg-[#8f2d22] hover:text-cream"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-bronze-deep"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach
          <input
            id={inputId}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block border-b hairline transition-colors focus-within:border-bronze", className)}>
      <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <p className="text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">{label}</p>
      <select
        name={name}
        required
        defaultValue=""
        className="mt-1.5 w-full appearance-none border-b hairline bg-transparent pb-2 pr-6 text-[0.9375rem] font-medium capitalize outline-none transition-colors focus:border-bronze"
      >
        <option value="" disabled>
          Choose a type…
        </option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
