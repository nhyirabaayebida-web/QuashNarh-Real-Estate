import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = new Set(["tour", "info", "offer"]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const propertyId = Number(body.propertyId);
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const topic = TOPICS.has(String(body.topic)) ? String(body.topic) : "tour";
  const tourDate = body.tourDate ? String(body.tourDate) : null;
  const message = String(body.message ?? "").trim();

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return NextResponse.json({ error: "A valid property is required" }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Your message is a little short — a sentence or two helps" }, { status: 400 });
  }

  try {
    const [row] = await db
      .insert(inquiries)
      .values({ propertyId, name, email, phone, topic, tourDate, message })
      .returning({ id: inquiries.id });

    return NextResponse.json(
      { ok: true, id: row.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Inquiry insert failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your inquiry — the residence may no longer be listed." },
      { status: 500 },
    );
  }
}
