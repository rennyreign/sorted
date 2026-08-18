import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * Punch-in reveal — wraps a child and scales it up from `from` to 1
 * as it enters. Used for the "after" website reveal.
 */
export const Zoom: React.FC<{
  children: React.ReactNode;
  startFrame?: number;
  durationInFrames?: number;
  from?: number;
}> = ({ children, startFrame = 0, durationInFrames = 14, from = 0.85 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};
