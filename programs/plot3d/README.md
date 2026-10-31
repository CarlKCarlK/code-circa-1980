# 3-D Plot

Answer a few questions and the TRS-80 draws a 3-D surface as a wire grid, one
block-graphics dot at a time. The surface is a funnel: flat at the rim, dropping
steeply into a point at the centre, like a gravity well. The program prints
`3-D PLOT   (C) 1979   CARL KADIE`.

## Running it

1. Click the screen so it gets your keys.
2. Press `Enter` at each of the five prompts to keep the standard settings
   (the program calls them "STANDARD PERIMETERS"):
   `TILT?`, `X SCALE?`, `Y SCALE?`, `SWITCH ON?` and `HOW MANY LINES?`.
3. Watch. With the standard settings the picture takes about 80 seconds.
   A `D` in the top-left corner means done. Restart to draw another.

| Prompt | Standard | What it does |
|---|---|---|
| `TILT` | `.5` | How far the far edge of the grid is shifted up and to the left. `0` gives a side view; larger values look down on it more. |
| `X SCALE` | `1` | Width: 1 is 30 dots each side of centre. |
| `Y SCALE` | `1` | Height: 1 is 15 dots each way. |
| `SWITCH ON` | not `YES` | `YES` draws the whole picture a second time over the first. Nothing changes, so it only doubles the time. |
| `HOW MANY LINES` | `7` | Grid lines in each direction. Odd numbers put a line through the centre point. `1` stops with a division-by-zero error. |

## How it works

For each grid point (X, Z) from −1 to 1, the height is
Y = 1 − 1/√(18X² + 18Z²) (Y = −1 at the centre). The screen position is an
oblique projection: `GX = 63.5 + X·DX − Z·DX·TILT` and
`GY = 23.5 − Y·DY + Z·DY·TILT`. Points off the 128 × 48 screen lift the pen.
TRS-80 Level II BASIC has no line command, so a subroutine (lines 360–420)
draws each segment with `SET`, stepping one dot at a time along it.

The program draws the grid twice: first rows of constant Z, then rows of
constant X.

## Versions

The order is inferred from the source, not from dates:

1. **v01** (tape19b save 2): the bare surface, a 7 × 7 grid drawn with
   `LINE(GX,GY)-(OX,OY),SET`. Level II BASIC has no `LINE`, so it stops with
   `?L3 Error in 150`. It was saved with a higher program start than Level II
   uses (pointer base 22204 instead of 17125), so it was probably written under a
   DOS or BASIC extension that had `LINE`. Source only.
2. **v02** (tape19b save 10): replaces `LINE` with the `SET` line-drawing
   subroutine, and sets `Y=0`, which draws a flat tilted grid (apparently a test
   of the new routine). Source only.
3. **v03** (tape5a saves 1–2; also tape23a save 11, identical): adds the title,
   the prompts and the 1979 credit, restores the funnel, and keeps v02's
   subroutine verbatim. A later save on tape29a is damaged; its recovered first
   17 lines match v03. **The site runs v03.**

## Quirks kept from the original

- `PERIMETERS` for "parameters".
- `SWITCH ON` sets a flag that only makes the program draw the same picture again.
- `NO` (line 210) is tested but never set.
- `Z1`–`Z6` are set to 67, 75, 65, 68, 73, 69, the character codes of
  `CKADIE`, and never used. `PI` and `E` are also computed and never used.
- Variable names are longer than BASIC sees: Level II reads only the first two
  letters, so `TILT`, `XSCALE`, `YSCALE` and `SWITCH` are `TI`, `XS`, `YS` and
  `SW`, which is why line 170 can use the short names.
- Line 190 is one BASIC line typed across two screen lines.
- The program ends in a `GOTO` loop that leaves the picture on screen.

## Date

v03 prints `(C) 1979`. v01 and v02 share tape19b with a Chemical Equation
Balancer save marked `COPYRIGHT 1979 CARL KADIE`. A copyright year is not a save
date; tape23a and tape29a hold later saves of v03.

See `provenance.json` for archive paths, hashes and recovery evidence, and
`VERIFICATION.md` for what was run in the emulator.
