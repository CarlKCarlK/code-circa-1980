# Verification

Imported November 2, 2026. Every complete raw payload and readable listing is
byte-identical to the recovery archive. BASIC validation checks ordered lines,
a single pointer base, exact record coverage, the end marker, and listing counts.
Canonical tags and current originals are verified by
`python3 app/scripts/verify-second-gallery.py`.

Representative real-emulator checks in app/tests/browser/science-five.spec.js:
Speed/angle/scale input, visible path, DONE, flight summary, pause/resume, and restart.

The original payload runs through the Z80 and BASIC ROM; no modern gameplay
implementation substitutes for it. These checks do not establish exhaustive
historical correctness. Per-program limits are documented in README.md.
## Recorded emulator evidence — November 2, 2026

Speed 20 m/s, 45 degrees, screen height 40 m; visible plot, DONE, flight summary, pause/resume, and restart.

Limits: No exhaustive scales, angles, or boundary/wrap cases. The earlier unfinished source is preserved but not claimed playable.

`verification/screen.png` is an actual emulator capture; its hash and the new
execution record are in provenance.json. The gallery SVG is a separate modern
illustration. Recovery-inventory execution flags remain historical evidence.

All 121 snapshot/canonical checks, strict BASIC/listing validation, unit tests,
and the production build pass. All 37 web release manifests validate against
the pre-import commit without changing an existing release. Final browser-suite
results are recorded in docs/five-science-programs.md.

The full browser regression run passes all 112 cases (5.5 minutes), including
all five new frozen-v1 startup/download/navigation checks.
