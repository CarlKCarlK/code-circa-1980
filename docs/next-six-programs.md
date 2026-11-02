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

## Final verification — November 2, 2026

- All 21 imported payloads/listings match the archive; 114 total snapshots and
  every canonical tag/current original pass the shared verifier.
- `npm test` passes all 18 test files, including the adaptation and actual-ROM
  arithmetic tests. `npm run build` passes.
- All 32 active web releases pass hash/catalog verification against pre-import
  commit 6b0e882; no existing release bytes were changed by this import.
- The full 98-case browser run passed 97 cases. Its sole failure was a new test
  incorrectly expecting the hidden Help dialog to be absent from the DOM.
  That assertion was corrected to require the dialog to be hidden; the targeted
  gallery recheck passes, including image decoding and 390px layout.
- All six source runtime scenarios and all six frozen-v1 startup/download/return
  checks passed in that full run. Screenshots and per-program execution limits
  are recorded in programs/<id>/verification and VERIFICATION.md.

The work is committed locally on second-gallery. The six new players remain at
unshared web v1; this task did not publish them or add a main-gallery link.
Use `npm run preview -- --port 5317 --strictPort` from app/, then open
`http://127.0.0.1:5317/#/more`. The shared workspace is
`tools/code-circa-1980.code-workspace`, with the recovery archive alongside it.

Follow-up: Worm One’s November 1973 article reference is now identified and linked
in Help and About, with research notes under programs/worm/history/. Its optional
20× emulator speed is included in a refreshed unshared web v1. The subsequent
full browser run passes all 100 cases, including the corrected gallery test.
