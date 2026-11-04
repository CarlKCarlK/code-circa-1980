# Bomb — verification

Recovery evidence (tape17a capture, byte-identical left/right payloads, BASIC
structure) is in the archive and summarized in `provenance.json`. This file
records new execution evidence from 2026-10-31. Neither file claims that every
historical routine has been exercised.

## Import checks (`npm test`, `tests/archive.test.mjs`)

Both snapshots match the archive SHA-256 hashes and recovery records:
pointer-consistent BASIC lines (base 17125), end markers, line counts (v01 134,
v02 93) and last lines (45020 and 5090), and listings identical to
`decodeBasicProgram`. Each `bomb-vNN` tag's `original/BOMB.BAS` and `BOMB.ASC`
were checked against the snapshot hashes when committed.

## Original versions in the emulator (`npm test`, `tests/bomb-original.test.mjs`)

Headless, trs80-emulator 2.3.1 on the site's configuration for Bomb: a stock
Model I (Level II BASIC, original character generator), started as the site
starts it (answer MEMORY SIZE?, then load and RUN at READY). The test reads each
color from the wire box and types it back in unshifted keys, holding each for
0.1 s, because the program reads answers with INKEY$ and misses keys that are
released too quickly.

- v02: the attract screen (TO PLAY DEPOSIT $.25 IN BOX, THEN PRESS ANY BUTTON)
  appears; a key starts the game; Enter turns both instruction pages, and the
  second shows YOU WILL BE TOLD in capitals (the source has yOU). At the
  starting speed each wire is shown for about 2.06 emulated seconds. Typing the
  wires back defuses the bomb (SO FAR YOU HAVE CUT n WIRES, RANKED NUMBER 1);
  YES at DO YOU WANT TO RETIRE? asks for initials and shows the double-width
  rankings with the score and initials.
- v02: a first wire typed with a wrong last letter, corrected with backspace,
  looks right on screen but sets off the bomb; the correct order is shown and,
  with no wires cut, the program returns to the attract screen.
- v02: waiting at the first wire prompt sets off the bomb after 21–25 emulated
  seconds (about 23).
- v01: choice 1 at the menu starts Bomb (MR. XX); a wrong first wire sets off
  the bomb and shows the correct order and HIGH SCORE IS 38  BY CMK.

Scratch runs during the import (not kept as tests), on the Model III the site
first used, also won six v02 bombs in a row, with the display time per wire
shrinking from about 1.9 to 0.5 seconds, and won a v01 bomb. On the Model I,
v01's answer limit is about 23 seconds. v01's radio intersection drew its
circles; its binary search was not exercised.

On a Model I the library types a capital letter as Shift+letter, which the ROM
stores as lowercase while showing a capital, so a wire typed that way does not
match. The site's player sends letters unshifted (and forces each letter's shift
state), so a player holding Shift is not affected. Text typed by the YES and NO buttons
or pasted is sent in lowercase on a Model I for the same reason; the browser test
checks that YES retires.

## Browser (`npm run test:browser`, `tests/browser/bomb.spec.js`)

Against a production preview: the card reads "06 / Game" and opens the player at
`#/program/bomb/basic/play` directly, with no edition tabs; it runs v02. About
mentions Nefarious Nick and MR. XX; Help explains that typos cannot be fixed and
lists the colors; v01 is source only and links to the player. In the emulator, a
key starts the game from the attract screen, the on-screen Enter key turns the
first page, the test reads the wires from the screen and types them with the
keyboard, the bomb is defused, the YES button retires, initials appear in the
rankings, and Pause, Resume and Restart work.

## Saved and shared scores (2026-11-03)

`tests/bomb-original.test.mjs` reads a real ranking from the running ROM's memory;
`tests/bomb-scores.test.mjs` runs the Worker against SQLite: ranking, validation, other
origins, rate limits and no stored addresses. `tests/browser/bomb.spec.js` plays a game
into the panel with the shared list faked, checks that the score posts once and survives
Restart and reload, and that the game plays when the list is unavailable.

## Not tested

Long games near the fastest speeds, ten or more ranked players, the rankings
during the attract cycle in the browser, v01's binary search, and phone
keyboards (answers must be typed on a keyboard; the on-screen keys cover only
Enter, any key, YES and NO). The quirks listed in Help come from reading the
source, except the backspace and timing behavior run above.
