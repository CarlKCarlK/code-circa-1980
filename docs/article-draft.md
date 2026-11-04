# Why BASIC Is Better than TypeScript and Rust

*Draft for This Week in Rust (via Medium). Open questions for Carl are at the end.*

This year I recovered programs I wrote in BASIC in high school and college,
between 1979 and 1982. They had sat on cassette tapes for more than 40 years. I
digitized the tapes, decoded the audio back into bytes, and put six of the
programs on the web at [Code Circa 1980](https://carlkcarlk.github.io/code-circa-1980/).
Each one runs unchanged in a TRS-80 emulator, and four of them also have a
modern version: two in TypeScript and two in Rust, compiled to WebAssembly.

I expected to be embarrassed. Instead, the programs were better than I
remembered, and when I put each one beside its modern port, BASIC kept winning
small arguments.

So, is BASIC better than TypeScript and Rust? No. But the comparison shows
something I believe more strongly after this project: **the ideas in a program
matter more than its syntax.** Syntax, typing, and tooling help, sometimes a lot,
but they come second. Here are the six programs, oldest first.

The machine was a TRS-80 Model I with Level II BASIC: a 64 × 16 text screen, 128 × 48 block graphics, and a cassette recorder for
storage. Variable names were significant only to two letters, and subroutines
took no arguments.

## 3-D Plot (1979): the formula is a line of code

3-D Plot draws a math surface as a wire grid. Level II BASIC has no command to
draw a line, only `SET` to turn on one pixel, so the program projects each grid
point onto the screen and joins neighbors with its own line routine:

```basic
360 D=SQR( (GX-OX)[2+(GY-OY)[2)
370 IF D=0 THEN SET(GX,GY):GOTO420
380 SX=(GX-OX)/D:SY=(GY-OY)/D
390 FOR DD=1TOD
400 SET(  DD*SX+OX+.5,DD*SY+OY+.5)
410 NEXTDD
420 RETURN
```

(The TRS-80 prints `↑`, exponentiation, as `[`.)

There was no prompt for a formula. To plot your own surface, you edited line 200
and typed `RUN`. Line 180 predefines `PI` and `E` for that purpose, and line 210
lets a formula lift the pen where the surface is undefined. The program was a
tiny plotting engine, with BASIC itself as the formula language.

The TypeScript version is where this gets interesting. It keeps the idea. Its
"Your own surface" box takes a Level II BASIC line 200, and the port includes a
small BASIC expression compiler to run it. Forty-seven years later, BASIC is
still the right syntax for the job: short, forgiving, and readable by someone who
has never programmed.

BASIC also has its own surprises. Because only two letters count, `SWITCH`,
which the program asks about at startup, is the same variable as `SW`, which line
330 tests. `TILT` is `TI`, and `XSCALE` is `XS`. The port has to model that
explicitly; the original gets it for free, and so do its bugs.

## Chemical Equation Balancer (1979, 1981): it was linear algebra all along

In school we balanced chemical equations by trial and error. Then my math teacher
taught us Gaussian elimination, and I realized balancing an equation *is* solving
a system of linear equations: one equation per element, one unknown per compound.
I wrote a floating-point balancer in 1979 and advertised it in Radio Shack's
*Applications Software Sourcebook*. In 1981 I rewrote it with exact fractions.
That let it recognize equations with no positive solution or with more than one
independent solution.

Every fraction is reduced by the greatest common divisor after each operation.
Here is the core of the 1981 routine, and the Rust port:

```basic
4020 A8=N8:B8=D8
4030 A8=ABS(A8):B8=ABS(B8)
4040 R8=A8-B8*INT(A8/B8)
4050 IF R8<>0 THEN A8=B8:B8=R8:GOTO4040
4070 N8=N8/B8:D8=D8/B8
```

```rust
pub fn gcd(a: i128, b: i128) -> i128 {
    let (mut a, mut b) = (a.abs(), b.abs());
    while b != 0 {
        (a, b) = (b, a % b);
    }
    a
}
```

Same algorithm: Euclid's. The differences are all in the plumbing. BASIC
subroutines take no parameters, so callers load the globals `N8` and `D8`,
`GOSUB 4000`, and copy the answer back out. There is no `MOD`, so the remainder
is `A8-B8*INT(A8/B8)`. The numbers are double-precision floats that stay exact
only while they remain whole, and the program checks for coefficients above 1E16
and reports OVERFLOW. Rust has parameters, real integers, `%`, and `try_from` to
catch overflow the moment it happens.

But BASIC wins one round. `DIM N(EN,CN+1)` makes a real rectangular 2-D array,
and BASIC counts from 0 *to* n, so every array has a spare row and column 0. The
program uses them for bookkeeping: compound numbers, element groups, and the
answer's coefficients. The Rust port uses `Vec<Vec<Fraction>>` and separate
vectors for the bookkeeping.

Formulas have parentheses, as in Ca(OH)₂, and BASIC gives you no stack to put data
on. So the program makes one: an array `PR()` and an index `PN`. A `(` moves up a
level. A `)` multiplies the level's total by the number that follows and adds it
to the level below. Each level needs only one number, because the program rereads
the formula once per element and counts just that element. 3-D Plot never had this
problem: its formula was a line of BASIC, so the ROM did the parsing.

## Alien (1979): typing in teaches you the code

Back then, you got someone else's program by typing it in from a book. I typed
Gregory Yob's *Hunt the Wumpus* (1973) from David Ahl's *More BASIC Computer
Games*. It was slow, and every typo had to be found before the program would
run. But by the time it ran, I had read every line, and the program felt like
mine to change.

I changed it in two steps, both saved on the same tape. First, a reskin after the
film *Alien*: the cave became a spaceship's air vents and arrows became poison
gas. Then a remix of the rules. You can close the junction you're in, so nothing
can enter it again, and win by trapping the alien instead of gassing it. The
junction numbers are shuffled each run, so there's no map to memorize.

There's no modern port, and it doesn't need one for this point. What made the
remix possible wasn't the language. It was having the whole program in my head,
which typing it in forced on me. Today we get that from reading source on
GitHub, if we bother.

## CISAB Chess (1980): look-ahead without recursion

The summer after high school, I wrote CISAB (BASIC spelled backwards) for a
computer chess tournament in Peoria, Illinois. An operator typed in the
opponent's moves at `WHAT WAS THEIR FOOLISH MOVE`. CISAB scored each move by
what it captured and what it put at risk, then tried its best moves and looked at
what the other side could take in reply.

That reply check is the beginning of game-tree search. In Rust you'd write it as
a recursive function that takes a position and a side. Level II BASIC has no
parameters, no local variables, and a `GOSUB` that can't carry state, so CISAB
does something cruder and rather clever. To see the board as the opponent does,
it negates every square, runs the same move generator, and negates them back:

```basic
2000 SW=1:FORR=1TO8:FORC=1TO8:B(R,C)=-B(R,C):J(R,C)=0:NEXTC,R
2020 CV=9:RV=9:FV=0:SW=0:FORR=1TO8:FORC=1TO8:B(R,C)=-B(R,C):NEXTC,R
```

The flag `SW` tells the shared code which side it's playing for. The Rust port
keeps the same structure, and gives it names:

```rust
fn flip(&mut self) {
    for r in 1..=8 {
        for c in 1..=8 {
            self.b[r][c] = -self.b[r][c];
        }
    }
}

/// Line 2000: the other side's view, with the attack map cleared.
fn line2000(&mut self) {
    self.sw = true;
    self.flip();
    self.j = [[false; 11]; 11];
    if !self.qt {
        self.pm = 0;
    }
}
```

The port is deliberately faithful. Given the same moves, it makes the same
replies as the BASIC program, including the TRS-80's random-number generator and
its single-precision rounding of move scores. That fidelity let me measure the
program for the first time. Over 200 games against the chess engine Texel at its
weakest setting, CISAB rated about 104 ± 50. Rust didn't make CISAB stronger, but
it made it fast enough to find out how strong it was.

## Bomb (1981): the clock is a loop counter

My roommate Rich Losey and I designed Bomb: wire colors flash, and you type them
back before the fuse runs out. Here is the input loop:

```basic
620 M$=INKEY$:TM=TM+1:IF TM>SP THEN 900 ELSE IF M$<>CHR$(13) AND M$<>"" THEN AN$=AN$+M$:PRINT M$;:GOTO 620  ELSE IF M$=CHR$(13) THEN PRINT:RETURN  ELSE IF M$="" THEN 620
```

Two things a modern programmer would never do. The timer is `TM`, a count of
trips through the loop, so the fuse is only as long as the CPU is slow. And every
key except Enter joins the answer, including Backspace: it erases the letter on
screen, but the answer can never match, and the bomb goes off. In TypeScript
you'd use a real clock and an input element that handles editing for you.

Yet the game holds up. It has an attract screen (`TO PLAY DEPOSIT $.25 IN BOX`),
rising difficulty, and a top-ten table that marks scores set by blowing up as
posthumous. The color list includes both GREY and GRAY, and you have to type the
one shown. Rich and I thought that was very funny.

## Castles (1982): the hot loop in a faster language

Castles lets you build towers and arches from blocks that need support, then
bombard them with two cannons. When BASIC was too slow for the falling debris, I
wrote that part in Z80 assembly and called it from BASIC:

```basic
195 IF NY<46 THEN POKE 32725,NY+1:POKE 16526,0:POKE 16527,127:DV=USR(0)
```

`POKE 16526,0:POKE 16527,127` sets the address of the machine-code routine,
and the argument goes in through a memory location. There's no foreign-function
interface, just shared memory and a jump. It's the same move as writing the hot
loop in Rust and calling it from Python or JavaScript today.

Here the TypeScript version is clearly better, and not because of syntax. It runs
on the web with a click, and you build with a mouse or a finger: drag up from the
ground to raise a tower. In the original you click into an emulator, tap 8 to
start drawing, and steer with the number keys. The rules are the same; what
changed is the platform.

## What I learned

The ideas held up: linear algebra instead of guessing, look-ahead, a plotting
engine extended by editing one line, remixing someone else's code, and moving the
hot loop into a faster language. None of them depended on BASIC, and none of them
needed Rust.

Modern languages make the same ideas safer and easier to read. Parameters,
local variables, real integers and named functions would have saved me hours in
1980. The modern platform, meaning the web, the mouse and touch, makes the
programs easier to share and to play. Both matter, but both come second to having
an idea worth writing down.

And BASIC deserves a fair-play list: real 2-D arrays, 0-to-n indexing that
pleases both camps, instant edit-and-`RUN`, and listings short enough to type in
and understand completely.

You can play all six, original and modern, at
[carlkcarlk.github.io/code-circa-1980](https://carlkcarlk.github.io/code-circa-1980/).
The source, including the recovered tapes' bytes and the Rust ports, is on
[GitHub](https://github.com/CarlKCarlK/code-circa-1980).

## Open questions for Carl

- Title: keep the provocative title, given that the intro answers "No"?
- 3-D Plot: is "forty-seven years later" right for the date of publication
  (1979 → 2026)?
- 3-D Plot: is the `SWITCH`/`SW` paragraph worth keeping, or too far in the weeds?
- Chess: the Texel rating ran on the Rust port, not on a real TRS-80; the text
  says the port made it "fast enough to find out." Is that framing acceptable?
- Alien: the "if we bother" line is a jab at readers; keep or soften?
- Length is about 1,800 words. This Week in Rust links rather than reprints, so
  length is flexible, but Medium readers may prefer to drop one code sample
  (Bomb's line 620 is the least essential).
