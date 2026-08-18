import React from "react";
import { AbsoluteFill } from "remotion";
import { EpisodeData } from "../types";
import { COLORS, FONT_FAMILY } from "../theme";
import { useFadeIn } from "../animations/Fade";
import { useSlideUp } from "../animations/Slide";

/**
 * Scene 1 — black screen, white text fades in:
 * TODAY WE MODERNISED / [BUSINESS] / [LOCATION]
 */
export const Intro: React.FC<{ data: EpisodeData }> = ({ data }) => {
  const taglineOpacity = useFadeIn(0, 12);
  const taglineY = useSlideUp(0, 12, 12);

  const businessOpacity = useFadeIn(10, 14);
  const businessY = useSlideUp(10, 14, 16);

  const locationOpacity = useFadeIn(22, 14);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            color: COLORS.muted,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 4,
            marginBottom: 18,
          }}
        >
          {data.tagline}
        </div>
        <div
          style={{
            opacity: businessOpacity,
            transform: `translateY(${businessY}px)`,
            color: COLORS.white,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -1,
            marginBottom: 10,
          }}
        >
          {data.business.toUpperCase()}
        </div>
        <div
          style={{
            opacity: locationOpacity,
            color: COLORS.muted,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: 3,
          }}
        >
          {data.location.toUpperCase()}
        </div>
      </div>
    </AbsoluteFill>
  );
};
