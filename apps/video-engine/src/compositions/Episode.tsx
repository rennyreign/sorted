import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { EpisodeData } from "../types";
import { DURATIONS } from "../theme";
import { Intro } from "../components/Intro";
import { WebsiteReview } from "../components/WebsiteReview";
import { WebsiteReveal } from "../components/WebsiteReveal";
import { SplitComparison } from "../components/SplitComparison";
import { CTA } from "../components/CTA";
import { Flash } from "../transitions/Flash";

/**
 * Every episode is this exact same shape:
 *
 *   <Intro /> <WebsiteReview /> <WebsiteReveal /> <SplitComparison /> <CTA />
 *
 * Scenes are driven entirely by `data` (see /data/*.json + types.ts).
 * To ship a new episode: add a JSON file, register it in
 * src/Root.tsx, done — never touch this file again.
 */
export const Episode: React.FC<{ data: EpisodeData }> = ({ data }) => {
  const introStart = 0;
  const reviewStart = introStart + DURATIONS.intro;
  const revealStart = reviewStart + DURATIONS.websiteReview;
  const comparisonStart = revealStart + DURATIONS.websiteReveal;
  const ctaStart = comparisonStart + DURATIONS.comparison;

  return (
    <AbsoluteFill>
      <Sequence from={introStart} durationInFrames={DURATIONS.intro}>
        <Intro data={data} />
      </Sequence>

      <Sequence from={reviewStart} durationInFrames={DURATIONS.websiteReview}>
        <WebsiteReview data={data} durationInFrames={DURATIONS.websiteReview} />
      </Sequence>

      <Sequence from={revealStart} durationInFrames={DURATIONS.websiteReveal}>
        <WebsiteReveal data={data} />
      </Sequence>

      <Sequence from={comparisonStart} durationInFrames={DURATIONS.comparison}>
        <SplitComparison data={data} />
      </Sequence>

      <Sequence from={ctaStart} durationInFrames={DURATIONS.cta}>
        <CTA data={data} />
      </Sequence>

      {/* Signature flash cut between the "before" review and the "after" reveal */}
      <Flash triggerFrame={revealStart} />
    </AbsoluteFill>
  );
};
