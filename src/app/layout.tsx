import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SmoothScroll from "@/components/smooth-scroll";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "QuashNarh Real Estate — Exceptional Homes for Sale & Rent in Ghana",
    template: "%s | QuashNarh Real Estate",
  },
  description:
    "QuashNarh Real Estate is a boutique Ghanaian real estate house curating exceptional homes for sale and rent in cedis (₵) — from glass pavilions in East Legon to heritage townhouses in Jamestown — plus a guild of verified construction artisans.",
  keywords: [
    "real estate Ghana",
    "houses for sale Accra",
    "houses for rent Accra",
    "property prices in cedis",
    "buy a home Ghana",
    "rent apartment Accra",
    "construction artisans Ghana",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">
        <SmoothScroll />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
