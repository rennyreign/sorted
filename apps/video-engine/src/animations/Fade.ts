import { interpolate, useCurrentFrame } from "remotion";

/**
 * Returns an opacity value that fades in from `startFrame` over
 * `durationInFrames`, and optionally fades back out over the same
 * window before `endFrame`.
 */
export const useFadeIn = (
  startFrame: number,
  durationInFrames = 15
): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const useFadeInOut = (
  startFrame: number,
  endFrame: number,
  durationInFrames = 15
): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [
      startFrame,
      startFrame + durationInFrames,
      endFrame - durationInFrames,
      endFrame,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};
