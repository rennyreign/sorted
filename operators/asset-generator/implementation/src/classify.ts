// ─────────────────────────────────────────────────────────────
// Asset Generator — Human Asset Classifier
//
// Deliberately zero-cost: reuses signals already present in the
// deconstruction JSON (type + description) rather than spending an
// extra vision call per crop. Errs toward classifying an asset as
// "human" when uncertain, since the human branch is the safer
// failure mode (real photo / flagged AI placeholder) vs. letting a
// real person get run through Flux reconstruction.
// ─────────────────────────────────────────────────────────────

import type { InputAsset } from './types.js';

const HUMAN_TYPES = new Set(['person', 'avatar']);

// Free supplementary signal — description text often names people even
// when the deconstructor mis-typed the region as "generic" or "screenshot".
const HUMAN_KEYWORDS = /\b(person|people|man|woman|men|women|child|children|kid|kids|boy|girl|face|portrait|player|players|team|staff|teacher|student|students|coach|founder|athlete|instructor|customer|client|family)\b/i;

export function isHumanAsset(asset: InputAsset): boolean {
  if (HUMAN_TYPES.has(asset.type)) return true;
  return HUMAN_KEYWORDS.test(asset.description ?? '');
}

// Icons are excluded from the whole pipeline — the frontend-builder supplies
// these itself (Lucide React component map, per doctrine), so cropping or
// reconstructing them from the mockup is wasted spend and wasted judgment
// (icon descriptions frequently trip the human keyword heuristic above, e.g.
// "line icon of a person" — excluding icons up front sidesteps that too).
export function isIconAsset(asset: InputAsset): boolean {
  return asset.type === 'icon';
}
