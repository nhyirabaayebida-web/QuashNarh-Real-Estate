import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import {
  DOC_EXTENSIONS,
  DOC_MIME_TYPES,
  DOCUMENT_REQUIREMENTS,
  MAX_DOC_BYTES,
  REQUIRED_DOC_TYPES,
} from "@/lib/documents";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GHANA_CARD_RE = /^GHA-\d{9}-\d$/;
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

async function saveDoc(type: string, file: File): Promise<string | { error: string }> {
  if (!DOC_MIME_TYPES.has(file.type)) {
    return { error: "Documents must be PDF, JPG, PNG or WEBP files" };
  }
  if (file.size > MAX_DOC_BYTES) {
    return { error: "Each document must be under 8 MB" };
  }
  if (file.size === 0) {
    return { error: "One of the documents is empty" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `sub-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${
    DOC_EXTENSIONS[file.type]
  }`;
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const ownerName = String(form.get("ownerName") ?? "").trim();
  const ownerPhone = String(form.get("ownerPhone") ?? "").trim();
  const ownerEmail = form.get("ownerEmail") ? String(form.get("ownerEmail")).trim() : null;
  const ghanaCard = String(form.get("ghanaCard") ?? "").trim().toUpperCase();
  const propertyType = String(form.get("propertyType") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const region = form.get("region") ? String(form.get("region")).trim() : null;
  const bedrooms = Number(form.get("bedrooms"));
  const bathrooms = Number(form.get("bathrooms"));
  const areaRaw = String(form.get("areaSqft") ?? "");
  const areaSqft = areaRaw ? Number(areaRaw.replace(/[^\d]/g, "")) : null;
  const priceRaw = String(form.get("askingPrice") ?? "");
  const askingPrice = priceRaw ? Number(priceRaw.replace(/[^\d]/g, "")) : null;
  const description = String(form.get("description") ?? "").trim();

  if (ownerName.length < 2) {
    return NextResponse.json({ error: "Please provide the owner's full name" }, { status: 400 });
  }
  if (ownerPhone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Please provide a reachable phone number" }, { status: 400 });
  }
  if (ownerEmail && !EMAIL_RE.test(ownerEmail)) {
    return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
  }
  if (!GHANA_CARD_RE.test(ghanaCard)) {
    return NextResponse.json(
      { error: "Owner's Ghana Card must look like GHA-123456789-0" },
      { status: 400 },
    );
  }
  if (!PROPERTY_TYPES.has(propertyType)) {
    return NextResponse.json({ error: "Choose a valid property type" }, { status: 400 });
  }
  if (address.length < 3) {
    return NextResponse.json({ error: "The property address is required" }, { status: 400 });
  }
  if (city.length < 2) {
    return NextResponse.json({ error: "Tell us the city / area of the property" }, { status: 400 });
  }
  if (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 50) {
    return NextResponse.json({ error: "Bedrooms looks off" }, { status: 400 });
  }
  if (!Number.isInteger(bathrooms) || bathrooms < 0 || bathrooms > 50) {
    return NextResponse.json({ error: "Bathrooms looks off" }, { status: 400 });
  }
  if (askingPrice !== null && (!Number.isFinite(askingPrice) || askingPrice < 1000)) {
    return NextResponse.json(
      { error: "Asking price should be a sensible cedi amount" },
      { status: 400 },
    );
  }
  if (description.length < 30) {
    return NextResponse.json(
      { error: "Tell us a little more about the property (30+ characters)" },
      { status: 400 },
    );
  }

  // --- Strict document standard: every required document must be present ---
  const documents: { type: string; label: string; path: string }[] = [];
  for (const req of DOCUMENT_REQUIREMENTS) {
    const field = form.get(`doc_${req.type}`);
    if (!(field instanceof File) || field.size === 0) {
      if (req.required) {
        return NextResponse.json(
          { error: `Missing required document: ${req.label}` },
          { status: 400 },
        );
      }
      continue;
    }
    const saved = await saveDoc(req.type, field);
    if (typeof saved !== "string") {
      return NextResponse.json(
        { error: `${req.label}: ${saved.error}` },
        { status: 400 },
      );
    }
    documents.push({ type: req.type, label: req.label, path: saved });
  }
  if (!REQUIRED_DOC_TYPES.every((t) => documents.some((d) => d.type === t))) {
    return NextResponse.json(
      { error: "The four required documents must all be attached" },
      { status: 400 },
    );
  }

  const [row] = await db
    .insert(submissions)
    .values({
      ownerName,
      ownerPhone,
      ownerEmail,
      ghanaCard,
      propertyType,
      address,
      city,
      region,
      bedrooms,
      bathrooms,
      areaSqft,
      askingPrice,
      description,
      documents,
      status: "pending",
    })
    .returning({ id: submissions.id });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
