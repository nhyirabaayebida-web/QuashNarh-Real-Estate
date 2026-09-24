import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { getArtisans } from "@/lib/queries";
import { TRADE_IDS } from "@/lib/trades";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GHANA_CARD_RE = /^GHA-\d{9}-\d$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Standard passport photo: 35 × 45 mm at 300 DPI ≈ 413 × 531 px. */
const PASSPORT_W = 413;
const PASSPORT_H = 531;
/** w/h must stay portrait and close to the 7:9 passport frame. */
const RATIO_MIN = 0.6;
const RATIO_MAX = 0.95;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const data = await getArtisans({
    trade: sp.get("trade") ?? undefined,
    q: sp.get("q") ?? undefined,
  });
  // KYC fields are private — never expose them publicly.
  const safe = data.map(({ ghanaCard, passportPhoto, ...rest }) => ({
    ...rest,
    idVerified: Boolean(ghanaCard && passportPhoto),
  }));
  return NextResponse.json({ data: safe, meta: { total: safe.length } });
}

async function savePassportPhoto(file: File): Promise<string | { error: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Passport photo must be a JPG, PNG or WEBP image" };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "Passport photo must be under 5 MB" };
  }
  const input = Buffer.from(await file.arrayBuffer());

  let width = 0;
  let height = 0;
  try {
    const meta = await sharp(input).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } catch {
    return { error: "That file doesn't look like a valid image" };
  }
  if (!width || !height) {
    return { error: "Couldn't read the image dimensions" };
  }

  const ratio = width / height;
  if (ratio >= 1) {
    return {
      error: "Passport photos must be portrait — taller than they are wide (35 × 45 mm)",
    };
  }
  if (ratio < RATIO_MIN || ratio > RATIO_MAX) {
    return {
      error: "Please frame to the passport ratio — about 35 × 45 mm (headshot, not full-body)",
    };
  }
  if (height < 400) {
    return { error: "Photo resolution is too low — at least 400px tall, please" };
  }

  // Normalise to the exact passport frame (7:9), auto-oriented and
  // face-aware cropped, compressed to a compact JPEG.
  const buffer = await sharp(input)
    .rotate()
    .resize(PASSPORT_W, PASSPORT_H, { fit: "cover", position: "attention" })
    .jpeg({ quality: 88 })
    .toBuffer();

  const filename = `artisan-pp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  let name = "";
  let trade = "";
  let phone = "";
  let email: string | null = null;
  let location = "";
  let years = NaN;
  let dayRate: number | null = null;
  let bio = "";
  let ghanaCard = "";
  let passportPhoto: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    name = String(form.get("name") ?? "").trim();
    trade = String(form.get("trade") ?? "").trim();
    phone = String(form.get("phone") ?? "").trim();
    email = form.get("email") ? String(form.get("email")).trim() : null;
    location = String(form.get("location") ?? "").trim();
    years = Number(form.get("years"));
    const rateRaw = String(form.get("dayRate") ?? "");
    dayRate = rateRaw ? Number(rateRaw) : null;
    bio = String(form.get("bio") ?? "").trim();
    ghanaCard = String(form.get("ghanaCard") ?? "").trim().toUpperCase();

    const photo = form.get("passport");
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json(
        { error: "A passport photo is required for KYC verification" },
        { status: 400 },
      );
    }
    const saved = await savePassportPhoto(photo);
    if (typeof saved !== "string") {
      return NextResponse.json({ error: saved.error }, { status: 400 });
    }
    passportPhoto = saved;
  } else {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    name = String(body.name ?? "").trim();
    trade = String(body.trade ?? "").trim();
    phone = String(body.phone ?? "").trim();
    email = body.email ? String(body.email).trim() : null;
    location = String(body.location ?? "").trim();
    years = Number(body.years);
    dayRate =
      body.dayRate === null || body.dayRate === undefined || body.dayRate === ""
        ? null
        : Number(body.dayRate);
    bio = String(body.bio ?? "").trim();
    ghanaCard = String(body.ghanaCard ?? "").trim().toUpperCase();
    passportPhoto = body.passportPhoto ? String(body.passportPhoto) : null;
  }

  if (name.length < 2) {
    return NextResponse.json({ error: "Please provide your full name" }, { status: 400 });
  }
  if (!TRADE_IDS.includes(trade)) {
    return NextResponse.json({ error: "Please choose a valid trade" }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Please provide a reachable phone number" }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
  }
  if (location.length < 2) {
    return NextResponse.json({ error: "Tell us the area you work in" }, { status: 400 });
  }
  if (!Number.isInteger(years) || years < 0 || years > 70) {
    return NextResponse.json({ error: "Years of experience looks off" }, { status: 400 });
  }
  if (dayRate !== null && (!Number.isFinite(dayRate) || dayRate < 0 || dayRate > 100000)) {
    return NextResponse.json({ error: "Day rate must be a cedi amount" }, { status: 400 });
  }
  if (bio.length < 20) {
    return NextResponse.json(
      { error: "Tell clients a little more about your work (20+ characters)" },
      { status: 400 },
    );
  }
  if (!GHANA_CARD_RE.test(ghanaCard)) {
    return NextResponse.json(
      { error: "Ghana Card number must look like GHA-123456789-0" },
      { status: 400 },
    );
  }
  if (!passportPhoto) {
    return NextResponse.json(
      { error: "A passport photo is required for KYC verification" },
      { status: 400 },
    );
  }

  const [row] = await db
    .insert(artisans)
    .values({
      name,
      trade,
      phone,
      email,
      location,
      years,
      dayRate,
      bio,
      ghanaCard,
      passportPhoto,
      status: "pending",
    })
    .returning({ id: artisans.id });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
