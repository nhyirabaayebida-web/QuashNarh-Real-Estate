"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

export default function NewsletterForm() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");

  if (done) {
    return (
      <div className="flex w-full max-w-md items-center gap-3 border-b hairline-light pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bronze text-ink">
          <Check className="h-5 w-5" />
        </span>
        <p className="text-lg">
          You&rsquo;re on the list — <span className="text-fog">the next report lands December 1.</span>
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-md items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      <div className="flex-1 border-b hairline-light pb-2">
        <label
          htmlFor="footer-email"
          className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-fog"
        >
          Market report, monthly
        </label>
        <input
          id="footer-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="mt-2 w-full bg-transparent text-lg outline-none placeholder:text-fog/60"
        />
      </div>
      <button
        type="submit"
        aria-label="Subscribe"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bronze text-ink transition-colors hover:bg-cream"
      >
        <ArrowUpRight className="h-5 w-5" />
      </button>
    </form>
  );
}
