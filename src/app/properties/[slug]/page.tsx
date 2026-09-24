import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  Calendar,
  Check,
  ChevronRight,
  MapPin,
  Phone,
  Ruler,
  Trees,
} from "lucide-react";
import { getPropertyBySlug, getSimilarProperties } from "@/lib/queries";
import { formatNumber, formatPrice, listingLabel, titleCase } from "@/lib/format";
import Gallery from "@/components/property/gallery";
import InquiryForm from "@/components/property/inquiry-form";
import FavoriteButton from "@/components/favorite-button";
import PropertyCard from "@/components/property-card";
import Reveal from "@/components/reveal";
import type { Property } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Residence not found" };
  return {
    title: `${property.title} — ${property.city}, ${property.state}`,
    description: `${formatPrice(property.price, property.listingType)} · ${property.bedrooms} bed · ${property.bathrooms} bath · ${formatNumber(property.areaSqft)} sqft. ${property.description.slice(0, 140)}…`,
  };
}

const CITY_NOTES: Record<string, { blurb: string; chips: string[] }> = {
  "East Legon": {
    blurb:
      "East Legon Hills is Accra's prestige address of the decade — gated calm above the canopy, with Accra Mall's flagships, international schools, and the airport all within a quarter hour.",
    chips: ["Accra Mall — 9 min", "Kotoka Airport — 12 min", "Ghana Int'l School — 7 min"],
  },
  "East Airport": {
    blurb:
      "East Airport balances established family living with unbeatable logistics — the airport five minutes east, Airport City's towers five minutes west, and International schools on your doorstep.",
    chips: ["Kotoka Airport — 5 min", "Airport City — 5 min", "Marina Mall — 8 min"],
  },
  Osu: {
    blurb:
      "Osu is Accra's heartbeat — Oxford Street's restaurants and galleries, the sea ten minutes south, and the capital's best street life running late into the warm night.",
    chips: ["Oxford Street — 3 min", "Labadi Beach — 7 min", "Independence Square — 9 min"],
  },
  Aburi: {
    blurb:
      "The Akuapem ridge offers what Accra can't — cool mountain air, misty valley mornings, and the Botanical Gardens as your local park, with the city only forty minutes downhill.",
    chips: ["Botanical Gardens — 5 min", "Aburi township — 4 min", "Accra — 40 min downhill"],
  },
  Tema: {
    blurb:
      "Tema's planned communities marina-side are the harbour city's hidden value play — lagoon views, motorway speed to the capital, and port commerce as your daily view.",
    chips: ["Tema Harbour — 8 min", "Motorway interchange — 3 min", "Junction Mall — 10 min"],
  },
  Cantonments: {
    blurb:
      "The diplomatic quarter is Accra at its most assured — embassy calm, bougainvillea walls, and Labone's café culture a stroll away, minutes from the Ministries and the sea.",
    chips: ["US Embassy row — 4 min", "Labone cafés — 6 min", "Independence Ave — 7 min"],
  },
  Ada: {
    blurb:
      "Ada Foah, where the Volta meets the Atlantic, is Ghana's water-playground — sand bars, boat regattas, and estuary sunsets that turn the river to hammered bronze.",
    chips: ["Estuary beach — at your gate", "Ada township — 10 min", "Accra — 90 min"],
  },
  Jamestown: {
    blurb:
      "Old Accra is a living archive — the lighthouse, Brazil House, boxing gyms and street art, undergoing a renaissance as galleries and cafés reclaim its colonial bones.",
    chips: ["Jamestown Lighthouse — 3 min", "Ussher Fort — 6 min", "Makola Market — 8 min"],
  },
  "Shai Hills": {
    blurb:
      "Shai Hills Resource Reserve is safari at the city's edge — baboons, antelope and granite kopjes, with the motorway delivering you to central Accra in three quarters of an hour.",
    chips: ["Reserve gate — 4 min", "Shai Hills lodge — 6 min", "Central Accra — 45 min"],
  },
  Labone: {
    blurb:
      "Labone is the connoisseur's Accra — quiet ridged streets over the Gulf, the best pastries in the capital, and five minutes to Osu when the evening calls.",
    chips: ["Labone coffee bars — 3 min", "Oxford Street — 5 min", "Labadi Beach — 8 min"],
  },
  "Airport City": {
    blurb:
      "Airport City is Ghana's new CBD — glass towers, Marina Mall, five-star hotels and the airport minutes away; for professionals, the most connected square mile in West Africa.",
    chips: ["Marina Mall — 3 min", "Kotoka Airport — 4 min", "Holiday Inn district — 2 min"],
  },
  Kumasi: {
    blurb:
      "Nhyiaeso is the Garden City's garden suburb — greenery, grand plots, and Ring Road ease, with Manhyia Palace and Kejetia's legendary market anchoring Ashanti life.",
    chips: ["Manhyia Palace — 8 min", "Kumasi City Mall — 6 min", "Kejetia Market — 12 min"],
  },
};

export default async function PropertyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property);
  const notes = CITY_NOTES[property.city];
  const paragraphs = property.description.split("\n\n");

  const estMonthly =
    property.listingType === "sale"
      ? Math.round(property.price * 0.8 * 0.0120017)
      : null;

  return (
    <div className="pt-[4.5rem]">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 pt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-fog">
          <Link href="/" className="transition-colors hover:text-bronze-deep">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/properties" className="transition-colors hover:text-bronze-deep">
            Portfolio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-espresso">{property.title}</span>
        </nav>

        {/* Header */}
        <header className="mt-6 flex flex-wrap items-start justify-between gap-6 pb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  property.listingType === "rent"
                    ? "rounded-full bg-moss px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-cream"
                    : "rounded-full bg-ink px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-cream"
                }
              >
                {listingLabel(property.listingType)}
              </span>
              <span className="rounded-full border hairline px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-fog">
                {titleCase(property.propertyType)}
              </span>
              {property.status === "pending" && (
                <span className="rounded-full bg-bronze px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-ink">
                  Offer pending
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.02] sm:text-6xl">
              {property.title}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-[1.0625rem] text-fog">
              <MapPin className="h-4 w-4 text-bronze-deep" />
              {property.address}, {property.city}, {property.state} {property.zip}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FavoriteButton
              propertyId={property.id}
              className="border hairline bg-cream hover:bg-parchment"
            />
            <Link
              href="/properties"
              className="group inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] transition-all hover:border-ink hover:bg-ink hover:text-cream"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              All homes
            </Link>
          </div>
        </header>

        {/* Gallery */}
        <Gallery images={property.images} title={property.title} />

        {/* Spec ribbon */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-parchment/70 sm:grid-cols-4">
          {[
            { icon: BedDouble, label: "Bedrooms", value: String(property.bedrooms) },
            { icon: Bath, label: "Bathrooms", value: String(property.bathrooms) },
            { icon: Ruler, label: "Living area", value: `${formatNumber(property.areaSqft)} sqft` },
            {
              icon: property.lotSqft ? Trees : Calendar,
              label: property.lotSqft ? "Lot size" : "Year built",
              value: property.lotSqft
                ? `${formatNumber(property.lotSqft)} sqft`
                : String(property.yearBuilt ?? "—"),
            },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 bg-cream px-6 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-parchment text-bronze-deep">
                <s.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-fog">
                  {s.label}
                </span>
                <span className="block font-display text-xl font-semibold">{s.value}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid gap-14 py-16 lg:grid-cols-[1fr_26rem] lg:gap-20">
          {/* Left column */}
          <div>
            <Reveal>
              <p className="eyebrow text-bronze-deep">The residence</p>
              <div className="mt-5 space-y-5 text-[1.0625rem] leading-[1.85] text-espresso/90">
                {paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-14">
              <h2 className="font-display text-3xl font-medium sm:text-4xl">
                Features & <em className="italic text-bronze-deep">amenities</em>
              </h2>
              <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {property.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[0.9375rem] font-medium">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze/15 text-bronze-deep">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>

            {notes && (
              <Reveal className="mt-14">
                <h2 className="font-display text-3xl font-medium sm:text-4xl">
                  The <em className="italic text-bronze-deep">neighborhood</em>
                </h2>
                <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.85] text-espresso/90">
                  {notes.blurb}
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {notes.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border hairline bg-cream px-4 py-2 text-[0.8125rem] font-semibold text-espresso"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal className="mt-14">
              <h2 className="font-display text-3xl font-medium sm:text-4xl">
                Listing <em className="italic text-bronze-deep">details</em>
              </h2>
              <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
                {[
                  ["Reference", `HVN-${String(property.id).padStart(4, "0")}`],
                  ["Status", titleCase(property.status)],
                  ["Type", titleCase(property.propertyType)],
                  ["Tenure", listingLabel(property.listingType)],
                  ["Year built", String(property.yearBuilt ?? "—")],
                  [
                    "Lot size",
                    property.lotSqft ? `${formatNumber(property.lotSqft)} sqft` : "—",
                  ],
                  ["Bedrooms", String(property.bedrooms)],
                  ["Bathrooms", String(property.bathrooms)],
                  [
                    "Living area",
                    `${formatNumber(property.areaSqft)} sqft`,
                  ],
                  [
                    "Listed",
                    property.createdAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between border-b hairline py-3.5 text-sm"
                  >
                    <dt className="font-semibold uppercase tracking-[0.14em] text-fog text-[0.6875rem]">
                      {k}
                    </dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-3xl bg-ink p-8 text-cream">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.26em] text-bronze">
                {listingLabel(property.listingType)}
              </p>
              <p className="mt-3 font-display text-[2.75rem] font-semibold leading-none">
                {formatPrice(property.price, property.listingType)}
              </p>
              {estMonthly && (
                <p className="mt-3 text-sm text-cream/60">
                  Est. ₵{formatNumber(estMonthly)}/mo — 20% down · 12% APR · 15 yr
                </p>
              )}
              {property.listingType === "rent" && (
                <p className="mt-3 text-sm text-cream/60">
                  Available now — 12 & 24 month terms
                </p>
              )}
              <div className="mt-6 flex items-center gap-4 border-t hairline-light pt-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bronze font-display text-lg font-semibold italic text-ink">
                  {property.agentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    {property.agentName}
                    <BadgeCheck className="h-4 w-4 text-bronze" />
                  </p>
                  <p className="text-[0.8125rem] text-cream/60">Listing agent</p>
                  <a
                    href={`tel:${property.agentPhone.replace(/[^+\d]/g, "")}`}
                    className="mt-1 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-bronze transition-colors hover:text-cream"
                  >
                    <Phone className="h-3 w-3" />
                    {property.agentPhone}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <InquiryForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </aside>
        </div>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="border-t hairline bg-parchment/50 py-20">
          <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-medium sm:text-5xl">
                You may also <em className="italic text-bronze-deep">love</em>
              </h2>
              <Link
                href="/properties"
                className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-bronze-deep link-sweep"
              >
                View the full portfolio
              </Link>
            </Reveal>
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p: Property, i: number) => (
                <Reveal key={p.slug} delay={i * 0.08}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
