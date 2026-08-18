import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * Crossfades two children over `durationInFrames`, starting at
 * `startFrame`. Used when two states of the same subject need to
 * blend into one another (e.g. before/after halves settling into a
 * split screen).
 */
export const Morph: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  startFrame?: number;
  durationInFrames?: number;
}> = ({ from, to, startFrame = 0, durationInFrames = 20 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - progress }}>{from}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: progress }}>{to}</AbsoluteFill>
    </AbsoluteFill>
  );
};
