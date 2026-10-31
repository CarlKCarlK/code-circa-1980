# CISAB Chess

CISAB is a chess program I wrote in TRS-80 Level II BASIC. The name is BASIC
spelled backwards. The last version's listing begins:

```
10 ' CISAB A COMPUTER CHESS GAME IN BASIC
11 '   BY    CARL MYERS KADIE
```

I competed with it in a tournament in Peoria, my high-school hometown. It is built for that job. It
asks `WHAT COLOR ARE WE`, then `WHAT WAS THEIR FOOLISH MOVE` (the adjective is
picked at random from ten), so whoever sits at the keyboard types in the
opponent's moves and plays CISAB's replies on the real board.

The site opens a Rust port of v14 on a mouse board (see below); the
**Level II BASIC version** tab runs v14 itself, unchanged, in the emulator.
The thirteen earlier versions are kept as source. They run from a program
that only plays itself (v01) to the tournament player (v03 on), then add
look-ahead, piece values and an opening.

## The Rust version

`rust/` ports CISAB v14's chess logic to Rust, compiled to WebAssembly, and
`modern/player.js` puts it on a board you play with the mouse. Given the same
moves, it makes the same replies as the BASIC program, including its illegal
moves and the errors that stop it. To do that it uses the TRS-80's RND and its
single-precision rounding of move scores. `rust/PARITY.md` lists the evidence
and the few differences. Your own moves must be legal chess. Castling, en
passant and promotion are typed with `ADD`, as an operator would have typed
them.

After changing the Rust sources, run `cargo test` in `rust/` and
`npm run build:chess` in `app/`, then commit the regenerated `rust/pkg/`.
`npm run record:chess` re-records the games against the emulator.

## Playing the BASIC version

You play "them"; CISAB is "we". Its pieces are always at the bottom of the
screen, yours at the top.

1. Click the screen so it gets your keys.
2. At `WHAT COLOR ARE WE?` type `WHITE` (CISAB moves first) or `BLACK`
   (you move first), then `Enter`. Only the first letter counts: W means
   White, anything else Black.
3. At `WHAT WAS THEIR … MOVE (ROW,COLUMB,NEW ROW,COULMB)?` type four numbers
   separated by commas, then `Enter`. Rows are numbered 1–8 from the top of
   the screen, columns 1–8 from the left. As White, CISAB opens by moving the
   knight from row 8 column 2 to row 6 column 3; reply `2,5,4,5` to push your
   king's pawn two squares.
4. CISAB shows your move and asks `OK?`. Type `OK` and `Enter`. Then it moves.

The first four replies come from its opening and take a few seconds. After
that it thinks: 1–7 minutes a move on a real TRS-80 in my tests. The site
starts at **Fast (×20)**, so most moves take seconds; **1979 speed** is the
real machine's pace.

### The board

Pieces are letters: `K` king, `Q` queen, `B` bishop, `N` knight, `R` rook,
`P` pawn; `-` is an empty square. A small block after a letter marks a
**White** piece: CISAB's pieces when it is White, yours when it is Black.
When CISAB is Black, the kings and queens swap columns, so the board is
seen from Black's side.

### Answers at OK?

| Answer | What it does |
|---|---|
| `OK` | Makes your move; CISAB replies. |
| anything else, or just `Enter` | Forgets the move and asks for it again (for typos). |
| `ADD` | Makes your move, then asks `GIVE R,C,V`: a row, a column and a piece value to put on that square. `1` king, `2` queen, `3` bishop, `4` knight, `5` rook, `6` pawn; positive for your pieces, negative for CISAB's ("WE ARE NEG."), `0` to empty the square. It then asks `OK?` again, so you can type `ADD` again for another square. |
| `IQ` | Makes your move and turns off CISAB's opening, so it starts thinking at once. |

CISAB only checks that the square you move from holds one of your pieces
(otherwise it flashes `**** CHEAT *****`). It does not check the rest of your
move. Use `ADD` for moves it does not know: castling (move the king, then
`ADD` the rook on its new square and `0` on its old one), en passant, and
promotion.

The game ends when a king is captured. If you take CISAB's king it prints
`DARN THEY BEAT YOU!`. There is no check or checkmate detection.

## How CISAB chooses a move

- It lists every move for its pieces. Bishops, rooks and queens step out
  along angles with `COS` and `SIN` instead of a table of directions.
- First it marks every square the other side attacks (lines 2000–2050:
  it flips the board's signs and generates the other side's moves).
- Each move is scored by the value of the piece it captures divided by
  the value of the piece it puts on an attacked square. Moves that leave
  its most valuable threatened piece where it is score lower (lines
  3000–3030). Values are in line 65: king 100, queen 9, rook 5, bishop and
  knight 3, pawn 1.
- It shuffles the moves with the best score and tries each in turn,
  looking at what the other side could then capture (lines 1050–1210).
  A move that loses the king scores worst (line 9000).

## Versions

The development order is inferred from save order and from the changes:
each listing is the previous one with additions, and v03 starts from v02's
code. The recovery labels V2–V9 are the archive's, inferred from save order;
they do not appear in the programs. No save is dated.

| | Capture | Archive label | What changes |
|---|---|---|---|
| v01 | tape1b save 8 | COMPUTER CHESS | Moves for every piece; takes the most valuable piece it can. Line 80 skips the human move, so it plays itself. |
| v02 | tape1b save 10 | COMPUTER CHESS, self-play variant | Asks `SHOULD I PLAY MYSELF` and `DO I GO FIRST`, so a person can play. |
| v03 | tape13a save 9 | COMPUTER CHESS | Becomes a tournament player: `WHAT COLOR ARE WE`, `WHAT WAS THEIR … MOVE`, `CHEAT`, `OK?`, pawn promotion. |
| v04 | tape13a save 10 | COMPUTER CHESS V2 | Promotes only on the last row; `OH DAMN!` when they capture. |
| v05 | tape13a save 11 | CISAB CHESS EARLY | The C I S A B title; `ADD`; maps the squares the other side attacks. |
| v06 | tape13a save 12 | CISAB CHESS | Piece values and one scoring routine (line 3000). |
| v07 | tape13a save 13 | CISAB CHESS V2 | Pawns may move two squares at the start. |
| v08 | tape13b save 1 | CISAB CHESS V3 | Tries its best moves and looks at the replies before choosing. |
| v09 | tape13b save 2 | CISAB CHESS V4 | `DEFINT` for speed; replies scored by the piece they could take. |
| v10 | tape13b save 3 | CISAB CHESS V5 | A test position of a few pieces; CLEAR to hurry it; printer debugging. |
| v11 | tape13b save 4 | CISAB CHESS V6 | The byline; full board again; scores differently when its king is threatened; faster animation. |
| v12 | tape13b save 5 | CISAB CHESS V7 | Puts the board back properly after each trial move. |
| v13 | tape13b save 6 | CISAB CHESS V8 | Another test position (kings and queens); half-square steps. |
| v14 | tape13b save 8 | CISAB CHESS V9 | Four-move opening, `IQ`, a lost king scores worst, `DARN` for `DAMN`. Runs on the site. |

Other saves: tape1b2 is a second capture of the same side, and its saves 8
and 10 are identical to v01 and v02. Two saves are damaged:

- tape1b save 9 (and tape1b2 save 9): a 50-line prefix, identical to v02's
  first 50 lines; probably an earlier save of v02.
- tape13b save 7: a 38-line prefix, saved between v13 and v14. It has
  v14's full board but v13's `DAMN` and no opening.

Their recovered files are in [partial/](partial/), unchanged and not playable.

## Quirks kept from the original

From reading the v14 source; only the behaviors in VERIFICATION.md were run.

- `COLUMB` and `COULMB` for "column".
- `CHECKMATE.....i WON!` can never print: line 1330 tests `R`, which by
  then is a loop counter, not a score. If CISAB takes your king, it just
  asks for your next move.
- Your pawns are never promoted: line 110 clears the move's row and column
  before checking for promotion. CISAB's promotion check (line 1300) looks
  at the target square before its pawn moves there. Use `ADD`.
- Its opening moves only check that the piece is still on its starting
  square, not that the path is clear.
- Line 1075 looks for CLEAR (`\` on the site's keyboard) between trial moves
  to stop the look-ahead. Holding it during CISAB's second move made no
  difference in my tests.
- Line 12100 is never reached.
