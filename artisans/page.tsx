import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  BrickWall,
  Flame,
  Hammer,
  HardHat,
  LayoutGrid,
  MapPin,
  PaintRoller,
  Phone,
  SearchX,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getArtisans } from "@/lib/queries";
import { TRADES, tradeLabel } from "@/lib/trades";
import { formatCedis } from "@/lib/format";
import { MEDIA } from "@/lib/media";
import ArtisanFilters from "@/components/artisans/artisan-filters";
import ArtisanForm from "@/components/artisans/artisan-form";
import Reveal from "@/components/reveal";
import type { Artisan } from "@/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Trade Guild — Verified Construction Artisans",
  description:
    "Find phone-verified masons, carpenters, electricians, plumbers, tilers and more across Ghana — or register as an artisan and let the work find you.",
};

const TRADE_ICONS: Record<string, LucideIcon> = {
  mason: BrickWall,
  carpenter: Hammer,
  electrician: Zap,
  plumber: Wrench,
  tiler: LayoutGrid,
  painter: PaintRoller,
  welder: Flame,
  pop: Sparkles,
};

type SP = Record<string, string | string[] | undefined>;

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const trade = typeof sp.trade === "string" ? sp.trade : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const pros = await getArtisans({ trade, q });

  return (
    <div className="pt-[4.5rem]">
      {/* Header */}
      <header className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0">
          <Image
            src={MEDIA.artisansWide}
            alt="Construction artisan aligning bricks on site"
            fill
            sizes="100vw"
            className="img-warm object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/60 to-cream" />
        </div>
        <div className="relative mx-auto flex max-w-[90rem] flex-wrap items-end justify-between gap-8 px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pt-24">
          <Reveal>
            <p className="eyebrow text-bronze-deep">The Trade Guild</p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">
              Artisans, <em className="italic text-bronze-deep">verified.</em>
            </h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-fog">
              {pros.length} Ghana Card&ndash;verified{" "}
              {trade && trade !== "all" ? tradeLabel(trade).toLowerCase() + "s" : "professionals"}{" "}
              ready for your build, renovation or repair. Call directly — no middlemen, no markups.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <a
              href="#join"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-bronze-deep"
            >
              <HardHat className="h-4 w-4" />
              Are you an artisan? Join
            </a>
          </Reveal>
        </div>
      </header>

      {/* Filters + grid */}
      <section className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 lg:px-12">
        <ArtisanFilters current={{ trade, q }} />

        {pros.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-3xl border hairline bg-parchment/50 px-8 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <SearchX className="h-7 w-7 text-bronze-deep" />
            </span>
            <h2 className="mt-6 font-display text-3xl font-medium">
              No artisans match that — <em className="italic">yet.</em>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-fog">
              Try another trade or area — or check back soon. New pros are
              verified every week.
            </p>
            <Link
              href="/artisans"
              className="mt-8 rounded-full bg-ink px-7 py-3.5 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-bronze-deep"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {pros.map((a: Artisan, i: number) => {
              const Icon = TRADE_ICONS[a.trade] ?? Hammer;
              return (
                <Reveal key={a.id} delay={0.05 * (i % 3)}>
                  <article className="group flex h-full flex-col rounded-3xl border hairline bg-cream p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(23,19,16,0.3)]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss font-display text-lg font-semibold italic text-cream">
                          {a.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-semibold leading-tight">{a.name}</h2>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-fog">
                            <MapPin className="h-3.5 w-3.5 text-bronze-deep" />
                            {a.location}
                          </p>
                        </div>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bronze/12 text-bronze-deep">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <span className="rounded-full bg-parchment px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-espresso">
                        {tradeLabel(a.trade)}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-moss/10 px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-moss">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        ID Verified
                      </span>
                    </div>

                    <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-espresso/85">
                      {a.bio}
                    </p>

                    <div className="mt-6 flex items-end justify-between border-t hairline pt-5">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-fog">
                            Experience
                          </p>
                          <p className="mt-1 font-display text-lg font-semibold">
                            {a.years} {a.years === 1 ? "yr" : "yrs"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-fog">
                            Day rate
                          </p>
                          <p className="mt-1 font-display text-lg font-semibold">
                            {a.dayRate ? formatCedis(a.dayRate) : "On request"}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${a.phone.replace(/\s/g, "")}`}
                        aria-label={`Call ${a.name}`}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream transition-all duration-300 hover:bg-bronze-deep group-hover:scale-105"
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                    </div>
                    <a
                      href={`tel:${a.phone.replace(/\s/g, "")}`}
                      className="mt-3 block text-center text-[0.8125rem] font-bold tracking-wide text-bronze-deep transition-colors hover:text-ink"
                    >
                      {a.phone}
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* Join */}
      <section id="join" className="scroll-mt-24 border-t hairline bg-parchment/50 py-20 lg:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-12">
          <Reveal>
            <p className="eyebrow text-bronze-deep">For artisans</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] sm:text-5xl">
              Your craft, <em className="italic text-bronze-deep">our clients.</em>
            </h2>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-fog">
              Homeowners building and renovating across Ghana browse this guild
              every day. Register once, pass one phone verification, and your
              phone starts ringing with serious work — not time-wasters.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Free listing — no commissions, no hidden fees",
                "Ghana Card + passport photo KYC — clients trust the badge",
                "Direct calls and WhatsApp, no middlemen",
                "Showcase your day rate in cedis and your base area",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[0.9375rem] font-medium">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze/15 text-bronze-deep">
                    <BadgeCheck className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <ArtisanForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
