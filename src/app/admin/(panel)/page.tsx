import Link from "next/link";
import { ArrowUpRight, Building2, FileCheck2, HardHat, Inbox, Plus } from "lucide-react";
import { getDashboardCounts, getRecentInquiries } from "@/lib/queries";
import { formatCedis } from "@/lib/format";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TOPIC_LABELS: Record<string, string> = {
  tour: "Tour",
  info: "Info",
  offer: "Offer",
};

export default async function AdminOverviewPage() {
  const [counts, recent, saleValueRows] = await Promise.all([
    getDashboardCounts(),
    getRecentInquiries(6),
    db
      .select({ total: sql<number>`coalesce(sum(${properties.price}), 0)` })
      .from(properties)
      .where(sql`${properties.listingType} = 'sale'`),
  ]);
  const saleValue = Number(saleValueRows[0]?.total ?? 0);

  const cards = [
    { label: "Live listings", value: String(counts.properties), icon: Building2, href: "/admin/properties" },
    { label: "Sales portfolio value", value: formatCedis(saleValue), icon: Building2, href: "/admin/properties?type=sale" },
    { label: "Inquiries", value: String(counts.inquiries), icon: Inbox, href: "/admin/inquiries" },
    {
      label: "Artisans awaiting review",
      value: String(counts.pendingArtisans),
      icon: HardHat,
      href: "/admin/artisans",
    },
    {
      label: "Sell requests to verify",
      value: String(counts.pendingSubmissions),
      icon: FileCheck2,
      href: "/admin/submissions",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-bronze-deep">Studio</p>
          <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
            Good day, <em className="italic text-bronze-deep">curator.</em>
          </h1>
        </div>
        <Link
          href="/admin/properties/new"
          className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-bronze-deep"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New listing
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-3xl border hairline bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(23,19,16,0.35)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bronze/12 text-bronze-deep">
                <c.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-fog transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze-deep" />
            </div>
            <p className="mt-5 font-display text-3xl font-semibold">{c.value}</p>
            <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-fog">
              {c.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="mt-12 rounded-3xl border hairline bg-cream p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium">Latest inquiries</h2>
          <Link
            href="/admin/inquiries"
            className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-bronze-deep link-sweep"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-parchment/60 px-5 py-8 text-center text-sm text-fog">
            No inquiries yet — they&rsquo;ll appear here the moment a buyer or renter reaches out.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-ink/8">
            {recent.map((inq) => (
              <div key={inq.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-bold">{inq.name}</p>
                  <p className="truncate text-[0.8125rem] text-fog">{inq.email}</p>
                </div>
                <span className="rounded-full bg-parchment px-3 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-espresso">
                  {TOPIC_LABELS[inq.topic] ?? inq.topic}
                </span>
                <p className="w-44 truncate text-[0.8125rem] font-medium text-espresso">
                  {inq.propertyTitle ?? "—"}
                </p>
                <p className="text-[0.75rem] text-fog">
                  {inq.createdAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
