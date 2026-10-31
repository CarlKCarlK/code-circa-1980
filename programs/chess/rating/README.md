# Rating CISAB with Texel

Standalone tools for measuring the playing strength of the Rust port of CISAB v14
(`../rust/`). Nothing here runs on the website.

## Method

- **CISAB:** `uci/` wraps the Rust engine as a UCI engine. On each `go` it
  replays the game from the start, typing each opponent move as an operator
  would have (castling, en passant and promotion through ADD), and sends
  CISAB's reply unchanged.
  - An illegal reply is sent as it is (one that leaves the board as `0000`),
    and Fastchess scores it as an illegal move.
  - A BASIC error that would have stopped the original ends the process, which
    counts as a crash.
  - When CISAB would think forever, it sends nothing and loses on time.
  - CISAB plays from the starting position, with its four-move opening.
- **Opponent:** Texel 1.12 (tag `1.12`, bd5698c), with `UCI_LimitStrength`
  and `UCI_Elo`. Texel converts the Elo to its internal Strength setting with
  a table its author measured (`app/texel/enginecontrol.cpp`). The table runs
  from −625, where Texel plays random legal moves, to 2900.
- **Match program:** Fastchess v1.8.2-alpha (f618e34).
- **Conditions:** 30+0.2 seconds, 200-move limit (then a draw), colors
  alternating, games from the starting position.
- **Counting:** `summarize.py` counts software defects (illegal moves, crashes,
  time forfeits) apart from chess results. The estimate counts every game: a
  defect loses, as it would in a tournament.
  - Estimate = Texel's Elo + 400·log10(score / (1 − score)), with a 95%
    interval from the score's binomial error.
  - A Texel-calibrated estimate is only as good as Texel's calibration, and it
    is meaningless below Texel's lowest level.

## Reproduce

```sh
./setup.sh                # clones and builds Texel and Fastchess into third_party/ (ignored)
./match.sh -625 100       # CISAB vs Texel at UCI_Elo -625, 100 games
./summarize.py results/*.pgn
./endgame.py results/texel-0-100.pgn   # stalemates and material; needs python-chess 1.11.2
```

`results/` keeps each match's PGN and the adapter's log of illegal moves and
crashes, with reasons.

Results are in [RESULTS.md](RESULTS.md).
