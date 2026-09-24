import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function PropertyNotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-[4.5rem] text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-parchment">
        <Compass className="h-7 w-7 text-bronze-deep" />
      </span>
      <h1 className="mt-8 font-display text-4xl font-medium sm:text-5xl">
        This home has <em className="italic text-bronze-deep">moved on.</em>
      </h1>
      <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-fog">
        The residence you&rsquo;re looking for was sold, taken off market, or
        never existed — but others are waiting to be discovered.
      </p>
      <Link
        href="/properties"
        className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-bronze-deep"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to the portfolio
      </Link>
    </div>
  );
}
