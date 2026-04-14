# Luminate — Remotion Demo Video

A 30-second product-reveal animation built with Remotion 4.x + React + TypeScript.  
Style: dark, premium, tech — inspired by Linear.app and Vercel.

## Sequences

| Segment | Frames | Duration | What happens |
|---------|--------|----------|--------------|
| Intro | 0 – 240 | 0 – 8 s | 42 particles converge to centre, letter-by-letter title spring, subtitle blur→sharp |
| Features | 240 – 660 | 8 – 22 s | 3 staggered feature cards, SVG connection lines, animated icons |
| Outro | 660 – 900 | 22 – 30 s | Everything contracts, logo pulses, fade to black |

## Stack

- `remotion` + `@remotion/cli` 4.0.448
- React 18 + TypeScript 5
- Zero external CSS — all styles are inline

## Install

```bash
npm install
```

## Preview (Remotion Studio)

```bash
npm start
# opens http://localhost:3000
```

## Render

```bash
# default (downloads Chrome Headless Shell — requires internet)
npm run render

# using local Chromium (no internet needed)
npm run render:demo
```

Output: `out/demo.mp4` — 1920 × 1080, H.264

## Project structure

```
src/
├── index.ts                  # registerRoot entry
├── Root.tsx                  # registers the Demo composition
└── compositions/
    ├── Demo.tsx              # main 30 s composition
    ├── Particle.tsx          # individual particle (42 instances)
    └── FeatureCard.tsx       # animated glass card
```

## Customisation

- **Brand name / colours** — edit the `TITLE` constant and colour palette in `Demo.tsx`
- **Timing** — adjust the `T` object at the top of `Demo.tsx`
- **Spring physics** — `damping: 20, stiffness: 80` throughout; tweak per component
