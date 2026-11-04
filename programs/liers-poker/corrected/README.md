# Liar’s Poker, corrected (derived)

`LIARS-POKER.BAS` and `LIARS-POKER.ASC` are **not** recovered files. They are v01
(`../versions/v01/04-LIERS-POKER.BAS`) with the spelling in its printed text corrected,
made at the author's request on 2026-11-04. The website plays only this edition; the
recovered files are unchanged and downloadable from `versions/` and `original/`.

[corrections.json](corrections.json) lists every change by line. Only printed text
changes: logic, line numbers and spacing stay, and each edit keeps its byte length, so
line pointers do not move.

Regenerate with `npm run build:liars-poker-corrected` from `app/`. `npm test` rebuilds it
and checks it against these files.
