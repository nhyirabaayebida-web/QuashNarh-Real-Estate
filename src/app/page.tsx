import Hero from "@/components/home/hero";
import Marquee from "@/components/home/marquee";
import Featured from "@/components/home/featured";
import Collections from "@/components/home/collections";
import Stats from "@/components/home/stats";
import Mission from "@/components/home/mission";
import Process from "@/components/home/process";
import ArtisansCta from "@/components/home/artisans-cta";
import Testimonials from "@/components/home/testimonials";
import Cta from "@/components/home/cta";
import {
  getArtisanCount,
  getFeaturedProperties,
  getListingCounts,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, counts, artisanCount] = await Promise.all([
    getFeaturedProperties(5),
    getListingCounts(),
    getArtisanCount("approved"),
  ]);

  return (
    <>
      <Hero />
      <Marquee />
      <Featured properties={featured} />
      <Collections counts={counts} />
      <Stats />
      <Mission />
      <Process />
      <ArtisansCta approvedCount={artisanCount} />
      <Testimonials />
      <Cta />
    </>
  );
}
