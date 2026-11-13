# Why BASIC Is Not Better than Rust or TypeScript

*Subtitle: Revisiting my first programs, 45 years later*

*Draft for This Week in Rust (via Medium). Notes and open questions for Carl are at the end. `[VIDEO: ...]` marks where an embedded recording goes.*

Imagine you were a professional poet, but hadn't seen your high-school and college poems for 40 years, until last week. I'm no poet, but I did just recover my 40+ year old computer programs and games and make them playable on the web.

I had seen early personal computers, such as the Altair, in San Francisco, but nothing like them was available in my hometown of Peoria, Illinois. In the summer of 1978, between my sophomore and junior years of high school, the TRS-80 Model I arrived at our local Radio Shack. I ordered one and waited several weeks for delivery. The least expensive complete system cost \$599 (about \$3,100 in 2026 dollars). I paid for mine with years of saved Christmas and birthday money. It never even occurred to me to ask my parents' permission.

I wrote the programs in BASIC, between 1979 and 1982, and saved them to cassette tape. This year I decoded the tapes' audio back into bytes and put six of the programs at [Code Circa 1980](https://carlkcarlk.github.io/code-circa-1980/). Each runs unchanged in an emulator. Four also have a modern port: two in Rust, compiled to WebAssembly, and two in TypeScript.

I expected to be embarrassed. Instead, when I put each program beside its port, BASIC kept winning small arguments. It lost the big ones: Rust and TypeScript are better languages. But very little of what was good in these programs came from the language. **The ideas in a program matter more than its syntax.** Syntax, typing, and tooling help, sometimes a lot, but they come second.

Here are the six, with what each one taught me. The machine was a TRS-80 Model I with Level II BASIC: a 64 × 16 text screen, 128 × 48 block graphics, and a cassette recorder for storage. Variable names were significant only to two letters, and subroutines took no arguments.

## Castles (1982): the hot loop in a faster language

`[VIDEO: building an arch and bombarding it, original then TypeScript]`

Castles is a software toy: there is no score and no winner. You build towers and arches from blocks that need support below or diagonally below, then let two cannons test your construction. The challenge is to work out the rules of its physics. Which blocks stand, which fall, and why? When BASIC was too slow for the falling debris, I wrote that part in Z80 assembly and called it from BASIC. Two `POKE`s set the address of the machine-code routine, a third passes the argument through a memory location, and `USR(0)` jumps. There's no foreign-function interface, just shared memory and a jump. It's the same move as writing the hot loop in Rust and calling it from Python or JavaScript today.

Here the TypeScript version is clearly better, and not because of syntax. It runs on the web with a click, and you build with a mouse or a finger: drag up from the ground to raise a tower. In the original you click into an emulator, tap 8 to start drawing, and steer with the number keys. The rules are the same; what changed is the platform. The port was written with AI tools and tested against the original, with the falling debris checked against the actual Z80 code running.

## Chemical Equation Balancer (1979, 1981): it was linear algebra all along

`[VIDEO: balancing an equation in the emulator, then in the Rust version]`

In middle school and high school, we were taught to balance chemical equations by trial and error. Change the coefficients, count the atoms on each side, and keep trying until everything balances. Remarkably, this approach is still taught today.

A little later, but still in high school, my math teacher, Ms. Canty, taught us Gaussian elimination, a general algorithm for solving systems of linear equations. I realized that balancing a chemical equation *is* solving such a system: one equation per element, one unknown coefficient per compound.

The realization pissed me off. First, our science teachers graded us on how well we guessed. That was the injury. Second, they never showed us the systematic approach. That was the insult.

In 1979, I wrote Chemistry Equation Balancer, which used floating-point Gaussian elimination. The next year, I paid \$10 to advertise it in Volume I of Radio Shack's *TRS-80 Applications Software Sourcebook*, a catalog of software from independent programmers. In 1981, now in college, I wrote Chembalancer II, a substantial rewrite with exact fractions. It could recognize equations with no positive solution or with more than one independent solution, and it handled ionic equations, conserving electrical charge as well as atoms. Its listing in Volume IV promised to balance equations "WITHOUT TRIAL & ERROR." The cassette cost \$39.95 (roughly \$150 in 2026 dollars) and came with 14 pages of documentation. I sold only a few copies, but that was real money to me at the time.

Every fraction is reduced by the greatest common divisor after each operation. Here is the core of the 1981 routine, and the Rust port:

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

Same algorithm: Euclid's. The differences are all in the plumbing. BASIC subroutines take no parameters, so callers load the globals `N8` and `D8`, `GOSUB 4000`, and copy the answer back out. There is no `MOD`, so the remainder is `A8-B8*INT(A8/B8)`. The numbers are double-precision floats that stay exact only while they remain whole, and the program checks for coefficients above 1E16 and reports OVERFLOW. Rust has parameters, real integers, `%`, and `try_from` to catch overflow the moment it happens. Exact fractions are also slow on 1980 hardware: about 20 seconds for water and up to three minutes for larger equations. The Rust port answers instantly.

But BASIC wins one round. `DIM N(EN,CN+1)` makes a real rectangular 2-D array, and BASIC counts from 0 *to* n, so every array has a spare row and column 0. The program uses them for bookkeeping: compound numbers, element groups, and the answer's coefficients. The Rust port uses `Vec<Vec<Fraction>>` and separate vectors for the bookkeeping.

Formulas have parentheses, as in Ca(OH)₂, and BASIC gives you no stack to put data on. So the program makes one: an array `PR()` and an index `PN`. A `(` moves up a level. A `)` multiplies the level's total by the number that follows and adds it to the level below. Each level needs only one number, because the program rereads the formula once per element and counts just that element.

## Alien (1979): typing in teaches you the code

`[VIDEO: a short Alien game, closing a junction to trap the alien]`

Back then, you got someone else's program by typing it in from a book. I typed Gregory Yob's *Hunt the Wumpus* (1973) from David Ahl's *More BASIC Computer Games*. It was slow, and every typo had to be found before the program would run. But by the time it ran, I had read every line, and the program felt like mine to change.

I changed it in two steps, both saved on the same tape. First, a reskin after the 1979 film *Alien*: the cave became a spaceship's air vents, pits became vacuum chambers, bats a failing ship's computer, and arrows poison gas. The game opens with the film's tagline, IN SPACE NO ONE CAN HEAR YOU SCREAM. Then a remix of the rules. You can close the junction you're in, so nothing can enter it again, and win by trapping the alien instead of gassing it. The junction numbers are shuffled each run, so there's no map to memorize.

There's no modern port, and it doesn't need one for this point. What made the remix possible wasn't the language. It was having the whole program in my head, which typing it in forced on me. Today we get that from reading source on GitHub, if we bother.

## 3-D Plot (1979): the formula is a line of code

`[VIDEO: 3-D Plot drawing a surface in the emulator, then the TypeScript version]`

3-D Plot draws a math surface as a wire grid. Level II BASIC has no command to draw a line, only `SET` to turn on one pixel, so the program projects each grid point onto the screen and joins neighbors with its own seven-line line routine. The pixels are about twice as tall as they are wide, so it scales X by 30 pixels and Y by 15. The projection is oblique, not perspective: the back of the grid is simply slid up and to the right. Every line is drawn; there is no hidden-line removal.

There was no prompt for a formula. To plot your own surface, you edited line 200 and typed `RUN`. Line 180 predefines `PI` and `E` for that purpose, and line 210 lets a formula lift the pen where the surface is undefined. The program was a tiny plotting engine, with BASIC itself as the formula language. Unlike the Balancer, it never had to parse a formula: the formula was a line of BASIC, so the ROM did the parsing. I sold it as 3-D Plotter through the same Radio Shack *Sourcebook*, for \$9.95 on cassette (roughly \$35–40 in 2026 dollars).

I asked an AI agent to translate the program into TypeScript because I wanted more control over the display. In my opinion, it went a little crazy, but in an amazing way. It noticed that the TRS-80 does not round numbers the way today's computers do: with modern rounding, the grid misses its center by 0.00000003 and the tip of the funnel disappears. So it modeled the TRS-80's own number format. Then it found that the ROM works out 3^2 as 9.0000029, not 9. So it read the ROM's machine code byte by byte and rebuilt its LOG, EXP, SIN and ATN routines from their original constants. The TypeScript version now lights exactly the same dots as the original in every picture it was tested on: 12 pictures, about 10,000 dots. The original takes 80 seconds to draw the funnel; the new version redraws it instantly as you drag a slider.

The TypeScript version also keeps the idea. Its "Your own surface" box takes a Level II BASIC line 200, exactly as an owner would have typed it in 1979, and the port includes a small BASIC interpreter to run it. Forty-seven years later, BASIC is still the right syntax for the job: short, forgiving, and readable by someone who has never programmed.

## CISAB Chess (1980): look-ahead without recursion

`[VIDEO: a few moves against CISAB, including WHAT WAS THEIR FOOLISH MOVE]`

The summer after high school, I wrote CISAB (BASIC spelled backwards) for a computer chess tournament in Peoria, Illinois: Saturday, July 12, 1980, at the Ramada Inn. I think everyone else used commercial programs such as Sargon. An operator typed in the opponent's moves at `WHAT WAS THEIR FOOLISH MOVE` (the adjective changes every turn) and played CISAB's replies on the real board.

I had Sargon at home, too, and played against it myself. For a very casual player like me, it was great: it taught me to stop overlooking my own dumb moves. CISAB asks the question Sargon made me ask: after this move, what can they take? It scored each move by what it captured and what it put at risk, then tried its best moves and looked at what the other side could take in reply.

That reply check is the beginning of game-tree search. In Rust you'd write it as a recursive function that takes a position and a side. Level II BASIC has no parameters, no local variables, and a `GOSUB` that can't carry state, so CISAB does something cruder and rather clever. To see the board as the opponent does, it negates every square, runs the same move generator, and negates them back. A flag, `SW`, tells the shared code which side it's playing for. The whole program is about 5 KB, and at the TRS-80's real speed each move took 1–7 minutes in my tests. I didn't learn the theory behind programs like this (game-tree search, minimax, evaluation functions) until years later, in AI classes in college.

The Rust port keeps that structure and is deliberately faithful. Given the same moves, it makes the same replies as the BASIC program, including the TRS-80's random-number generator and its single-precision rounding of move scores. That fidelity let me measure the program for the first time. Over 200 games against the chess engine Texel at its weakest settings, CISAB rated about 104 ± 50: very weak, roughly a player who knows the moves but little else. It never lost to random legal moves, though. Its weak spot is finishing. It knows nothing of check, checkmate or stalemate, so in 129 of the 200 games it stalemated its opponent while ahead by a queen or more. Rust didn't make CISAB stronger, but it made it fast enough to find out how strong it was.

One caution: the rating is for a corrected copy. The version I recovered had pawn bugs and scored under 10% even against random moves. The site plays the recovered program with those bugs fixed, and lists every change.

## Bomb (1981): the clock is a loop counter

`[VIDEO: a round of Bomb, ending in an explosion and the top-ten table]`

I designed this game with my roommate, Rich Losey. It shows you the wires to cut, one color at a time, and then makes you type them back, in order and spelled right, while the bomb ticks. Each bomb you defuse flashes the next one's wires faster and gives you less time to answer.

The input loop does two things a modern programmer would never do. The timer is a count of trips through the loop, so the fuse is only as long as the CPU is slow. And every key except Enter joins the answer, including Backspace: it erases the letter on screen, but the answer can never match, and the bomb goes off. In TypeScript you'd use a real clock and an input element that handles editing for you.

Yet the game holds up. It has an attract screen (`TO PLAY DEPOSIT $.25 IN BOX`), rising difficulty, and a top-ten table that marks scores set by blowing up as posthumous. The color list includes both GREY and GRAY, and you have to type the one shown. Rich and I thought that was very funny. I'm a poor speller, but thanks to this game I learned to spell AZURE.

The top-ten table has had one upgrade. In 1981 it vanished when you turned the machine off. The web version keeps a World top ten across the whole internet, so you can now be posthumous in front of everyone.

## What I learned

The ideas held up: moving the hot loop into a faster language, linear algebra instead of guessing, remixing someone else's code, a plotting engine extended by editing one line, and look-ahead. None of them depended on BASIC, and none of them needed Rust.

Modern languages make the same ideas safer and easier to read. Parameters, local variables, real integers and named functions would have saved me hours in 1980. The modern platform, meaning the web, the mouse and touch, makes the programs easier to share and to play. Both matter, but both come second to having an idea worth writing down.

The TRS-80 never acquired the prestige of the Apple II or Commodore PET, and BASIC eventually became associated with amateur programming. Both reputations obscure what these tools made possible. I could explore algorithms, write games, and solve interesting problems on a computer I owned, understood, and didn't have to share or wait to use.

And BASIC deserves a fair-play list: real 2-D arrays, 0-to-n indexing that pleases both camps, instant edit-and-`RUN`, and listings short enough to type in and understand completely.

You can play all six, original and modern, at [carlkcarlk.github.io/code-circa-1980](https://carlkcarlk.github.io/code-circa-1980/). The source, including the recovered tapes' bytes and the Rust ports, is on [GitHub](https://github.com/CarlKCarlK/code-circa-1980).

## Notes and open questions for Carl

Decided (November 12, 2026):

- The six programs appear in the website's gallery order, and the article does not explain the order.
- Scope is these six programs only, one visit each, with an embedded video per program (still to be recorded).
- The only code sample is the GCD comparison. The line routine, the chess board-flip, Bomb's line 620, and Castles' line 195 are now described in prose; the earlier text is in Git (`439a695c`).
- "Forty-seven years later" is right for a 2026 publication (2026 − 1979 = 47). Change it to forty-eight if the article slips into 2027.
- The Texel rating framing ("fast enough to find out") stays.

Still open:

- Title. Current: "Why BASIC Is Not Better than Rust or TypeScript", subtitle "Revisiting my first programs, 45 years later" (the programs are 44 to 47 years old in 2026). Alternatives, all naming both languages: "BASIC Is Not Better than Rust or TypeScript (Mostly)"; "BASIC Is Not Better than Rust or TypeScript. It Still Won a Few Rounds".
- The poetry intro now opens the article, in your words. Check the join to the second paragraph.
- Bomb: the World top ten paragraph and its closing joke are mine; edit freely.
- The `SWITCH`/`SW` two-letter-variable paragraph is cut from 3-D Plot (my call, since you had no preference); the fact survives as one sentence in the machine description. Restore it from Git if you miss it.
- Alien: the "if we bother" line is a jab at readers; keep or soften?
- The site's story prose is now in the draft (About text, Ms. Canty and the injury/insult, Sourcebook prices, the AI port of 3-D Plot, Sargon, the tournament date, AZURE, "software toy"). Left out on purpose: how-to-play steps, Alien's odds table, and the quirk lists. Say if any of those belong.
- Chess: I added that the 104 rating is for the corrected v14, since the recovered v14 scored under 10% against random moves.
- Personal material you want in that isn't on the site yet.
- Images: the Radio Shack ad's reuse rights and credit line are unchecked.
