"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Property } from "@/db/schema";
import { cn } from "@/lib/utils";

const LISTING_TYPES = [
  ["sale", "For Sale"],
  ["rent", "For Rent"],
] as const;

const PROPERTY_TYPES = [
  "house",
  "villa",
  "apartment",
  "condo",
  "townhouse",
  "cottage",
  "penthouse",
  "loft",
];

const STATUSES = [
  ["available", "Available"],
  ["pending", "Pending"],
  ["sold", "Sold / Let"],
] as const;

export default function PropertyForm({ initial }: { initial?: Property }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [listingType, setListingType] = useState(initial?.listingType ?? "sale");
  const [propertyType, setPropertyType] = useState(initial?.propertyType ?? "house");
  const [status, setStatus] = useState(initial?.status ?? "available");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [bedrooms, setBedrooms] = useState(initial ? String(initial.bedrooms) : "3");
  const [bathrooms, setBathrooms] = useState(initial ? String(initial.bathrooms) : "2");
  const [areaSqft, setAreaSqft] = useState(initial ? String(initial.areaSqft) : "");
  const [lotSqft, setLotSqft] = useState(initial?.lotSqft ? String(initial.lotSqft) : "");
  const [yearBuilt, setYearBuilt] = useState(initial?.yearBuilt ? String(initial.yearBuilt) : "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "Greater Accra");
  const [zip, setZip] = useState(initial?.zip ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [featuresText, setFeaturesText] = useState(initial ? initial.features.join("\n") : "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageDraft, setImageDraft] = useState("");
  const [agentName, setAgentName] = useState(initial?.agentName ?? "");
  const [agentPhone, setAgentPhone] = useState(initial?.agentPhone ?? "+233 ");
  const [agentEmail, setAgentEmail] = useState(initial?.agentEmail ?? "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addImage() {
    const url = imageDraft.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError("Image must be a full URL starting with https://");
      return;
    }
    if (images.includes(url)) {
      setError("That image is already in the gallery");
      return;
    }
    setImages((imgs) => [...imgs, url]);
    setImageDraft("");
    setError("");
  }

  function moveImage(i: number, dir: -1 | 1) {
    setImages((imgs) => {
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      const next = [...imgs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const payload = {
      full: true,
      title,
      description,
      listingType,
      propertyType,
      status,
      featured,
      price: Number(price.replace(/[^\d]/g, "")),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      areaSqft: Number(areaSqft.replace(/[^\d]/g, "")),
      lotSqft: lotSqft ? Number(lotSqft.replace(/[^\d]/g, "")) : null,
      yearBuilt: yearBuilt ? Number(yearBuilt) : null,
      address,
      city,
      state,
      zip,
      images,
      features: featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      agentName,
      agentPhone,
      agentEmail,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/properties/${initial!.id}` : "/api/admin/properties",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-8">
      {/* Basics */}
      <section className="rounded-3xl border hairline bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">The essentials</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Field label="Listing title" className="lg:col-span-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="The Palm Court Villa"
              className="w-full bg-transparent pb-2 font-display text-xl font-semibold outline-none placeholder:text-fog/50"
            />
          </Field>

          <div>
            <p className="text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
              Listing type
            </p>
            <div className="mt-2 flex gap-1 rounded-full border hairline bg-parchment/60 p-1">
              {LISTING_TYPES.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setListingType(val)}
                  className={cn(
                    "flex-1 rounded-full py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] transition-all",
                    listingType === val ? "bg-ink text-cream" : "text-espresso hover:text-bronze-deep",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Property type"
              value={propertyType}
              onChange={setPropertyType}
              options={PROPERTY_TYPES.map((t) => [t, t[0].toUpperCase() + t.slice(1)])}
              capitalize
            />
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              options={[...STATUSES]}
            />
          </div>

          <Field label="Price in cedis (₵)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              inputMode="numeric"
              placeholder={listingType === "rent" ? "4,500 / month" : "1,850,000"}
              className="w-full bg-transparent pb-2 text-xl font-bold outline-none placeholder:text-fog/50"
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border hairline px-5 py-3.5 transition-colors hover:border-bronze">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-[#a5834f]"
            />
            <span className="text-sm font-semibold">
              Feature on homepage
              <span className="block text-[0.6875rem] font-medium text-fog">
                Shown in &ldquo;Featured residences&rdquo;
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Specs */}
      <section className="rounded-3xl border hairline bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Specs & location</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Bedrooms">
            <input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} type="number" min={0} required className="w-full bg-transparent pb-2 font-medium outline-none" />
          </Field>
          <Field label="Bathrooms">
            <input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} type="number" min={0} required className="w-full bg-transparent pb-2 font-medium outline-none" />
          </Field>
          <Field label="Living area (sqft)">
            <input value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} inputMode="numeric" required placeholder="2,400" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="Lot size (sqft, optional)">
            <input value={lotSqft} onChange={(e) => setLotSqft(e.target.value)} inputMode="numeric" placeholder="12,000" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="Year built (optional)">
            <input value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} type="number" min={1700} max={2100} placeholder="2021" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="Digital address / code">
            <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="GA-448-7165" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="Street address" className="sm:col-span-2 lg:col-span-1">
            <input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="12 Baobab Close" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="City / area">
            <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="East Legon" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="Region">
            <input value={state} onChange={(e) => setState(e.target.value)} required className="w-full bg-transparent pb-2 font-medium outline-none" />
          </Field>
        </div>
      </section>

      {/* Photos */}
      <section className="rounded-3xl border hairline bg-cream p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">House photos</h2>
            <p className="mt-1 text-[0.8125rem] text-fog">
              Paste image URLs — the first photo becomes the cover everywhere.
            </p>
          </div>
          <span className="rounded-full bg-parchment px-3.5 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-espresso">
            {images.length} photo{images.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <input
            value={imageDraft}
            onChange={(e) => setImageDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="https://images.pexels.com/photos/…"
            className="flex-1 rounded-xl border hairline bg-cream px-4 py-3 text-sm font-medium outline-none transition-colors focus:border-bronze placeholder:text-fog/50"
          />
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-2 rounded-xl bg-ink px-5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-bronze-deep"
          >
            <ImagePlus className="h-4 w-4" />
            Add
          </button>
        </div>

        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, i) => (
              <figure key={url} className="group relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-parchment">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-bronze px-2 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink">
                      Cover
                    </span>
                  )}
                </div>
                <figcaption className="mt-2 flex items-center justify-between gap-1">
                  <span className="truncate text-[0.6875rem] text-fog">Photo {i + 1}</span>
                  <span className="flex shrink-0 gap-1">
                    <IconBtn label="Move up" onClick={() => moveImage(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn label="Move down" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn label="Remove" danger onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* Copy */}
      <section className="rounded-3xl border hairline bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Story & features</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Field label="Description (blank line between paragraphs)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={9}
              placeholder="A study in transparency and light…"
              className="w-full resize-y rounded-xl border hairline bg-cream p-4 text-[0.9375rem] leading-relaxed outline-none transition-colors focus:border-bronze placeholder:text-fog/50"
            />
          </Field>
          <Field label="Features — one per line">
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              required
              rows={9}
              placeholder={"Swimming pool\nStandby generator\nStaff quarters"}
              className="w-full resize-y rounded-xl border hairline bg-cream p-4 text-[0.9375rem] leading-relaxed outline-none transition-colors focus:border-bronze placeholder:text-fog/50"
            />
          </Field>
        </div>
      </section>

      {/* Agent */}
      <section className="rounded-3xl border hairline bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Listing agent</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Field label="Agent name">
            <input value={agentName} onChange={(e) => setAgentName(e.target.value)} required placeholder="Ama Serwaa Boateng" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
          <Field label="Agent phone">
            <input value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} required type="tel" className="w-full bg-transparent pb-2 font-medium outline-none" />
          </Field>
          <Field label="Agent email">
            <input value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} type="email" placeholder="ama@quashnarh.com" className="w-full bg-transparent pb-2 font-medium outline-none placeholder:text-fog/50" />
          </Field>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl bg-bronze/15 px-5 py-4 text-sm font-semibold text-bronze-deep">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pb-6">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2.5 rounded-full bg-ink px-9 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-bronze-deep disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {busy ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/properties")}
          className="flex items-center gap-2 rounded-full border hairline px-7 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-espresso transition-colors hover:border-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block border-b hairline transition-colors focus-within:border-bronze", className)}>
      <span className="block text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  capitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-[0.5625rem] font-bold uppercase tracking-[0.24em] text-fog">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-2 w-full appearance-none rounded-xl border hairline bg-cream px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-bronze",
          capitalize && "capitalize",
        )}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg bg-parchment text-espresso transition-all hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-30",
        danger && "hover:bg-[#8f2d22] hover:text-cream",
      )}
    >
      {children}
    </button>
  );
}
