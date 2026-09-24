import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";
import { validatePropertyPayload } from "../route";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const propertyId = Number(id);
  if (!Number.isInteger(propertyId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Full-form edit: validate everything when the payload looks complete
  if (body.full === true) {
    const { values, error } = validatePropertyPayload(body);
    if (error || !values) {
      return NextResponse.json({ error: error ?? "Invalid listing" }, { status: 400 });
    }
    const [row] = await db
      .update(properties)
      .set(values)
      .where(eq(properties.id, propertyId))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data: row });
  }

  // Granular patch (price, status, featured, images)
  const patch: Partial<typeof properties.$inferInsert> = {};
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be a cedi amount above zero" }, { status: 400 });
    }
    patch.price = Math.round(price);
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!["available", "pending", "sold"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = status;
  }
  if (body.featured !== undefined) {
    patch.featured = Boolean(body.featured);
  }
  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      return NextResponse.json({ error: "Images must be an array of URLs" }, { status: 400 });
    }
    const images = body.images.map((u) => String(u).trim()).filter((u) => /^https?:\/\//.test(u));
    if (images.length === 0) {
      return NextResponse.json({ error: "A listing needs at least one image" }, { status: 400 });
    }
    patch.images = images;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [row] = await db
    .update(properties)
    .set(patch)
    .where(eq(properties.id, propertyId))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: row });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const propertyId = Number(id);
  if (!Number.isInteger(propertyId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const [row] = await db
    .delete(properties)
    .where(eq(properties.id, propertyId))
    .returning({ id: properties.id });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
