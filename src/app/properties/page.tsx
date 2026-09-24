import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { getProperties, type PropertyFilters } from "@/lib/queries";
import PropertyCard from "@/components/property-card";
import FilterBar from "@/components/properties/filter-bar";
import Reveal from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio — Homes for Sale & Rent",
  description:
    "Browse QuashNarh's curated portfolio of houses, villas, apartments and estates for sale and for rent across Ghana, priced in cedis.",
};

type SP = Record<string, string | string[] | undefined>;

function pick(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v.length ? v : undefined;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filters: PropertyFilters = {
    type: pick(sp, "type"),
    q: pick(sp, "q"),
    ptype: pick(sp, "ptype"),
    beds: pick(sp, "beds"),
    min: pick(sp, "min"),
    max: pick(sp, "max"),
    sort: pick(sp, "sort"),
  };

  const properties = await getProperties(filters);

  const heading =
    filters.type === "rent"
      ? "homes to rent"
      : filters.type === "sale"
        ? "homes to buy"
        : "homes, curated";

  return (
    <div className="pt-[4.5rem]">
      {/* Page header */}
      <header className="mx-auto max-w-[90rem] px-5 pb-10 pt-14 sm:px-8 lg:px-12 lg:pt-20">
        <Reveal>
          <p className="eyebrow text-bronze-deep">The portfolio</p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">
            <em className="italic text-bronze-deep">{properties.length}</em>{" "}
            {heading}
          </h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-fog">
            Every residence below has passed our 60-point review — light,
            layout, build quality, and that harder-to-name feeling of home.
          </p>
        </Reveal>
      </header>

      <FilterBar current={filters} />

      {/* Results */}
      <section className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8 lg:px-12">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border hairline bg-parchment/50 px-8 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <SearchX className="h-7 w-7 text-bronze-deep" />
            </span>
            <h2 className="mt-6 font-display text-3xl font-medium">
              No homes match that brief — <em className="italic">yet.</em>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-fog">
              Loosen a filter or two, or tell us what you&rsquo;re searching for
              and we&rsquo;ll call you the moment it surfaces — often before it
              ever lists publicly.
            </p>
            <Link
              href="/properties"
              className="mt-8 rounded-full bg-ink px-7 py-3.5 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-bronze-deep"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p, i) => (
              <Reveal key={p.slug} delay={0.06 * (i % 3)}>
                <PropertyCard property={p} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
