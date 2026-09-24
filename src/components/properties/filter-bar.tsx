"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import type { PropertyFilters } from "@/lib/queries";
import { cn } from "@/lib/utils";

const TYPES = [
  ["any", "Any type"],
  ["house", "House"],
  ["villa", "Villa"],
  ["apartment", "Apartment"],
  ["condo", "Condo"],
  ["townhouse", "Townhouse"],
  ["cottage", "Cottage"],
  ["penthouse", "Penthouse"],
  ["loft", "Loft"],
] as [string, string][];

const BEDS = [
  ["", "Any beds"],
  ["1", "1+"],
  ["2", "2+"],
  ["3", "3+"],
  ["4", "4+"],
  ["5", "5+"],
] as [string, string][];

const SORTS = [
  ["newest", "Newest"],
  ["price-asc", "Price · low to high"],
  ["price-desc", "Price · high to low"],
  ["beds", "Most bedrooms"],
] as [string, string][];

export default function FilterBar({ current }: { current: PropertyFilters }) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? "");
  const [minDraft, setMinDraft] = useState(current.min ?? "");
  const [maxDraft, setMaxDraft] = useState(current.max ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const budgetDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = (patch: Partial<Record<string, string | undefined>>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      type: current.type,
      q: current.q,
      ptype: current.ptype,
      beds: current.beds,
      min: current.min,
      max: current.max,
      sort: current.sort,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v && !(k === "sort" && v === "newest")) params.set(k, v);
    }
    const qs = params.toString();
    router.replace(qs ? `/properties?${qs}` : "/properties", { scroll: false });
  };

  useEffect(() => {
    setQ(current.q ?? "");
  }, [current.q]);
  useEffect(() => {
    setMinDraft(current.min ?? "");
  }, [current.min]);
  useEffect(() => {
    setMaxDraft(current.max ?? "");
  }, [current.max]);

  const onBudget = (which: "min" | "max", raw: string) => {
    const digits = raw.replace(/[^\d]/g, "").slice(0, 10);
    if (which === "min") setMinDraft(digits);
    else setMaxDraft(digits);
    if (budgetDebounce.current) clearTimeout(budgetDebounce.current);
    budgetDebounce.current = setTimeout(() => {
      push({ [which]: digits || undefined });
    }, 450);
  };

  const activeCount = [
    current.ptype && current.ptype !== "any" ? "1" : "",
    current.beds,
    current.min,
    current.max,
    current.q,
  ].filter(Boolean).length;

  return (
    <div className="sticky top-[4.5rem] z-40 border-y hairline bg-cream/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-3 px-5 py-3.5 sm:px-8 lg:px-12">
        {/* Buy / Rent segmented */}
        <div className="flex rounded-full border hairline bg-cream p-1">
          {(
            [
              ["", "All"],
              ["sale", "Buy"],
              ["rent", "Rent"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={label}
              onClick={() => push({ type: val, max: undefined, min: undefined })}
              className={cn(
                "rounded-full px-5 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] transition-all duration-300",
                (current.type ?? "") === val
                  ? "bg-ink text-cream"
                  : "text-espresso hover:text-bronze-deep",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <label className="flex min-w-[180px] flex-1 items-center gap-2.5 rounded-full border hairline bg-cream px-4.5 py-2.5 transition-colors focus-within:border-bronze sm:max-w-64">
          <Search className="h-4 w-4 shrink-0 text-fog" />
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              if (debounce.current) clearTimeout(debounce.current);
              debounce.current = setTimeout(() => push({ q: v || undefined }), 350);
            }}
            placeholder="Search city or address…"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-fog/60"
          />
        </label>

        {/* Selects */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={current.ptype ?? "any"}
            onChange={(v) => push({ ptype: v === "any" ? undefined : v })}
            options={TYPES}
            label="Type"
          />
          <Select
            value={current.beds ?? ""}
            onChange={(v) => push({ beds: v || undefined })}
            options={BEDS}
            label="Beds"
          />
          <div
            className="flex items-center gap-1.5 rounded-full border hairline bg-cream py-2.5 pl-4 pr-3 transition-colors focus-within:border-bronze"
            title="Enter your budget in Ghana cedis"
          >
            <span className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-fog">
              Budget ₵
            </span>
            <input
              value={minDraft ? Number(minDraft).toLocaleString("en-US") : ""}
              onChange={(e) => onBudget("min", e.target.value)}
              inputMode="numeric"
              placeholder="Min"
              aria-label="Minimum budget in cedis"
              className="w-[4.25rem] bg-transparent text-[0.8125rem] font-semibold outline-none placeholder:text-fog/50"
            />
            <span className="text-fog">–</span>
            <input
              value={maxDraft ? Number(maxDraft).toLocaleString("en-US") : ""}
              onChange={(e) => onBudget("max", e.target.value)}
              inputMode="numeric"
              placeholder="Max"
              aria-label="Maximum budget in cedis"
              className="w-[4.75rem] bg-transparent text-[0.8125rem] font-semibold outline-none placeholder:text-fog/50"
            />
          </div>
          <Select
            value={current.sort ?? "newest"}
            onChange={(v) => push({ sort: v })}
            options={SORTS}
            label="Sort"
          />

          {activeCount > 0 && (
            <button
              onClick={() => {
                setQ("");
                router.replace(current.type ? `/properties?type=${current.type}` : "/properties", { scroll: false });
              }}
              className="group flex items-center gap-2 rounded-full px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-bronze-deep transition-colors hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
              Reset
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bronze text-[0.625rem] text-ink">
                {activeCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
  label: string;
}) {
  return (
    <label className="relative flex items-center gap-2 rounded-full border hairline bg-cream py-2.5 pl-4 pr-9 text-[0.8125rem] font-semibold transition-colors hover:border-fog/50 focus-within:border-bronze">
      <span className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-fog">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent outline-none"
      >
        {options.map(([v, l]) => (
          <option key={l} value={v}>
            {l}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 h-3.5 w-3.5 text-fog" />
    </label>
  );
}
