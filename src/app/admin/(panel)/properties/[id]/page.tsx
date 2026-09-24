import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import PropertyForm from "@/components/admin/property-form";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);
  if (!Number.isInteger(propertyId)) notFound();

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!property) notFound();

  return (
    <div>
      <p className="eyebrow text-bronze-deep">Studio · {property.slug}</p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
        Edit <em className="italic text-bronze-deep">{property.title}</em>
      </h1>
      <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fog">
        Adjust the cedi price, swap or reorder photos, and refine the story —{" "}
        changes go live instantly.
      </p>
      <PropertyForm initial={property} />
    </div>
  );
}
