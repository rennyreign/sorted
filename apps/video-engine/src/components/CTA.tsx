import React from "react";
import { AbsoluteFill } from "remotion";
import { EpisodeData } from "../types";
import { COLORS, FONT_FAMILY } from "../theme";
import { Swipe } from "../transitions/Swipe";
import { useFadeIn } from "../animations/Fade";

/**
 * Scene 5 — end card. Logo + caption lines standing in for
 * voiceover ("Know the owner? Send them this. We've already
 * built it."). Swap in an <Audio> track once a real VO exists.
 */
export const CTA: React.FC<{ data: EpisodeData }> = ({ data }) => {
  const logoOpacity = useFadeIn(0, 14);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.black,
        fontFamily: FONT_FAMILY,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ opacity: logoOpacity, marginBottom: 48 }}>
        <span
          style={{
            color: COLORS.white,
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          Sorted
        </span>
        <span style={{ color: COLORS.good, fontSize: 46, fontWeight: 700 }}>
          .
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.cta.lines.map((line, i) => (
          <Swipe key={line} from="bottom" startFrame={20 + i * 18} durationInFrames={12}>
            <div
              style={{
                color: COLORS.muted,
                fontSize: 26,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {line}
            </div>
          </Swipe>
        ))}
      </div>
    </AbsoluteFill>
  );
};
