# 3-D Plot

Answer a few questions and the TRS-80 draws a 3-D surface as a wire grid, one
block-graphics dot at a time. The surface is a funnel: flat at the rim, dropping
steeply into a point at the center, like a gravity well. The program prints
`3-D PLOT   (C) 1979   CARL KADIE`.

## Two ways to run it

The site opens the **TypeScript version**: pick a surface or type your own
line 200, drag sliders for the original's questions (they redraw instantly), and draw at the 1979 pace,
20 times faster, or instantly. It draws the same dots as the original (see
[typescript/PARITY.md](typescript/PARITY.md)).
For fun, a **What if · 512×384** screen shows the same program in a world with
higher resolution: 512 × 384 square dots instead of 128 × 48 tall ones, with
only the screen size changed (`XX=511:YY=383`, `DX=XS*120:DY=YS*120` in lines
150 and 170), so the picture keeps its size and shape. It is a what-if, not a
recovered version, and has no parity fixtures.

The **Level II BASIC version** runs v03 unchanged in the emulator. Its
**Line 200** box does what a 1979 owner would: it presses BREAK, types the new
line 200 and `RUN`. Restart brings back the original line. Its **Fast (×20)** button
runs the emulated TRS-80 about 20 times faster, so the funnel takes about
4 seconds; **1979 speed** is the real machine's pace.

## Running the original

1. Click the screen so it gets your keys.
2. Press `Enter` at each of the five prompts to keep the standard settings
   (the program calls them "STANDARD PERIMETERS"):
   `TILT?`, `X SCALE?`, `Y SCALE?`, `SWITCH ON?` and `HOW MANY LINES?`.
3. Watch. With the standard settings the picture takes about 80 seconds.
   A `D` in the top-left corner means done. Restart to draw another.

| Prompt | Standard | What it does |
|---|---|---|
| `TILT` | `.5` | How far the back of the grid is shifted up and to the right, and the front down and to the left. `0` gives a flat side view; larger values draw the depth lines longer, always at 45°. |
| `X SCALE` | `1` | Width: 1 is 30 dots each side of center. |
| `Y SCALE` | `1` | Height: 1 is 15 dots each way. |
| `SWITCH ON` | not `YES` | `YES` draws the whole picture a second time over the first. Nothing changes, so it only doubles the time. |
| `HOW MANY LINES` | `7` | Grid lines in each direction. Odd numbers put a line through the center point. `1` stops with a division-by-zero error. |

## How it works

For each grid point (X, Z) from −1 to 1, the height is
Y = 1 − 1/√(18X² + 18Z²) (Y = −1 at the center). The screen position is an
oblique projection: `GX = 63.5 + X·DX − Z·DX·TILT` and
`GY = 23.5 − Y·DY + Z·DY·TILT`. Points off the 128 × 48 screen lift the pen.

## Your own formulas

Line 200 is the formula. Line 180 sets `PI` and `E`, which the funnel never
uses, so they are almost certainly there for an owner's own surfaces. Line 210,
`IF NO=1 THEN NO=0:P=1`, lifts the pen when a formula sets `NO=1`. The program
never sets `NO` itself, so this looks like a hook that lets a formula break the
grid where its surface is undefined. The surfaces offered on the site are in
[typescript/formulas.js](typescript/formulas.js), written as Level II BASIC, for
example `Y=1.5*E^(-5*(X*X+Z*Z))-.5` or
`R=3*PI*SQR(X*X+Z*Z):IF R=0 THEN Y=1 ELSE Y=SIN(R)/R`.

## Drawing lines

TRS-80 Level II BASIC has no line command, so a subroutine (lines 360–420)
draws each segment with `SET`, stepping one dot at a time along it.

The program draws the grid twice: first rows of constant Z, then rows of
constant X.

## Versions

The order is inferred from the source, not from dates:

1. **v01** (tape19b save 2): the bare surface, a 7 × 7 grid drawn with
   `LINE(GX,GY)-(OX,OY),SET`. Level II BASIC has no `LINE`, so it stops with
   `?L3 Error in 150`. It was saved with a higher program start than Level II
   uses (pointer base 22204 instead of 17125), so something was loaded below it.
   The likeliest candidate is Microsoft's Level III BASIC, a cassette add-on to
   Level II whose additions included `LINE` for lines and boxes. TRSDOS Disk BASIC
   had no graphics `LINE`. Source only.
2. **v02** (tape19b save 10): replaces `LINE` with the `SET` line-drawing
   subroutine, and sets `Y=0`, which draws a flat tilted grid (apparently a test
   of the new routine). Source only. My recollection, which is tentative: I think
   I dropped `LINE` so that more people could run the program and see the
   picture, since most owners had only Level II. The tapes fit this: v03 adds a
   title, prompts and a credit, and it was saved more often than the drafts.
3. **v03** (tape5a saves 1–2; also tape23a save 11, identical, and tape25a
   save 18, identical except for its one-letter cassette name): adds the title,
   the prompts and the 1979 credit, restores the funnel, and keeps v02's
   subroutine verbatim. A later save on tape29a is damaged; its recovered first
   17 lines match v03. **The site runs v03.**

## Quirks kept from the original

- `PERIMETERS` for "parameters".
- `SWITCH ON` sets a flag that only makes the program draw the same picture again.
- `Z1`–`Z6` are set to 67, 75, 65, 68, 73, 69, the character codes of
  `CKADIE`, and never used.
- Variable names are longer than BASIC sees: Level II reads only the first two
  letters, so `TILT`, `XSCALE`, `YSCALE` and `SWITCH` are `TI`, `XS`, `YS` and
  `SW`, which is why line 170 can use the short names.
- Line 190 is one BASIC line typed across two screen lines.
- The program ends in a `GOTO` loop that leaves the picture on screen.

## Date

v03 prints `(C) 1979`. v01 and v02 share tape19b with a Chemical Equation
Balancer save marked `COPYRIGHT 1979 CARL KADIE`. A copyright year is not a save
date; tape23a, tape25a and tape29a hold other saves of v03.

See `provenance.json` for archive paths, hashes and recovery evidence, and
`VERIFICATION.md` for what was run in the emulator.
