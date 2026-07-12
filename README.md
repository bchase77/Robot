# wheresmystuff

A 3D simulation environment for developing and evaluating RF-based object
localization ("tags") in indoor spaces.

## Goal

Model a 3D space (rooms, walls, furniture, metal objects, glass, etc.) and
place "tags" — small battery-powered devices — inside it. Each tag
communicates over one or more radio links (BLE, sub-GHz/900 MHz, Wi-Fi,
UWB, ...) and may also carry a camera or light sensor for extra
situational awareness. The simulator visualizes the scene in 3D with
proper occlusion/lighting and estimates how each tag-to-tag radio link is
affected by:

- **Distance** (free-space path loss)
- **Obstructions** in the line-of-sight path (metal, drywall, concrete,
  glass, wood — each attenuates differently, and attenuation varies by
  frequency)
- **Radio technology tradeoffs** (range vs. power draw vs. sensitivity)
- **Power budget** — tags are small, so battery life under a given radio's
  transmit current matters as much as link quality

The end goal is to explore tag/antenna/radio designs and placement
strategies that keep tags locatable even when metal objects or walls sit
between them, without blowing the power budget.

## Current state (v0)

This is a first-pass scaffold, not a finished simulator:

- `src/lib/types.ts` — data model for scene objects, tags, and radio
  profiles (BLE, 900 MHz, Wi-Fi 2.4, UWB) with rough per-material
  attenuation constants.
- `src/lib/geometry.ts` — segment-vs-box intersection test, used to find
  which objects sit between two tags.
- `src/lib/radioModel.ts` — free-space path loss + per-obstacle material
  loss → RSSI, link margin, connected/dead, and an optimistic battery-life
  estimate.
- `src/components/Scene3D.tsx` — `react-three-fiber` scene rendering
  objects (colored/shaded by material), tags, and link lines
  (green = connected, red dashed = dead).
- `src/app/page.tsx` — editable scene: add/remove objects and tags, tweak
  position/size/material/radio/power/battery, and see a live link-budget
  table.

The propagation model is intentionally simple (free-space path loss plus a
flat per-obstacle dB penalty by material) — good enough to compare radio
technologies and placements qualitatively, not a substitute for real RF
measurement. Likely next steps: multipath/reflection effects, tag
orientation and antenna patterns, camera/light-sensor field-of-view
modeling, and duty-cycled (not continuous-TX) power estimates.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + `three.js` /
`@react-three/fiber` / `@react-three/drei`.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
