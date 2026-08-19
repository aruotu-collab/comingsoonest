import type { CategoryBucket, Launch } from "@/lib/types";
import { BUCKET_LABEL } from "@/lib/types";
import { getLaunches } from "@/lib/repo";

export type CategoryDef = {
  slug: string;
  label: string;
  bucket?: CategoryBucket;
  subcategory?: string;
  /** Match CSV category / tags (case-insensitive contains). */
  tagsAny?: string[];
};

/** Browse chips under the main app nav — popular verticals first. */
export const CATEGORIES: CategoryDef[] = [
  { slug: "trainers", label: "Trainers", tagsAny: ["sneakers", "trainers"] },
  { slug: "gaming", label: "Gaming", tagsAny: ["gaming", "gaming & play"] },
  { slug: "books", label: "Books", tagsAny: ["books"] },
  { slug: "lego", label: "LEGO", tagsAny: ["lego", "family / lego", "family"] },
  { slug: "perfume", label: "Perfume", subcategory: "Perfume", tagsAny: ["fragrance", "perfume"] },
  { slug: "makeup", label: "Makeup", subcategory: "Makeup" },
  { slug: "phones", label: "Phones", subcategory: "Phones", tagsAny: ["phones"] },
  { slug: "headphones", label: "Headphones", subcategory: "Headphones" },
  { slug: "gadgets", label: "Gadgets", subcategory: "Gadgets" },
  { slug: "streaming", label: "Streaming", subcategory: "Streaming" },
  { slug: "restaurants", label: "Restaurants", subcategory: "Restaurant" },
  { slug: "ai", label: "AI", subcategory: "AI", tagsAny: ["ai"] },
  { slug: "tech", label: BUCKET_LABEL.tech, bucket: "tech", tagsAny: ["tech"] },
  { slug: "beauty", label: BUCKET_LABEL.beauty, bucket: "beauty" },
  { slug: "wear", label: BUCKET_LABEL.wear, bucket: "wear" },
  { slug: "play", label: BUCKET_LABEL.play, bucket: "play" },
  { slug: "watch", label: "Watches & media", bucket: "watch" },
  { slug: "eat", label: BUCKET_LABEL.eat, bucket: "eat" },
  { slug: "use", label: BUCKET_LABEL.use, bucket: "use" },
];

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

function matchesCategory(launch: Launch, cat: CategoryDef): boolean {
  if (cat.tagsAny?.length) {
    const hay = [
      ...launch.tags,
      launch.subcategory,
      launch.summary,
    ]
      .join(" ")
      .toLowerCase();
    if (cat.tagsAny.some((t) => hay.includes(t.toLowerCase()))) return true;
  }
  if (cat.subcategory) {
    if (launch.subcategory.toLowerCase() === cat.subcategory.toLowerCase()) {
      return true;
    }
  }
  if (cat.bucket && !cat.subcategory && !cat.tagsAny) {
    return launch.bucket === cat.bucket;
  }
  if (cat.bucket && (cat.subcategory || cat.tagsAny)) {
    // Already checked tags/subcategory; allow bucket as soft fallback only if no tags matched path
    return false;
  }
  return false;
}

export function launchesForCategory(slug: string): Launch[] {
  const cat = getCategory(slug);
  if (!cat) return [];

  // Bucket-only chips (Beauty, Tech, Wear…)
  if (cat.bucket && !cat.subcategory && !cat.tagsAny) {
    return getLaunches({ bucket: cat.bucket });
  }

  return getLaunches().filter((l) => matchesCategory(l, cat));
}
