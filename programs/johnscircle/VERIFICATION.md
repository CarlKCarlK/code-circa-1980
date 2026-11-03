# Verification

Imported November 2, 2026. Every complete raw payload and readable listing is
byte-identical to the recovery archive. BASIC validation checks ordered lines,
a single pointer base, exact record coverage, the end marker, and listing counts.
Canonical tags and current originals are verified by
`python3 app/scripts/verify-second-gallery.py`.

Representative real-emulator checks in app/tests/browser/science-five.spec.js:
First circle, second ellipse, changed screen output, pause/resume, and restart.

The original payload runs through the Z80 and BASIC ROM; no modern gameplay
implementation substitutes for it. These checks do not establish exhaustive
historical correctness. Per-program limits are documented in README.md.
## Recorded emulator evidence — November 2, 2026

Input 40,20 draws a circle; 50,10 draws a second ellipse; changed graphic output, pause/resume and restart pass.

Limits: No exhaustive radii or out-of-bounds inputs; original floating-point behavior and existing-drawing behavior remain.

`verification/screen.png` is an actual emulator capture; its hash and the new
execution record are in provenance.json. The gallery SVG is a separate modern
illustration. Recovery-inventory execution flags remain historical evidence.

All 121 snapshot/canonical checks, strict BASIC/listing validation, unit tests,
and the production build pass. All 37 web release manifests validate against
the pre-import commit without changing an existing release. Final browser-suite
results are recorded in docs/five-science-programs.md.

The full browser regression run passes all 112 cases (5.5 minutes), including
all five new frozen-v1 startup/download/navigation checks.
