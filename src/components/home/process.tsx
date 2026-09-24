import Link from "next/link";
import { Compass, Handshake, KeyRound, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/reveal";

const STEPS = [
  {
    n: "01",
    icon: Compass,
    title: "Curated search",
    copy: "Tell us how you live — school runs, morning light, the dinner parties you host. We shortlist from the whole market, including off-market doors only we can open.",
    link: { href: "/properties", label: "Browse the portfolio" },
  },
  {
    n: "02",
    icon: KeyRound,
    title: "Private tours",
    copy: "Twilight showings, video walk-throughs for relocating families, honest notes on every floor plan. Tour on your schedule, at your pace — in person or from abroad.",
    link: { href: "/properties?sort=newest", label: "See what's new" },
  },
  {
    n: "03",
    icon: Handshake,
    title: "Close with confidence",
    copy: "From offer strategy to inspection, appraisal to keys — a senior negotiator in your corner and a paper trail so clean your attorney will send us a thank-you note.",
    link: { href: "/#sell", label: "Selling? Start here" },
  },
];

export default function Process() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <Reveal className="mb-14 max-w-2xl">
        <p className="eyebrow text-bronze-deep">05 · How we work</p>
        <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
          Three steps to <em className="italic text-bronze-deep">your next chapter</em>
        </h2>
      </Reveal>

      <div>
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08}>
            <div className="group grid grid-cols-[auto_1fr] items-start gap-6 border-t hairline py-10 transition-colors duration-500 hover:bg-parchment/50 sm:grid-cols-[7rem_auto_1fr_auto] sm:items-center sm:gap-10 lg:px-6">
              <span className="font-display text-3xl font-light italic text-bronze-deep sm:text-4xl">
                {step.n}
              </span>
              <span className="hidden h-14 w-14 items-center justify-center rounded-full border hairline text-espresso transition-all duration-500 group-hover:border-bronze group-hover:bg-bronze group-hover:text-ink sm:flex">
                <step.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-medium sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-fog">
                  {step.copy}
                </p>
              </div>
              <Link
                href={step.link.href}
                className="col-span-2 mt-2 inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-bronze-deep link-sweep sm:col-span-1 sm:mt-0 sm:justify-self-end"
              >
                {step.link.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ))}
        <div className="border-t hairline" />
      </div>
    </section>
  );
}
