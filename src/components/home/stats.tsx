import CountUp from "@/components/count-up";
import Reveal from "@/components/reveal";

const STATS = [
  { value: 2.4, prefix: "₵", suffix: "B+", decimals: 1, label: "In closed volume" },
  { value: 4200, suffix: "+", decimals: 0, label: "Homes matched" },
  { value: 98, suffix: "%", decimals: 0, label: "Client satisfaction" },
  { value: 18, suffix: "", decimals: 0, label: "Years of craft" },
];

export default function Stats() {
  return (
    <section id="story" className="bg-ink py-24 text-cream lg:py-32">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1.4fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow text-bronze">03 · The QuashNarh standard</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] sm:text-5xl">
              A boutique house,{" "}
              <em className="italic text-bronze">obsessively</em> run.
            </h2>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-cream/65">
              We take on a fraction of the listings we&rsquo;re offered — so every
              client, buyer or seller, gets the senior team, the full rolodex,
              and honest counsel. Fewer homes. Deeper work. Better outcomes.
            </p>
            <p className="mt-8 font-display text-lg italic text-cream/50">
              — Boateng &amp; Ansah, founders
            </p>
          </Reveal>

          <div className="grid grid-cols-2 content-center gap-x-8 gap-y-12">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <div className="border-l hairline-light pl-6">
                  <p className="font-display text-5xl font-semibold text-cream sm:text-6xl">
                    <CountUp
                      to={s.value}
                      prefix={s.prefix ?? ""}
                      suffix={s.suffix}
                      decimals={s.decimals}
                    />
                  </p>
                  <p className="mt-3 text-[0.6875rem] font-bold uppercase tracking-[0.24em] text-fog">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
