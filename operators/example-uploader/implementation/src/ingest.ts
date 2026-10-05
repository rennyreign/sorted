// ─────────────────────────────────────────────────────────────
// Example Uploader — Ingest Module
// Discovers sites from multiple sources: clients/sites.json,
// site-briefs/, and sibling project directories.
// ─────────────────────────────────────────────────────────────

import fs from "node:fs";
import path from "node:path";
import type { SiteSource } from "./types.js";

// Category mapping (mirrors app/examples/data.ts categoryMap)
const CATEGORY_MAP: Record<string, string> = {
  fitness: "Health & fitness",
  healthcare: "Health & fitness",
  "beauty-wellness": "Health & fitness",
  hospitality: "Hospitality",
  "retail-fashion": "Retail",
  "professional-services": "Professional",
  "ai services": "Professional",
  trade: "Home services",
  property: "Other",
  restaurant: "Hospitality",
  food: "Hospitality",
  education: "Other",
  sports: "Health & fitness",
  technology: "Professional",
  coaching: "Professional",
  marketing: "Professional",
};

function inferCategory(businessName: string, hint?: string): string {
  if (hint) {
    const key = hint.toLowerCase().trim();
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key]!;
  }
  const name = businessName.toLowerCase();
  if (name.includes("fitness") || name.includes("gym") || name.includes("bjj") || name.includes("jiu") || name.includes("basketball") || name.includes("skill")) return "Health & fitness";
  if (name.includes("poke") || name.includes("catch") || name.includes("food") || name.includes("restaurant") || name.includes("kitchen")) return "Hospitality";
  if (name.includes("growth") || name.includes("consult") || name.includes("agency") || name.includes("marketing")) return "Professional";
  if (name.includes("stay") || name.includes("cottage") || name.includes("barn")) return "Hospitality";
  return "Other";
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ClientSiteEntry = {
  slug: string;
  name: string;
  domain?: string;
  liveUrl?: string;
  localPath?: string;
  category?: string;
  isClaimed?: boolean;
};

// Known live sites — can be extended via clients/sites.json or manually
const KNOWN_SITES: ClientSiteEntry[] = [
  {
    slug: "school-of-skill",
    name: "School of Skill",
    domain: "schoolofskill.co.uk",
    liveUrl: "https://schoolofskill.co.uk",
    localPath: "../sos",
    category: "Health & fitness",
    isClaimed: true,
  },
  {
    slug: "a-good-catch",
    name: "A Good Catch",
    liveUrl: "https://agoodcatch.netlify.app",
    localPath: "../agoodcatch",
    category: "Hospitality",
    isClaimed: false,
  },
  {
    slug: "bridge-growth",
    name: "Bridge Growth",
    liveUrl: "https://bridgegrowth.netlify.app",
    localPath: "../bridgegrowth",
    category: "Professional",
    isClaimed: false,
  },
];

export function ingestLiveSites(repoRoot: string, businessFilter?: string): SiteSource[] {
  // Load clients/sites.json if it exists
  const sitesJsonPath = path.join(repoRoot, "clients", "sites.json");
  const jsonSites: ClientSiteEntry[] = [];
  if (fs.existsSync(sitesJsonPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(sitesJsonPath, "utf-8")) as Array<{
        slug: string;
        name: string;
        domain?: string;
        localPath?: string;
      }>;
      for (const s of raw) {
        jsonSites.push({
          slug: s.slug,
          name: s.name,
          domain: s.domain,
          liveUrl: s.domain ? `https://${s.domain}` : undefined,
          localPath: s.localPath,
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  const allSites = [...KNOWN_SITES, ...jsonSites];
  const seen = new Set<string>();
  const sources: SiteSource[] = [];

  for (const site of allSites) {
    if (seen.has(site.slug)) continue;
    seen.add(site.slug);

    if (businessFilter && !site.name.toLowerCase().includes(businessFilter.toLowerCase())) {
      continue;
    }

    // Look for brief in the local project
    let briefPath: string | undefined;
    const localPath = site.localPath ? path.resolve(repoRoot, site.localPath) : null;

    if (localPath && fs.existsSync(localPath)) {
      const briefCandidates = [
        path.join(localPath, "brief.md"),
        path.join(localPath, "client", "brief.md"),
        path.join(localPath, "design-brief.md"),
      ];
      briefPath = briefCandidates.find((p) => fs.existsSync(p));
    }

    // Look for mockup
    let mockupPath: string | undefined;
    if (localPath && fs.existsSync(localPath)) {
      const mockupCandidates = [
        path.join(localPath, "mockup.png"),
        path.join(localPath, `mockup-${site.slug}.png`),
        path.join(localPath, "mockup-agoodcatch.png"),
        path.join(localPath, "mockup-bridge.png"),
        path.join(localPath, "sos-mockup.png"),
      ];
      mockupPath = mockupCandidates.find((p) => fs.existsSync(p));
    }

    sources.push({
      slug: site.slug,
      businessName: site.name,
      liveUrl: site.liveUrl,
      category: site.category ?? inferCategory(site.name),
      location: inferLocation(site.name, localPath, briefPath),
      briefPath,
      mockupPath,
      localPath: localPath ?? undefined,
      isLive: Boolean(site.liveUrl),
      isClaimed: site.isClaimed ?? true,
    });
  }

  return sources;
}

function inferLocation(businessName: string, localPath: string | null, briefPath?: string): string {
  // Try to extract location from brief
  if (briefPath && fs.existsSync(briefPath)) {
    const content = fs.readFileSync(briefPath, "utf-8").slice(0, 3000);
    const locMatch = content.match(/(?:location|based in|city)\s*[:\-]\s*(.+)/i);
    if (locMatch) {
      return locMatch[1]!.trim().split(/[,\n]/)[0]!.trim();
    }
  }

  // Fallback heuristics
  const name = businessName.toLowerCase();
  if (name.includes("halesowen")) return "Halesowen";
  if (name.includes("warwickshire")) return "Warwickshire";
  if (name.includes("birmingham") || name.includes("skill")) return "Birmingham";
  if (name.includes("shropshire") || name.includes("palace barn")) return "Shropshire";
  if (name.includes("tennessee") || name.includes("savannah")) return "Tennessee";
  if (name.includes("good catch")) return "London";
  if (name.includes("bridge growth")) return "London";

  return "UK";
}
