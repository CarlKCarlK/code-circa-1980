# Verification

Imported November 2, 2026. Every complete raw payload and readable listing is
byte-identical to the recovery archive. BASIC validation checks ordered lines,
a single pointer base, exact record coverage, the end marker, and listing counts.
Canonical tags and current originals are verified by
`python3 app/scripts/verify-second-gallery.py`.

Representative real-emulator checks in app/tests/browser/science-five.spec.js:
Space reaction and printed result, return to menu, interval input and result, gunfight D input/outcome, pause/resume, and restart. No exhaustive timing calibration or winning-gunfight claim.

The original payload runs through the Z80 and BASIC ROM; no modern gameplay
implementation substitutes for it. These checks do not establish exhaustive
historical correctness. Per-program limits are documented in README.md.
The final production/release and browser evidence will be appended below.
