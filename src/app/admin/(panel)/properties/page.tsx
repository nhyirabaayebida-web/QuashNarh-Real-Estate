import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProperties } from "@/lib/queries";
import PropertiesTable from "@/components/admin/properties-table";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-bronze-deep">Studio</p>
          <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
            Listings <em className="italic text-bronze-deep">({properties.length})</em>
          </h1>
          <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fog">
            Edit prices in cedis inline, swap photos, adjust status or featuring
            — changes go live instantly.
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-bronze-deep"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New listing
        </Link>
      </div>

      <PropertiesTable initial={properties} />
    </div>
  );
}
