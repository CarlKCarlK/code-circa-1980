# CISAB v14, corrected

The site's BASIC player and its Rust version run this edition, made on request
on 2026-10-31. It is v14 (`versions/v14/08-CISAB-CHESS-V9.BAS`, tape13b save 8)
with these changes and nothing else. All were requested; each keeps what the
program was meant to do:

| Line | Change | Why |
|---|---|---|
| 1300 | `B(R8,C8)` → `B(R7,C7)` (twice) | CISAB's pawns never promoted: the test looked at the square the pawn was moving to, which never holds its pawn. A pawn reaching row 1 now becomes a queen. |
| 335 | `IF R=7 AND …` | CISAB's pawns could step two squares from any row, even off the board to row 0. Now they step two only from row 7, where they start. |
| 110, 111 | The test for your pawn moves ahead of `RN=0:CN=0:RO=0:CO=0`, which becomes line 111 | Your pawns never promoted: the move was erased before the test. A pawn of yours reaching row 8 now becomes a queen. |
| 14 | `PM=120` → `PM=300` | PM sizes the move lists (line 15). Rooks, bishops and queens list some squares two or three times, so busy positions passed 120 entries and stopped with `?BS Error in 3015` or `3500`. 300 entries cost about 4 KB. |
| 210 | `GOSUB 2000` → `GOTO 2000` | The routine at 2000 always leaves by GOTO, so this GOSUB never returned and every searched move stranded a frame on BASIC's stack. |
| 9500–9530 | Each test names its own piece and a clear path, e.g. `IF B(8,2)=-4 AND B(6,3)>=0` | The opening moved whatever stood on its squares, through pieces and onto its own. |
| 9540 | New: `S$="":GOTO 210` | When no opening move fits, CISAB ends its opening and thinks. Before, it fell into line 10000 and stopped with `?RG Error in 10020`. |
| 80 | `COLUMB`, `COULMB` → `COLUMN` | Spelling. |
| 1005, 1330 | `i` → `I` | `I CAN'T MOVE`, `I WON`. |

`app/scripts/build-chess-corrected.mjs` rebuilds `CHESS.BAS` and `CHESS.ASC`
from v14 and `corrections.json`. It re-tokenizes only the edited lines, and
checks first that each one re-tokenizes to its recovered bytes. `changes.json`
records every change and the hashes. Every other line keeps its bytes. Its
other quirks stay, including no idea of check (it can leave its king in check,
and it loops forever when checkmated) and a CHECKMATE message that never prints.

Rating matches before the fixes (as recovered) found that the two pawn bugs
caused 75 of CISAB's 79 illegal moves against Texel's weakest setting, the
opening 4 more, and the move list's size its 7 crashes (`../rating/RESULTS.md`).
