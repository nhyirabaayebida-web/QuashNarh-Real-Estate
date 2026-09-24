import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const properties = pgTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    /** 'sale' | 'rent' */
    listingType: text("listing_type").notNull(),
    /** house | villa | apartment | condo | townhouse | cottage | penthouse | loft */
    propertyType: text("property_type").notNull(),
    /** sale price in USD, or monthly rent for rentals */
    price: integer("price").notNull(),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    areaSqft: integer("area_sqft").notNull(),
    lotSqft: integer("lot_sqft"),
    yearBuilt: integer("year_built"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zip: text("zip").notNull(),
    images: jsonb("images").$type<string[]>().notNull(),
    features: jsonb("features").$type<string[]>().notNull(),
    /** available | pending | sold */
    status: text("status").notNull().default("available"),
    featured: boolean("featured").notNull().default(false),
    agentName: text("agent_name").notNull(),
    agentPhone: text("agent_phone").notNull(),
    agentEmail: text("agent_email").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("properties_listing_type_idx").on(t.listingType),
    index("properties_city_idx").on(t.city),
    index("properties_property_type_idx").on(t.propertyType),
    index("properties_featured_idx").on(t.featured),
  ],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    /** 'tour' | 'info' | 'offer' */
    topic: text("topic").notNull().default("tour"),
    tourDate: text("tour_date"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("inquiries_property_idx").on(t.propertyId)],
);

export const artisans = pgTable(
  "artisans",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    /** mason | carpenter | electrician | plumber | tiler | painter | welder | pop */
    trade: text("trade").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    location: text("location").notNull(),
    years: integer("years").notNull().default(1),
    /** daily rate in Ghana cedis */
    dayRate: integer("day_rate"),
    bio: text("bio").notNull(),
    /** KYC: Ghana Card number, e.g. GHA-123456789-0 */
    ghanaCard: text("ghana_card"),
    /** KYC: path/URL to passport-style photo */
    passportPhoto: text("passport_photo"),
    /** pending | approved | suspended */
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("artisans_trade_idx").on(t.trade),
    index("artisans_status_idx").on(t.status),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    ownerName: text("owner_name").notNull(),
    ownerPhone: text("owner_phone").notNull(),
    ownerEmail: text("owner_email"),
    ghanaCard: text("ghana_card").notNull(),
    propertyType: text("property_type").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    region: text("region"),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    areaSqft: integer("area_sqft"),
    askingPrice: integer("asking_price"),
    description: text("description").notNull(),
    documents: jsonb("documents")
      .$type<{ type: string; label: string; path: string }[]>()
      .notNull(),
    /** pending | reviewing | approved | rejected */
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("submissions_status_idx").on(t.status)],
);

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type Artisan = typeof artisans.$inferSelect;
export type NewArtisan = typeof artisans.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
