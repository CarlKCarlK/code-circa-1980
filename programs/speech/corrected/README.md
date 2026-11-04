# Speech, corrected (derived)

`SPEECH.BAS` and `SPEECH.ASC` are **not** recovered files. They are Speech v10
(`../versions/v10/07-SPEECH-TEAM-COACH-GAME.BAS`) with the spelling and grammar in its
printed text corrected, made at my request on 2026-11-03. The website plays only this
edition; the recovered files are unchanged and downloadable as source.

[corrections.json](corrections.json) lists every change by line. Only printed text
changes: logic and line numbers stay, and line pointers are recomputed.

Left as they were:

- People's surnames, including STEWARD and JORGANSEN, which may be real people.
  Two first names were corrected: PALUA (PAULA) and KENTH (KENNETH).
- The EMPATH and VOC. printer column abbreviations.

Regenerate with `npm run build:speech-corrected` from `app/`. `npm test` rebuilds it
and checks it against these files.
