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
The final production/release and browser evidence will be appended below.
