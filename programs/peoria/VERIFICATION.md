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

Original v04. Skill 1 and driver count 1 accepted; countdown, scrolling road, held-arrow input, pause/resume and restart verified.

Limits: Two-driver controls were read from the source but not exercised in the browser. No complete five-stage scoring audit.

The frozen web v1 also opens directly, reaches its initial prompt or final sample
output as applicable, downloads its selected payload, and returns to More.
See `verification/screen.png` for the captured original-emulator display.
`provenance.json` records its hash and keeps this new execution evidence separate
from the original recovery-inventory evidence.

Unit tests, production build, all 114 canonical/snapshot checks, and preservation
of all 32 active web releases pass. The final browser-suite result is recorded
in docs/next-six-programs.md.
