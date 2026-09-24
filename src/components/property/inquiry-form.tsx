"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = [
  ["tour", "Book a tour"],
  ["info", "Request info"],
  ["offer", "Make an offer"],
] as const;

type Status = "idle" | "sending" | "sent" | "error";

export default function InquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: number;
  propertyTitle: string;
}) {
  const [topic, setTopic] = useState<string>("tour");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      propertyId,
      topic,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      tourDate: String(form.get("tourDate") ?? "") || null,
      message: String(form.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("sent");
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
            className="flex flex-col items-center px-8 py-14 text-center"
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
              Consider it handled.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-fog">
              Your note is with the listing agent for{" "}
              <span className="font-semibold text-espresso">{propertyTitle}</span>.
              Expect a reply within the hour, 9am — 7pm.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-bronze-deep link-sweep"
            >
              Send another message
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
            {/* Topic picker */}
            <div className="grid grid-cols-3 gap-1 rounded-full border hairline bg-parchment/60 p-1">
              {TOPICS.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTopic(val)}
                  className={cn(
                    "rounded-full px-2 py-2.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] transition-all duration-300",
                    topic === val ? "bg-ink text-cream" : "text-espresso hover:text-bronze-deep",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              <Field label="Full name">
                <input
                  name="name"
                  required
                  minLength={2}
                  placeholder="Alexandra Moreau"
                  className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                />
              </Field>
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone (optional)">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                  />
                </Field>
                {topic === "tour" && (
                  <Field label="Preferred date">
                    <input
                      name="tourDate"
                      type="date"
                      className="w-full bg-transparent pb-2 text-[0.9375rem] font-medium outline-none"
                    />
                  </Field>
                )}
              </div>
              <Field label="Message">
                <textarea
                  name="message"
                  required
                  minLength={10}
                  rows={4}
                  placeholder={
                    topic === "offer"
                      ? "I'd like to discuss terms on this property…"
                      : "We'd love to see this home — ideally this weekend…"
                  }
                  className="w-full resize-none bg-transparent pb-2 text-[0.9375rem] font-medium outline-none placeholder:text-fog/50"
                />
              </Field>
            </div>

            {status === "error" && (
              <p className="mt-4 rounded-xl bg-bronze/15 px-4 py-3 text-sm font-medium text-bronze-deep">
                {error || "Could not send your inquiry. Please try again."}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="group mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-ink py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-all duration-300 hover:bg-bronze-deep disabled:opacity-60"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : topic === "tour" ? (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Request private tour
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  Send message
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-fog">
              By continuing you agree to our terms & privacy policy. No spam —
              ever.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block border-b hairline transition-colors focus-within:border-bronze">
      <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
