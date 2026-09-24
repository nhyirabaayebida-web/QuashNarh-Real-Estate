import PropertyForm from "@/components/admin/property-form";

export const dynamic = "force-dynamic";

export default function NewPropertyPage() {
  return (
    <div>
      <p className="eyebrow text-bronze-deep">Studio</p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
        New <em className="italic text-bronze-deep">listing</em>
      </h1>
      <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fog">
        Add a residence to the portfolio — paste photo URLs, set the price in
        cedis, and it goes live the moment you publish.
      </p>
      <PropertyForm />
    </div>
  );
}
