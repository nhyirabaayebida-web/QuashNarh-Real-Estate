"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { cn } from "@/lib/utils";

const TYPES = [
  "any",
  "house",
  "villa",
  "apartment",
  "condo",
  "townhouse",
  "cottage",
  "penthouse",
  "loft",
];

/** Format digits with thousands separators for display. */
function withCommas(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "").slice(0, 10);
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [tab, setTab] = useState<"sale" | "rent">("sale");
  const [q, setQ] = useState("");
  const [ptype, setPtype] = useState("any");
  const [budget, setBudget] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", tab);
    if (q.trim()) params.set("q", q.trim());
    if (ptype !== "any") params.set("ptype", ptype);
    const max = budget.replace(/[^\d]/g, "");
    if (max) params.set("max", max);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* Backdrop */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
        <Image
          src={MEDIA.hero}
          alt="Modern villa with illuminated pool at dusk"
          fill
          priority
          sizes="100vw"
          className="img-warm object-cover"
        />
      </motion.div>
      <div className="grain absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/45" />

      {/* Copy */}
      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center px-5 pb-56 pt-40 text-cream sm:px-8 lg:px-12"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="eyebrow text-bronze"
        >
          Boutique real estate — est. 2008
        </motion.p>
        <h1 className="mt-7 max-w-5xl font-display text-[clamp(3.2rem,8vw,7.5rem)] font-medium leading-[0.98] tracking-[-0.01em]">
          <motion.span
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.4, ease }}
            className="block"
          >
            Find a home that
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.55, ease }}
            className="block italic text-bronze"
          >
            tells your story.
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease }}
          className="mt-8 max-w-md text-[1.0625rem] leading-relaxed text-cream/75"
        >
          A hand-curated portfolio of exceptional residences — for purchase and
          for lease — across Ghana&rsquo;s most coveted addresses.
        </motion.p>
      </motion.div>

      {/* Search console */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.95, ease }}
        className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[90rem] px-5 pb-8 sm:px-8 lg:px-12"
      >
        <form
          onSubmit={submit}
          className="rounded-[1.75rem] bg-cream p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
        >
          {/* Tabs */}
          <div className="flex gap-1 px-2 pt-1.5">
            {(["sale", "rent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] transition-colors",
                  tab === t ? "text-cream" : "text-espresso hover:text-ink",
                )}
              >
                {tab === t && (
                  <motion.span
                    layoutId="hero-tab"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: 0.45, ease }}
                  />
                )}
                <span className="relative">{t === "sale" ? "Buy" : "Rent"}</span>
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 items-stretch gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            {/* Location */}
            <label className="flex items-center gap-3 rounded-2xl border hairline bg-cream px-5 py-4 transition-colors focus-within:border-bronze">
              <MapPin className="h-4.5 w-4.5 shrink-0 text-bronze-deep" />
              <span className="w-full">
                <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                  Where to?
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="City, neighborhood, or address"
                  className="w-full bg-transparent text-[0.9375rem] font-medium outline-none placeholder:text-fog/60"
                />
              </span>
            </label>

            {/* Type */}
            <label className="relative flex items-center gap-3 rounded-2xl border hairline bg-cream px-5 py-4 transition-colors focus-within:border-bronze">
              <span className="w-full">
                <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                  Property type
                </span>
                <select
                  value={ptype}
                  onChange={(e) => setPtype(e.target.value)}
                  className="w-full appearance-none bg-transparent pr-6 text-[0.9375rem] font-medium capitalize outline-none"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "any" ? "Any type" : t}
                    </option>
                  ))}
                </select>
              </span>
              <ChevronDown className="pointer-events-none absolute right-5 h-4 w-4 text-fog" />
            </label>

            {/* Budget in cedis */}
            <label className="flex items-center gap-3 rounded-2xl border hairline bg-cream px-5 py-4 transition-colors focus-within:border-bronze">
              <span className="shrink-0 font-display text-xl font-semibold text-bronze-deep">₵</span>
              <span className="w-full">
                <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
                  {tab === "rent" ? "Monthly budget (cedis)" : "Your budget (cedis)"}
                </span>
                <input
                  value={budget}
                  onChange={(e) => setBudget(withCommas(e.target.value))}
                  inputMode="numeric"
                  placeholder={tab === "rent" ? "e.g. 4,500" : "e.g. 1,850,000"}
                  className="w-full bg-transparent text-[0.9375rem] font-medium outline-none placeholder:text-fog/60"
                />
              </span>
            </label>

            <button
              type="submit"
              className="group flex items-center justify-center gap-2.5 rounded-2xl bg-bronze px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:bg-ink hover:text-cream"
            >
              <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between text-[0.625rem] font-semibold uppercase tracking-[0.26em] text-cream/55">
          <p className="hidden items-center gap-2 sm:flex">
            <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-bronze" />
            Scroll to explore
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            On the cover — East Legon Hills, at dusk
          </p>
        </div>
      </motion.div>
    </section>
  );
}
