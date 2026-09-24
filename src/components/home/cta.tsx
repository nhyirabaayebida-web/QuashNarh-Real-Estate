import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { MEDIA } from "@/lib/media";
import Reveal from "@/components/reveal";

export default function Cta() {
  return (
    <section id="sell" className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <Reveal>
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-ink">
          <Image
            src={MEDIA.sellBanner}
            alt="Infinity pool overlooking the sea at sunset"
            fill
            sizes="(max-width: 1280px) 100vw, 1440px"
            className="img-warm object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
          <div className="relative grid gap-10 p-10 sm:p-16 lg:grid-cols-[1.5fr_1fr] lg:p-20">
            <div className="text-cream">
              <p className="eyebrow text-bronze">Selling?</p>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] sm:text-6xl">
                Your home deserves an{" "}
                <em className="italic text-bronze">audience of one — the right one.</em>
              </h2>
              <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-cream/70">
                Complimentary valuation, architectural photography, staging
                direction, and placement before our private client list — all
                before your home ever hits the open market.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/sell"
                  className="group inline-flex items-center gap-3 rounded-full bg-bronze px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:bg-cream"
                >
                  Submit your property
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="tel:+233302740147"
                  className="inline-flex items-center gap-2.5 rounded-full border hairline-light px-7 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:border-bronze hover:text-bronze"
                >
                  <Phone className="h-4 w-4" />
                  +233 30 274 0147
                </a>
              </div>
            </div>
            <div className="flex items-end lg:justify-end">
              <dl className="grid w-full max-w-xs grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline-light bg-cream/10 text-cream backdrop-blur-md">
                {[
                  ["41", "days avg. to close"],
                  ["104%", "of asking achieved"],
                ].map(([v, l]) => (
                  <div key={l} className="bg-ink/35 p-6">
                    <dt className="font-display text-4xl font-semibold">{v}</dt>
                    <dd className="mt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-cream/60">
                      {l}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
