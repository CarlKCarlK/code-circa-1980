# Verification

Imported November 2, 2026. Snapshots match the recovery archive byte for byte.
Complete BASIC saves have ordered records, one pointer base, exact record coverage,
and an end marker. Listings match the converter and numbered record count.
Canonical tags/current originals are checked by verify-second-gallery.py.

## New emulator execution — November 2, 2026

Browser shows the original placement search progressing through stored words and responds to speed/pause/restart controls. A separate full original-ROM run reaches DONE, fills all 225 cells, lists included words after Space, and redraws the identical grid after another Space.

Limits: Browser tests bound the slow search rather than waiting for full completion; the full end-to-end result is from the direct ROM harness. Actual accelerated speed depends on device capacity.

The browser cases are in app/tests/browser/related-more.spec.js. The captured
screen and SHA-256 are recorded separately from recovery-stage evidence in
provenance.json. All 133 canonical/snapshot checks, five damaged-recording
verifications, unit tests (19 test files), and production build pass. All 42
active release manifests validate. The full browser result is recorded in
docs/related-more-programs.md.

## Spelling-corrected player

The player now selects the separate corrected derivative of tape4a save 7.
Reproduction checks verify its bytes, listing, change manifest, record count, and
original pointer base. Exactly records 1330, 2000, and 3000 change; every other
record body is byte-identical. The canonical originals and snapshots still pass
the 133-snapshot archive check. All 19 unit-test files, the production build,
and all 42 release manifests pass. The local unshared experience remains v1.

The original full-ROM run above remains evidence for the unmodified payload.
The corrected full-ROM result is recorded separately in
verification/corrected-full-rom-run.json.

The corrected payload completed in 15,883.98 emulated seconds (226.34 wall
seconds in the direct-ROM harness). Its included-word display contains
DISCUSSION and no DISSCUSSION, the redraw prompt says REPRINT, and a second
Space redraws the identical 225-letter grid. This measures the harness run,
not a browser speed guarantee. SOLVENT is in the unused list and is verified
in the derivative bytes rather than the default runtime path.
