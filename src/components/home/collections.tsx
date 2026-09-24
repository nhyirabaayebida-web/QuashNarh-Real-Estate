import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MEDIA } from "@/lib/media";
import Reveal from "@/components/reveal";

const panels = [
  {
    id: "buy",
    href: "/properties?type=sale",
    image: MEDIA.buyPanel,
    alt: "Contemporary house with green courtyard",
    kicker: "Own the address",
    title: "For Sale",
    note: "Residences & estates, curated for lasting value",
    countKey: "sale" as const,
  },
  {
    id: "rent",
    href: "/properties?type=rent",
    image: MEDIA.rentPanel,
    alt: "Modern apartment towers against the sky",
    kicker: "Live lightly",
    title: "For Rent",
    note: "Design-led apartments & homes, ready now",
    countKey: "rent" as const,
  },
];

export default function Collections({
  counts,
}: {
  counts: { sale: number; rent: number };
}) {
  return (
    <section className="bg-parchment/60 py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Reveal className="mb-12 max-w-2xl">
          <p className="eyebrow text-bronze-deep">02 · Two doors in</p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            Whether you <em className="italic text-bronze-deep">settle</em> or{" "}
            <em className="italic text-bronze-deep">sojourn</em>
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {panels.map((panel, i) => (
            <Reveal key={panel.id} delay={i * 0.12}>
              <Link
                href={panel.href}
                className="group relative block h-[68vh] min-h-[460px] overflow-hidden rounded-3xl"
              >
                <Image
                  src={panel.image}
                  alt={panel.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="img-warm object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8 sm:p-10">
                  <div className="text-cream">
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-bronze">
                      {panel.kicker}
                    </p>
                    <h3 className="mt-3 font-display text-5xl font-medium italic sm:text-6xl">
                      {panel.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">
                      {panel.note}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-full border hairline-light px-4 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-cream/85">
                      {counts[panel.countKey]} homes available
                    </p>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cream text-ink transition-all duration-500 group-hover:bg-bronze group-hover:rotate-45">
                    <ArrowUpRight className="h-6 w-6" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
