import { and, asc, count, desc, eq, gte, ilike, lte, ne, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  artisans,
  inquiries,
  properties,
  submissions,
  type Artisan,
  type Property,
  type Submission,
} from "@/db/schema";

export type PropertyFilters = {
  type?: string;
  q?: string;
  ptype?: string;
  beds?: string;
  min?: string;
  max?: string;
  sort?: string;
};

export async function getProperties(f: PropertyFilters): Promise<Property[]> {
  const conds: SQL[] = [];

  if (f.type === "sale" || f.type === "rent") {
    conds.push(eq(properties.listingType, f.type));
  }
  if (f.q) {
    const like = `%${f.q}%`;
    const search = or(
      ilike(properties.city, like),
      ilike(properties.address, like),
      ilike(properties.title, like),
      ilike(properties.state, like),
      ilike(properties.zip, like),
    );
    if (search) conds.push(search);
  }
  if (f.ptype && f.ptype !== "any") {
    conds.push(eq(properties.propertyType, f.ptype));
  }
  if (f.beds) {
    const b = Number(f.beds);
    if (!Number.isNaN(b) && b > 0) conds.push(gte(properties.bedrooms, b));
  }
  if (f.min) {
    const n = Number(f.min);
    if (!Number.isNaN(n)) conds.push(gte(properties.price, n));
  }
  if (f.max) {
    const n = Number(f.max);
    if (!Number.isNaN(n)) conds.push(lte(properties.price, n));
  }

  const orderBy =
    f.sort === "price-asc"
      ? asc(properties.price)
      : f.sort === "price-desc"
        ? desc(properties.price)
        : f.sort === "beds"
          ? desc(properties.bedrooms)
          : desc(properties.createdAt);

  return db
    .select()
    .from(properties)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(orderBy);
}

export async function getFeaturedProperties(limit = 5): Promise<Property[]> {
  return db
    .select()
    .from(properties)
    .where(eq(properties.featured, true))
    .orderBy(desc(properties.createdAt))
    .limit(limit);
}

export async function getNewestProperties(limit = 3): Promise<Property[]> {
  return db
    .select()
    .from(properties)
    .orderBy(desc(properties.createdAt))
    .limit(limit);
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const rows = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  return rows[0];
}

export async function getSimilarProperties(property: Property, limit = 3): Promise<Property[]> {
  const rows = await db
    .select()
    .from(properties)
    .where(
      and(
        ne(properties.slug, property.slug),
        or(
          eq(properties.listingType, property.listingType),
          eq(properties.propertyType, property.propertyType),
        ),
      ),
    )
    .orderBy(desc(properties.featured))
    .limit(limit);
  return rows;
}

export async function getListingCounts(): Promise<{ sale: number; rent: number }> {
  const rows = await db
    .select({ listingType: properties.listingType, n: count() })
    .from(properties)
    .groupBy(properties.listingType);
  const result = { sale: 0, rent: 0 };
  for (const r of rows) {
    if (r.listingType === "sale") result.sale = r.n;
    if (r.listingType === "rent") result.rent = r.n;
  }
  return result;
}

/* ------------------------------ Artisans ------------------------------ */

export type ArtisanFilters = {
  trade?: string;
  q?: string;
  includeUnapproved?: boolean;
};

export async function getArtisans(f: ArtisanFilters): Promise<Artisan[]> {
  const conds: SQL[] = [];
  if (!f.includeUnapproved) {
    conds.push(eq(artisans.status, "approved"));
  }
  if (f.trade && f.trade !== "all") {
    conds.push(eq(artisans.trade, f.trade));
  }
  if (f.q) {
    const like = `%${f.q}%`;
    const search = or(ilike(artisans.name, like), ilike(artisans.location, like), ilike(artisans.bio, like));
    if (search) conds.push(search);
  }
  return db
    .select()
    .from(artisans)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(artisans.years), asc(artisans.name));
}

export async function getArtisanCount(status?: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(artisans)
    .where(status ? eq(artisans.status, status) : undefined);
  return rows[0]?.n ?? 0;
}

/* ------------------------------- Admin -------------------------------- */

export async function getAllProperties(): Promise<Property[]> {
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

export async function getAllArtisans(): Promise<Artisan[]> {
  return db.select().from(artisans).orderBy(desc(artisans.createdAt));
}

export async function getRecentInquiries(limit = 20) {
  return db
    .select({
      id: inquiries.id,
      name: inquiries.name,
      email: inquiries.email,
      phone: inquiries.phone,
      topic: inquiries.topic,
      tourDate: inquiries.tourDate,
      message: inquiries.message,
      createdAt: inquiries.createdAt,
      propertyTitle: properties.title,
      propertySlug: properties.slug,
    })
    .from(inquiries)
    .leftJoin(properties, eq(inquiries.propertyId, properties.id))
    .orderBy(desc(inquiries.createdAt))
    .limit(limit);
}

export async function getDashboardCounts() {
  const [props] = await db.select({ n: count() }).from(properties);
  const [inqs] = await db.select({ n: count() }).from(inquiries);
  const [pendingArtisans] = await db
    .select({ n: count() })
    .from(artisans)
    .where(eq(artisans.status, "pending"));
  const [approvedArtisans] = await db
    .select({ n: count() })
    .from(artisans)
    .where(eq(artisans.status, "approved"));
  const [pendingSubmissions] = await db
    .select({ n: count() })
    .from(submissions)
    .where(eq(submissions.status, "pending"));
  return {
    properties: props?.n ?? 0,
    inquiries: inqs?.n ?? 0,
    pendingArtisans: pendingArtisans?.n ?? 0,
    approvedArtisans: approvedArtisans?.n ?? 0,
    pendingSubmissions: pendingSubmissions?.n ?? 0,
  };
}

/* ---------------------------- Sell-with-us ----------------------------- */

export async function getSubmissions(): Promise<Submission[]> {
  return db.select().from(submissions).orderBy(desc(submissions.createdAt));
}
