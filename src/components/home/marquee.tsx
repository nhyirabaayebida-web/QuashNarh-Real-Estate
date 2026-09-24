const CITIES = [
  "Accra",
  "East Legon",
  "Cantonments",
  "Osu",
  "Labone",
  "Airport City",
  "Tema",
  "Kumasi",
  "Aburi",
  "Ada Foah",
  "Takoradi",
  "Shai Hills",
];

export default function Marquee() {
  const row = [...CITIES, ...CITIES];
  return (
    <div className="relative overflow-hidden border-y hairline bg-cream py-5">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {row.map((city, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-display text-2xl font-medium italic text-espresso/70"
          >
            {city}
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-bronze" />
          </span>
        ))}
      </div>
    </div>
  );
}
