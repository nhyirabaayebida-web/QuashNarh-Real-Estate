import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck2,
  Fingerprint,
  Home,
  Landmark,
  Map,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { DOCUMENT_REQUIREMENTS } from "@/lib/documents";
import SubmissionForm from "@/components/sell/submission-form";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Sell With Us — Strict Document Verification",
  description:
    "List your property with QuashNarh Real Estate. Every listing passes our strict document standard — land title, site plan, Ghana Card and tax receipts verified before your home goes live.",
};

const DOC_ICONS: Record<string, typeof Landmark> = {
  title: Landmark,
  sitePlan: Map,
  idCard: Fingerprint,
  taxReceipt: Receipt,
  permit: FileCheck2,
};

const STEPS = [
  {
    n: "01",
    title: "Submit with documents",
    copy: "Send the property details with all four required documents. Incomplete files never reach review.",
  },
  {
    n: "02",
    title: "We verify everything",
    copy: "Our compliance desk checks the title against the owner's ID, the site plan against the plot, and the tax record with the assembly.",
  },
  {
    n: "03",
    title: "Valuation, then listing",
    copy: "Once proven, we photograph, price and publish — and your documents stay private forever.",
  },
];

export default function SellPage() {
  const required = DOCUMENT_REQUIREMENTS.filter((d) => d.required);
  const optional = DOCUMENT_REQUIREMENTS.filter((d) => !d.required);

  return (
    <div className="pt-[4.5rem]">
      {/* Header */}
      <header className="mx-auto max-w-[90rem] px-5 pb-14 pt-14 sm:px-8 lg:px-12 lg:pt-20">
        <Reveal className="mb-8 flex justify-end">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] transition-all hover:border-ink hover:bg-ink hover:text-cream"
          >
            <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Back home
          </Link>
        </Reveal>
        <Reveal>
          <p className="eyebrow text-bronze-deep">Sell with us</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">
            List with the house that <em className="italic text-bronze-deep">verifies everything.</em>
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-fog">
            Any agent can promise a fast sale. We promise a clean one — every
            QuashNarh listing passes a strict document standard before it goes
            live, which is why buyers trust our keys and pay our prices.
          </p>
        </Reveal>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-14 px-5 pb-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:px-12">
        {/* Document standard */}
        <div>
          <Reveal>
            <div className="rounded-3xl border border-bronze/40 bg-bronze/8 p-7 sm:p-9">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-bronze-deep" />
                <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-bronze-deep">
                  The document standard — non-negotiable
                </h2>
              </div>
              <ul className="mt-6 space-y-5">
                {required.map((d) => {
                  const Icon = DOC_ICONS[d.type] ?? FileCheck2;
                  return (
                    <li key={d.type} className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-bronze-deep">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[0.9375rem] font-bold">
                          {d.label} <span className="text-bronze-deep">*</span>
                        </p>
                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-espresso/70">
                          {d.note}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 border-t border-bronze/30 pt-5">
                {optional.map((d) => {
                  const Icon = DOC_ICONS[d.type] ?? FileCheck2;
                  return (
                    <div key={d.type} className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/60 text-fog">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[0.9375rem] font-bold text-espresso/80">{d.label}</p>
                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-fog">{d.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 rounded-xl bg-cream px-5 py-4 text-[0.8125rem] leading-relaxed text-espresso/80">
                PDF or image scans accepted, up to 8 MB each. Documents are
                reviewed by our compliance desk only — they are never published,
                shared, or attached to your listing.
              </p>
            </div>
          </Reveal>

          {/* How it goes */}
          <Reveal delay={0.12} className="mt-8">
            <ol className="space-y-0">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="grid grid-cols-[3.5rem_1fr] gap-4 border-t hairline py-6"
                >
                  <span className="font-display text-2xl font-light italic text-bronze-deep">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fog">{s.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* Form */}
        <Reveal delay={0.08}>
          <SubmissionForm />
        </Reveal>
      </div>
    </div>
  );
}
