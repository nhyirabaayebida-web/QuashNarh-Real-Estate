import Link from "next/link";
import { CalendarDays, Mail, Phone } from "lucide-react";
import { getRecentInquiries } from "@/lib/queries";

export const dynamic = "force-dynamic";

const TOPIC_LABELS: Record<string, string> = {
  tour: "Book a tour",
  info: "Request info",
  offer: "Make an offer",
};

export default async function AdminInquiriesPage() {
  const inquiries = await getRecentInquiries(100);

  return (
    <div>
      <p className="eyebrow text-bronze-deep">Studio</p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
        Inquiries <em className="italic text-bronze-deep">({inquiries.length})</em>
      </h1>
      <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fog">
        Every tour request, info ask and offer — newest first. Reply by phone
        or email while they&rsquo;re warm.
      </p>

      <div className="mt-8 space-y-4">
        {inquiries.length === 0 && (
          <p className="rounded-3xl border hairline bg-cream px-6 py-16 text-center text-sm text-fog">
            No inquiries yet. Share the site — buyers are browsing.
          </p>
        )}
        {inquiries.map((inq) => (
          <article key={inq.id} className="rounded-3xl border hairline bg-cream p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-semibold">{inq.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-fog">
                  <a href={`mailto:${inq.email}`} className="flex items-center gap-1.5 hover:text-bronze-deep">
                    <Mail className="h-3.5 w-3.5" />
                    {inq.email}
                  </a>
                  {inq.phone && (
                    <a href={`tel:${inq.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-bronze-deep">
                      <Phone className="h-3.5 w-3.5" />
                      {inq.phone}
                    </a>
                  )}
                  {inq.tourDate && (
                    <span className="flex items-center gap-1.5 font-semibold text-bronze-deep">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Tour: {inq.tourDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-parchment px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-espresso">
                  {TOPIC_LABELS[inq.topic] ?? inq.topic}
                </span>
                <span className="text-[0.75rem] text-fog">
                  {inq.createdAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-parchment/60 px-5 py-4 text-[0.9375rem] leading-relaxed text-espresso/90">
              {inq.message}
            </p>
            <p className="mt-3 text-[0.8125rem]">
              <span className="font-bold uppercase tracking-[0.14em] text-fog text-[0.625rem]">
                Regarding:&nbsp;
              </span>
              {inq.propertySlug ? (
                <Link
                  href={`/properties/${inq.propertySlug}`}
                  className="font-semibold text-bronze-deep hover:text-ink"
                >
                  {inq.propertyTitle}
                </Link>
              ) : (
                <span className="font-semibold">{inq.propertyTitle ?? "—"}</span>
              )}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
