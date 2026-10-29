# TypeScript baseline: Castles v05 + FALL v6

Implemented October 29, 2026. The calibrated keyboard baseline is preserved by
tag `castles-typescript-v02`. The current implementation adds optional mouse,
touch, and pen editing while retaining the original game rules. The recovered BASIC,
assembly sources, and canonical historical source history are unchanged.

## Kept from the reference

128 × 48 logical field, the blank graphics background and ground, supported
construction, drawing/moving/erasing modes, 1–4 movement, Q to bombard, 0 single
block placement, and Shift five-step movement. Cannon positions, power/angle
controls, alternating shots, ballistic formula, impact exchanges, optional
scattered-block removal, and full-width settling follow the v05/FALL v6 sources.
The final projectile dot is left on an out-of-bounds exit, as in BASIC.

## Comparisons performed

- Assembled unchanged FALL v6 with z80-asm 2.3.0: 214 bytes at 32512; TST=32725.
- Original v05 boots with this dependency and reaches the same initial screen.
- Six construction scenarios compare TypeScript screen bytes against diagnostic
  BASIC programs executing the original v05 builder statements: supported and
  unsupported drawing, diagonal support, erasing restrictions, and boundaries.
- A BASIC ROM probe establishes positive fractional-coordinate truncation and
  that RESET converts a printed text cell into graphics. Projectile samples at
  60 distances agree with BASIC after single-precision intermediate arithmetic.
- Settling compares all 1024 screen bytes against **executed assembled Z80 code**
  for five hand-built scenes and 24 seeded arrangements of 80 scattered blocks,
  including left/right edge blocks. These comparisons are deterministic; they do
  not rely on two implementations sharing the same translated algorithm.
- Four controlled impact/debris streams compare the translated result against
  the original BASIC statements plus the Z80 call, feeding both the same random
  draws. The reference harness replaces RND calls with recorded DATA reads.
- A BASIC harness calls the routine through the original POKE/USR interface,
  returns, and matches TypeScript's settled screen for an unsupported block.
- Chromium production-build tests exercise both the original v05 and TypeScript:
  instructions, construction, bombardment, pause, restart, keyboard release, and
  narrow layout. Existing v01–v03 browser tests also continue to run.

The diagnostic BASIC harnesses copy only the relevant recovered statements and
add fixture setup/sentinels. They are test programs, not edited historical saves.

## Explicit limits and differences

- Random draws follow the same ranges and uses, but the default generator is the
  browser's RNG, not the BASIC ROM generator. Individual games won't repeat the
  same cannon positions or debris patterns. Tests can inject a seeded generator.
- Cannon flight/setup/exit and impact delays are calibrated against the running
  v05 BASIC at Model III clock speed. FALL work uses row-, support-, and
  operation-dependent cycle budgets checked against the executed Z80 routine.
  BASIC timings use measured medians, not instruction-perfect replay of every
  expression. Construction retains the port's existing 150ms adapter interval. Browser
  frame scheduling also limits visible precision. See TIMING.md. Cursor blink is
  a display overlay and does not affect construction, collisions, or settling.
- Projectile arithmetic uses JavaScript single-precision rounding for the sampled
  formula. Trigonometry and every random shot have not been proven bit-identical
  to the ROM's math routines.
- FALL v6 can address beyond VRAM when probing the far screen edges. In the Z80
  this may read BASIC workspace RAM; TypeScript treats reads beyond its screen
  buffer as zero. The tested edge arrangements match, but arbitrary workspace
  memory effects are not emulated. Invalid BASIC-style impact coordinates stop
  the TypeScript simulation with a message instead of being silently clipped.
- Four controlled impact/debris fixtures match; arbitrary complete game sessions
  have not been compared end to end against the ROM. Long-session,
  all-browser, and physical-touch-device equivalence is not claimed.

Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:browser`.
Use the Original/TypeScript selectors on the instructions page for manual review.

## Pointer controls added after the baseline

The TypeScript player supports free pointer positioning and click/drag drawing.
Draw, Erase, and Move tools are visible; right-drag temporarily erases without
changing the selected tool. Turn off Mouse controls for keyboard-only play.
The original emulator and recovered sources are unchanged.

Mouse strokes visit every crossed cell in order, so rapid motion leaves no
sampling gaps. Drawing still requires lower/direct-diagonal support; erasing is
blocked by a block directly or diagonally above. Keyboard and pointer input use
the same engine legality checks. There is no automatic support creation or
relaxed erase rule. Borders and ground remain outside the editable area.

The browser adapter maps CSS-scaled canvas coordinates through CRT padding and
non-square block dimensions. Pointer capture ends on release/cancel, pause,
blur, restart, navigation, keyboard input, or bombardment. A pending Q command
locks pointer input so mouse movement cannot cancel it. Tests cover supported
strokes, protected/top-down erasing, right-drag, free movement, keyboard-only
fallback, cancellation, pause/bombardment lockout, and emulated touch taps.
