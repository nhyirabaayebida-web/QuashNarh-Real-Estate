import { getAllArtisans } from "@/lib/queries";
import ArtisansTable from "@/components/admin/artisans-table";

export const dynamic = "force-dynamic";

export default async function AdminArtisansPage() {
  const artisans = await getAllArtisans();
  const pending = artisans.filter((a) => a.status === "pending").length;

  return (
    <div>
      <p className="eyebrow text-bronze-deep">Studio</p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
        The guild <em className="italic text-bronze-deep">({artisans.length})</em>
      </h1>
      <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fog">
        {pending > 0
          ? `${pending} application${pending === 1 ? "" : "s"} awaiting review — check the Ghana Card and ID photo, then approve to publish.`
          : "Review artisan KYC documents, then approve to publish them in the directory."}
      </p>
      <ArtisansTable initial={artisans} />
    </div>
  );
}
