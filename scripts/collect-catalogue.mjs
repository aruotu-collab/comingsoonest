/**
 * Collect upcoming products from public sources → data/catalogue.csv
 *
 * Sources:
 *   - Steam Store "coming soon" search (games)
 *   - Open Library first_publish_year 2026–2027 (books)
 *   - Existing seed CSV (sneakers / LEGO / curated rows)
 *
 * Run: node scripts/collect-catalogue.mjs
 * Then: node scripts/import-catalogue.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const seedPath = path.join(dataDir, "comingsoonest_seed_599.csv");
const outPath = path.join(dataDir, "catalogue.csv");

const HEADERS = [
  "Category",
  "Subcategory",
  "Product / Release",
  "Brand / Creator",
  "Release Date / Window",
  "Status",
  "Price",
  "SKU / Identifier",
  "Region / Platform",
  "Source URL",
  "Source Type",
  "Verification Notes",
];

const TARGET = {
  steam: 2800,
  books2026: 1800,
  booksExtra: 600,
};

const UA = {
  "User-Agent":
    "ComingSoonestBot/1.0 (+https://comingsoonest.com; catalogue refresh)",
  Accept: "application/json, text/html;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.status === 429 || res.status >= 500) {
      await sleep(1500 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }
  throw new Error(`Failed after retries: ${url}`);
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowToCsv(row) {
  return HEADERS.map((h) => csvEscape(row[h] ?? "")).join(",");
}

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
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

function loadSeedRows() {
  if (!fs.existsSync(seedPath)) return [];
  const rows = parseCsv(fs.readFileSync(seedPath, "utf8"));
  const header = rows[0].map((h) => h.trim());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  return rows.slice(1).map((r) => {
    const obj = {};
    for (const h of HEADERS) obj[h] = (r[idx[h]] || "").trim();
    return obj;
  }).filter((o) => o["Product / Release"]);
}

function normKey(product, brand, sku) {
  const s = (sku || "").trim().toLowerCase();
  if (s) return `sku:${s}`;
  return `n:${(product || "").toLowerCase().replace(/\s+/g, " ").trim()}|${(brand || "").toLowerCase().trim()}`;
}

/** Parse Steam "19 Aug, 2026" / "Q4 2026" / "Coming soon" → ISO or window label */
function parseSteamDate(raw) {
  const v = (raw || "").replace(/\s+/g, " ").trim();
  if (!v || /^coming soon$/i.test(v) || /^to be announced$/i.test(v) || /^tba$/i.test(v)) {
    return { window: "TBA", status: "Announced" };
  }
  const m = v.match(/^(\d{1,2})\s+([A-Za-z]{3}),?\s+(\d{4})$/);
  if (m) {
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    const mo = months[m[2]];
    if (mo) {
      const day = m[1].padStart(2, "0");
      return { window: `${m[3]}-${mo}-${day}`, status: "Confirmed" };
    }
  }
  const q = v.match(/^Q([1-4])\s+(\d{4})$/i);
  if (q) return { window: `Q${q[1]} ${q[2]}`, status: "Expected" };
  if (/^\d{4}$/.test(v)) return { window: v, status: "Expected" };
  return { window: v, status: "Announced" };
}

function parseBookDate(dates) {
  const list = Array.isArray(dates) ? dates : [];
  for (const d of list) {
    const iso = String(d).match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return { window: iso[1], status: "Confirmed" };
  }
  for (const d of list) {
    const m = String(d).match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (m) {
      const months = {
        january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
        july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
      };
      const mo = months[m[1].toLowerCase()];
      if (mo) {
        return {
          window: `${m[3]}-${mo}-${m[2].padStart(2, "0")}`,
          status: "Confirmed",
        };
      }
    }
  }
  for (const d of list) {
    const y = String(d).match(/\b(20\d{2})\b/);
    if (y) return { window: y[1], status: "Expected" };
  }
  return { window: "", status: "Announced" };
}

async function collectSteam(limit) {
  console.log(`Steam: collecting up to ${limit} coming-soon titles…`);
  const out = [];
  const seen = new Set();
  // Steam search infinite endpoint typically returns ~50 rows per request.
  const pageSize = 50;
  for (let start = 0; out.length < limit && start < 20000; start += pageSize) {
    const url =
      `https://store.steampowered.com/search/results/?query=&start=${start}` +
      `&count=${pageSize}&sort_by=_ASC&filter=comingsoon&infinite=1`;
    let data;
    try {
      data = await fetchJson(url);
    } catch (e) {
      console.warn(`  Steam page start=${start} failed:`, e.message);
      await sleep(2000);
      continue;
    }
    const html = data.results_html || "";
    if (!html.trim()) break;

    const re =
      /data-ds-appid="(\d+)"[\s\S]*?href="(https:\/\/store\.steampowered\.com\/app\/[^"]+)"[\s\S]*?<span class="title">([^<]+)<\/span>[\s\S]*?<div class="search_released[^"]*">\s*([^<]*)</g;
    let m;
    let pageHits = 0;
    while ((m = re.exec(html)) !== null) {
      const appId = m[1];
      if (seen.has(appId)) continue;
      seen.add(appId);
      pageHits++;
      const href = m[2].split("?")[0];
      const title = m[3].replace(/\s+/g, " ").trim();
      const { window, status } = parseSteamDate(m[4]);
      if (!title) continue;
      out.push({
        Category: "Gaming",
        Subcategory: "PC / Steam",
        "Product / Release": title,
        "Brand / Creator": "Steam",
        "Release Date / Window": window,
        Status: status,
        Price: "",
        "SKU / Identifier": `steam-${appId}`,
        "Region / Platform": "PC / Steam",
        "Source URL": href,
        "Source Type": "Official store",
        "Verification Notes": "Collected from Steam coming-soon search",
      });
      if (out.length >= limit) break;
    }
    console.log(`  Steam start=${start} +${pageHits} (total ${out.length})`);
    if (pageHits === 0) break;
    await sleep(400);
  }
  return out;
}

async function collectOpenLibrary(query, limit, label) {
  console.log(`Open Library: collecting up to ${limit} (${label})…`);
  const out = [];
  const seen = new Set();
  const pageSize = 100;
  for (let page = 1; out.length < limit && page <= 50; page++) {
    const url =
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}` +
      `&limit=${pageSize}&page=${page}` +
      `&fields=key,title,author_name,publish_date,isbn,publisher,first_publish_year`;
    let data;
    try {
      data = await fetchJson(url);
    } catch (e) {
      console.warn(`  OL ${label} page ${page} failed:`, e.message);
      await sleep(2000);
      continue;
    }
    const docs = data.docs || [];
    if (!docs.length) break;
    let added = 0;
    for (const doc of docs) {
      const title = (doc.title || "").replace(/\s+/g, " ").trim();
      if (!title || title.length < 2) continue;
      const isbn = Array.isArray(doc.isbn)
        ? doc.isbn.find((x) => /^\d{10,13}$/.test(String(x).replace(/-/g, "")))
        : "";
      const key = doc.key || isbn || title;
      if (seen.has(key)) continue;
      seen.add(key);
      const year = doc.first_publish_year || "";
      const author =
        (Array.isArray(doc.author_name) && doc.author_name[0]) ||
        (Array.isArray(doc.publisher) && doc.publisher[0]) ||
        "Unknown";
      const { window, status } = parseBookDate(doc.publish_date);
      const workKey = (doc.key || "").replace("/works/", "");
      out.push({
        Category: "Books",
        Subcategory: "New release",
        "Product / Release": title,
        "Brand / Creator": author,
        "Release Date / Window": window || String(year || ""),
        Status: status,
        Price: "",
        "SKU / Identifier": isbn
          ? `isbn-${isbn}`
          : workKey
            ? `ol-${workKey}`
            : "",
        "Region / Platform": "Global",
        "Source URL": doc.key
          ? `https://openlibrary.org${doc.key}`
          : "https://openlibrary.org",
        "Source Type": "Library catalogue",
        "Verification Notes": `Open Library query=${label}`,
      });
      added++;
      if (out.length >= limit) break;
    }
    console.log(
      `  OL ${label} page=${page} +${added} (total ${out.length} / found ${data.numFound})`
    );
    if (docs.length < pageSize) break;
    await sleep(350);
  }
  return out;
}

function mergeRows(lists) {
  const map = new Map();
  for (const list of lists) {
    for (const row of list) {
      const key = normKey(
        row["Product / Release"],
        row["Brand / Creator"],
        row["SKU / Identifier"]
      );
      if (!map.has(key)) map.set(key, row);
    }
  }
  return [...map.values()];
}

async function main() {
  fs.mkdirSync(dataDir, { recursive: true });

  const seed = loadSeedRows();
  console.log(`Seed: ${seed.length} rows`);

  const steam = await collectSteam(TARGET.steam);
  const books2026 = await collectOpenLibrary(
    "first_publish_year:2026",
    TARGET.books2026,
    "year-2026"
  );
  const booksExtra = await collectOpenLibrary(
    "first_publish_year:2027 OR first_publish_year:2025",
    TARGET.booksExtra,
    "year-2025-2027"
  );

  const merged = mergeRows([seed, steam, books2026, booksExtra]);
  // Prefer future / dated items first in file for readability
  merged.sort((a, b) => {
    const da = a["Release Date / Window"] || "9999";
    const db = b["Release Date / Window"] || "9999";
    return da.localeCompare(db);
  });

  const body = [HEADERS.join(","), ...merged.map(rowToCsv)].join("\n") + "\n";
  fs.writeFileSync(outPath, body, "utf8");

  const byCat = {};
  for (const r of merged) {
    const c = r.Category || "Other";
    byCat[c] = (byCat[c] || 0) + 1;
  }
  console.log(`\nWrote ${merged.length} products → ${path.relative(root, outPath)}`);
  console.log("By category:", byCat);
  console.log(
    `Breakdown: seed=${seed.length} steam=${steam.length} books2026=${books2026.length} booksExtra=${booksExtra.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
