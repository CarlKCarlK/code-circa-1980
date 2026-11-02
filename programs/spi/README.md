# Superpower Investing

Five tape20b saves; selected v05 (save 8), the last data-bearing form. All recovered payloads and listings remain unchanged in `versions/`
and `original/`; tags `spi-vNN` identify canonical historical revisions.
Only one selected edition is playable. Web releases begin at unshared v1.

## Play

The original computes its stored sample price series automatically and prints a table and REAL PROFIT (WITHOUT BANK INTEREST). Pause to inspect output, Resume to continue, and Restart to repeat the same data.

Click the player for keyboard focus. Help pauses and restores the previous
pause state; Pause/Resume holds the machine; Restart begins a fresh session.
Held keys are released on blur, navigation, pause, and restart.

## History and limits

Superpower Investing was my first professional program, unless the bond-amortization program I wrote for my dad came earlier. That order remains uncertain. The source credits Robert Lichello’s book and Carl Kadie’s programming. SPI’s 1974 copyright notice and BOND’s 1979 notice do not establish relative creation or save dates. This page uses historical sample data; it does not fetch prices or execute trades.

Read `provenance.json` for archive paths, SHA-256 hashes, exact capture/save IDs,
source-structure validation, and inferred ordering. Recovery validation is
separate from emulator execution; see `VERIFICATION.md` for actual checks.
Run locally from `app/` with `npm run dev`, then open
`/?development=1#/program/spi` directly in the player.
