/**
 * Episode data contract. Every /data/*.json file must satisfy this
 * shape. Components read exclusively from this — never hardcode
 * copy inside a component.
 */
export type EpisodeData = {
  business: string;
  location: string;
  tagline: string;
  beforeImage: string;
  afterImage: string;
  problems: string[];
  improvements: string[];
  comparisonQuestion: string;
  cta: {
    lines: string[];
  };
};
