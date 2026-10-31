# Alien — verification

Recovery evidence (tape22b capture, byte-identical left/right payloads, BASIC
structure) is in the archive and summarized in `provenance.json`. This file
records new execution evidence from 2026-10-30. Neither file claims that every
historical routine has been exercised.

## Import checks (`npm test`, `tests/archive.test.mjs`)

Both snapshots match the archive SHA-256 hashes and recovery records:
pointer-consistent BASIC lines (base 17125), end markers, line counts (v01 214,
v02 251) and last lines, and listings identical to `decodeBasicProgram`. The
repeated saves 7 and 9 have the same hashes as saves 6 and 8. Each `alien-vNN`
tag's `original/ALIEN.BAS` and `ALIEN.ASC` were checked against the snapshot hashes.

## Original versions in the emulator (headless, trs80-emulator 2.3.1)

A scratch harness like `tests/helpers/balancer-reference.mjs` ran each version on
the library default (Model III, Level II BASIC, as on the site), typing at each prompt:

- v02: the title draws ALIEN and prints IN SPACE NO ONE CAN HEAR YOU SCREAM.;
  DO YOU NEED BACKGROUND INFORMATION? appears after about 52 emulated seconds.
  After NO, PLEASE WAIT A MOMENT lasts about 20 seconds (junction shuffling).
  A move (M, 1), a close (C → JUCTION # 1 IS NOW CLOSED), and a one-junction
  spray (S, 1, 5 → MISSED) all responded as the source describes.
- Starting worlds (v02): two full runs that watched the title both started in
  junction 18 (vents 1, 5, 6); runs that skipped the title with a key after about
  5 or 26 emulated seconds both started in junction 9 (vents 20, 4, 15). The
  emulator's Restart resets the machine and reboots the ROM before running.
- v01: after NO, a two-junction shot ended with AHA! YOU GOT THE ALIEN!,
  BOY, THAT WAS CLOSE.  BUT YOU WON! and the SAME SET-UP prompt.

## Browser (`npm run test:browser`, `tests/browser/alien.spec.js`)

Against a production preview: the card reads "03 / Game" and opens
`#/program/alien/basic/play` directly; the About section is open and credits
Gregory Yob and *More BASIC Computer Games*; Help shows the commands; v01 is
source only and links to the player. In the emulator, a key skips the title, the
NO button answers the first prompt, a move through the first listed vent gets the
original program's answer, and Pause, Resume and Restart work.

## Not tested

Winning or losing in the browser, vacuum and computer-failure hazards, trapping
the alien, every spray path, replay with SAME SET-UP, and phone keyboards. The
quirks listed in README.md come from reading the source; only the behaviors
above were run.
