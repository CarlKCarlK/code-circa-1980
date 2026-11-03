# Speech, corrected spelling (derived)

`SPEECH.BAS` and `SPEECH.ASC` are **not** recovered files. They are Speech v10
(`../versions/v10/07-SPEECH-TEAM-COACH-GAME.BAS`) with the spelling in its printed
text corrected, made at my request on 2026-11-03. The website plays only this
edition; the recovered files are unchanged and downloadable as source.

[corrections.json](corrections.json) lists every change by line. Only printed text
changes: logic and line numbers stay, and line pointers are recomputed.

Left as they were:

- People's surnames and first names other than PALUA (PAULA), including KENTH,
  STEWARD and JORGANSEN, which may be real people.
- The EMPATH and VOC. printer column abbreviations.
- Missing words, which are grammar rather than spelling: NOW WILL GO, READY START,
  IT'S TIME THE SWEEPSTAKES, GO TO AUDITORIUM and THIS IS THIRD WEEK.

Regenerate with `npm run build:speech-corrected` from `app/`. `npm test` rebuilds it
and checks it against these files.
