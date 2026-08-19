import type { CategoryBucket } from "@/lib/types";
import { BUCKET_LABEL } from "@/lib/types";
import { getLaunches } from "@/lib/repo";
import type { Launch } from "@/lib/types";

export type CategoryDef = {
  slug: string;
  label: string;
  bucket?: CategoryBucket;
  subcategory?: string;
};

/** Browse chips under the main app nav — popular verticals first. */
export const CATEGORIES: CategoryDef[] = [
  { slug: "perfume", label: "Perfume", subcategory: "Perfume" },
  { slug: "trainers", label: "Trainers", subcategory: "Trainers" },
  { slug: "makeup", label: "Makeup", subcategory: "Makeup" },
  { slug: "phones", label: "Phones", subcategory: "Phones" },
  { slug: "headphones", label: "Headphones", subcategory: "Headphones" },
  { slug: "gadgets", label: "Gadgets", subcategory: "Gadgets" },
  { slug: "lego", label: "LEGO", subcategory: "LEGO" },
  { slug: "streaming", label: "Streaming", subcategory: "Streaming" },
  { slug: "restaurants", label: "Restaurants", subcategory: "Restaurant" },
  { slug: "books", label: "Books", subcategory: "Books" },
  { slug: "ai", label: "AI", subcategory: "AI" },
  { slug: "beauty", label: BUCKET_LABEL.beauty, bucket: "beauty" },
  { slug: "tech", label: BUCKET_LABEL.tech, bucket: "tech" },
  { slug: "wear", label: BUCKET_LABEL.wear, bucket: "wear" },
  { slug: "play", label: BUCKET_LABEL.play, bucket: "play" },
  { slug: "watch", label: "Watches & media", bucket: "watch" },
  { slug: "eat", label: BUCKET_LABEL.eat, bucket: "eat" },
  { slug: "use", label: BUCKET_LABEL.use, bucket: "use" },
];

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function launchesForCategory(slug: string): Launch[] {
  const cat = getCategory(slug);
  if (!cat) return [];

  return getLaunches().filter((l) => {
    if (cat.subcategory) {
      return l.subcategory.toLowerCase() === cat.subcategory.toLowerCase();
    }
    if (cat.bucket) return l.bucket === cat.bucket;
    return false;
  });
}
