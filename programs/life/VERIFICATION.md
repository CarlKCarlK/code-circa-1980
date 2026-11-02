# Verification

Imported raw and readable files match the recovery archive byte for byte.
Every complete BASIC snapshot has ordered records, one pointer base, and an exact end marker; LIFE instead has valid EDTASM source records and its 1A terminator.
Canonical local commits/tags preserve each original revision.

Browser startup and representative controls are exercised by app/tests/browser/learning.spec.js. Verified November 2, 2026: Original assembly editor responds to arrows and Space, Enter begins generation output, Escape clears back to editing, pause/restart. A direct Z80 fixture verifies a three-cell horizontal blinker becomes vertical. The executable is newly assembled from untouched v06 source; no recovered machine code is claimed. Recovery validation does not establish that every historical routine works.

## Corrected derivative and web v2 — November 2, 2026

The current player uses `corrected/`, derived from untouched v06. The only source
change is LD BC,991 → LD BC,992 immediately after CALL GEN. The assembled binary
changes only offset 35 (address 32803), DF → E0. `corrected/build.json` records
hashes and the exact patch; the unchanged bootstrap is copied from `derived/`.

Reproduce from `app/` with `npm run build:life-corrected`, then run
`node tests/life-corrected.test.mjs`. All eight checks pass. These execute the
actual Z80 initialization and complete MAIN loop, including its real LDIR copy,
rather than substituting a JavaScript copy. Six consecutive generations each
of block, blinker, glider, edge blinker, corner glider, and an isolated bottom-right
cell match independent Conway rules on the 64 × 48 wrapping field. The untouched
executable separately reproduces the isolated corner cell remaining alive.

`npm test` and `npm run build` pass. Release integrity checks verify all 27 frozen
releases. The three targeted Playwright checks pass: editable corrected player,
frozen corrected web v2, and original frozen web v1. Controls exercised include
drawing, arrows, Enter, Escape, pause/resume, and restart; v2 also exposes its
corrected assembly and executable download. The full browser suite runs separately.
The recovered original and version files, original derived build, and web v1
remain unchanged. This verifies representative behavior, not every possible
population or hardware configuration.
