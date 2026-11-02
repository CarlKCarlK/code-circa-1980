# Verification

Imported November 2, 2026. All raw payloads and listings are byte-identical to
the recovery archive. Ordered line records, a consistent pointer base, exact
record coverage, and the normal end marker validate every complete payload.
The listing matches the local decoder and the BASIC record count. Historical
bugs and original spelling are preserved.

`python3 app/scripts/verify-second-gallery.py` verifies snapshot hashes, every
canonical tagged Git blob, and the final canonical original. `npm test` runs
archive validation; `npm run build` checks production bundling and types.
Program-specific browser checks are in `app/tests/browser/next-six.spec.js`.

## Emulator execution — November 2, 2026

Stock-ROM adapted v04. YES first-player choice, 1,1, move, computer reply, 0,0,C feedback, new-round prompt, pause/resume and restart verified. Two additional tests verify exact adaptation artifacts, unchanged other records, and expression evaluation in the actual Level II ROM.

Limits: No claim of correct learning, optimal play, win detection, or complete rule enforcement. Original prototype bugs remain documented.

The frozen web v1 also opens directly, reaches its initial prompt or final sample
output as applicable, downloads its selected payload, and returns to More.
See `verification/screen.png` for the captured original-emulator display.
`provenance.json` records its hash and keeps this new execution evidence separate
from the original recovery-inventory evidence.

Unit tests, production build, all 114 canonical/snapshot checks, and preservation
of all 32 active web releases pass. The final browser-suite result is recorded
in docs/next-six-programs.md.

Gallery-art correction, November 2, 2026: the illustration now uses a square
270-by-270 board with equal 90-by-90 cells, equal-diagonal X marks, and a round
O. Desktop and 390px captures were inspected; the gallery image/link/layout
check, unit tests, and production build pass. The provenance artwork hash is
updated. This gallery-only change leaves the frozen v1 player unchanged.
