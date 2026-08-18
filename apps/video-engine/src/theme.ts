/**
 * Sorted Video Design System — theme tokens
 *
 * This is the video equivalent of the website's design tokens
 * (see app/globals.css). Every component should read from here
 * instead of hardcoding colors, fonts, or timing so that every
 * episode automatically inherits the "Sorted look".
 */

export const COLORS = {
  black: "#0A0A0A",
  white: "#FAFAFA",
  bad: "#FF453A", // problems / "before" state
  good: "#32D74B", // improvements / "after" state
  muted: "#8A8A8E",
} as const;

export const FONT_FAMILY =
  '"Helvetica Neue", Helvetica, Arial, sans-serif';

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  bold: 700,
} as const;

/**
 * Standard scene durations, expressed in frames at 30fps.
 * Keep every episode's pacing consistent by reusing these.
 */
export const FPS = 30;

export const DURATIONS = {
  intro: 2 * FPS,
  websiteReview: 4 * FPS,
  websiteReveal: 3 * FPS,
  comparison: 6 * FPS,
  cta: 5 * FPS,
} as const;

/**
 * Standard transition length between scenes.
 */
export const TRANSITION_FRAMES = Math.round(0.4 * FPS);

/**
 * Standard easing curves — the motion equivalent of a spacing scale.
 * Reuse these instead of inventing new curves per component.
 */
export const EASING = {
  standard: [0.16, 1, 0.3, 1] as const, // fast out, gentle settle
  snappy: [0.65, 0, 0.35, 1] as const,
};
