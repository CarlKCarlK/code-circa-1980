# Armatron-80 verification

Armatron-80 is new 2026 code. Nothing here is recovery evidence.

## Headless ROM run (November 13, 2026)

`node scripts/check-armatron.mjs --json ../programs/armatron/verification/rom-check.json`
loads `versions/v01/ARMATRON.BAS` into trs80-emulator 2.3.1 (stock Model III Level II ROM).
It runs at 1× emulated time and holds real keys in the keyboard matrix. It checked:

- The title, status line, help line, floor dots, solid arm, and dotted ghost arm are drawn.
- Holding Q (base), W (shoulder), Left arrow (camera orbit), and Z (zoom) redraws the scene.
- Space starts auto-reach. On target #0 it brought the fingertip distance from 3.63 to 0.07,
  stopped by itself, and printed a success quip.
- N advances to target #1, 1 starts the dance, and 0 resets the pose and stops it.

The results and emulated time are in `verification/rom-check.json`.

## Browser

`app/tests/browser/armatron.spec.js` checks only the site's JavaScript, as for other More
programs: the card, the direct player link, Max as the default speed, emulation staying faster
than 3× while a key is held, the speed selector, Help, and the listing download.

## Limits

Greedy auto-reach can stop in a local minimum short of the 0.30 success distance on some
targets. Only targets #0 and #1 were exercised. Pixel-level output wasn't compared with Linkage
Blaze, which runs at 320×240 with its own renderer.
