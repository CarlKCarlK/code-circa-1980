# Six additional More programs

The user requested these on November 2, 2026. They remain in the unlinked More
gallery, at unshared web v1, with one player each and all sources preserved.

| Program ID | Selected capture/save | Imported saves | Notes |
|---|---|---:|---|
| worm | tape3a / 14 | 4 | Worm One source credit: Carl Kadie, July 27, 1980; Scientific American inspiration |
| peoria | tape15b / 12 | 4 | Related Peoria races culminate in the five-stage Grand Prix |
| pendulum | tape22a / 5 | 2 | Half-swing check, period and frequency display |
| sentences | tape10b / 12 | 2 | Original first names and word data; quarantined file8b excluded |
| learningttt | tape8a / 8 | 4 | Unfinished prototype; separate DEF FN expansion for stock-ROM execution |
| spi | tape20b / 8 | 5 | Data-bearing and empty-price forms; historical sample calculation |

`app/scripts/import-next-six.py` records the import method and refuses to
replace existing program metadata. One scaffold commit precedes each program’s
successive canonical-source commits; tags and byte hashes verify the snapshots.
Ordering is inferred from source changes and within-side save order. Templates,
repeated saves, and experimental branches are explicitly identified.

## Professional history

Superpower Investing was my first professional program, unless the
bond-amortization program I wrote for my dad came earlier. That order remains
unresolved. SPI line 40 is `40 REM            COPYRIGHT (C) 1974`.
BOND on tape31a save 1 has line 20: `20 PRINT"  (C) 1979 CARL KADIE`.
These are direct source notices, not established creation or save dates.
The BOND archive is Commodore BASIC (likely PET/CBM, exact machine unverified),
so it is historical context here, not an additional TRS-80 player.

## Reproduce checks

From the repository root run `python3 app/scripts/verify-second-gallery.py`.
From app/ run `npm run build:learningttt-runtime`, `npm test`, `npm run build`,
and `npm run test:browser`. Set PLAYWRIGHT_BASE_URL to a private production
preview port to avoid using another worktree’s server. Browser screenshots are
test artifacts, not gallery illustrations. Gallery SVGs are modern illustrations.
