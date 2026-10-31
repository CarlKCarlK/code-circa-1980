# Alien

Hunt an alien through the air vents of your spaceship. Twenty vent junctions form
a dodecahedron; each leads to three others. Spray poison gas to kill the alien, or
close junctions to trap it, before it gets you.

## Credit: Hunt the Wumpus

Alien is my reskinning and remixing of **Hunt the Wumpus**, which **Gregory Yob** wrote in 1973.
It was published in *Creative Computing* in 1975, and Wumpus 1 and Wumpus 2 both
appear in David Ahl's *More BASIC Computer Games* (1979). I started from Yob's
BASIC program: his cave map (the same `DATA` table), variables, line numbering
and much of his text. A source comment still says `2 WAMPUS`, `PITS` and `BATS`.
The reskin comes from the 1979 film *Alien*, whose tagline opens the game:
"IN SPACE NO ONE CAN HEAR YOU SCREAM." The remix is in how it plays.

## The remix: how it plays differently

Alien is a containment game rather than a pure hunt:

- **Close junctions.** Besides moving and spraying, you can close the junction
  you are in. Nothing can enter it again: not you, not the alien, not the gas.
  Close all three of the alien's exits and you win; close yourself in and you lose.
- **No map to memorize.** The junction numbers are shuffled each run, so
  the room-to-room connections must be worked out again.
- **No second chances.** Walking into the alien kills you. In Hunt the Wumpus the
  Wumpus usually wakes and moves away.
- **The alien moves on your closes too.** It can move at the start of a game,
  after a missed spray and after every close, never when you move.

The full list is at the bottom.

## When the alien moves

The alien moves only at these moments:

- At the start of each game, including SAME SET-UP: half the time it tries one
  move. Overall it moves 3 times in 8.
- After a spray that misses: it moves 3 times in 4.
- After you close a junction: it moves 3 times in 4.

A move takes it through one open vent to a neighbouring junction, chosen at random.
It ignores vacuum chambers and booby traps, never enters a closed junction, and
otherwise stays put. It never moves when you move.

## Is every game different?

Within one run, a new game (any answer but `YES` to `SAME SET-UP`) places you,
the alien and the hazards at new random junctions; the junction numbers stay the
same. `SAME SET-UP` puts everyone back where that game started, except that the
alien may make its starting move again. Closed junctions stay closed.

Each run of the program starts the same way, though. It never uses BASIC's
`RANDOM` statement, so after every start the TRS-80 produces the same random
numbers. The title animation uses some of them, so the first world depends only on
whether you skip the title. In the emulator, watching it starts you in junction 18
(vents 1, 5, 6); skipping it starts you in junction 9 (vents 20, 4, 15). Restart,
like switching a TRS-80 off and on, brings back the same two.

## Versions

Alien is v02 (tape22b save 8, 251 lines; save 9 is identical).

The website plays it in a TRS-80 emulator. By default it runs a **corrected
spelling** edition: v02 with the misspellings in its printed text fixed (ALIEN,
JUNCTION, TOO and others), derived at my request and kept separately in
[corrected/](corrected/), which lists every change. The program logic is unchanged. The
**Original spelling** tab (`#/program/alien/basic`) runs the recovered v02 exactly.

An earlier save, v01 (tape22b save 6, 214 lines; save 7 is identical), is kept as
source only. It is Hunt the Wumpus with the new words but none of the remix:
no title, no closing junctions, fixed junction numbers. The order is inferred
from save order and from v02 containing everything in v01.

## Date

Probably 1979; no date is written in the program. The tagline comes from the
publicity for *Alien* (1979). On the same tape side, TEACH VI is dated
11 January 1979; on the other side (tape22a), TRIGECTIOR is dated 24 October 1978
and RELITIVITY 9 May 1979. Old programs were sometimes saved again later.

[original/](original/) holds stable paths that advance through one Git commit per
version (tags `alien-v01`, `alien-v02`) so the changes can be compared.

## All differences from Hunt the Wumpus

Compared line by line with Yob's published listing. See
[VERIFICATION.md](VERIFICATION.md) for what was actually run; the rest comes from
reading the source.

### Play

- New action: close the junction you are in. Every vent into it is cut; your
  own exits stay open. You, the alien and the gas can no longer enter it.
- Win by trapping the alien (all three of its exits closed). Lose if all of
  your exits are closed (`YOU ARE TRAPPED, WITH NO WAY OUT`).
- Each close gives the alien a turn to move.
- Junction numbers are shuffled once per run; the map's shape is unchanged.
- Walking into the alien is always fatal. Yob: the Wumpus wakes and moves away
  3 times in 4.
- The alien may move at the start of every game (3 times in 8).
- Gas wanders only through open vents; gas in a room with no open vent gets you.
- Closed junctions and the junction numbering carry over to later games, even
  new set-ups, until the program is run again.
- No check against gas paths that double back (Yob: "ARROWS AREN'T THAT CROOKED").
- After a missed spray, the alien's move is checked against the room where the
  gas stopped instead of your room (Yob reset this). The alien can kill you
  from elsewhere, or move into your junction harmlessly until you walk into it.
  A close right after a miss closes the gas's last room.
- Entering your own junction at `WHERE TO` asks again; Yob lets you stay put.
- `SAME SET-UP` needs `YES` (Yob: `Y`); any answer except `NO` shows the
  instructions (Yob: except `N`).
- No `RANDOM`: every start of the program replays the same worlds (above).

### Where the instructions and code disagree

- "One chance to flee" the alien: walking into it kills you at once.
- The alien "often moves": only at the moments listed above.
- Computer failure "switches the junction's numbers": it moves you to a random
  junction, like Yob's super bats.
- If the alien's starting move lands on you, the game prints the slime message
  and then carries on.
- "THE ALIEN IS TRAPPED. YOU HAVE WON!" can print more than once.
- The original spells ALEIN, JUCTION, VACUM, BOOBIE-TRAPPED, YOUR ARE, TO LATE
  and more. The site's default edition corrects the printed spelling; the
  recovered files are unchanged.

### Unchanged

The 20-room dodecahedron, two pits (vacuum chambers), two bats (computer
failures), warnings one room away, five shots, paths of 1–5 rooms that wander at
random where no tunnel leads, and being able to shoot yourself.
