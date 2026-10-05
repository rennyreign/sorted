// ─────────────────────────────────────────────────────────────
// Example Uploader — Case Study Generation
// Uses Anthropic Claude to generate full case study content
// for live/built sites, following the ExampleCaseStudy format.
// ─────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import path from "node:path";
import fs from "node:fs";
import { createCostRecord, type CostRecord } from "./cost.js";
import type { GeneratedCaseStudy, SiteSource } from "./types.js";

const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `You are Sorted's case study writer. You write concise, compelling case studies for websites Sorted has built.

Your writing style:
- Plain English, no jargon, no marketing fluff
- Confident but not boastful
- Specific over generic
- Short sentences with punch
- Real-sounding, like a business owner would actually say it

You NEVER use these words: elevate, unleash, transform, next-gen, seamless, revolutionary, empower, cutting-edge, synergy, holistic, robust, leverage.

You follow the exact output format requested. No extra commentary.`;

function buildCaseStudyPrompt(source: SiteSource, briefContent: string | null, screenshotPaths: { desktop: string; tablet: string; mobile: string }): string {
  const claimedNote = source.isClaimed
    ? "This site is live and the client is actively working with Sorted."
    : "This site is an unclaimed build — Sorted manufactured it as proof but the business has not yet committed. The case study should reflect this: frame it as a demonstration of what Sorted can build, not as a client success story with a testimonial.";

  const testimonialInstruction = source.isClaimed
    ? `Write a realistic testimonial that the business owner might give. Use the business name or founder name as the testimonial name. Keep it 2-3 sentences, specific and grounded.`
    : `Write a testimonial-style quote that reflects what a prospect might say upon seeing this mockup for the first time. Use the business name as the testimonial name. Mark the role as "Pending response" to indicate the site is unclaimed.`;

  return `Write a case study for this website Sorted has built.

## Business Details
- Business name: ${source.businessName}
- Category: ${source.category}
- Location: ${source.location}
- Live URL: ${source.liveUrl ?? "N/A"}
- Status: ${claimedNote}

## Brief / Context
${briefContent ?? "No brief available — infer from the business name and category."}

## Screenshots
Desktop: ${screenshotPaths.desktop}
Tablet: ${screenshotPaths.tablet}
Mobile: ${screenshotPaths.mobile}

## Output Format
Return ONLY a valid JSON object with this exact shape (no markdown, no explanation):

{
  "slug": "${source.slug}",
  "category": "${source.category}",
  "title": "A short punchy headline (5-8 words) about what the website achieves",
  "business": "${source.businessName}",
  "location": "${source.location}",
  "description": "One sentence (15-25 words) describing what the website is and does",
  "goal": "2-3 sentences describing the business goal — what they needed from a website",
  "solution": "2-3 sentences describing what Sorted built and how it works",
  "testimonial": "${testimonialInstruction}",
  "testimonialName": "The name for the testimonial attribution",
  "testimonialRole": "The role/title for the testimonial attribution",
  "stats": [
    ["24hrs", "First homepage concept delivered"],
    ["VALUE_2", "LABEL_2"],
    ["VALUE_3", "LABEL_3"],
    ["VALUE_4", "LABEL_4"]
  ]
}

Rules:
- title should be a statement, not a question. e.g. "Designed to earn the booking."
- stats: always include the "24hrs / First homepage concept delivered" as the first entry. Then 3 more relevant stats. Stats values should be short (1-4 chars). Labels should be 3-8 words.
- Keep everything concise and specific to this business.
- Return ONLY the JSON, no other text.`;
}

function buildBlurbPrompt(source: SiteSource): string {
  return `Write a one-sentence blurb (15-25 words) for this website example on Sorted's examples page.

Business: ${source.businessName}
Category: ${source.category}
Location: ${source.location}
${source.isClaimed ? "Status: Live client site." : "Status: Unclaimed build — Sorted manufactured this as proof."}

Return ONLY the blurb sentence, nothing else. No quotes, no prefix.`;
}

export type GenerationResult = {
  caseStudy: GeneratedCaseStudy;
  blurb: string;
  costs: CostRecord[];
};

export async function generateCaseStudy(
  source: SiteSource,
  screenshotPublicPaths: { desktop: string; tablet: string; mobile: string },
  repoRoot: string,
): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });

  // Read brief if available
  let briefContent: string | null = null;
  if (source.briefPath && fs.existsSync(source.briefPath)) {
    briefContent = fs.readFileSync(source.briefPath, "utf-8").slice(0, 8000);
  }

  const costs: CostRecord[] = [];

  // Generate blurb
  const blurbResponse = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildBlurbPrompt(source) }],
  });

  const blurbUsage = blurbResponse.usage;
  costs.push(
    createCostRecord(MODEL, blurbUsage.input_tokens, blurbUsage.output_tokens, `blurb: ${source.slug}`),
  );

  const blurb = (blurbResponse.content[0] as { text: string }).text.trim().replace(/^["']|["']$/g, "");

  // Generate case study
  const caseStudyResponse = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildCaseStudyPrompt(source, briefContent, screenshotPublicPaths),
      },
    ],
  });

  const csUsage = caseStudyResponse.usage;
  costs.push(
    createCostRecord(MODEL, csUsage.input_tokens, csUsage.output_tokens, `case-study: ${source.slug}`),
  );

  const rawJson = (caseStudyResponse.content[0] as { text: string }).text.trim();
  // Strip any markdown code fences if present
  const cleanJson = rawJson.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  const parsed = JSON.parse(cleanJson) as Omit<GeneratedCaseStudy, "image" | "screenshots" | "liveUrl" | "isClaimed">;

  const caseStudy: GeneratedCaseStudy = {
    ...parsed,
    image: screenshotPublicPaths.desktop,
    screenshots: {
      desktop: screenshotPublicPaths.desktop,
      tablet: screenshotPublicPaths.tablet,
      mobile: screenshotPublicPaths.mobile,
    },
    liveUrl: source.liveUrl,
    isClaimed: source.isClaimed,
  };

  return { caseStudy, blurb, costs };
}
