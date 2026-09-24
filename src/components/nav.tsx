"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/properties?type=sale", label: "Buy" },
  { href: "/properties?type=rent", label: "Rent" },
  { href: "/properties", label: "Portfolio" },
  { href: "/artisans", label: "Artisans" },
  { href: "/sell", label: "Sell with us" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid
            ? "border-b hairline bg-cream/90 text-ink backdrop-blur-xl"
            : "border-b border-transparent text-cream",
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Wordmark */}
          <Link href="/" className="group flex items-baseline gap-2.5">
            <span className="font-display text-[1.45rem] font-semibold tracking-[0.02em]">
              Quash<span className="italic text-bronze-deep">Narh</span>
            </span>
            <span
              className={cn(
                "hidden text-[0.5625rem] font-semibold uppercase tracking-[0.28em] transition-colors sm:block",
                solid ? "text-fog" : "text-cream/70",
              )}
            >
              Real Estate
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="link-sweep text-[0.8125rem] font-semibold uppercase tracking-[0.18em] opacity-90 transition-opacity hover:opacity-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <a
              href="tel:+233302740147"
              className="flex items-center gap-2 text-[0.8125rem] font-semibold tracking-wide opacity-80 transition-opacity hover:opacity-100"
            >
              <Phone className="h-3.5 w-3.5" />
              +233 30 274 0147
            </a>
            <Link
              href="/#sell"
              className={cn(
                "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300",
                solid
                  ? "bg-ink text-cream hover:bg-bronze-deep"
                  : "bg-cream text-ink hover:bg-bronze hover:text-cream",
              )}
            >
              List your home
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border hairline lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink text-cream"
          >
            <div className="flex h-[4.5rem] items-center justify-between px-5 sm:px-8">
              <span className="font-display text-[1.45rem] font-semibold tracking-[0.02em]">
                Quash<span className="italic text-bronze">Narh</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border hairline-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b hairline-light py-5"
                >
                  <span className="font-display text-4xl font-medium italic">Home</span>
                  <ArrowUpRight className="h-6 w-6 text-bronze transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </motion.div>
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b hairline-light py-5"
                  >
                    <span className="font-display text-4xl font-medium italic">
                      {l.label}
                    </span>
                    <ArrowUpRight className="h-6 w-6 text-bronze transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-8 pb-10 text-sm text-fog">
              <p>+233 30 274 0147 — hello@quashnarh.com</p>
              <p className="mt-1">12 Marina Boulevard, Airport City, Accra</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
