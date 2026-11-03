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
