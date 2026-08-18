import { interpolate, useCurrentFrame } from "remotion";
import { EASING } from "../theme";

/**
 * Vertical slide-up-and-settle, used for text and callouts entering
 * the frame. Returns a `translateY` in pixels — pair with useFadeIn
 * for the standard "Sorted" entrance.
 */
export const useSlideUp = (
  startFrame: number,
  durationInFrames = 15,
  distance = 24
): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [distance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => bezier(t, EASING.standard),
    }
  );
};

// Minimal cubic-bezier evaluator so we don't need an extra dependency.
function bezier(t: number, [x1, y1, x2, y2]: readonly number[]): number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) =>
    (3 * ax * t + 2 * bx) * t + cx;

  let x = t;
  for (let i = 0; i < 8; i++) {
    const currentX = sampleCurveX(x) - t;
    const derivative = sampleCurveDerivativeX(x);
    if (Math.abs(derivative) < 1e-6) break;
    x -= currentX / derivative;
  }
  return sampleCurveY(x);
}
