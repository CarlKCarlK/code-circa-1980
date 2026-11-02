# Second gallery

An unlinked collection at `#/more`, using the main gallery’s layout. Speech,
Olympics, and the tentative X-wing fighter match belong here. No main-gallery
card or navigation link points here. Unlinked does not mean access-controlled.

Develop in this worktree with `cd app && npm run dev -- --port 5187`.
Open `http://127.0.0.1:5187/#/more`.

Recovered bytes stay in each program’s versions directory. Canonical original
paths advance in separate commits and program-specific tags. Development order
is inferred from source changes; capture numbers do not establish dates.

This branch is kept separate for review; no merge or deployment is part of this pass.

## Programs and recovery evidence

- Speech: eleven complete snapshots; default v10 is tape11b save 7. Its repeat
  is retained as v11. Two malformed tape20a recordings remain in partial/.
- Olympics: three complete snapshots, including the repeated earlier capture;
  default v03 is tape3a save 2, with the explicit 1980 Carl Kadie copyright.
- Star Wars cockpit (`startwar81` internally): tentative identification; default v01 is tape23b save 5.
  v02 (tape30a save 2) preserves the later alternate-control experiment as source.
  The damaged tape23b save 4 is retained separately. All three raw headers store
  cassette name `S`. The user specified `startwar81` as the internal short name; spelling is preserved exactly.

X-wing source locations: tape23b save 4 at 7:18–8:10 (damaged), save 5 at
8:20–9:16 (complete); tape30a save 2 at 2:42–3:36 (complete). Times are rounded
from recovery detection intervals in the WAVs, not physical tape counter values.

The main gallery retains its original six entries. Both galleries use the same
card renderer and stylesheet. These three players return to the second gallery.
The page and players request no indexing. There is no inbound navigation link
from the main collection. Initial web v1 snapshots are frozen locally; startwar81 also has a v2 preserving the newly remembered name while keeping its earlier X-wing label in v1; no
existing published snapshot was modified. No merge or deployment was performed.

## Verification commands

From the repository root:

```sh
python3 app/scripts/verify-second-gallery.py
cd app
npm test
npm run build
npm run verify:web-versions -- --against e951413
npm run preview -- --port 5187 --strictPort
```

With that preview running, in another terminal in app/:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 PLAYWRIGHT_WORKERS=3 npm run test:browser
```

The verifier checks all sixteen snapshots, canonical tagged listing/payload
blobs, current original files, partial hashes, and unmodified raw prefix ranges.
The archive suite checks complete BASIC structure and listing conversion. The
release-integrity check verifies eleven immutable experiences, including the seven
that predate this worktree. Desktop and 390-pixel phone views were inspected;
the phone page has no horizontal overflow.

Browser checks exercise gallery separation, direct player navigation, coaching
setup and event generation, event-requirement pages, Speech's actual printer
output, Help, pause/resume, restart, X-wing radar movement with digit 4, and each
new frozen v1 player. A stale Castles test closed an already-open source panel;
it was corrected to open that panel only when needed, and its rerun passed.
Complete tournament seasons, Olympic competitions, and the Death Star mission
were not played through. No claim of exhaustive historical behavior testing.

## Results — November 2, 2026

- Unit/archive checks and production build passed.
- All sixteen complete snapshots, canonical tag blobs, and partial prefix/hash
  checks passed; all eleven frozen web experiences passed integrity verification
  against the worktree's starting commit e951413.
- The full browser run had 60 passing tests, one preexisting skipped test, and
  one failing cockpit-startup assertion. That assertion watched a reticle while
  BASIC was still drawing; it now waits for the stable timer field to contain
  a number. The final focused run passed all eight tests, including that flight
  check, both coaching games, all three v1 snapshots, the renamed startwar81 v2,
  return navigation, and phone gallery width. The broad suite was not rerun
  after the title/prose change; all affected gallery/player checks were rerun.

The final branch is `second-gallery`. Open tools/code-circa-1980.code-workspace
in this worktree to keep the website and recovery archive together. The local
preview is at http://127.0.0.1:5187/#/more. This work is committed locally and
has not been merged, pushed, or deployed.

## Short name and display title

Use `startwar81` for the folder, program ID, and new URLs. The visible title is
**Star Wars cockpit**, a descriptive label because neither recovered listing
prints an explicit title. Old xwing/v1 and xwing/v2 snapshots and their catalog
remain unchanged. The current catalog carries those releases forward; new
releases use startwar81 paths. Legacy xwing hash/query routes remain aliases.
Original tag names and committed file paths remain intact as historical evidence.

### Naming migration verification

The naming migration uses `programs/startwar81/`, program ID `startwar81`,
STARTWAR81 canonical source filenames, and new `startwar81-*` tags. Historical
commits retain their old paths; the new historical tag aliases point to those
same commits, and the verifier checks the original committed blobs explicitly.
The current player opens at `/startwar81/v3/` and displays **Star Wars cockpit**.

After this migration, unit/archive checks, production build, and canonical/raw
hash checks passed. The full browser suite passed **63 tests**, with **one
preexisting skipped test**. Checks include the new URL and display title, legacy
query/hash routing, old frozen URLs, movement in the original program, both
coaching games, and the main gallery. All **12** frozen experiences passed
integrity verification against the pre-migration commit `373ebac`; every earlier
frozen file and catalog is unchanged. Changes remain on the local worktree branch.
