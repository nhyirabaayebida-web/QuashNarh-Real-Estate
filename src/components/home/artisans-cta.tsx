import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HardHat } from "lucide-react";
import { MEDIA } from "@/lib/media";
import Reveal from "@/components/reveal";

export default function ArtisansCta({ approvedCount }: { approvedCount: number }) {
  return (
    <section className="bg-ink py-24 text-cream lg:py-32">
      <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <Reveal>
          <p className="eyebrow text-bronze">06 · The Trade Guild</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            Building? Meet the <em className="italic text-bronze">hands that build homes.</em>
          </h2>
          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-cream/65">
            Masons, carpenters, electricians, tilers and more — every artisan in
            our guild passes Ghana Card KYC and is reviewed by homeowners like
            you. Hire with confidence, or join and let the work find you.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {["8 trades", `${approvedCount}+ vetted pros`, "Ghana Card verified", "Free to join"].map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 rounded-full border hairline-light px-4 py-2 text-[0.75rem] font-semibold text-cream/80"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-bronze" />
                {c}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/artisans"
              className="group inline-flex items-center gap-3 rounded-full bg-bronze px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:bg-cream"
            >
              Find an artisan
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/artisans#join"
              className="inline-flex items-center gap-2.5 rounded-full border hairline-light px-7 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:border-bronze hover:text-bronze"
            >
              <HardHat className="h-4 w-4" />
              Join as an artisan
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[5/5]">
            <Image
              src={MEDIA.artisansMain}
              alt="Mason laying bricks on a rooftop in Accra"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="img-warm object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>
          <div className="absolute -bottom-8 -left-4 hidden w-56 overflow-hidden rounded-2xl border-4 border-ink shadow-2xl sm:block lg:-left-10">
            <div className="relative aspect-[4/3]">
              <Image
                src={MEDIA.artisanCarpenter}
                alt="Carpenters at work in a joinery workshop"
                fill
                sizes="224px"
                className="img-warm object-cover"
              />
            </div>
          </div>
          <div className="absolute -right-3 top-8 rounded-2xl bg-cream px-5 py-4 text-ink shadow-2xl sm:-right-6">
            <p className="font-display text-3xl font-semibold">{approvedCount}+</p>
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-fog">
              Verified pros on call
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
