import { Quote, Star } from "lucide-react";
import Reveal from "@/components/reveal";

const VOICES = [
  {
    quote:
      "They talked us out of two houses before finding us the right one. Who does that? An advisor, not a salesperson.",
    name: "Akosua & Kojo Darko",
    role: "Bought in Cantonments, 2025",
  },
  {
    quote:
      "Our bungalow sold nine days after the first viewing — ₵180,000 over ask, to a buyer from their private list.",
    name: "Esi Dadson",
    role: "Sold in Aburi, 2025",
  },
  {
    quote:
      "Relocating from London, we rented sight unseen. The video tours were so honest the apartment felt familiar on day one.",
    name: "Nii Noi Sowah",
    role: "Renting in Osu, 2026",
  },
];

export default function Testimonials() {
  return (
    <section id="voices" className="bg-parchment/60 py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-bronze-deep">07 · Voices</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
              Clients, <em className="italic text-bronze-deep">in their own words</em>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-bronze text-bronze" />
              ))}
            </div>
            <span className="text-sm font-semibold text-espresso">5.0 — 212 reviews</span>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {VOICES.map((v, i) => (
            <Reveal key={v.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border hairline bg-cream p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(23,19,16,0.25)] sm:p-10">
                <Quote className="h-8 w-8 rotate-180 text-bronze" />
                <blockquote className="mt-6 flex-1 font-display text-xl font-medium leading-snug text-espresso sm:text-[1.375rem]">
                  {v.quote}
                </blockquote>
                <figcaption className="mt-8 border-t hairline pt-5">
                  <p className="text-sm font-bold">{v.name}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-fog">{v.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
