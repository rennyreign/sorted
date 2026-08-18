import React from "react";
import { AbsoluteFill } from "remotion";
import { EpisodeData } from "../types";
import { COLORS, FONT_FAMILY } from "../theme";
import { WebsiteMockup } from "./WebsiteMockup";
import { useKenBurns } from "../animations/Zoom";
import { useFadeIn } from "../animations/Fade";
import { useSlideUp } from "../animations/Slide";

/**
 * Scene 2 — "before" website. Slow zoom on the mockup while problem
 * callouts stack in one at a time.
 */
export const WebsiteReview: React.FC<{
  data: EpisodeData;
  durationInFrames: number;
}> = ({ data, durationInFrames }) => {
  const scale = useKenBurns(durationInFrames, 1, 1.06);

  return (
    <AbsoluteFill style={{ background: COLORS.black, fontFamily: FONT_FAMILY }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <AbsoluteFill
          style={{
            padding: "0 8%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", aspectRatio: "4 / 3" }}>
            <WebsiteMockup variant="before" businessName={data.business} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: "0 0 64px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.problems.map((problem, i) => (
            <Callout key={problem} text={problem} startFrame={12 + i * 18} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Callout: React.FC<{ text: string; startFrame: number }> = ({
  text,
  startFrame,
}) => {
  const opacity = useFadeIn(startFrame, 10);
  const y = useSlideUp(startFrame, 10, 14);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(10,10,10,0.75)",
        border: `1px solid ${COLORS.bad}`,
        borderRadius: 8,
        padding: "10px 18px",
      }}
    >
      <span style={{ color: COLORS.bad, fontSize: 22, fontWeight: 700 }}>
        ✕
      </span>
      <span style={{ color: COLORS.white, fontSize: 22, fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
};
