import { getSubmissions } from "@/lib/queries";
import SubmissionsTable from "@/components/admin/submissions-table";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissions();
  const pending = submissions.filter((s) => s.status === "pending").length;

  return (
    <div>
      <p className="eyebrow text-bronze-deep">Studio</p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
        Sell requests <em className="italic text-bronze-deep">({submissions.length})</em>
      </h1>
      <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fog">
        {pending > 0
          ? `${pending} submission${pending === 1 ? "" : "s"} awaiting document verification — open the title deed, site plan and ID before approving.`
          : "Owner submissions for the strict document standard — verify titles before anything lists."}
      </p>
      <SubmissionsTable initial={submissions} />
    </div>
  );
}
