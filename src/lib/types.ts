export type LaunchStatus =
  | "rumoured"
  | "detected"
  | "announced"
  | "dated"
  | "early_access"
  | "dropping"
  | "live"
  | "sold_out"
  | "restock_expected";

export type CategoryBucket =
  | "wear"
  | "beauty"
  | "tech"
  | "watch"
  | "play"
  | "drive"
  | "eat"
  | "go"
  | "live"
  | "use";

export type SourceType =
  | "official"
  | "retailer"
  | "press"
  | "trademark"
  | "community"
  | "brand_submitted";

export type AlertIntensity = "relaxed" | "interested" | "i_want_this" | "must_get";

export type ChangeEventType =
  | "detected"
  | "announced"
  | "date_changed"
  | "date_confirmed"
  | "price_detected"
  | "preorder_live"
  | "retailer_detected"
  | "momentum_spike"
  | "uk_confirmed"
  | "sample_available"
  | "went_live"
  | "sold_out"
  | "restock"
  | "watch_joined";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  followers: number;
  categoryHeat?: number;
}

export interface Source {
  type: SourceType;
  label: string;
  confirmed: boolean;
  at: string;
}

export interface TimelineEvent {
  at: string;
  label: string;
}

export interface RegionalRelease {
  region: string;
  date?: string;
  dateLabel: string;
  confidence: number;
  note?: string;
}

export interface RetailerSignal {
  name: string;
  status: string;
}

export interface Launch {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  bucket: CategoryBucket;
  subcategory: string;
  status: LaunchStatus;
  summary: string;
  expectedPrice?: string;
  sizes?: string[];
  launchScore: number;
  hype: number;
  confidence: number;
  dropRisk: number;
  watchers: number;
  momentum7d: number;
  watchersToday: number;
  expectedAt?: string;
  expectedLabel: string;
  regions: RegionalRelease[];
  retailers: RetailerSignal[];
  sources: Source[];
  timeline: TimelineEvent[];
  tags: string[];
  successorOf?: string;
  sampleAvailable?: boolean;
  preorderUrl?: string;
  buyUrl?: string;
  /** YouTube watch / youtu.be / embed URL — shown on launch page when set. */
  videoUrl?: string;
  sponsored?: boolean;
  underTheRadar?: boolean;
  nearMiles?: number;
  intentBuyPct?: number;
  intentSamplePct?: number;
  historical?: boolean;
  launchedAt?: string;
}

export interface ChangeEvent {
  id: string;
  at: string;
  type: ChangeEventType;
  launchId?: string;
  brandId?: string;
  message: string;
  bucket?: CategoryBucket;
}

export interface HistoricalLaunch {
  id: string;
  name: string;
  brand: string;
  bucket: CategoryBucket;
  launchedAt: string;
  note: string;
}

export interface WatchPrefs {
  dateConfirmed: boolean;
  ukAvailability: boolean;
  priceAppears: boolean;
  preordersOpen: boolean;
  samplesAvailable: boolean;
  reviewsAppear: boolean;
  twentyFourHours: boolean;
  goesLive: boolean;
  sellsOut: boolean;
  comesBack: boolean;
}

export interface Watch {
  launchId: string;
  intensity: AlertIntensity;
  prefs: WatchPrefs;
  createdAt: string;
}

export interface WatchRule {
  id: string;
  label: string;
  brandId?: string;
  bucket?: CategoryBucket;
  query?: string;
}

export const STATUS_LABEL: Record<LaunchStatus, string> = {
  rumoured: "Rumoured",
  detected: "Detected",
  announced: "Announced",
  dated: "Dated",
  early_access: "Early access",
  dropping: "Dropping",
  live: "Live",
  sold_out: "Sold out",
  restock_expected: "Restock expected",
};

export const BUCKET_LABEL: Record<CategoryBucket, string> = {
  wear: "Wear",
  beauty: "Beauty",
  tech: "Tech",
  watch: "Watch",
  play: "Play",
  drive: "Drive",
  eat: "Eat",
  go: "Go",
  live: "Live",
  use: "Use",
};

export const DEFAULT_WATCH_PREFS: WatchPrefs = {
  dateConfirmed: true,
  ukAvailability: true,
  priceAppears: true,
  preordersOpen: true,
  samplesAvailable: false,
  reviewsAppear: false,
  twentyFourHours: true,
  goesLive: true,
  sellsOut: false,
  comesBack: false,
};
