# 3-D Plot — verification

Recovery evidence (byte-identical left/right payloads, BASIC structure) is in
the archive and summarized in `provenance.json`. This file records new
execution evidence from 2026-10-30. Neither file claims that every historical
routine has been exercised.

## Import checks (`npm test`, `tests/archive.test.mjs`)

All three snapshots match the archive SHA-256 hashes and recovery records:
pointer-consistent BASIC lines, end markers, line counts (v01 21, v02 28,
v03 42) and last lines, and listings identical to `decodeBasicProgram`. The
repeated saves tape5a save 2 and tape23a save 11 have the same hash as v03;
tape25a save 18 differs only in byte 3, the cassette name (G instead of P).
The damaged tape29a save's validated 17-line prefix has the same listing text as
v03's first 17 lines, with pointer base 22204 instead of 17125. Each
`plot3d-vNN` tag's `original/PLOT3D.BAS` and `PLOT3D.ASC` were checked against
the snapshot hashes.

## Original versions in the emulator (headless, trs80-emulator 2.3.1)

A scratch harness like `tests/helpers/balancer-reference.mjs` ran each version
on the library default (Model III, Level II BASIC, as on the site) and rendered
the 128 × 48 block-graphics screen as text:

- v01 stops at once with `?L3 Error in 150` (the `LINE` statement).
- v02 draws a flat, tilted 7 × 7 grid and prints `D`, as the source describes.
- v03 with Enter at all five prompts draws the funnel (562 lit dots) and prints
  `D` after about 82 emulated seconds; typing all five Enters at once gives the
  same picture (86 s). `SWITCH ON` = `YES` redraws the same picture and takes
  169 s. `TILT` 0 gives a side view; `TILT` 1, `X SCALE` 1.5, 11 lines draws a
  denser, steeper, partly clipped grid.

## Browser (`npm run test:browser`, `tests/browser/plot3d.spec.js`)

Against a production preview: the card reads "04 / Graphics" and opens
`#/program/plot3d/basic/play` directly; About is open and lists the quirks; Help
shows the questions; v01 and v02 are source only and link to the player. In the
emulator the title and `TILT?` appear, the Standard settings button answers all
five prompts, the grid draws until `D` appears (over 400 lit dots), and Pause,
Resume and Restart work (Restart returns to an empty screen at `TILT?`).

## Not tested

Non-default answers in the browser, error cases such as 1 line, and phone
keyboards. The quirks listed in README.md come from reading the source.
