export const TRADES = [
  { id: "mason", label: "Mason", blurb: "Block work, concrete & foundations" },
  { id: "carpenter", label: "Carpenter", blurb: "Timber, roofing & joinery" },
  { id: "electrician", label: "Electrician", blurb: "Wiring, solar & inverters" },
  { id: "plumber", label: "Plumber", blurb: "Water systems & bathrooms" },
  { id: "tiler", label: "Tiler", blurb: "Floors, marble & wall finishes" },
  { id: "painter", label: "Painter", blurb: "Interior & exterior coatings" },
  { id: "welder", label: "Welder", blurb: "Gates, rails & structural steel" },
  { id: "pop", label: "POP Specialist", blurb: "Ceilings, bulkheads & cornices" },
] as const;

export type TradeId = (typeof TRADES)[number]["id"];

export const TRADE_IDS: string[] = TRADES.map((t) => t.id);

export function tradeLabel(id: string): string {
  return TRADES.find((t) => t.id === id)?.label ?? id;
}
