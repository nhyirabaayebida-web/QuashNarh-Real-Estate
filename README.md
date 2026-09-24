# QuashNarh Real Estate

A premium, full-stack real estate platform for **Ghana** — homes for sale and rent priced in **Ghana cedis (₵)**, a guild of **KYC-verified construction artisans**, and a private admin studio for managing listings, photos, and prices.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Drizzle ORM, and PostgreSQL.

> **Working on the code?** See [`DEVELOPER.md`](./DEVELOPER.md) for a full
> interpretation of the codebase: request lifecycle, rendering strategy,
> mutation pipelines (inquiries, artisan KYC, admin CRUD), auth, uploads, and
> the design/motion systems.

---

## Highlights

### Public experience
- **Cinematic homepage** — parallax hero with a Buy/Rent search console (location, property type, and a type-in **budget field in cedis**), city marquee, featured residences, animated stats, Trade Guild section, testimonials, and a "Sell with us" valuation CTA.
- **Portfolio** (`/properties`) — 14 curated listings across Accra, Aburi, Kumasi, Ada and more, with a sticky filter bar: **Buy/Rent/All**, live search, property type, bedrooms, **₵ min–max budget inputs**, and sorting. URL-driven, so filtered views are shareable.
- **Property detail** (`/properties/[slug]`) — photo grid with a keyboard-navigable lightbox, spec ribbon, rich descriptions, amenities, Ghana-neighborhood guides, mortgage estimate (Ghana terms), agent card, and a **working inquiry form** (book a tour / request info / make an offer) with similar-home suggestions.
- **Trade Guild** (`/artisans`) — a directory of **Ghana Card–verified artisans** (masons, carpenters, electricians, plumbers, tilers, painters, welders, POP specialists) with day rates in cedis and tap-to-call, filterable by trade.
- **Saved homes** — heart any listing; favorites persist in `localStorage`.

### Artisan KYC
Artisans register with **Ghana Card number + passport photo** (multipart upload):
- Ghana Card auto-formats to `GHA-XXXXXXXXX-X` and is validated server-side.
- Passport photos (JPG/PNG/WEBP, ≤ 5 MB) are validated for the **passport frame** — portrait orientation, ~35 × 45 mm aspect — then auto-oriented and cropped with `sharp` to exactly **413 × 531 px** (35 × 45 mm @ 300 DPI) before storage. Files are served via a hardened `/uploads/[file]` route.
- Registrations land as `pending`; they appear in the directory only after admin approval.
- **Privacy:** the public API never exposes Ghana Card numbers or ID photos — only an `idVerified` flag.

### Sell with us — strict document standard (`/sell`)
Owners submit properties for listing through a **strict verification pipeline**:
- **Four required documents** — Land Title Certificate/Indenture, Site Plan, owner's Ghana Card scan, and current Property Tax Receipt (plus optional Building Permit) — each PDF/image up to 8 MB, all enforced server-side; submissions missing any document are rejected.
- Owner KYC (Ghana Card number, validated) plus full property details and cedi asking price.
- Submissions land as `pending` with documents stored privately (`./uploads`, served only through the hardened `/uploads/[file]` route); documents are never published.
- **Studio review** — admins open each document, then mark *reviewing → verified & approved* or *rejected*.

### QuashNarh Studio — admin back office (`/admin`)
Passcode-protected dashboard to run the business:
- **Overview** — listing counts, portfolio value in cedis, inquiry inbox, artisan review queue, sell requests to verify.
- **Listings** — inline **cedi price editing**, featured toggles, status (Available / Pending / Sold), delete with confirm.
- **New / Edit listing** — full form including a **photo manager** (paste image URLs, live thumbnails, reorder, first photo = cover), features, specs, and agent details. Changes go live instantly.
- **Artisans** — review applications with **passport photo + Ghana Card on display**, then approve, suspend, or remove.
- **Inquiries** — every tour request, info ask, and offer with property context.

---

## Tech stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript      |
| Styling   | Tailwind CSS v4 (CSS-first config), Fraunces + Manrope fonts  |
| Motion    | framer-motion, lenis smooth scroll                            |
| Database  | PostgreSQL via Drizzle ORM (`drizzle-orm/node-postgres`)      |
| Media     | Pexels CDN imagery + runtime file uploads for KYC             |

## Getting started

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
ADMIN_PASSCODE=quashnarh2026   # optional — this is the default for local dev
```

Push the schema and seed demo data (14 listings + 11 artisans):

```bash
npx drizzle-kit push --config drizzle.config.json
npx tsx src/db/seed.ts
```

Run it:

```bash
npm run dev      # develop
npm run build    # production build
npm run start    # serve production build
npm run typecheck
```

Then visit:
- Site: `http://localhost:3000`
- Studio: `http://localhost:3000/admin` — passcode `quashnarh2026` (or your `ADMIN_PASSCODE`)
- Artisans: `http://localhost:3000/artisans`

## Environment variables

| Variable         | Required | Purpose                                              |
| ---------------- | -------- | ---------------------------------------------------- |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string                          |
| `ADMIN_PASSCODE` | No       | Admin studio passcode (default: `quashnarh2026`)      |

## Project structure

```
src/
├── app/
│   ├── page.tsx                     # Homepage (dynamic)
│   ├── layout.tsx                   # Fonts, nav, footer, smooth scroll
│   ├── globals.css                  # Tailwind v4 theme tokens & utilities
│   ├── properties/
│   │   ├── page.tsx                 # Portfolio + filters (URL-driven)
│   │   └── [slug]/                  # Property detail (+ custom 404)
│   ├── artisans/page.tsx            # Trade Guild directory + KYC join form
│   ├── admin/
│   │   ├── login/                   # Passcode sign-in
│   │   └── (panel)/                 # Guarded studio: overview, listings,
│   │                                # new/edit listing, artisans, inquiries
│   ├── api/
│   │   ├── health/route.ts          # GET healthcheck
│   │   ├── properties/route.ts      # GET filtered listings (JSON)
│   │   ├── inquiries/route.ts       # POST buyer/renter inquiry
│   │   ├── artisans/route.ts        # GET directory (KYC stripped) · POST register (multipart)
│   │   ├── uploads/[file]/route.ts  # Serves runtime KYC uploads safely
│   │   └── admin/                   # login · logout · properties CRUD · artisan review
│   └── uploads/[file]/route.ts
├── components/
│   ├── home/                        # hero, marquee, featured, collections, stats,
│   │                                # process, artisans CTA, testimonials, cta
│   ├── properties/filter-bar.tsx    # Buy/Rent, search, beds, ₵ min–max, sort
│   ├── property/                    # gallery + lightbox, inquiry form
│   ├── artisans/                    # trade filters, KYC registration form
│   ├── admin/                       # tables, forms, login/logout
│   └── …                            # nav, footer, cards, reveal, count-up
├── db/
│   ├── index.ts                     # pg Pool + drizzle client
│   ├── schema.ts                    # properties · inquiries · artisans
│   └── seed.ts                      # Ghana demo data (listings + artisans)
└── lib/                             # queries, formatting (cedis), media, trades, admin auth
```

## Database schema

- **`properties`** — slug, title, description, `listingType` (sale/rent), `propertyType`, price (cedis), beds/baths/sqft/lot/year, address/city/region/digital code, `images` (jsonb), `features` (jsonb), status, featured, agent contact. Indexes on listing type, city, type, featured.
- **`inquiries`** — property ref (cascade), name/email/phone, topic (tour/info/offer), tour date, message.
- **`artisans`** — name, trade, phone/email, location, years, day rate (cedis), bio, **KYC: `ghanaCard`, `passportPhoto`**, status (pending/approved/suspended).

Apply changes with `npx drizzle-kit push`; reseed anytime with `npx tsx src/db/seed.ts` (wipes and reinserts demo data).

## Notes

- **Currency:** every price on the platform is a Ghana cedi amount (₵). Rental prices are monthly.
- **KYC uploads** are stored in `./uploads` and served through a path-traversal-safe route handler; they are never exposed via the public artisans API.
- **Images** for listings come from Pexels' on-the-fly resize URLs (`images.pexels.com` is whitelisted in `next.config.ts`).
- All DB-backed pages are `force-dynamic`, so admin edits appear instantly with no rebuild.
