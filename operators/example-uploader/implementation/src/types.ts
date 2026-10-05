// ─────────────────────────────────────────────────────────────
// Example Uploader — Shared Types
// ─────────────────────────────────────────────────────────────

export type ExampleType = "mockup" | "live" | "build";

export type ExampleStatus = "Mockup" | "Approved" | "Building";

export type ViewportSize = {
  name: "desktop" | "tablet" | "mobile";
  width: number;
  height: number;
};

export const VIEWPORTS: ViewportSize[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

export type SiteSource = {
  slug: string;
  businessName: string;
  liveUrl?: string;
  category: string;
  location: string;
  description?: string;
  briefPath?: string;
  mockupPath?: string;
  localPath?: string;
  isLive: boolean;
  isClaimed: boolean;
};

export type GeneratedCaseStudy = {
  slug: string;
  category: string;
  title: string;
  business: string;
  location: string;
  description: string;
  image: string;
  screenshots: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  liveUrl?: string;
  goal: string;
  solution: string;
  testimonial: string;
  testimonialName: string;
  testimonialRole: string;
  stats: [string, string][];
  isClaimed: boolean;
};

export type UploadResult = {
  screenshots: { slug: string; paths: { desktop: string; tablet: string; mobile: string } };
  caseStudy?: GeneratedCaseStudy;
  published: boolean;
  costUsd: number;
};

export type RunConfig = {
  dryRun: boolean;
  source: "all" | "mockups" | "live" | "case-studies";
  business?: string;
  forceScreenshots: boolean;
  verbose: boolean;
};

export type CostRecord = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  purpose: string;
};
