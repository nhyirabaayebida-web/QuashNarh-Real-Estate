"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Fingerprint,
  HardHat,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { TRADES } from "@/lib/trades";
import { formatGhanaCard } from "@/lib/ghana-card";

type Status = "idle" | "sending" | "sent" | "error";

export default function ArtisanForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [ghanaCard, setGhanaCard] = useState("GHA-");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickPhoto(file: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Passport photo must be a JPG, PNG or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Passport photo must be under 5 MB");
      return;
    }
    // Pre-check the passport frame (portrait, roughly 35 × 45 mm) before upload.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio >= 1 || ratio < 0.6) {
        URL.revokeObjectURL(url);
        setError("Use a portrait passport photo (35 × 45 mm) — taller than it is wide");
        return;
      }
      setError("");
      setPhoto(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Couldn't read that image — try another file");
    };
    img.src = url;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!photo) {
      setError("Please attach your passport photo — it's required for verification");
      return;
    }
    setStatus("sending");
    setError("");

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.set("ghanaCard", ghanaCard);
    fd.set("passport", photo);

    try {
      const res = await fetch("/api/artisans", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("sent");
      formEl.reset();
      setGhanaCard("GHA-");
      setPhoto(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
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
            <h3 className="mt-6 font-display text-2xl font-medium">Application received, craftsman.</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fog">
              Our team verifies your Ghana Card and passport photo, then calls
              your line within 48 hours. Once approved, you go live in the
              guild directory.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-bronze-deep link-sweep"
            >
              Register another trade
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
                <HardHat className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold">Join the guild</h3>
                <p className="text-[0.8125rem] text-fog">Free to apply — KYC verified in 48h</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Field label="Full name">
                <input
                  name="name"
                  required
                  minLength={2}
                  placeholder="Kwame Mensah"
                  className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="relative border-b hairline transition-colors focus-within:border-bronze">
                  <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                    Your trade
                  </span>
                  <select
                    name="trade"
                    required
                    defaultValue=""
                    className="mt-1.5 w-full appearance-none bg-transparent pb-2 pr-6 text-[0.9375rem] font-medium outline-none"
                  >
                    <option value="" disabled>
                      Choose a trade…
                    </option>
                    {TRADES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-3 right-0 h-4 w-4 text-fog" />
                </div>
                <Field label="Base location">
                  <input
                    name="location"
                    required
                    placeholder="Spintex, Accra"
                    className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone (WhatsApp line)">
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="+233 24 000 0000"
                    className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                  />
                </Field>
                <Field label="Email (optional)">
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Years of experience">
                  <input
                    name="years"
                    required
                    type="number"
                    min={0}
                    max={70}
                    placeholder="8"
                    className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                  />
                </Field>
                <Field label="Day rate in cedis (₵)">
                  <input
                    name="dayRate"
                    type="number"
                    min={0}
                    step={10}
                    placeholder="350"
                    className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                  />
                </Field>
              </div>
            </div>

            {/* KYC block */}
            <div className="mt-7 rounded-2xl border border-bronze/40 bg-bronze/8 p-5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 text-bronze-deep" />
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-bronze-deep">
                  KYC — identity verification
                </p>
              </div>
              <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className="block border-b hairline transition-colors focus-within:border-bronze">
                    <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                      Ghana Card number
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
                  <p className="mt-2.5 text-[0.75rem] leading-relaxed text-fog">
                    Your national ID number — kept private, used only for
                    verification.
                  </p>
                </div>

                {/* Passport photo */}
                <div>
                  <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                    Passport photo — 35 × 45 mm
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
                  />
                  {preview ? (
                    <div className="relative mt-1.5 w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Passport photo preview"
                        className="aspect-[35/45] h-24 rounded-xl border-2 border-moss/60 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto(null);
                          if (preview) URL.revokeObjectURL(preview);
                          setPreview(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        aria-label="Remove photo"
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-[#8f2d22]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="mt-1.5 flex aspect-[35/45] h-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-fog/50 text-fog transition-all hover:border-bronze hover:text-bronze-deep"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="px-2 text-center text-[0.5625rem] font-bold uppercase tracking-[0.1em]">
                        Upload
                      </span>
                    </button>
                  )}
                  <p className="mt-2 text-[0.6875rem] leading-relaxed text-fog">
                    Portrait, plain background.
                    <br />
                    We crop to passport size — JPG/PNG, max 5 MB.
                  </p>
                </div>
              </div>
            </div>

            <Field label="About your work" className="mt-5">
              <textarea
                name="bio"
                required
                minLength={20}
                rows={4}
                placeholder="Specialities, notable projects, guarantees you offer…"
                className="w-full resize-none bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
              />
            </Field>

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
                  <ShieldCheck className="h-4 w-4" />
                  Apply with KYC
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-fog">
              Your Ghana Card and photo are stored securely and shown only to
              our verification team.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
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
    <label className={`block border-b hairline transition-colors focus-within:border-bronze ${className ?? ""}`}>
      <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
