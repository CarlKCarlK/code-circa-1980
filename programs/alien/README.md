# Alien

Hunt an alien through the air vents of your spaceship. Twenty vent junctions form
a dodecahedron; each leads to three others. Vacuum chambers and booby-trapped
junctions wait along the way. Warnings tell you when the alien or a hazard is one
junction away. Spray poison gas through up to five junctions to kill it, or, in
the expanded version, close junctions to trap it.

## Credit: Hunt the Wumpus

The game is not my idea. It is **Hunt the Wumpus**, written by **Gregory Yob** in
1973 and published in *Creative Computing* in 1975. Wumpus 1 and Wumpus 2
both appear in David Ahl's *More BASIC Computer Games* (1979). My program keeps
Yob's cave map (the same `DATA` table), his variables, his line numbering and much
of his text. The source still says `2 WAMPUS`, `PITS` and `BATS` in a comment.

I re-themed it after Ridley Scott's 1979 film *Alien*: the cave became a ship's
air vents, the Wumpus an alien, bottomless pits became vacuum chambers, super bats
a computer failure that moves you, and crooked arrows poison gas. The expanded
version opens with the film's tagline, "IN SPACE NO ONE CAN HEAR YOU SCREAM."

## Versions

Two distinct versions survive on tape22b; each was saved twice, byte for byte
identical (saves 6–7 and 8–9). The order is inferred from save order and from
v02 containing everything in v01.

- **v01 · Early** (tape22b save 6, 214 lines): mostly Yob's game with new words.
  It drops Yob's "arrows aren't that crooked" check.
- **v02 · Expanded** (tape22b save 8, 251 lines): a block-graphics title, a
  backstory, junction numbers shuffled every game, and a new action, *close a
  junction*, which cuts every vent into the junction you are in. Trap the alien
  and you win; trap yourself and you lose. Walking into the alien now kills you.

The website runs v02, unchanged, in a TRS-80 emulator at `#/program/alien/basic`.
v01 is source only.

## Historical quirks (preserved)

Read from the source; see [VERIFICATION.md](VERIFICATION.md) for what was run.

- v02's instructions promise "one chance to flee" from the alien, but the code
  kills you at once. They say the alien "often moves", but its extra random move
  happens only once, at the start of a game.
- "Computer failure" says it switches junction numbers; it relocates you at
  random, like Yob's bats.
- After a missed spray, the alien's move is checked against the room where the
  gas stopped, not your junction (Yob reset this; both versions omit the reset).
  In v02 a following *close* then closes that room.
- Closed junctions and the shuffled numbers last until the program is run again,
  including after "SAME SET-UP".
- Spelling is preserved: ALEIN, JUCTION, VACUM, BOOBIE-TRAPPED, YOUR ARE.

## Date

Probably 1979; no date is written in the program. The tagline comes from the
publicity for *Alien* (1979). On the same tape side, TEACH VI is dated
11 January 1979; on the other side (tape22a), TRIGECTIOR is dated 24 October 1978
and RELITIVITY 9 May 1979. Old programs were sometimes saved again later.

[original/](original/) holds stable paths that advance through one Git commit per
version (tags `alien-v01`, `alien-v02`) so the changes can be compared.
