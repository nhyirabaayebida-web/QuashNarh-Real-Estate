"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "quashnarh:favorites";

export function readFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function FavoriteButton({
  propertyId,
  className,
}: {
  propertyId: number;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readFavorites().includes(propertyId));
  }, [propertyId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = readFavorites();
    const next = saved ? favs.filter((f) => f !== propertyId) : [...favs, propertyId];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove from saved homes" : "Save this home"}
      aria-pressed={saved}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90",
        saved
          ? "bg-bronze text-ink"
          : "bg-cream/85 text-ink hover:bg-cream",
        className,
      )}
    >
      <Heart className={cn("h-[1.05rem] w-[1.05rem] transition-all", saved && "fill-current")} />
    </button>
  );
}
