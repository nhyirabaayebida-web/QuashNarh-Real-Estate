import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, Ruler } from "lucide-react";
import type { Property } from "@/db/schema";
import { formatNumber, formatPrice, listingLabel, titleCase } from "@/lib/format";
import { pxResize } from "@/lib/media";
import FavoriteButton from "@/components/favorite-button";
import { cn } from "@/lib/utils";

export default function PropertyCard({
  property,
  priority = false,
  size = "default",
}: {
  property: Property;
  priority?: boolean;
  size?: "default" | "large";
}) {
  const p = property;
  return (
    <Link
      href={`/properties/${p.slug}`}
      className="group block"
      aria-label={`${p.title}, ${p.city}`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-parchment",
          size === "large" ? "aspect-[16/11]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={pxResize(p.images[0], size === "large" ? 1600 : 1200, size === "large" ? 1100 : 900)}
          alt={`${p.title} — ${p.city}, ${p.state}`}
          fill
          priority={priority}
          sizes={size === "large" ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className="img-warm object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        {/* badges */}
        <div className="absolute left-4 top-4 flex gap-2">
          <span
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] backdrop-blur-md",
              p.listingType === "rent"
                ? "bg-moss/85 text-cream"
                : "bg-ink/80 text-cream",
            )}
          >
            {listingLabel(p.listingType)}
          </span>
          {p.status === "pending" && (
            <span className="rounded-full bg-bronze/90 px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-ink backdrop-blur-md">
              Pending
            </span>
          )}
        </div>
        <FavoriteButton propertyId={p.id} className="absolute right-4 top-4" />
        {/* price plate */}
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
          <span className="rounded-xl bg-cream/92 px-4 py-2.5 font-display text-xl font-semibold text-ink shadow-[0_8px_30px_rgba(0,0,0,0.14)] backdrop-blur-md">
            {formatPrice(p.price, p.listingType, { compact: true })}
          </span>
          <span className="flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-bronze text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div>
          <h3
            className={cn(
              "font-display font-medium leading-tight transition-colors duration-300 group-hover:text-bronze-deep",
              size === "large" ? "text-3xl" : "text-[1.35rem]",
            )}
          >
            {p.title}
          </h3>
          <p className="mt-1.5 text-sm text-fog">
            {p.address} — {p.city}, {p.state}
          </p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-5 border-t hairline px-1 pt-3.5 text-[0.8125rem] font-medium text-espresso">
        <span className="flex items-center gap-1.5">
          <BedDouble className="h-4 w-4 text-bronze-deep" />
          {p.bedrooms} Beds
        </span>
        <span className="flex items-center gap-1.5">
          <Bath className="h-4 w-4 text-bronze-deep" />
          {p.bathrooms} Baths
        </span>
        <span className="flex items-center gap-1.5">
          <Ruler className="h-4 w-4 text-bronze-deep" />
          {formatNumber(p.areaSqft)} sqft
        </span>
        <span className="ml-auto hidden rounded-full border hairline px-3 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-fog sm:block">
          {titleCase(p.propertyType)}
        </span>
      </div>
    </Link>
  );
}
