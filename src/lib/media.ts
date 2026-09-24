/**
 * Helpers for building Pexels image URLs with on-the-fly resizing.
 */

export function pex(id: number, w = 1600, h?: number): string {
  const ext = id === 5517853 ? "png" : "jpeg";
  const base = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}`;
  const params = new URLSearchParams({
    auto: "compress",
    cs: "tinysrgb",
    w: String(w),
  });
  if (h) {
    params.set("h", String(h));
    params.set("fit", "crop");
  }
  return `${base}?${params.toString()}`;
}

/** Rewrites an existing Pexels URL with new dimensions. */
export function pxResize(url: string, w = 1200, h?: number): string {
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(w));
    if (h) {
      u.searchParams.set("h", String(h));
      u.searchParams.set("fit", "crop");
    } else {
      u.searchParams.delete("h");
      u.searchParams.delete("fit");
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** Shared site imagery (non-listing). */
export const MEDIA = {
  hero: pex(24805054, 2400, 1400),
  heroPoster: pex(31817157, 2000, 1200),
  buyPanel: pex(7031600, 1400, 1750),
  rentPanel: pex(24259313, 1400, 1750),
  sellBanner: pex(20975729, 2200, 1100),
  aboutBand: pex(24807126, 2200, 900),
  poolEvening: pex(19084142, 1800, 1000),
  artisansMain: pex(16151267, 1600, 2000),
  artisansWide: pex(33194812, 2200, 1000),
  artisanCarpenter: pex(7484154, 1400, 1000),
};
