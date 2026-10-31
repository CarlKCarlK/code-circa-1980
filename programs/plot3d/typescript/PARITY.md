# 3-D Plot TypeScript version — parity with v03

Reference: v03, tape5a save 1 (`versions/v03/01-3D-PLOT-1979.BAS`), run in
trs80-emulator 2.3.1 (Model III, Level II BASIC). The TypeScript version is a
translation, not a recovered program. It is a parity baseline before any
improvements.

## What matches

For every recorded case the TypeScript engine sets exactly the dots the
original sets. That is 12 drawings and 1 error case, listed in
`parity-cases.js`. `npm test` checks them against `parity-fixtures.json`, and
`npm run record:plot3d` re-records the fixtures from the emulator.

- Settings: standard; TILT 0; TILT 1 with X SCALE 1.5 and 11 lines; 6 lines
  (an even count, which steps by .4); Y SCALE 2 with 9 lines (clipped);
  SWITCH ON = YES; and 1 line (`?/0 Error`, from line 130).
- Formulas typed as line 200 after BREAK, with 11 lines: ripples, saddle, hill,
  egg crate, sombrero and cone (`formulas.js`). They use `^`, `SQR`, `SIN`,
  `COS`, `EXP`, `PI`, `E`, `:` and `IF … THEN … ELSE`.

## How

- **Order of work.** `engine.ts` follows lines 130–420 statement by statement:
  the two passes of FOR loops, pen up and down through `P`, and the SET
  line routine. Expressions are evaluated in BASIC's order, one rounding per
  operation. MS BASIC FOR loops always run once and stop when the value
  passes the limit.
- **Numbers.** `mbf.ts` models Level II single precision: a 24-bit mantissa
  with a guard byte, rounded half up. IEEE's round-half-even would get the
  center wrong: `FOR X=1 TO -1 STEP -1/3` misses 0 by 3E-8, and the funnel's
  tip then disappears. Level II lands exactly on 0.
- **ROM math.** Level II computes `x^y` as `EXP(y*LOG(x))`, and `SQR(x)` as
  `x^.5`, so `3^2` is 9.0000029, not 9. That changes the dot counts in the line
  routine. `mbf.ts` ports the ROM routines LOG (0809h), EXP (1439h), x^y
  (13F2h), SQR (13E7h), SIN (1547h), COS (1541h), TAN (15A8h) and ATN (15BDh),
  with the ROM's constants and series tables, which were read from the Model III
  ROM image in trs80-emulator.
- **Program variables.** A formula can read the program's variables (`PI`,
  `E`, `XX`, `S`, `TI`, …), and line 210's `NO=1` lifts the pen, as in BASIC.

## Differences

- **Left out:** SWITCH ON. It only draws the same picture twice. The engine
  keeps the option (`switchOn`) and the parity test covers it, but the page
  does not offer it.
- **Assignments:** a formula that assigns a program variable (for example
  `X`, `S` or `P`) changes the original's drawing. In the TypeScript version it
  changes only the formula's own copy.
- **Formula statements:** only assignments, `IF … THEN … ELSE` and `:`. No
  `GOTO`, line numbers after `THEN`, `PRINT`, `RND` or strings.
- **Arithmetic:** add, multiply and divide follow the model above and agree on
  every tested case. They are not a cycle-level port of the ROM routines, so a
  rare last-bit difference is possible for other inputs. Error checks cover the
  errors these routines raise (`?FC`, `?/0`, `?OV`), not every ROM case.
- **Screen:** the page does not print the `D` (done) in the top-left corner; the
  status line says Done instead. The TypeScript page shows only the plot, not the
  title and questions.
- **Timing:** the 1979 pace is 0.32 emulated seconds per grid point plus 0.074
  per dot, fitted to the recorded runs to within about 6%. Formulas that are
  slower or faster for BASIC to evaluate are not modeled.

## Not verified

Formulas and settings beyond the recorded cases, and very large or very small
values near Level II's overflow and underflow limits.
