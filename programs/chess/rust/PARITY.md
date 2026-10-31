# CISAB in Rust: parity with the original

The Rust engine (`src/engine.rs`) ports the chess logic of CISAB v14 (CISAB V9,
tape13b save 8) as corrected for the site (`corrected/CHESS.BAS`): pawns
promote and step two squares only from their first row, move lists hold 300
entries, and the opening plays only moves that fit. See `corrected/README.md`.
The parity evidence below is for that edition. It keeps the BASIC
program's variables and follows its statements. Display statements (PRINT@, the
move animation) become events instead. Given the same typed answers, it should
reach the same position as the original after every answer: the same moves
(illegal ones included), the same `B(0-10,0-10)` array (including rows the
screen never shows), the same RND seed and adjective, and the same ending.

## What it takes from the TRS-80

- **RND.** The ROM's generator (14F0h): a 24-bit seed, multiplied by 40E64Dh
  plus 05B065h. It starts at 0 when the machine is switched on. `RND(N)` is
  `INT(N*RND(0)+1)` in single precision. Line 80 uses it to pick the
  adjective, and line 1050 uses it to shuffle the best-scoring moves.
- **Single-precision rounding.** It applies to the scores in lines 3000–3030
  and 1205 (`P2*.91`, `P1*QQ/P2`, `-ABS(D)/VA`). The ROM keeps a guard byte
  and rounds half up. That decides which scores tie, and so which moves get
  shuffled. `.91` and `1E-30` use the bytes Level II stores for them.
- **Move steps.** Every angle in lines 410–650 is a multiple of 45°, so exact
  cosines give the ROM's answers. `FOR M=1 TO 12 STEP .5` makes rooks and
  queens list most squares twice and bishops some three times. Each copy is a
  separate entry in the move list.
- **Errors.** The original stops in the same places, and Rust stops with the
  same message:
  - `?BS Error in 3015` or `3500`: more than 300 moves of CISAB's or yours
    (120 before the fix); not seen since.
  - `?FC Error in 335`: a CISAB pawn on row 1 looks at `B(-1,C)`. With
    promotion fixed, only a pawn put there with ADD can reach it.
  - `?BS Error in 80` or `1050`: RND returns N+1, which can happen but is very rare.
- **Thinking forever.** When every move loses its king, lines 1010–1220
  repeat with nothing changing. The Rust engine detects that state and stops
  with `ThinksForever`.

## Evidence

- `npm run record:chess` plays 22 games against corrected v14 in the emulator
  (trs80-emulator 2.3.1, Model III Level II). It records the prompt, the
  whole B array, the RND seed and the adjective after every typed line.
  - Your moves are random legal moves from a fixed seed, sometimes greedy for
    captures, with castling, en passant and promotion typed through ADD.
  - Some games answer IQ, mistype at OK? or type a CHEAT move.
  - Four scripted games cover the rare endings: taking its king, a
    checkmate, the opening running out, and ADD twice.
- `tests/chess-rust.test.mjs` replays every recorded line into the Rust engine
  and compares each snapshot. It also compares the step table, all 5,292 scores
  lines 3000–3030 and 1205 can produce, and 3,000 RND calls with the ROM's
  results, and runs a short game in the emulator live.
- **Checkmate:** the recorded original had not moved after 900 emulated
  seconds. The Rust engine shows the loop cannot end.

## Differences

- **CLEAR.** Line 1075 ends the look-ahead when CLEAR is held. The Rust engine
  answers at once, so there is nothing to interrupt. The recorded games never
  press CLEAR.
- **Memory.** Line 210's `GOSUB 2000` never returns, so every searched move
  leaves a frame on BASIC's stack. The Rust engine does not model memory. No
  recorded game ran out.
- **Input.** Only well-formed answers are modeled. Moves must be whole
  numbers, and ADD values must be −6 to 6 (the original could be handed
  others). Out-of-range squares give the original's errors.
- **Timing and display.** Not modeled: the TRS-80 took minutes per searched
  move.

The site's board (`modern/player.js` and `src/rules.rs`) adds what the original
never had: it offers you every legal chess move and no others, and it judges
CISAB's moves without changing them. An illegal move (`illegal_reason` in
`src/lib.rs`), or an error that stops the original, disqualifies CISAB. Castling, en passant and promotion
are typed as an operator would have typed them, with ADD. CISAB never sees
anything the original could not have been told.
