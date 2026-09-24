import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin, usingDefaultPasscode } from "@/lib/admin-auth";
import LoginForm from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio sign-in",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const showHint = usingDefaultPasscode();

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-ink px-5 pt-[4.5rem] text-cream">
      <div className="w-full max-w-md">
        <p className="eyebrow text-bronze">QuashNarh Studio</p>
        <h1 className="mt-4 font-display text-4xl font-medium sm:text-5xl">
          Back <em className="italic text-bronze">office.</em>
        </h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/60">
          Sign in to add listings, upload house photos, adjust prices in cedis,
          and review artisan applications.
        </p>
        <LoginForm showHint={showHint} />
      </div>
    </div>
  );
}
