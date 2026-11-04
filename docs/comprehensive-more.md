# Comprehensive More archive

The More gallery has 277 entries. The original 34 stay in order; restored Poker
and Space Colony follow them, then 241 additional source collections. The main
six-program gallery stays curated. A search field filters More by title,
language, description, and category.

The new collections preserve 405 captured items in 946 untouched files. The inventory marks 368 complete and 37 partial/uncertain. They
include repeated saves, drafts, damaged fragments, assembly, Model 100, pocket
computer, and Commodore material. Each has permanent snapshots, per-capture
canonical Git commits/tags, a source credit or explicit unknown-authorship notice,
and one frozen web v1. Grouping and cross-capture order remain provisional where
source evidence does not establish a development history. The extra early
balancer and assembly collections are labeled development material rather than
additional selected main-gallery editions.

175 new collections have one complete stock-BASIC payload selected for the real
TRS-80 emulator. Historical bugs and unfinished routines remain. 66 new collections
are source only because of their format, missing extensions/data, uncertain
recovery, or development-only source. This pass makes no claim of BASIC gameplay
verification. The older source-only Unfinished Tank Game remains source only.

BOND is preserved as Commodore BASIC, likely PET/CBM with the exact machine
unverified. Model 100 and pocket-computer programs do not run in the stock TRS-80
player. SARGON II, RSM, and Orion were later removed at the user’s request; they stay in
the recovery archive.

Documented published comparisons include Amazing, Bunny, Checkers, 3-D Plot,
Golf, Reverse, Stars, Stock Market, and Qubic. Complete electronic anthology
transcriptions precede recovered saves in the relevant new canonical histories.
They are not verified print transcriptions or proven exact intermediate editions.
Poker and Space Colony append published comparisons and canonical replays without
rewriting their earlier history. Their withdrawn web snapshots remain unchanged
in website-archive/v1; the restored unshared public v1 receives visible credits.
Quest is credited to Roger Chaffee’s July 1979 BYTE article; no incomplete excerpt
is represented as its full original listing. Source notices and URLs remain with
each program. Unknown authorship is explicit, rather than inferred from silence.

All 716 authoritative inventory rows have a disposition in
[remaining-coverage.json](remaining-coverage.json): 246 already represented,
405 newly imported, 62 supporting/nonprogram items, and three quarantined entries
excluded. The supporting records remain in the recovery archive: unidentified
binary/data, documents, audio, blank sides, animation data, and header-only
fragments are not invented programs. No tape recovery or inventory edit occurred.
An existing-program match can be an exact already-preserved listing hash; the
ledger retains the additional capture identity without claiming a new development
revision. The reviewed import plan is [remaining-import-plan.json](remaining-import-plan.json).

## Reproduce verification

From the repository root:

```sh
python3 app/scripts/verify-remaining.py /path/to/trs80
```

This checks source and raw hashes against the archive, every imported file,
canonical tag blobs, published comparison hashes, all inventory dispositions,
and the preserved withdrawn snapshots. Unit tests additionally decode complete
TRS-80 BASIC and compare the exact readable export and record structure.
Other formats retain their recorded recovery validation; they are not mislabeled
as Level II BASIC.

From `app/`:

```sh
npm test
npm run build
npm run verify:web-versions
npm run test:browser
```

Browser checks cover the website JavaScript: direct frozen pages, attribution,
source downloads, gallery order/search, controls, Help, pause/restart, speed,
alternate-source navigation, and responsive layout. They do not wait for BASIC
prompts, make gameplay assertions, or validate the historical program rules.

New frozen archive builds include only their own source assets through
`app/config/archive-release.js`. They preserve the same shared site and emulator
UI without embedding every other program’s historical files in every release.
All prior main-gallery and LIFE frozen builds remain unchanged.

Local run: `just show`, then follow **More uncurated programs →**, or open
`http://localhost:5281/#/more` when the existing local server is running.

## Recorded results — November 3, 2026

All 19 unit/archive test files passed, along with the TypeScript/production build.
The archive verifier checked all 716 inventory dispositions, 405 captured items,
946 unchanged imported files, canonical Git tag blobs, upstream comparison
hashes, and the preserved withdrawn snapshots. The release checker verified
293 active frozen releases. Git comparison against the pre-import commit
`a5eb978` confirms no changes to any frozen main-gallery or LIFE release.

All 372 Playwright checks passed against an isolated production preview in
1.4 minutes. The 243 new-archive checks cover every one of the 241 new frozen
entries plus search/order and shared player controls. Poker and Space Colony’s
restored attribution checks passed too. Separate visual inspection confirmed
the desktop gallery and phone search layout. No new More BASIC gameplay test
was performed, and these results do not establish correctness of its historical
programs.

The work is committed locally with per-save tags and per-program web-v1 tags.
No remote publication was performed as part of this local archive pass.
