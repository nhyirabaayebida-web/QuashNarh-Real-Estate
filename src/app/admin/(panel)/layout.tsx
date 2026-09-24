import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  ExternalLink,
  FileCheck2,
  HardHat,
  Home,
  Inbox,
  LayoutDashboard,
} from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import LogoutButton from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Listings", icon: Building2 },
  { href: "/admin/artisans", label: "Artisans", icon: HardHat },
  { href: "/admin/submissions", label: "Sell requests", icon: FileCheck2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-parchment/40 pt-[4.5rem]">
      {/* Sidebar (desktop) */}
      <aside className="fixed bottom-0 left-0 top-[4.5rem] z-30 hidden w-64 flex-col justify-between border-r hairline bg-ink p-7 text-cream lg:flex">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-bronze">
              QuashNarh Studio
            </p>
            <Link
              href="/"
              aria-label="Back to website home"
              title="Back to website home"
              className="flex h-9 w-9 items-center justify-center rounded-full border hairline-light text-cream/70 transition-colors hover:border-bronze hover:text-bronze"
            >
              <Home className="h-4 w-4" />
            </Link>
          </div>
          <nav className="mt-8 space-y-1.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-cream/60 transition-colors hover:text-bronze"
          >
            <ExternalLink className="h-4 w-4" />
            View website
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="sticky top-[4.5rem] z-30 flex gap-1 overflow-x-auto border-b hairline bg-ink px-4 py-2.5 text-cream lg:hidden">
        <Link
          href="/"
          aria-label="Back to website home"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border hairline-light text-cream/75 self-center hover:text-bronze"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-cream/75 hover:bg-cream/10"
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        ))}
        <span className="ml-auto shrink-0 self-center">
          <LogoutButton compact />
        </span>
      </nav>

      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
