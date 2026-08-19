/**
 * Convert data/comingsoonest_seed_599.csv → src/data/catalogue.generated.ts
 * Run: node scripts/import-catalogue.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const csvPath = path.join(root, "data", "comingsoonest_seed_599.csv");
const outPath = path.join(root, "src", "data", "catalogue.generated.ts");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      if (ch === "\r") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

function shortHash(s) {
  return createHash("sha1").update(s).digest("hex").slice(0, 8);
}

function mapBucket(category) {
  const c = (category || "").toLowerCase();
  if (c.includes("sneaker")) return "wear";
  if (c.includes("gaming") || c.includes("play") || c.includes("lego") || c.includes("family"))
    return "play";
  if (c.includes("book")) return "use";
  if (c.includes("fragrance") || c.includes("beauty")) return "beauty";
  if (c.includes("tech")) return "tech";
  return "use";
}

function mapStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("confirm")) return "dated";
  if (s.includes("rumour") || s.includes("rumor")) return "rumoured";
  if (s.includes("expect")) return "detected";
  if (s.includes("unreleased") || s.includes("upcoming") || s.includes("announce"))
    return "announced";
  return "detected";
}

function mapSourceType(t) {
  const s = (t || "").toLowerCase();
  if (s.includes("official") || s.includes("press")) return "press";
  if (s.includes("retail")) return "retailer";
  if (s.includes("community")) return "community";
  return "press";
}

function parseRelease(raw) {
  const v = (raw || "").trim();
  if (!v) return { expectedAt: undefined, expectedLabel: "Date TBD" };
  // Exact date
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T12:00:00.000Z`);
    const days = Math.round((d.getTime() - Date.now()) / 86400000);
    const label =
      days > 0 ? `Coming in ${days} days` : days === 0 ? "Drop imminent" : "Released / past window";
    return { expectedAt: d.toISOString(), expectedLabel: label };
  }
  // Year only
  if (/^\d{4}$/.test(v)) {
    return { expectedAt: `${v}-06-15T12:00:00.000Z`, expectedLabel: v };
  }
  // Qx 2026 etc
  const q = v.match(/Q([1-4])\s*(\d{4})/i);
  if (q) {
    const month = { 1: "02", 2: "05", 3: "08", 4: "11" }[q[1]];
    return {
      expectedAt: `${q[2]}-${month}-15T12:00:00.000Z`,
      expectedLabel: v,
    };
  }
  return { expectedAt: undefined, expectedLabel: v };
}

function confidenceFor(status) {
  const s = mapStatus(status);
  if (s === "dated") return 90;
  if (s === "announced") return 78;
  if (s === "detected") return 65;
  return 45;
}

function scoreFor(status, hasPrice, hasSku) {
  let n = confidenceFor(status);
  if (hasPrice) n += 4;
  if (hasSku) n += 3;
  return Math.min(98, n);
}

const raw = fs.readFileSync(csvPath, "utf8");
const rows = parseCsv(raw);
const header = rows[0].map((h) => h.trim());
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

function col(row, name) {
  const i = idx[name];
  return i == null ? "" : (row[i] || "").trim();
}

const brandMap = new Map();
const launches = [];
const usedSlugs = new Set();

for (const row of rows.slice(1)) {
  const category = col(row, "Category");
  const subcategory = col(row, "Subcategory") || category || "General";
  const product = col(row, "Product / Release");
  const brandName = col(row, "Brand / Creator") || "Unknown";
  if (!product) continue;

  const brandSlug = slugify(brandName);
  const brandId = `b-${brandSlug}`;
  if (!brandMap.has(brandId)) {
    brandMap.set(brandId, {
      id: brandId,
      slug: brandSlug,
      name: brandName,
      followers: 1000 + brandMap.size * 37,
      categoryHeat: 50 + (brandMap.size % 45),
    });
  }

  let slug = slugify(`${brandSlug}-${product}`);
  if (usedSlugs.has(slug)) slug = `${slug}-${shortHash(product + brandName)}`;
  usedSlugs.add(slug);

  const statusRaw = col(row, "Status");
  const price = col(row, "Price");
  const sku = col(row, "SKU / Identifier");
  const region = col(row, "Region / Platform") || "Global";
  const sourceUrl = col(row, "Source URL");
  const sourceType = col(row, "Source Type");
  const notes = col(row, "Verification Notes");
  const releaseRaw = col(row, "Release Date / Window");
  const { expectedAt, expectedLabel } = parseRelease(releaseRaw);
  const status = mapStatus(statusRaw);
  const bucket = mapBucket(category);
  const confidence = confidenceFor(statusRaw);
  const launchScore = scoreFor(statusRaw, Boolean(price), Boolean(sku));
  const id = `l-${shortHash(slug)}`;

  launches.push({
    id,
    slug,
    name: product,
    brandId,
    bucket,
    subcategory,
    status,
    summary:
      notes ||
      `${product} — ${statusRaw || "upcoming"} in ${category}${sku ? ` (${sku})` : ""}.`,
    expectedPrice: price || undefined,
    launchScore,
    hype: Math.max(40, launchScore - 6),
    confidence,
    dropRisk: status === "dated" ? 35 : 18,
    watchers: 200 + (launchScore * 37 + brandMap.size * 11) % 18000,
    momentum7d: 5 + (launchScore % 40),
    watchersToday: 10 + (launchScore % 90),
    expectedAt,
    expectedLabel,
    regions: [
      {
        region: region.split(/[|/]/)[0].trim() || "Global",
        date: expectedAt?.slice(0, 10),
        dateLabel: expectedLabel,
        confidence,
        note: region.includes("|") || region.includes("/") ? region : undefined,
      },
    ],
    retailers: [],
    sources: sourceUrl
      ? [
          {
            type: mapSourceType(sourceType),
            label: sourceType || "Source",
            confirmed: status === "dated",
            at: expectedAt || new Date().toISOString(),
          },
        ]
      : [],
    timeline: expectedAt
      ? [{ at: expectedAt, label: statusRaw || "Expected" }]
      : [],
    tags: [category, subcategory, sku].filter(Boolean).map((t) => t.toLowerCase()),
    preorderUrl: sourceUrl || undefined,
  });
}

const brands = [...brandMap.values()];

const file = `/* eslint-disable */
// AUTO-GENERATED by scripts/import-catalogue.mjs — do not edit by hand.
import type { Brand, Launch } from "@/lib/types";

export const catalogueBrands: Brand[] = ${JSON.stringify(brands, null, 2)};

export const catalogueLaunches: Launch[] = ${JSON.stringify(launches, null, 2)};
`;

fs.writeFileSync(outPath, file, "utf8");
console.log(
  `Wrote ${brands.length} brands and ${launches.length} launches → ${path.relative(root, outPath)}`
);
