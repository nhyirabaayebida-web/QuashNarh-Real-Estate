"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LogoutButton({ compact }: { compact?: boolean }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={cn(
        "flex items-center gap-3 text-sm font-semibold transition-colors",
        compact
          ? "rounded-full px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-cream/75 hover:bg-cream/10"
          : "w-full rounded-xl px-4 py-3 text-cream/60 hover:text-bronze",
      )}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
