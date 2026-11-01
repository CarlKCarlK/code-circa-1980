# Why BASIC Is Better than TypeScript and Rust

*Working draft for This Week in Rust (via Medium). Notes in [brackets] are for
us, not readers. Verify every claim against the source before publishing.*

I recently had the pleasure of restoring 45-year-old programs that I wrote in
BASIC in high school and college. I hadn't seen them in all that time. They were
not as bad as I thought. Let's look at each one and see why, while also comparing
them with modern languages.

[Not every section needs a code sample. Use code only where it shows something
(the balancer's GCD, CISAB's look-ahead); elsewhere, compare in words.]

[Thesis, to land in the intro or the close: the ideas in a program matter more
than its syntax. Syntax, typing, and tooling help, but they come second. The
title is the hook; turn it within the first few paragraphs.]

[Setup paragraph: TRS-80 Model I, Level II BASIC, cassette tapes. Recovered from
audio in 2026; every program now runs in the browser at code-circa-1980, original
in an emulator, with TypeScript or Rust versions for four of them.]

## 3-D Plot (1979)

**The idea.** Draw a 3-D surface as a wire grid on a 128 × 48 block-graphics
screen: an oblique projection, plus a line-drawing routine, because Level II BASIC
had no line command.

**Why it holds up.** The formula is a single line (line 200), so the program is
really a tiny plotting engine: type your own surface and RUN. Line 180 defines
`PI` and `E`, which the default funnel never uses, and line 210 lets a formula
lift the pen (`NO=1`) where the surface is undefined. It was designed to be
extended.

**Modern comparison.** The line routine (lines 360–420): find the length, take
unit steps, `SET` each dot. Compare a TypeScript version: [excerpt from
`programs/plot3d/typescript/`]. In TypeScript the formula would be a function
argument; in 1979 the "function argument" was "edit line 200."

```basic
360 D=SQR( (GX-OX)[2+(GY-OY)[2)
370 IF D=0 THEN SET(GX,GY):GOTO420
380 SX=(GX-OX)/D:SY=(GY-OY)/D
390 FOR DD=1TOD
400 SET(  DD*SX+OX+.5,DD*SY+OY+.5)
410 NEXTDD
420 RETURN
```

[Note for readers: `[` is how the TRS-80 listing shows `↑`, exponentiation.]

## Chemical Equation Balancer (1979, 1981)

**The idea.** Balancing a chemical equation is solving a system of linear
equations. School taught trial and error; I realized it was Gaussian elimination.

**Why it holds up.** Version II (1981) switched from floating point to exact
fractions, and it detects equations with only negative solutions or with more than
one independent solution. That's real linear algebra, not guessing.

**Modern comparison.** The GCD routine as BASIC, a one-for-one readable rewrite,
and the Rust port. [Use `programs/bal/basic-vs-rust.md`, trimmed.] Wins on both
sides: BASIC has true 2-D arrays and 0-to-n indexing; Rust has parameters, real
integers, and overflow checks.

## Alien (Hunt the Wumpus remix)

**The idea.** Start from Gregory Yob's *Hunt the Wumpus* (1973), typed in from
*More BASIC Computer Games*, and reskin it after the film *Alien*. Then change how
it plays: close junctions to trap the alien, shuffle junction numbers each run,
make the alien move after your closes.

**Why it holds up.** Typing in a listing meant reading every line, so the program
felt like mine to change. Remixing shared code is what open source does today.

**Modern comparison.** [Candidate: the dodecahedron map as a `DATA` table vs. a
Rust/TypeScript adjacency array. No modern port exists yet; either write a small
excerpt for the article or keep this section about the idea.] [Date unknown;
check the tape evidence.]

## CISAB Chess (high school)

**The idea.** A chess program for a tournament in Peoria. It asks "WHAT WAS THEIR
FOOLISH MOVE," scores each move by what it captures and what it risks, then looks
ahead: after this move, what can they take?

**Why it holds up.** Its look-ahead is the core idea of game-tree search, which I
didn't learn by name until AI classes in college.

**Modern comparison.** Why BASIC made it hard: no parameters, locals, or
recursion, so look-ahead could not call itself. Instead, it negates every square
so the same move generator plays for the other side, with flags (`SW`, `QT`) and
the board saved and restored by hand. Variable names are significant only to two
letters. The Rust port reproduces it statement by statement, including the TRS-80's
RND and single-precision rounding. [Excerpt: the board negation, BASIC vs. Rust.
See the CISAB items in `docs/TODO.md` and `programs/chess/rust/PARITY.md`.]

## Bomb (about 1981, with Rich Losey)

**The idea.** A bomb-defusing game that is really a memory and spelling test:
watch the wire colors flash, then type them back against the clock.

**Why it holds up.** It's a complete little arcade game: an attract screen
("DEPOSIT $.25"), rising difficulty, a top-ten table with posthumous ranks. The
humor holds up too: GREY and GRAY are both wires.

**Modern comparison.** [Candidate: line 620, where every key but Enter joins the
answer, so Backspace erases the letter on screen but not from the answer, and you
blow up. Compare modern input handling. No modern port exists.]

## Castles (about 1982)

**The idea.** Build towers and bridges from blocks that need support, then let two
cannons bombard them, with falling debris.

**Why it holds up.** When BASIC got too slow for the falling blocks, I wrote that
part in Z80 assembly and called it from BASIC with USR. That's the same move as
writing the hot loop in Rust or C today and calling it from Python or JavaScript.

**Modern comparison.** Here the TypeScript version (a port of v05 plus FALL v6)
is better, and not because of syntax. It's published on the web, so anyone can
play it with a click, and you build with the mouse or a finger: drag up from the
ground to build a tower. The original makes you click into an emulator, tap 8 to
draw, and steer with the number keys 1–4. Same rules, same game; the platform is
what changed. [No code sample needed.]

## What I learned

[Close: the ideas held up (linear algebra, look-ahead, extensible plotting,
remixing, performance-critical code in a faster language). The syntax didn't
matter much. Modern languages make the same ideas safer and easier to read, and
the modern platform (the web, the mouse, touch) makes them easier to share and
play. Both are real but secondary. Fair-play list of BASIC wins: 2-D arrays, 0-to-n
indexing, instant edit-and-RUN, the listing *is* the documentation.]

[Links: code-circa-1980 site, the repo, This Week in Rust.]
