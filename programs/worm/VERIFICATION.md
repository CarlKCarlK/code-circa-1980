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

Original v04. Rule and starting coordinates accepted; a visible path drawn; pause/resume and restart verified. A separate direct-ROM probe ran six different rules for 100 emulated seconds apiece; some stop with D and others produce longer traces.

Limits: Only sampled rules and coordinates were tested; no exhaustive pattern enumeration.

The frozen web v1 also opens directly, reaches its initial prompt or final sample
output as applicable, downloads its selected payload, and returns to More.
See `verification/screen.png` for the captured original-emulator display.
`provenance.json` records its hash and keeps this new execution evidence separate
from the original recovery-inventory evidence.

Unit tests, production build, all 114 canonical/snapshot checks, and preservation
of all 32 active web releases pass. The final browser-suite result is recorded
in docs/next-six-programs.md.

## Article research and optional speed — November 2, 2026

The publisher record verifies Martin Gardner, November 1973, volume 229 issue 5,
starting page 116, and DOI 10.1038/scientificamerican1173-116. MIT’s repository
verifies Michael Beeler’s June 1973 AIM-290 and provides a PDF download. The
article’s connection to the BASIC grid/rule tables is labeled as a source-based
interpretation; see history/scientific-american.md.

The current unshared web v1 was refreshed with these links and a speed selector.
Original (1×) remains the default; Fast (20×) targets accelerated execution of
the same original payload. It does not change the worm’s rules or reset its path.
Actual speed depends on browser scheduling and CPU availability.

Three targeted browser tests pass: original rule/coordinate entry and drawing,
development history links/speed control, and frozen-v1 history links/speed
control. The speed tests observe increased Z80 cycle progress (over 3× the
original-speed sample), preserved path text, stopped cycles while paused,
Help pausing/restoring the machine, retained 20× after Restart, and switching
back to 1×. Both reference links appear in About and Help.

Unit tests and production build pass; all 32 current release hash manifests
validate. Comparison against c5d08db confirms all recovered Worm One snapshots
and canonical originals are unchanged and no other frozen player was modified.
The authorized unshared v1 refresh is retained in Git history and tagged
worm-web-v1-speed, without advancing the web version number.

The complete browser regression run passes all 100 cases (5.1 minutes), including
the new speed/link checks and all six additional programs’ source and frozen-v1
scenarios. No pending browser failures remain from this change.
