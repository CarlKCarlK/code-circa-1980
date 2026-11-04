# Liar’s Poker, corrected (derived)

`LIARS-POKER.BAS` and `LIARS-POKER.ASC` are **not** recovered files. They are v01
(`../versions/v01/04-LIERS-POKER.BAS`) with the spelling in its printed text corrected
and `RANDOM` added to line 5, made at the author's request on 2026-11-04. Without
`RANDOM`, every run dealt the same numbers. The website plays only this edition; the
recovered files are unchanged and downloadable from `versions/` and `original/`.

[corrections.json](corrections.json) lists every change by line. Other logic and all
line numbers stay. `RANDOM` adds two bytes, so the line pointers after it move.

`RANDOM` seeds from the Z80 R register. A real machine's value varied with when a person
typed `RUN`, but emulated startup timing does not, so the player starts R at a random
value (`randomStart` in program.json). That gives up to 128 different opening deals.

Regenerate with `npm run build:liars-poker-corrected` from `app/`. `npm test` rebuilds it
and checks it against these files.
