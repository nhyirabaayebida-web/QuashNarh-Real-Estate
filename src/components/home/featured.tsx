import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Property } from "@/db/schema";
import PropertyCard from "@/components/property-card";
import Reveal from "@/components/reveal";

export default function Featured({ properties }: { properties: Property[] }) {
  if (!properties.length) return null;
  const [first, ...rest] = properties;

  return (
    <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="eyebrow text-bronze-deep">01 · Featured residences</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            This season&rsquo;s <em className="italic text-bronze-deep">quiet masterpieces</em>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <Link
            href="/properties"
            className="group inline-flex items-center gap-3 rounded-full border hairline px-6 py-3 text-[0.75rem] font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:border-ink hover:bg-ink hover:text-cream"
          >
            View full portfolio
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-6">
        <Reveal className="sm:col-span-2 lg:col-span-4">
          <PropertyCard property={first} priority size="large" />
        </Reveal>
        {rest.map((p, i) => (
          <Reveal
            key={p.slug}
            delay={0.08 * (i + 1)}
            className="lg:col-span-2"
          >
            <PropertyCard property={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
