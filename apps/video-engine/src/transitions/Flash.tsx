import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/**
 * A single white flash-frame, the "Sorted" signature cut between
 * before/after reveals. Place it absolutely positioned across a
 * scene boundary at `triggerFrame` (composition-relative).
 */
export const Flash: React.FC<{
  triggerFrame: number;
  durationInFrames?: number;
}> = ({ triggerFrame, durationInFrames = 8 }) => {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;

  const opacity = interpolate(
    frame,
    [triggerFrame - half, triggerFrame, triggerFrame + half],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (opacity <= 0) return null;

  return (
    <AbsoluteFill style={{ background: COLORS.white, opacity, zIndex: 50 }} />
  );
};
