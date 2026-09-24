# Developer Guide — How the Code Works & Why

This document interprets the QuashNarh codebase: the request lifecycle, the
server/client boundaries, every mutation pipeline (inquiries, artisan KYC,
admin CRUD), and the design/animation systems. Read `README.md` first for
setup and product context.

---

## 1. Architecture at a glance

```
Browser
  │
  ├─ static/marketing & catalog pages ──► React Server Components (RSC)
  │     read searchParams → src/lib/queries.ts → drizzle → PostgreSQL
  │     render HTML on every request (force-dynamic)
  │
  ├─ client islands ("use client")
  │     filter bars, forms, gallery, nav, favorites ──► fetch() JSON/FormData
  │     ──► Route Handlers (src/app/api/**) → validate → drizzle → 2xx/4xx
  │
  └─ images ──► next/image → Pexels CDN (resized by query params)
              └ /uploads/[file] → custom handler → ./uploads (KYC photos)
```

**Core philosophy:** pages are *server-rendered and URL-driven*; client
components only own *interactivity* (inputs, modals, local state). All truth
lives in PostgreSQL; all URLs are shareable.

## 2. Request lifecycle — example: `/properties?type=sale&max=2000000`

1. `src/app/properties/page.tsx` (RSC, `export const dynamic = "force-dynamic"`)
   awaits `searchParams` (a **Promise** in Next 15+).
2. `pick()` normalises each param to `string | undefined`.
3. `getProperties(filters)` in `src/lib/queries.ts` builds a `SQL[]` array:
   - `type=sale` → `eq(properties.listingType, "sale")`
   - `max=2000000` → `lte(properties.price, 2_000_000)`
   - `q` → `or(ilike(city|address|title|state|zip, "%q%"))`
   - order: `createdAt desc` unless `sort` overrides.
   Conditions are combined with `and(...)`; none → `undefined` (whole table).
4. Drizzle turns this into one parameterised query (`drizzle-orm/node-postgres`
   over a pooled `pg` connection — see §4).
5. The page renders `<FilterBar current={filters}/>` (client) + a grid of
   `<PropertyCard>` (server). Each card is wrapped in `<Reveal>` — a client
   framer-motion island; the card markup itself streams as HTML.
6. In the browser, `FilterBar` mirrors the URL. Any change calls
   `router.replace("/properties?…", { scroll: false })`; text inputs debounce
   350–450 ms so typing doesn't thrash the server. Next re-renders the RSC
   payload for the new URL and React reconciles — **no full page reload, no
   client-side data fetching for catalog data.**

The same pattern powers `/artisans` (`trade`, `q`) via `ArtisanFilters`.

## 3. Rendering strategy

- **Why `force-dynamic` on every DB-backed page:** the admin studio mutates
  rows (price edits, new listings, approvals) and those changes must be live
  instantly. Force-dynamic skips build-time prerendering, so the production
  build never needs the database, and every request reads current data.
- **Server components (default):** all pages, `PropertyCard`, `Footer`,
  section shells. They can `await` DB helpers directly.
- **Client components** exist only where the browser adds something:
  | Component | Why client |
  |---|---|
  | `nav.tsx` | scroll-awareness, pathname, mobile menu animation |
  | `hero.tsx` | scroll parallax (`useScroll`), search form state |
  | `filter-bar.tsx`, `artisan-filters.tsx` | URL state machines, debounce |
  | `gallery.tsx` | lightbox state, keyboard listeners, body scroll-lock |
  | `inquiry-form.tsx`, `artisan-form.tsx`, `property-form.tsx`, tables | fetch() mutations + state machines |
  | `favorite-button.tsx` | `localStorage` (read in `useEffect` to avoid hydration mismatch) |
  | `reveal.tsx`, `count-up.tsx`, `smooth-scroll.tsx` | browser-only animation primitives |

## 4. Data layer

**`src/db/index.ts`** — a `Pool` from `pg`, memoised on `globalThis` in dev so
hot-reloads don't leak connections; `db` is the drizzle client.

**`src/db/schema.ts`** — three tables. Notable choices:
- `images` / `features` are `jsonb ...$type<string[]>()` → typed as real TS
  arrays at runtime, one row per property, no join tables needed.
- Indexes on filter columns: `listing_type`, `city`, `property_type`,
  `featured`, `trade`, `status`.
- `inquiries.propertyId → properties.id (onDelete: "cascade")` so deleting a
  listing cleans its inbox.
- Artisan KYC fields (`ghanaCard`, `passportPhoto`) are nullable so legacy
  rows survive; the public read path treats nulls as "unverified".

**`src/lib/queries.ts`** — the single source of read logic. Public pages and
the `/api/properties` + `/api/artisans` JSON endpoints share the exact same
helpers (`getProperties`, `getArtisans`, counters, similar-home logic), so the
UI and the API can never disagree. `getSimilarProperties` matches same
listing-type *or* property-type, featured first — fast, no ML needed.

**`src/db/seed.ts`** — wipes (`delete`) then reinserts 14 Ghana-localised
listings and 11 artisans (10 approved + 1 pending for the review queue).
Run with `npx tsx src/db/seed.ts`; it imports `dotenv/config` before `db` so
tsx picks up `.env`.

## 5. Mutation pipelines

### 5.1 Inquiries — `POST /api/inquiries`
Client (`inquiry-form.tsx`) keeps a `Status = idle | sending | sent | error`
state machine driving an `AnimatePresence` swap between form and success card.
The route validates with hand-rolled guards (no zod dependency): integer
`propertyId`, `name ≥ 2`, RFC-ish email regex, `message ≥ 10`, topic whitelist.
On FK/insert failure it returns a friendly 500 (e.g. listing deleted
mid-checkout). Insert returns the new id → UI shows the success state.

### 5.2 Artisan registration + KYC — `POST /api/artisans`
Content-negotiated: `multipart/form-data` (the form) **or** JSON (API clients).

1. **Parse** fields; `ghanaCard` upper-cased.
2. **Validate in order** — name, trade whitelist (`TRADE_IDS` from
   `src/lib/trades.ts`), phone digits ≥ 7, optional email, location, integer
   years 0–70, optional day rate, bio ≥ 20 chars, then KYC:
   `GHANA_CARD_RE = /^GHA-\d{9}-\d$/` and passport photo required.
3. **Passport pipeline** (`savePassportPhoto`):
   - MIME whitelist (jpeg/png/webp), ≤ 5 MB.
   - `sharp(buffer).metadata()` → reject non-images, landscape/square
     (`ratio ≥ 1`), off-ratio frames (`< 0.6`), low-res (`< 400px` tall).
   - Normalise: EXIF `.rotate()`, face-aware
     `.resize(413, 531, { fit: "cover", position: "attention" })`, JPEG q88 →
     exactly **35 × 45 mm @ 300 DPI**, ~25 KB.
   - Write to `./uploads/artisan-pp-<ts>-<rand>.jpg`, store the URL path.
4. Insert with `status: "pending"` → admin review.

**Serving uploads** — Next only serves `public/` files that existed at build
time, so runtime uploads live in `./uploads` and are streamed by
`src/app/uploads/[file]/route.ts`: single flat segment, rejects `..` / slashes
(path-traversal proof), extension→MIME map, `Cache-Control: immutable`.
*(Side note: the folder uses `[file]` rather than `[...path]` on purpose —
flat filenames make traversal impossible by construction.)*

**Privacy** — `GET /api/artisans` destructures `ghanaCard`/`passportPhoto`
_OFF the response and substitutes `idVerified: boolean`. KYC is visible only
through server-rendered admin pages (`/admin/artisans`), never over public
JSON.

### 5.3 Admin session

`src/lib/admin-auth.ts`:
- Passcode = `process.env.ADMIN_PASSCODE ?? "quashnarh2026"`.
- Token = `sha256("quashnarh:" + passcode)` — a deterministic value that never
  exposes the passcode itself.
- `POST /api/admin/login` sets it as an **httpOnly, sameSite=lax** cookie
  (7 days); logout deletes it.
- `isAdmin()` compares the cookie to the recomputed token.
- Two enforcement layers: the route-group layout
  `src/app/admin/(panel)/layout.tsx` `redirect("/admin/login")`s for pages, and
  **every admin API handler re-checks** (401 otherwise) — never trust layout
  guards alone for API routes.
- `(panel)` is a Next "route group": it shares the guarded layout while
  `/admin/login` sits outside the group and stays public.

### 5.4 Admin listing edits — `PATCH /api/admin/properties/[id]`
Two modes in one handler:
- **Granular patch** (table inline edits): whitelist of fields
  (`price`, `status`, `featured`, `images`), each re-validated; unknown keys
  ignored — prevents mass-assignment.
- **Full form** (`{ full: true, ... }`): runs the shared
  `validatePropertyPayload` from `../route.ts`, the same validator used by
  create — one source of truth for what a listing may contain.
Client tables keep local state initialised from the server payload and update
from the PATCH response (`data.data`) — no refetch needed; a transient "Saved
— live on the site." pill confirms via `aria-live`.

**Slug generation:** `slugify(title [+ city])`, deduplicated by scanning
`ilike(slug || '%')` and appending `-2`, `-3`, …

### 5.5 Artisan review — `PATCH/DELETE /api/admin/artisans/[id]`
Status machine `pending → approved / suspended`; the directory query already
filters `status = approved`, so approval is the publish switch. The admin row
renders the passport photo (avatar + full-view link) and the Ghana Card in
mono so a human can eyeball face↔ID before approving.

## 6. Media pipeline

- **Listings & site imagery** — Pexels CDN. `src/lib/media.ts`:
  - `pex(id, w, h?)` builds URLs; `h` triggers `fit=crop` for exact frames
    (hero 2400×1400, cards 1200×900, passport faces 540×694).
  - `pxResize(url, w, h)` rewrites a stored URL's params server-side, so the
    DB stores one canonical 1600×1067 URL and each consumer requests its own
    size (card 1200×900, lightbox 2000w).
- `next.config.ts` whitelists `images.pexels.com` for `next/image`
  (optimisation, lazy loading, `sizes`). Admin previews use plain `<img>`
  deliberately — internal, arbitrary URLs.
- **Favorites** — `localStorage["quashnarh:favorites"]` read inside
  `useEffect` (server HTML can't know it → no hydration mismatch).

## 7. Design system

Tailwind v4, CSS-first — there is no `tailwind.config`.
`src/app/globals.css` `@theme` defines tokens used as utilities:

- **Palette:** `cream` page bg, `parchment`/`sand` surfaces, `ink`/`espresso`
  text, `bronze` accent, `moss` success/verified, `fog` muted text, plus
  `hairline` (ink 14%) / `hairline-light` border-class overlays.
- **Fonts:** `Fraunces` (display serif, optical sizing, italics) via
  `var(--font-fraunces)` → `font-display`; `Manrope` body → default `font-sans`.
  Both injected by `next/font/google` in `layout.tsx` (zero layout shift).
- **Custom utility classes:** `.eyebrow` (kicker with rule line), `.grain`
  (SVG-noise overlay on hero/CTA), `.link-sweep` (animated underline),
  `.no-scrollbar`, `.img-warm` (photo grade).
- **Keyframes in `@theme`:** `--animate-marquee` (translateX -50%, duplicated
  content), used by the city marquee.

## 8. Motion system

- **Lenis** (`smooth-scroll.tsx`) — requestAnimationFrame-driven smooth wheel
  scrolling; destroyed on unmount.
- **`<Reveal>`** — `whileInView` fade/slide-up with the house easing
  `[0.22, 1, 0.36, 1]`, `viewport={{ once: true }}`, per-index delays for
  grid stagger.
- **`<CountUp>`** — `animate()` from framer-motion counts to the target on
  in-view, formatting with `toLocaleString`.
- **Hero** — `useScroll` + `useTransform` parallax (image y/scale, copy fade);
  tab pill uses `layoutId="hero-tab"` so the active Buy/Rent background
  *glides* between buttons.
- **Gallery** — `AnimatePresence` for lightbox mount/unmount; arrow-key
  navigation with body scroll-lock restored on cleanup.

## 9. Conventions worth copying

1. **One validator per resource**, shared by create + full-edit
   (`validatePropertyPayload`).
2. **Routes validate; forms only hint.** Client checks (Ghana Card regex,
   photo aspect) mirror the server purely for UX — the server never trusts them.
3. **Optimistic-feeling, server-true:** tables mutate local state from API
   responses rather than re-querying.
4. **No client fetching for read-only catalog data** — the URL is the state
   and the server is the fetcher.
5. **PII minimisation:** collect (KYC), store privately, expose a boolean.

## 10. Quick file ↔ responsibility map

| Path | Interpretation |
|---|---|
| `src/lib/queries.ts` | All reads; shared by pages + public APIs |
| `src/lib/format.ts` | Cedi formatting (`₵1,285,000`, `₵4.85M`, `₵3,450/mo`) |
| `src/lib/media.ts` | Pexels URL builders + site imagery map |
| `src/lib/admin-auth.ts` | Passcode→token, cookie gate for pages & APIs |
| `src/lib/trades.ts` | Trade ids/labels — the artisan taxonomy source |
| `src/app/api/artisans/route.ts` | Multipart KYC intake + privacy-safe directory GET |
| `src/app/api/submissions/route.ts` | Sell-with-us intake — strict 4-document enforcement |
| `src/lib/documents.ts` | The document standard shared by form, API and admin |
| `src/lib/ghana-card.ts` | Shared GHA-000000000-0 auto-formatter |
| `src/app/api/admin/*` | Session + CRUD; every handler re-checks `isAdmin()` |
| `src/app/uploads/[file]/route.ts` | Safe runtime file serving for KYC photos |
| `src/components/properties/filter-bar.tsx` | URL state machine (type/q/ptype/beds/₵min–₵max/sort) |
| `src/components/property/inquiry-form.tsx` | Status-state-machine form talking to `/api/inquiries` |
| `src/components/artisans/artisan-form.tsx` | FormData submit incl. Ghana Card auto-format + photo pre-check |
| `src/db/seed.ts` | Deterministic demo dataset (wipe + insert) |
