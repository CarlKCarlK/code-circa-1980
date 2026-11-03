# Investing group and four More additions

Requested November 2, 2026. AIM joins SPI under one investing gallery entry.
Their separate original algorithms, source histories, default captures, and
canonical tags remain intact. AIM has no second gallery card; the player selector
opens either program directly. More has 27 entries; the main gallery stays at six.

| Source collection | Complete captures | Selected source |
|---|---:|---|
| AIM | 4 | tape20b save 12 (v04) |
| Keyword Cipher | 1 | tape21b save 2, separately corrected derivative |
| Word Search | 1 | tape4a save 7, full original generator/list |
| Space Colony | 2 | tape14a save 3 (v02); recovered King remains source only |
| Computa-Match | 4 | file8b save 16 (v04) |

Two damaged AIM fragments and three damaged Space Colony captures remain source
only. Every exported candidate and prefix is copied unchanged. Prefixes are exact
leading ranges without synthetic end markers; no bytes are filled from another
save. The read-only verifier checks every declared matching archive candidate.

The published King instructions name James A. Storer and match the recovered
Setats Detinu/Rallods form. The space adaptation’s theme and shared budget rules
are source-comparison evidence; its exact authorship/date remain uncertain.
[Author-hosted primary book scan](https://www.cs.brandeis.edu/~storer/LunarLander/PollutionGame/King-101BasicComputerGames.pdf).
Keyword Cipher names BASIC PROGRAMMING and C.M. Kadie; the exact book edition is
not guessed. Computa-Match names Carl Kadie, Woodruff’s computer club/student
council, and January 6, 1980. Original sample names and phone-like fields remain.

The Cipher derivative changes five record bodies only, with artifact reproduction
and actual-ROM round-trip/boundary fixtures. Word Search’s original exhaustive
search is slow; the browser exposes 200× targeting and bounded progress checks.
The manual check-wordsearch.mjs runs full generation and output controls directly
through the original ROM. No modern generator substitutes for recovered code.

Run verify-second-gallery.py and verify-related-partials.py (with the archive
path), then npm test/build/test:browser from app/. Source and artifact records
separate recovery validation from new execution evidence. Work stays local on
second-gallery, at unshared web v1; this task does not publish the players.

## Recorded execution and preservation

The original Word Search finished its full generator and output-control check
in 15,628.87 emulated seconds (about 4.34 hours), taking 215.8 seconds in the
recorded direct-ROM harness. All 225 cells are letters. Space/list/Space/redraw
preserves the exact grid hash. This is a measured verification run, not a browser
performance promise; verification/full-rom-run.json stores the source/grid hashes.

All 12 complete imported saves retain raw/listing bytes and per-save canonical
tags. The shared source verifier now checks 133 snapshots. Five damaged records
retain unchanged exports and precise prefixes; every claimed matching archive
candidate is rechecked by verify-related-partials.py. Unit tests pass all 19
files, including ROM cipher round trips and the SPI/AIM relationship invariant.
Production build and all 42 active release hash manifests pass.

Source defaults: AIM tape20b save 12; Cipher tape21b save 2 with five documented
record changes; Word Search tape4a save 7 unmodified; Space Colony tape14a save 3;
Computa-Match file8b save 16 unmodified. Old sample data is retained as historical
sample data. No quarantined source was imported and no inventory was rewritten.

The full browser suite passed all 124 cases in 5.7 minutes, including the
SPI/AIM selector in development and frozen v1, the four new players, direct
release navigation, mobile gallery layout, pause, and restart.
