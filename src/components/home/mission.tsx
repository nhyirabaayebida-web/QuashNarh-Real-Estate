import { Hammer, HeartHandshake, Target, Telescope, Users } from "lucide-react";
import Reveal from "@/components/reveal";

const PILLARS = [
  {
    icon: Target,
    tag: "Our Mission",
    title: "Why we show up every day",
    copy: "To connect every Ghanaian family with a home worthy of them — curating exceptional residences at honest cedi prices, and standing behind every key with verified artisans, transparent counsel, and service that outlasts the sale.",
  },
  {
    icon: Telescope,
    tag: "Our Vision",
    title: "Where we are going",
    copy: "A Ghana where trust builds every address. Where buying, renting, or building a home is safe, transparent, and dignified — from the first search to the final coat of paint, in every region we serve.",
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    name: "Radical honesty",
    copy: "Real photos, real cedi prices, real counsel — even when the truth costs us the deal.",
  },
  {
    icon: Hammer,
    name: "Craftsmanship",
    copy: "From the homes we list to the artisans we KYC-verify, quality is non-negotiable.",
  },
  {
    icon: Users,
    name: "Community first",
    copy: "Every cedi we help move keeps building Ghanaian neighbourhoods and livelihoods.",
  },
];

export default function Mission() {
  return (
    <section id="mission" className="scroll-mt-24 bg-parchment/60 py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center text-bronze-deep">04 · Our compass</p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            Guided by a <em className="italic text-bronze-deep">mission</em>,{" "}
            pulled by a <em className="italic text-bronze-deep">vision</em>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.tag} delay={i * 0.12}>
              <article className="group relative h-full overflow-hidden rounded-3xl border hairline bg-cream p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(23,19,16,0.28)] sm:p-10">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-8 select-none font-display text-[9rem] font-semibold italic leading-none text-bronze/10 transition-colors duration-500 group-hover:text-bronze/20"
                >
                  {i === 0 ? "M" : "V"}
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream transition-colors duration-500 group-hover:bg-bronze-deep">
                  <p.icon className="h-6 w-6" />
                </span>
                <p className="mt-7 text-[0.625rem] font-bold uppercase tracking-[0.3em] text-bronze-deep">
                  {p.tag}
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium sm:text-3xl">{p.title}</h3>
                <p className="mt-4 max-w-lg text-[1.0625rem] leading-[1.85] text-espresso/85">
                  {p.copy}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-8 border-t hairline pt-10 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.name} delay={i * 0.1}>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bronze/12 text-bronze-deep">
                  <v.icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold">{v.name}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-fog">{v.copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
