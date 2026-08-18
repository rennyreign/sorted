import React from "react";
import { AbsoluteFill } from "remotion";
import { EpisodeData } from "../types";
import { COLORS, FONT_FAMILY } from "../theme";
import { WebsiteMockup } from "./WebsiteMockup";
import { Swipe } from "../transitions/Swipe";
import { useFadeIn } from "../animations/Fade";

/**
 * Scene 4 — before/after side by side, then a hold on a single
 * question. No voiceover here by design; let the visual do the work.
 */
export const SplitComparison: React.FC<{ data: EpisodeData }> = ({
  data,
}) => {
  const questionOpacity = useFadeIn(60, 16);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.black,
        fontFamily: FONT_FAMILY,
        flexDirection: "column",
        padding: "5% 8%",
        gap: 24,
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <Swipe from="left" durationInFrames={16}>
          <WebsiteMockup variant="before" businessName={data.business} />
        </Swipe>
      </div>
      <div style={{ height: 2, background: "#2A2A2A", margin: "0 8%" }} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <Swipe from="right" durationInFrames={16}>
          <WebsiteMockup variant="after" businessName={data.business} />
        </Swipe>
      </div>
      <div
        style={{
          opacity: questionOpacity,
          color: COLORS.white,
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: -0.5,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {data.comparisonQuestion}
      </div>
    </AbsoluteFill>
  );
};
