"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TRADES } from "@/lib/trades";
import { cn } from "@/lib/utils";

export default function ArtisanFilters({
  current,
}: {
  current: { trade?: string; q?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQ(current.q ?? ""), [current.q]);

  const push = (trade?: string, query?: string) => {
    const params = new URLSearchParams();
    const t = trade === undefined ? current.trade : trade;
    const s = query === undefined ? current.q : query;
    if (t && t !== "all") params.set("trade", t);
    if (s) params.set("q", s);
    const qs = params.toString();
    router.replace(qs ? `/artisans?${qs}` : "/artisans", { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto py-1">
        <button
          onClick={() => push("all")}
          className={cn(
            "shrink-0 rounded-full border px-4.5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] transition-all duration-300",
            !current.trade || current.trade === "all"
              ? "border-ink bg-ink text-cream"
              : "hairline bg-cream text-espresso hover:border-bronze",
          )}
        >
          All trades
        </button>
        {TRADES.map((t) => (
          <button
            key={t.id}
            onClick={() => push(t.id)}
            className={cn(
              "shrink-0 rounded-full border px-4.5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] transition-all duration-300",
              current.trade === t.id
                ? "border-ink bg-ink text-cream"
                : "hairline bg-cream text-espresso hover:border-bronze",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <label className="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-full border hairline bg-cream px-4.5 py-3 transition-colors focus-within:border-bronze sm:max-w-72">
        <Search className="h-4 w-4 shrink-0 text-fog" />
        <input
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            if (debounce.current) clearTimeout(debounce.current);
            debounce.current = setTimeout(() => push(undefined, v || undefined), 350);
          }}
          placeholder="Search name or area…"
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-fog/60"
        />
      </label>
    </div>
  );
}
