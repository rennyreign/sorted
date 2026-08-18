import React from "react";
import { AbsoluteFill } from "remotion";
import { EpisodeData } from "../types";
import { COLORS, FONT_FAMILY } from "../theme";
import { WebsiteMockup } from "./WebsiteMockup";
import { Zoom } from "../transitions/Zoom";
import { useFadeIn } from "../animations/Fade";
import { useSlideUp } from "../animations/Slide";

/**
 * Scene 3 — the "after" website, punched in right after the Flash
 * transition, with the improvement checklist stacking in.
 */
export const WebsiteReveal: React.FC<{ data: EpisodeData }> = ({ data }) => {
  return (
    <AbsoluteFill style={{ background: COLORS.black, fontFamily: FONT_FAMILY }}>
      <AbsoluteFill
        style={{ padding: "0 8%", justifyContent: "center", alignItems: "center" }}
      >
        <div style={{ width: "100%", aspectRatio: "4 / 3" }}>
          <Zoom startFrame={0} durationInFrames={14} from={0.9}>
            <WebsiteMockup variant="after" businessName={data.business} />
          </Zoom>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-end",
          padding: "0 64px 64px 0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.improvements.map((item, i) => (
            <Checklist key={item} text={item} startFrame={10 + i * 10} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Checklist: React.FC<{ text: string; startFrame: number }> = ({
  text,
  startFrame,
}) => {
  const opacity = useFadeIn(startFrame, 8);
  const y = useSlideUp(startFrame, 8, 14);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(10,10,10,0.75)",
        border: `1px solid ${COLORS.good}`,
        borderRadius: 8,
        padding: "10px 18px",
      }}
    >
      <span style={{ color: COLORS.good, fontSize: 22, fontWeight: 700 }}>
        ✓
      </span>
      <span style={{ color: COLORS.white, fontSize: 22, fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
};
