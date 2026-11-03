# Verification

Imported November 2, 2026. Snapshots match the recovery archive byte for byte.
Complete BASIC saves have ordered records, one pointer base, exact record coverage,
and an end marker. Listings match the converter and numbered record count.
Canonical tags/current originals are checked by verify-second-gallery.py.

## New emulator execution — November 2, 2026

HELLO + KEY + ENCODE produces SJJWT; restart and DECODE restores HELLO. Actual-ROM fixtures also verify ABC/B and space/wrapping boundaries; artifact regeneration and unchanged other records pass.

Limits: Only letters/spaces and keywords up to ten letters are supported by the tested examples. Other punctuation/input limits retain source behavior. Only the separate five-record derivative is the working default.

The browser cases are in app/tests/browser/related-more.spec.js. The captured
screen and SHA-256 are recorded separately from recovery-stage evidence in
provenance.json. All 133 canonical/snapshot checks, five damaged-recording
verifications, unit tests (19 test files), and production build pass. All 42
active release manifests validate. The full browser result is recorded in
docs/related-more-programs.md.
