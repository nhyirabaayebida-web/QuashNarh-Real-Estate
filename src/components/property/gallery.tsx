"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { pxResize } from "@/lib/media";
import { cn } from "@/lib/utils";

export default function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setLightbox((cur) =>
        cur === null ? cur : (cur + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
        {images.slice(0, 4).map((src, i) => (
          <button
            key={src}
            onClick={() => setLightbox(i)}
            aria-label={`Open photo ${i + 1} of ${title}`}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-parchment",
              i === 0 ? "aspect-[16/11] md:col-span-2 md:row-span-2 md:aspect-auto md:h-full" : "aspect-[16/11]",
            )}
          >
            <Image
              src={pxResize(src, i === 0 ? 1600 : 1000, i === 0 ? 1100 : 640)}
              alt={`${title} — photo ${i + 1}`}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              className="img-warm object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />
            {i === images.slice(0, 4).length - 1 && (
              <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-cream/92 px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                <Expand className="h-3.5 w-3.5" />
                All {images.length} photos
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink/97 backdrop-blur-sm"
            onClick={close}
          >
            <div className="flex items-center justify-between px-5 py-4 text-cream sm:px-8">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.24em] text-cream/60">
                {title} — {lightbox + 1} / {images.length}
              </p>
              <button
                onClick={close}
                aria-label="Close gallery"
                className="flex h-11 w-11 items-center justify-center rounded-full border hairline-light transition-colors hover:border-bronze hover:text-bronze"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="relative flex-1 px-5 pb-4 sm:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={lightbox}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.015 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-full w-full overflow-hidden rounded-2xl"
                >
                  <Image
                    src={pxResize(images[lightbox], 2000)}
                    alt={`${title} — photo ${lightbox + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {(["prev", "next"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={(e) => {
                    e.stopPropagation();
                    step(dir === "prev" ? -1 : 1);
                  }}
                  aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
                  className={cn(
                    "absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream backdrop-blur-md transition-all hover:bg-bronze hover:text-ink sm:flex",
                    dir === "prev" ? "left-6" : "right-6",
                  )}
                >
                  {dir === "prev" ? (
                    <ChevronLeft className="h-6 w-6" />
                  ) : (
                    <ChevronRight className="h-6 w-6" />
                  )}
                </button>
              ))}
            </div>

            <div
              className="flex justify-center gap-2 px-5 pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setLightbox(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  className={cn(
                    "relative h-14 w-20 overflow-hidden rounded-lg transition-all duration-300",
                    i === lightbox
                      ? "ring-2 ring-bronze"
                      : "opacity-45 hover:opacity-90",
                  )}
                >
                  <Image
                    src={pxResize(src, 240, 160)}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
