# CISAB rating results

All matches were played on 2026-10-31 against Texel 1.12 with `UCI_LimitStrength`,
using Fastchess v1.8.2-alpha, 30+0.2 seconds, from the starting position (see
[README.md](README.md)). Each estimate is the Texel `UCI_Elo` adjusted by
CISAB's score, with a 95% interval. That makes it a Texel-calibrated Elo
estimate, no better than Texel's own calibration. Software defects (illegal
moves, crashes, time forfeits) are counted apart from chess results, and they
count as losses in the score.

## Corrected v14: about 100

This is the edition the site plays, with six bugs fixed (see
[../corrected/README.md](../corrected/README.md)).

| Texel `UCI_Elo` | Games | Won | Drawn | Lost | Defects | Score | Estimate |
|---|---|---|---|---|---|---|---|
| 0 | 100 | 12 | 83 | 5 | 0 | 53.5% | 24 ± 68 |
| 200 | 100 | 14 | 67 | 18 | 1 illegal move | 47.5% | 183 ± 68 |
| **both** | 200 | | | | | | **104 ± 50** |

The combined figure is the maximum-likelihood rating from both matches.

How the games went:

- **The endgame is particularly bad.** CISAB stalemated its opponent in 129 of
  the 200 games: 75 against Texel 0 and 54 against Texel 200. Every time it was
  ahead by a queen or more; the median lead was 41–43 points of material
  (pawn 1, knight and bishop 3, rook 5, queen 9), roughly four queens.
  CISAB knows nothing of check, mate or stalemate, so with a won game it keeps
  taking squares away from the bare king until it has no legal move.
  `endgame.py` counts this.
- **Its wins came when a capture happened to give mate.** Those are its 12
  and 14 wins.
- **The one defect:** a move that ignored check, against Texel 200.
- **Draws by other rules:** 4 by the fifty-move rule and 4 by other rules
  against Texel 0. Against Texel 200, 11 were by threefold repetition and 2 by
  the fifty-move rule.

Shorter runs pointed to the same range before the 100-game matches:

| Texel | 8 games | 16 games |
|---|---|---|
| −400 | 62.5% | |
| 0 | 62.5% | 53.1% |
| 200 | | 31.2% |
| 400 | 31.2% | 34.4% |

Against Texel −625 (random legal moves), 32 games gave 5 wins and 27 draws:
23 stalemates and 4 by other rules, with no losses.

## v14 as recovered: off the bottom of the scale

These are the same conditions with the recovered v14, before the fixes
(`results/as-recovered/`).

| Texel `UCI_Elo` | Games | Score | Illegal moves | Crashes |
|---|---|---|---|---|
| −625 | 100 | 9.0% | 79 | 7 |
| −400 | 100 | 8.0% | 82 | 7 |

It scored under 10% even against random legal moves (−625, Texel's lowest
setting), so its rating lies below the calibrated range. The formula gives
about −1000, which means nothing.

Almost every loss was a defect:

| Cause | vs −625 | vs −400 |
|---|---|---|
| Pawn left unpromoted on the last row (line 1300) | 44 | 49 |
| Pawn stepping two squares after its first move (line 335) | 31 | 33 |
| Move list overflow, `?BS Error in 3015` or `3500` (line 14) | 7 | 7 |
| Opening move onto or through a piece (lines 9500–9530) | 4 | 0 |
| Chess losses | 0 | 0 |

So the as-recovered program almost never lost a game of chess. It lost by
breaking the rules or crashing. With those bugs fixed, it plays at about
Texel 100.

## Caveats

- **Calibration.** Texel's author measured its strength levels against other
  engines. An estimate here can be off from human ratings (Chess.com,
  Lichess, FIDE) by hundreds of points. Differences between estimates are
  more reliable than the absolute numbers.
- **Determinism.** CISAB always starts from the same random seed, as a
  freshly switched-on TRS-80 does. Texel's reduced-strength randomness
  supplies the variety between games.
- **Timing.** CISAB answers instantly; the TRS-80 took minutes. Time cannot
  change its moves.
- **Draws.** Many drawn games make each game's result less variable than the
  win/loss binomial assumes, so the ± figures are, if anything, too wide.
