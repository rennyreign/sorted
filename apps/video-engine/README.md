# Sorted Video Engine

A **video design system**, not a video template. Same philosophy as the
Sorted website factory: deterministic inputs, reusable components,
consistent output. Every episode is built from the exact same
component sequence and reads its copy from a single JSON file.

```
<Intro /> <WebsiteReview /> <WebsiteReveal /> <SplitComparison /> <CTA />
```

## Status

Proof of concept: one 20-second episode (`johns-fish-and-chips`)
covering the full pipeline end to end. `WebsiteMockup` is a pure-CSS
browser mockup standing in for real screenshots — swap it for
`<Img src={staticFile(...)} />` once real before/after captures exist;
every scene consumes websites through that one component, so the swap
happens in one place.

## Structure

```
apps/video-engine/
  src/
    Root.tsx              Episode registry — one <Composition> per business
    index.ts              Remotion entry point
    theme.ts              Design tokens: colors, fonts, durations, easing
    types.ts              EpisodeData contract every JSON file must satisfy
    compositions/
      Episode.tsx          The fixed 5-scene shape every episode uses
    components/
      Intro.tsx
      WebsiteReview.tsx
      WebsiteReveal.tsx
      SplitComparison.tsx
      CTA.tsx
      WebsiteMockup.tsx    Shared before/after browser mockup
    transitions/
      Flash.tsx            Signature white flash-cut
      Swipe.tsx            Directional slide-in wrapper
      Zoom.tsx             Punch-in reveal wrapper
      Morph.tsx            Crossfade wrapper
    animations/
      Fade.ts               useFadeIn / useFadeInOut hooks
      Slide.ts               useSlideUp hook
      Zoom.ts                useKenBurns / usePunchIn hooks
    data/
      johns-fish-and-chips.json
```

## Shipping a new episode

1. Add `src/data/<client-slug>.json` matching `EpisodeData` in `types.ts`.
2. Register it in `src/Root.tsx`'s `EPISODES` array.
3. Render: `npx remotion render src/index.ts <client-slug> out/<client-slug>.mp4`

Never touch `Episode.tsx` or the scene components to ship a new
episode — that's the point of the system.

## Commands

```bash
npm install
npm run dev              # Remotion Studio — scrub the timeline live
npx remotion still src/index.ts <episode-id> out/frame.png --frame=<n>
npx remotion render src/index.ts <episode-id> out/<episode-id>.mp4
```

## Design tokens (`theme.ts`)

Scene pacing (20s POC, 30fps): Intro 2s → WebsiteReview 4s →
WebsiteReveal 3s → SplitComparison 6s → CTA 5s. Colors, font family,
and easing curves are centralized here — the same idea as the site's
`app/globals.css` tokens, but for motion instead of layout.

## Where this is going

This POC proves the pipeline. The next layers (per the original brief)
are additive, not structural changes:

- Real website screenshots via `staticFile()` instead of `WebsiteMockup`
- `GoogleMaps.tsx` / `BusinessHero.tsx` components for a fuller episode
- ElevenLabs voiceover track + burned-in captions
- A `Prospect Finder → Mockup → Screen Recording → GPT narration →
  ElevenLabs → Remotion render → Captions → TikTok/IG/YouTube Shorts`
  pipeline, with this engine as the render step
