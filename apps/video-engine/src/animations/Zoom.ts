import { interpolate, useCurrentFrame } from "remotion";

/**
 * Slow "Ken Burns" style zoom used on website screenshots.
 * Returns a `scale` value to apply via CSS transform.
 */
export const useKenBurns = (
  durationInFrames: number,
  from = 1,
  to = 1.08
): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * A quick punch-in used on flash transitions / reveals.
 */
export const usePunchIn = (
  startFrame: number,
  durationInFrames = 10,
  from = 0.9,
  to = 1
): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};
