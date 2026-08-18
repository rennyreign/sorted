import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * Wraps a child and swipes it in from a direction, relative to the
 * current sequence (frame 0 = local start). Used for lower-thirds,
 * callouts, and CTA lines.
 */
export const Swipe: React.FC<{
  children: React.ReactNode;
  from?: "left" | "right" | "bottom" | "top";
  startFrame?: number;
  durationInFrames?: number;
  distance?: number;
}> = ({
  children,
  from = "bottom",
  startFrame = 0,
  durationInFrames = 12,
  distance = 60,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: cubicOut,
    }
  );

  const offset = (1 - progress) * distance;
  const transform =
    from === "left"
      ? `translateX(${-offset}px)`
      : from === "right"
      ? `translateX(${offset}px)`
      : from === "top"
      ? `translateY(${-offset}px)`
      : `translateY(${offset}px)`;

  return (
    <div style={{ transform, opacity: progress, width: "100%", height: "100%" }}>
      {children}
    </div>
  );
};

// Cheap approximation of EASING.standard for interpolate's `easing` option.
function cubicOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
