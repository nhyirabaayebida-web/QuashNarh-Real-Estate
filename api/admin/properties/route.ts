import { NextRequest, NextResponse } from "next/server";
import { ilike } from "drizzle-orm";
import { db } from "@/db";
import { properties, type NewProperty } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";
import { getAllProperties } from "@/lib/queries";

export const dynamic = "force-dynamic";

const LISTING_TYPES = new Set(["sale", "rent"]);
const STATUSES = new Set(["available", "pending", "sold"]);
const PROPERTY_TYPES = new Set([
  "house",
  "villa",
  "apartment",
  "condo",
  "townhouse",
  "cottage",
  "penthouse",
  "loft",
]);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validatePropertyPayload(
  body: Record<string, unknown>,
): { values?: Omit<NewProperty, "slug">; slugBase?: string; error?: string } {
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const listingType = String(body.listingType ?? "");
  const propertyType = String(body.propertyType ?? "");
  const price = Number(body.price);
  const bedrooms = Number(body.bedrooms);
  const bathrooms = Number(body.bathrooms);
  const areaSqft = Number(body.areaSqft);
  const lotSqft = body.lotSqft === null || body.lotSqft === "" ? null : Number(body.lotSqft);
  const yearBuilt = body.yearBuilt === null || body.yearBuilt === "" ? null : Number(body.yearBuilt);
  const address = String(body.address ?? "").trim();
  const city = String(body.city ?? "").trim();
  const state = String(body.state ?? "").trim();
  const zip = String(body.zip ?? "").trim();
  const status = String(body.status ?? "available");
  const agentName = String(body.agentName ?? "").trim();
  const agentPhone = String(body.agentPhone ?? "").trim();
  const agentEmail = String(body.agentEmail ?? "").trim();

  const images = Array.isArray(body.images)
    ? body.images.map((u) => String(u).trim()).filter((u) => /^https?:\/\//.test(u))
    : [];
  const features = Array.isArray(body.features)
    ? body.features.map((f) => String(f).trim()).filter(Boolean)
    : [];

  if (title.length < 3) return { error: "Title is too short" };
  if (description.length < 30) return { error: "Description needs at least 30 characters" };
  if (!LISTING_TYPES.has(listingType)) return { error: "Listing type must be sale or rent" };
  if (!PROPERTY_TYPES.has(propertyType)) return { error: "Choose a valid property type" };
  if (!Number.isFinite(price) || price <= 0) return { error: "Price must be a cedi amount above zero" };
  if (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 50) return { error: "Bedrooms looks off" };
  if (!Number.isInteger(bathrooms) || bathrooms < 0 || bathrooms > 50) return { error: "Bathrooms looks off" };
  if (!Number.isFinite(areaSqft) || areaSqft <= 0) return { error: "Living area must be above zero" };
  if (lotSqft !== null && !Number.isFinite(lotSqft)) return { error: "Lot size must be a number" };
  if (yearBuilt !== null && (!Number.isInteger(yearBuilt) || yearBuilt < 1700 || yearBuilt > 2100))
    return { error: "Year built looks off" };
  if (address.length < 3) return { error: "Address is required" };
  if (city.length < 2) return { error: "City / area is required" };
  if (!STATUSES.has(status)) return { error: "Invalid status" };
  if (images.length === 0) return { error: "Add at least one image URL (first image is the cover)" };
  if (features.length === 0) return { error: "Add at least one feature" };
  if (agentName.length < 2) return { error: "Agent name is required" };
  if (agentPhone.length < 5) return { error: "Agent phone is required" };

  return {
    slugBase: slugify(title.toLowerCase().includes(city.toLowerCase()) ? title : `${title} ${city}`),
    values: {
      title,
      description,
      listingType,
      propertyType,
      price: Math.round(price),
      bedrooms,
      bathrooms,
      areaSqft: Math.round(areaSqft),
      lotSqft: lotSqft === null ? null : Math.round(lotSqft),
      yearBuilt,
      address,
      city,
      state: state || "Greater Accra",
      zip: zip || "—",
      images,
      features,
      status,
      featured: Boolean(body.featured),
      agentName,
      agentPhone,
      agentEmail: agentEmail || "listings@quashnarh.com",
    },
  };
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ data: await getAllProperties() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { values, slugBase, error } = validatePropertyPayload(body);
  if (error || !values) {
    return NextResponse.json({ error: error ?? "Invalid listing" }, { status: 400 });
  }

  // Ensure a unique slug
  let slug = String(body.slug ?? "").trim() ? slugify(String(body.slug)) : (slugBase as string);
  const existing = await db
    .select({ slug: properties.slug })
    .from(properties)
    .where(ilike(properties.slug, `${slug}%`));
  const taken = new Set(existing.map((e) => e.slug));
  if (taken.has(slug)) {
    let n = 2;
    while (taken.has(`${slug}-${n}`)) n += 1;
    slug = `${slug}-${n}`;
  }

  const [row] = await db
    .insert(properties)
    .values({ ...values, slug })
    .returning();
  return NextResponse.json({ ok: true, data: row }, { status: 201 });
}
