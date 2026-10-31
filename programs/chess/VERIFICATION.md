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
(part of `npm test`) runs the corrected edition the site plays; the
observations below held for the recovered v14 as well. It checks:

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

## Rust version (`rust/`, `modern/player.js`)

Recorded with `npm run record:chess` on 2026-10-31 and replayed by
`tests/chess-rust.test.mjs` (part of `npm test`):

- **22 games against corrected v14** (`corrected/CHESS.BAS`) **in the
  emulator.** After every typed line, the Rust engine had the same prompt,
  the same B(0-10,0-10) array, the same RND seed and adjective, and the same
  ending as the BASIC program. That covers 18 random-legal games, some
  answering IQ, mistyping at OK?, typing CHEAT moves, or castling, taking en
  passant and promoting through ADD, plus 4 scripted games.
- **No error stopped any of the 18 random games**; each reached its move
  limit. The same games recorded against the recovered v14, before the
  corrections, ended with `?BS Error in 3015` (7 games) and
  `?FC Error in 335` (4 games).
- **Scripted endings:**
  - `DARN THEY BEAT YOU!`;
  - a checkmate: Rust reports it loops forever, and the BASIC program made no
    move in 900 emulated seconds;
  - with the opening squares emptied through ADD, CISAB thinks (line 9540)
    where v14 stopped with `?RG Error in 10020`.
- **Arithmetic:** the step table of lines 410–650, all 5,292 scores lines
  3000–3030 and 1205 can produce, and 3,000 RND calls match what the ROM
  computes. The step table and a game through a searched move are also
  checked against the emulator live, as part of `npm test`.

Browser (`tests/browser/chess.spec.js`): the collection and `#/program/chess`
open the Rust board. Clicking and dragging move pieces, and dots mark your
legal squares. CISAB's book replies appear in the move list. Unchecking the
opening sends IQ, after which CISAB searches. Play Black makes CISAB open
with Nc3 on a board shown from Black's side, and New game works. The
Level II BASIC tab runs corrected v14. At 390 px wide there is no horizontal
scrolling. An illegal move disqualifies CISAB. In the test, after e3, Bc4 and Bxf7+,
its opening plays d7-d5 while in check, and the board ends the game.
Rust unit tests check your 20 opening moves, castling typed with ADD, an en
passant capture offered after its pawn steps two squares, and a blocked
opening move being skipped.

`tests/chess-corrected.test.mjs` rebuilds the corrected edition from the
recovered v14 bytes. It checks that only the listed lines changed, and that
every other line keeps its recovered bytes.

## Not tested

A full game in the BASIC player, castling or promotion typed by hand with `ADD` in the BASIC player, CISAB capturing your king,
pawns reaching the last row, games longer than a few moves, the earlier
versions v01–v13 in the emulator, and phone keyboards. The quirks listed in
README.md come from reading the source; only the behaviors above were run.
