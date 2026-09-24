import { NextRequest, NextResponse } from "next/server";
import { getListingCounts, getProperties } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const properties = await getProperties({
    type: sp.get("type") ?? undefined,
    q: sp.get("q") ?? undefined,
    ptype: sp.get("ptype") ?? undefined,
    beds: sp.get("beds") ?? undefined,
    min: sp.get("min") ?? undefined,
    max: sp.get("max") ?? undefined,
    sort: sp.get("sort") ?? undefined,
  });
  const counts = await getListingCounts();
  return NextResponse.json({
    data: properties,
    meta: { total: properties.length, sale: counts.sale, rent: counts.rent },
  });
}
