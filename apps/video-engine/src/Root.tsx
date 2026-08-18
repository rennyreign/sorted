import React from "react";
import { Composition } from "remotion";
import { Episode } from "./compositions/Episode";
import { DURATIONS, FPS } from "./theme";
import { EpisodeData } from "./types";
import johnsFishAndChips from "./data/johns-fish-and-chips.json";

const TOTAL_DURATION_IN_FRAMES = Object.values(DURATIONS).reduce(
  (a, b) => a + b,
  0
);

/**
 * The episode registry. Every business gets one entry here — the
 * JSON drives 100% of the copy, nothing else needs to change to
 * ship a new episode.
 */
const EPISODES: { id: string; data: EpisodeData }[] = [
  { id: "johns-fish-and-chips", data: johnsFishAndChips as EpisodeData },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {EPISODES.map(({ id, data }) => (
        <Composition
          key={id}
          id={id}
          component={Episode}
          durationInFrames={TOTAL_DURATION_IN_FRAMES}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ data }}
        />
      ))}
    </>
  );
};
