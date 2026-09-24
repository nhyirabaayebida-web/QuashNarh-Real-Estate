import Link from "next/link";
import NewsletterForm from "@/components/newsletter-form";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Homes for sale", href: "/properties?type=sale" },
      { label: "Homes for rent", href: "/properties?type=rent" },
      { label: "Full portfolio", href: "/properties" },
      { label: "Find an artisan", href: "/artisans" },
      { label: "New this week", href: "/properties?sort=newest" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About QuashNarh", href: "/#story" },
      { label: "Mission & vision", href: "/#mission" },
      { label: "Sell with us", href: "/sell" },
      { label: "Join the trade guild", href: "/artisans#join" },
      { label: "Testimonials", href: "/#voices" },
      { label: "Team studio", href: "/admin" },
    ],
  },
];

const offices = [
  { city: "Accra — Airport City", line: "12 Marina Boulevard" },
  { city: "Accra — Osu", line: "24 Oxford Street" },
  { city: "Kumasi", line: "7 Ahodwo Road, Nhyiaeso" },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-ink text-cream">
      <div className="mx-auto max-w-[90rem] px-5 pt-20 sm:px-8 lg:px-12">
        {/* CTA row */}
        <div className="flex flex-col gap-10 border-b hairline-light pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-bronze">Begin the conversation</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] sm:text-5xl">
              Let&rsquo;s find the home <em className="italic text-bronze">you&rsquo;ll never want to leave.</em>
            </h2>
          </div>
          <NewsletterForm />
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 border-b hairline-light py-14 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-fog">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="link-sweep text-sm text-cream/85 hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-fog">
              Offices
            </h3>
            <ul className="mt-5 space-y-4">
              {offices.map((o) => (
                <li key={o.city} className="text-sm">
                  <p className="font-semibold text-cream/90">{o.city}</p>
                  <p className="text-cream/50">{o.line}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-fog">
              Follow
            </h3>
            <ul className="mt-5 space-y-3">
              {["Instagram", "Pinterest", "LinkedIn"].map((name) => (
                <li key={name}>
                  <a href="#" className="link-sweep text-sm text-cream/85 hover:text-cream">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cream/50">
              +233 30 274 0147
              <br />
              hello@quashnarh.com
            </p>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="select-none overflow-hidden py-10 text-center">
          <p
            aria-hidden
            className="font-display text-[17vw] font-semibold leading-[0.8] tracking-[0.02em] text-transparent lg:text-[13vw]"
            style={{ WebkitTextStroke: "1px rgba(244,240,232,0.16)" }}
          >
            QUASH
          </p>
          <p
            aria-hidden
            className="font-display text-[17vw] font-semibold italic leading-[0.85] tracking-[0.02em] text-transparent lg:text-[13vw]"
            style={{ WebkitTextStroke: "1px rgba(165,131,79,0.35)" }}
          >
            NARH
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t hairline-light py-6 text-[0.6875rem] uppercase tracking-[0.22em] text-fog sm:flex-row">
          <p>© {new Date().getFullYear()} QuashNarh Real Estate. All rights reserved.</p>
          <p>All prices in Ghana cedis (₵) — GREBA member agency</p>
        </div>
      </div>
    </footer>
  );
}
