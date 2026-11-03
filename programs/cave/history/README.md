# Cave Game: source and dating

Two consecutive tape9a saves (10 and 11) are retained separately; source changes and expanded instructions suggest v01 before v02. No verified published source was located, so the canonical history begins with the first recovered save. Similarity to Wumpus-style hunting is not enough to substitute Yob’s program as an exact ancestor.

The random directed 20-room graph, darts, and one-way cave sealing resemble ideas in Jaberwocky and Alien, but variables and representation differ. No shared detailed code chain establishes their order. Instructions disagree with the five-dart initialization and the firing branch behaves like moving to the selected room; preserve those quirks.

Neither source has a direct date. Tape numbers do not establish chronology, and neighboring material supplies no firm upper bound. Same-side TEACH III saves 1, 5, and 12 repeat the exact source comment `10 'TEACH III            BY      CARL KADIE    OCT. 21,1978`; this is context, not a save date. No relative order with Alien/Jaberwocky is claimed.

Compare `git diff -w cave-v01 cave-v02 -- programs/cave/original/CAVE.ASC`.
