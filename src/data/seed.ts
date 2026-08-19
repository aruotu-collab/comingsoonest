import type { ChangeEvent, HistoricalLaunch } from "@/lib/types";

const hoursAgo = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
};

/** Lightweight activity stubs — launchIds filled at runtime from live catalogue. */
export const changeEventTemplates: Omit<ChangeEvent, "launchId" | "id">[] = [
  { at: hoursAgo(0.2), type: "detected", message: "New product detected", bucket: "tech" },
  { at: hoursAgo(0.4), type: "price_detected", message: "Price signal confirmed", bucket: "wear" },
  { at: hoursAgo(0.6), type: "watch_joined", message: "Watchlist surge", bucket: "beauty" },
  { at: hoursAgo(0.9), type: "uk_confirmed", message: "UK availability confirmed", bucket: "beauty" },
  { at: hoursAgo(1.2), type: "date_changed", message: "Release window adjusted", bucket: "tech" },
  { at: hoursAgo(1.5), type: "preorder_live", message: "Preorder signal", bucket: "play" },
  { at: hoursAgo(1.8), type: "momentum_spike", message: "Momentum spike", bucket: "beauty" },
  { at: hoursAgo(2.2), type: "preorder_live", message: "Preorders opening", bucket: "use" },
  { at: hoursAgo(2.6), type: "detected", message: "New listing detected", bucket: "play" },
  { at: hoursAgo(3.0), type: "date_changed", message: "Date move detected", bucket: "wear" },
];

/** Archive samples for “On this day” / Time Travel — not product catalogue. */
export const historicalLaunches: HistoricalLaunch[] = [
  {
    id: "h1",
    name: "Miss Dior Blooming Bouquet (refresh)",
    brand: "Dior",
    bucket: "beauty",
    launchedAt: "2025-08-12",
    note: "Major fragrance moment",
  },
  {
    id: "h2",
    name: "Air Jordan seasonal drop",
    brand: "Nike",
    bucket: "wear",
    launchedAt: "2024-08-12",
    note: "Sold out in under 2 hours",
  },
  {
    id: "h3",
    name: "Galaxy Fold generation",
    brand: "Samsung",
    bucket: "tech",
    launchedAt: "2023-08-11",
    note: "Event-week launch",
  },
  {
    id: "h4",
    name: "Iconic console software title",
    brand: "Sony",
    bucket: "play",
    launchedAt: "2018-08-12",
    note: "Still referenced in delay patterns",
  },
  {
    id: "h5",
    name: "Chanel Chance Eau Tendre EDT",
    brand: "Chanel",
    bucket: "beauty",
    launchedAt: "2010-08-12",
    note: "Archive fragrance milestone",
  },
  {
    id: "h6",
    name: "iPhone original announcement week",
    brand: "Apple",
    bucket: "tech",
    launchedAt: "2007-01-09",
    note: "Time Travel archive",
  },
];

export const csIndex = [
  {
    bucket: "beauty",
    label: "Beauty",
    delta: 18,
    parts: [
      { name: "Fragrance", delta: 32 },
      { name: "Makeup", delta: 11 },
      { name: "Skincare", delta: 4 },
    ],
  },
  {
    bucket: "tech",
    label: "Tech",
    delta: 7,
    parts: [
      { name: "AI Products", delta: 16 },
      { name: "Phones", delta: 8 },
      { name: "Gaming", delta: -3 },
    ],
  },
  { bucket: "wear", label: "Sneakers", delta: 18, parts: [] },
  { bucket: "play", label: "Gaming", delta: 21, parts: [] },
];
