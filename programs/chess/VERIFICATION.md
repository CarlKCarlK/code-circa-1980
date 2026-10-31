# CISAB Chess — verification

Recovery evidence (tape1b, tape13a and tape13b captures, byte-identical
left/right payloads, BASIC structure) is in the archive and summarized in
`provenance.json`. This file records new execution evidence from 2026-10-31.
Neither file claims that every historical routine has been exercised.

## Import checks (`npm test`, `tests/archive.test.mjs`)

All fourteen snapshots match the archive SHA-256 hashes and recovery records:
pointer-consistent BASIC lines (base 17125), end markers, line counts (v01 74
through v14 125) and last lines, and listings identical to `decodeBasicProgram`.
tape1b2 saves 8 and 10 have the same hashes as v01 and v02. The damaged saves
in `partial/` are byte-for-byte copies of the archive files, and the tape1b and
tape1b2 save 9 prefixes are identical. Each `chess-vNN` tag's
`original/CHESS.BAS` and `CHESS.ASC` were checked against the snapshot hashes
as they were committed.

## v14 in the emulator (headless, trs80-emulator 2.3.1)

`tests/helpers/chess-reference.mjs` runs a version on the site's configuration
(Model III, Level II BASIC) and answers its prompts. `tests/chess-original.test.mjs`
(part of `npm test`) checks:

- As White, CISAB's first move is the knight from row 8, column 2 to row 6,
  column 3; after `2,5,4,5` and `OK`, its second is the other knight to row 6,
  column 6. Each takes a few emulated seconds.
- As Black, `ADD` makes the move and asks `GIVE R,C,V`; `5,4,2` puts a queen
  of yours on row 5, column 4, and `OK?` returns.
- Moving a piece onto CISAB's king prints `DARN THEY BEAT YOU!` and ends at READY.

Scratch runs with the same helper also showed:

- As White, after `2,4,4,4`, `2,5,4,5` and `1,7,3,6` (three more book replies,
  the last a bishop to row 5, column 3), the searched replies took 408, 81 and
  78 emulated seconds.
- As Black, after `2,5,4,5` and `IQ` (no opening), it pushed a rook's pawn two
  squares after about 64 emulated seconds. Holding CLEAR (`\`) from 1, 20 or
  40 seconds into that search gave the same move in the same time.
- After `ADD` put your queen next to its king, `IQ` led to its king taking the
  queen after about 74 emulated seconds.

## Browser (`npm run test:browser`, `tests/browser/chess.spec.js`)

Against a production preview: the card reads "05 / Game" and opens the one
playable version at `#/program/chess/basic/play` directly; About is open with
the history; Help shows the move format and the OK? answers; v01 is source only
and links to the player; Fast (×20) is selected at start. In the emulator:
WHITE's button answers the first prompt and the knight appears on row 6,
column 3; a typed `2,5,4,5` and the OK button bring its second book move;
Pause, Resume and Restart (with confirmation) work. As Black with `IQ`, its
first searched move took about 4 seconds at Fast (×20).

The fast mode runs at real speed while a key is held. Without this, a
keypress of about 0.1 s lasted 2 emulated seconds, the ROM repeated the key,
and CISAB stopped with `?OV Error in 80`.

## Not tested

A full game, castling or promotion with `ADD`, CISAB capturing your king,
pawns reaching the last row, games longer than a few moves, the earlier
versions v01–v13 in the emulator, and phone keyboards. The quirks listed in
README.md come from reading the source; only the behaviors above were run.
