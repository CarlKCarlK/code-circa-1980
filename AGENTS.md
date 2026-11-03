# Code Circa 1980

This is a local collection of Carl Kadie's original programs, with browser
emulation first and optional modern versions later. The first program's official
name is **Castles**. Do not add remasters or unrelated programs until requested.

## Adding one program

1. Inspect the recovery archive in the sibling VS Code workspace. Identify related
   versions using inventory, listings, clusters, and user descriptions. Follow an
   official title supplied by the user; preserve archive labels and capture/save IDs.
   Keep a user-supplied short name separate from the display title: use the short
   name for folders, program IDs, and URLs; show a title from the recovered code
   when present, or identify a descriptive display title as inferred.
2. Add `programs/<slug>/` with `program.json`, `README.md`, `provenance.json`, and
   `versions/<sequence>/`. Copy raw recovered payloads and listings byte for byte;
   verify hashes, structure, and line counts. Do not alter historical spelling,
   bugs, pointers, line numbers, or terminators. Do not edit the recovery inventory
   just to import a website program.
3. Make a reasoned development-order guess from source changes and within-capture
   order. State uncertainty; do not infer chronology from tape numbers alone.
   Commit each recovered version separately in that order, without invented
   historical dates or rewriting user history. Use the configured Git identity.
4. Register the program in `app/site/catalog.js` and put its presentation functions
   in `app/site/programs/<slug>.js`. Keep common navigation and emulator
   code shared; keep version-specific controls and dependencies in program metadata.
5. Show instructions before launching. Include purpose, a concrete first sequence,
   keyboard focus, modes, restart, and version differences. Default to a complete,
   self-contained version. Preserve unavailable versions for study with clear reasons.
6. Execute the original payload through the real emulator. Keep runtime adaptations
   separate and documented. Confine keyboard capture to the focused player; clear
   pressed keys on blur, visibility change, pause, restart, and navigation.
7. Run `npm test`, `npm run build`, and `npm run test:browser`. Browser checks must
   exercise actual startup and meaningful input/output, not just page rendering.
   Record evidence in the program's verification notes. Never claim unperformed
   runtime testing or that a smoke test validates every historical routine.
8. Keep original recovery evidence separate from new execution evidence. Retain
   third-party notices and exact dependency versions/lockfile. Update README and
   workflow instructions as needed, commit the finished integration, and report
   remaining limits. Keep publication and future modern rewrites out of scope
   unless requested. Never spawn subagents unless the user explicitly asks.

Use American spelling in all new prose, UI text, comments, and docs: color,
behavior, neighbor, favorite, center, gray, catalog, canceled, labeled, -ize/-yze
(organize, analyze). Watch especially for British "-our" and "-re" endings. Never
change spelling inside recovered historical files, quoted program output, or
program data (Bomb's color list deliberately has both GREY and GRAY). Leave
frozen release builds under `public/` alone; rebuild them instead.

Do not add AI co-author trailers (such as `Co-Authored-By: Claude …`) or other
AI attribution lines to commit messages or pull request descriptions.

## Commands

From the root, `just show [program]` starts the dev server and opens a browser.
From `app/`: `npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run test:browser`.

Move fast: this is a personal project. After each change run `npm test` and
`npm run build` (seconds) before committing. Start `npm run test:browser`
(Playwright, minutes) in the background and keep working; report and fix any
failures when it finishes. On 2026-10-31 the user authorized publishing without
waiting for browser tests: the project has no users yet. Build, unit tests and
release-integrity checks gate deployment. Browser checks run in a separate
GitHub workflow and must not block publication; report and fix failures afterward.
For a nonstandard local browser installation, set PLAYWRIGHT_CHROMIUM_EXECUTABLE.

## Preserve both views of historical versions

Keep every recovered version together in `programs/<slug>/versions/` for website
selection and downloads. Also maintain stable canonical paths under
`programs/<slug>/original/` for the listing, raw payload, and provenance. Advance
those same files in one commit per version, in documented inferred development
order, verifying each committed blob against its snapshot hash. Add program-specific
tags (for example, `castles-v01`) to make each canonical revision easy to compare.
Append this history when earlier commits are already published; do not rewrite
user history unless the user explicitly authorizes it. Use actual import dates, preserve all historical bytes, and explain
when the latest historical source differs from the website's playable default.
When a program began as someone else's published listing, the canonical history
may start with a transcription of it (Alien: Yob's Hunt the Wumpus, tag
`alien-wumpus`, also kept in `programs/alien/wumpus/`) so `git diff -w` shows the changes.

## Native TypeScript implementations

Behavior first, improvements later. Castles now uses v05 plus FALL assembly v6
as its native TypeScript reference. Each program's site runs only its best BASIC
version, at `#/program/<id>/basic` (Castles v05, bal v20, Alien v02 with its spelling corrected from `programs/alien/corrected/`, 3-D Plot v03, CISAB Chess v14 with six bugs and its spelling corrected from `programs/chess/corrected/`, Bomb v02). Never offer two
playable BASIC editions of one program (for example with and without corrections); the user wants only the best one. Other recovered
versions are source only (listing, payload, provenance). Keep `programs/castles/typescript/` separate from all recovered files.
The modern implementation is a first review baseline, with differences documented
in its PARITY.md. Do not silently claim cycle-exact or exhaustive equivalence.
Use `npm run typecheck`; `npm test` also runs ROM/Z80 comparison fixtures.
Use `npm run build:fall` to reproduce the derived executable; never describe that
modern build as recovered historical machine code. Record provenance for any
new external dependency before enabling a historical version in the player.

3-D Plot's TypeScript version (`programs/plot3d/typescript/`) reproduces v03's
dots exactly, using Level II rounding and ports of the ROM's LOG/EXP/SIN/ATN
(`mbf.ts`). After any engine change, `npm test` must still match the emulator
fixtures; re-record them with `npm run record:plot3d`. Surface formulas are
Level II BASIC line-200 text shared by both players (`formulas.js`).

Chemical Equation Balancer's official short name is **bal**: use it for its folder
(`programs/bal/`), URLs (`#/program/bal`), program ID, and tags (`bal-v01`,
`bal-web-v1`). Chemical Equation Balancer uses a Rust port of Chemistry Balancer II v20 in
`programs/bal/rust/`, compiled to WebAssembly. After
changing Rust sources run `cargo test` there and `npm run build:balancer`, and
commit the regenerated `rust/pkg/`; `npm test` rejects a stale build. Differences
are in its PARITY.md. Its browser version is the site default; v20 is Original.

CISAB Chess (`programs/chess/`) opens a Rust port of corrected v14 (`rust/`, WebAssembly,
`modern/player.js`) by default. For the same moves it makes the same replies as
the original, which includes its illegal moves, its BASIC errors, and its endless
loop when checkmated. Never "fix" CISAB's play in the engine. The board offers
the human every legal move, and disqualifies CISAB on an illegal move or a BASIC
error. After Rust changes run `cargo test`,
`npm run build:chess` (commit `rust/pkg/`), and `npm test`, which replays the
recorded emulator games in `modern/parity-fixtures.json`; re-record them with
`npm run record:chess`. Differences are in `rust/PARITY.md`.

Run browser tests against your own preview port (`PLAYWRIGHT_BASE_URL`) when
another worktree may already be serving 5181, since Playwright reuses it.

Write the collection’s personal history in first person ("I wrote"), not as a
third-person biography. Preserve historical source credits and copyright notices.

## Preserve web experiences

Every program starts with web v1, separately from recovered historical versions.
Follow [WEB-VERSIONS.md](docs/WEB-VERSIONS.md). Published builds under
`public/<program>/vN/` are immutable. Public program links default to
the latest entry in `programs/<program>/web-versions.json`; the gallery and permanent
version URLs retain every earlier experience. Preserve its entire player, styling,
instructions, original payloads, and license notices.

Develop and test editable source using `?development=1`. Before publishing changes
to a program's experience, commit its source, run `npm run release:web -- <program>`
to freeze the next sequential version, verify it, and commit its snapshot/catalog.
Use tags such as `castles-web-v1`, distinct from historical tags such as `castles-v01`.
Never fix a published snapshot in place or rebuild old releases using newer code.
CI verifies their hashes and rejects modifications to previously published versions.

**Clean release URLs are `/<program>/vN/`.** They open the release's frozen
default player with no hash or query parameters. Collection cards and version
selectors link directly to these paths. Existing alternate implementation/source
navigation uses query parameters, never public hash routes. The editable local
app can retain its development hash routes.

On 2026-10-31 the user explicitly authorized replacing the six unshared v1 builds
to establish these clean URLs. This one-time migration uses
`node scripts/migrate-web-v1.mjs --replace-unshared-v1` and a migration commit
containing `[reset-web-versions]`. Old snapshots remain in Git history. After that
migration, v1 is immutable: all subsequent program changes become v2 or later
with `npm run release:web -- <program>`. Never reset or replace these new v1s
without another explicit user instruction. A new program starts at its own v1.

## No intermediate pages

Never put a start, instructions, or launch page between a visitor and a program.
Every link to a playable program or version (collection cards, bare program
routes such as `#/program/<id>`, version links, web releases) opens its player
directly. Instructions live in the player's Help dialog and the "About, history &
source" section below the field. Only a version that cannot run gets a
non-player page, explaining why and linking to a playable one.

## Castles web UX

Browser play starts with the arch and tower; the Start from picker offers other
scenes and an empty field (`?scene=blank` opens one directly in a frozen release). Controls always dock
beside the field on desktop and below it on phones. Help pauses and restores
the same scene and prior pause state. Browser and Original keep separate paused
in-memory sessions until reload; do not imply scene transfer or persistence to
disk. Confirm clearing/replacement only when work exists. PNG saves preserve
brick layouts, not running sessions. Keep phase actions and pause outside
advanced controls. See [the UX specification](docs/castles-user-experience-spec.md)
and [development checks](docs/development.md).

## Repository layout and publishing

Website code, scripts, tests and artwork live under `app/`. Configuration lives
in `app/config/`, and the shared VS Code workspace is in `tools/`. Keep the root
listing short; put supporting documentation in `docs/`. Run the usual npm
commands from `app/`; they explicitly select the relocated configuration.
Preserve `programs/` historical paths and all frozen `public/<program>/vN/` bytes.
The user has authorized pushing verified changes and deploying GitHub Pages;
complete deployment and check the live result before reporting it ready.

## Unlinked second gallery

Programs with `gallery: "more"` appear only at `#/more`, not on the main gallery.
Keep this gallery and its programs unlinked from the main collection until the
user requests otherwise. Reuse shared gallery markup and player controls.
Speech and Olympics are separate entries even though their code is related.
The X-wing identity remains tentative. Use `starwars81` for the program ID, source folder, new URLs, and new tags. Display a source title when present; neither current listing prints one, so use the descriptive display title "Star Wars cockpit." Historical import tags remain intact as provenance. Coaching games capture the original
Model III printer-port output in a roster panel without altering recovered BASIC.

## Extra-program release policy

On November 2, 2026, the user confirmed no extra-program URLs had been shared
and authorized resetting Speech, Olympics, and starwars81 to unshared web v1.
Keep these extra programs at web v1 until the user says to advance them; local
iterations may replace their unshared v1 snapshots. Offer one best playable
version, without web-version menus. Other recovered versions are source only.
This exception does not permit changing any previously published main-gallery
release. Use `starwars81` exactly for the cockpit game's internal and URL name.

For local v1 iterations, mark extra programs with `unsharedWebV1: true`, commit
the source, and run `npm run release:web -- <id> --refresh-unshared-v1`. The
release helper refuses this option for main-gallery/published programs and
refuses to advance these extras to v2 automatically. New extras use the normal
release command once to create v1. Use `showWebVersions: false` here.

Ricky Rat, Pinball, the logic-circuit simulator, and the orbit simulator were
also requested for the unlinked gallery on November 2, 2026. Their compact IDs
are rickyrat, pinball, logic, and orbit; they follow the same unshared-v1 policy.
Gallery artwork for these four is captured from the actual original players at
native canvas aspect ratio. Only set CAPTURE_GALLERY_ART=1 when intentionally
refreshing those PNGs; ordinary browser tests must not alter tracked artwork.

The next requested extra programs are skinner, german, magazine, teachvi, poker,
and life. They follow the same single-player, unshared-v1 policy. Magazine Index
captures LPRINT with optional emulator acceleration; its source is unchanged.
Poker uses the self-contained text save; later graphics-extension saves are
source only. LIFE preserves raw EDTASM plus both exports. Run `npm run build:life`
from app/ to reproduce its separately derived executable and BASIC USR bootstrap.
Do not describe that build as a recovered historical binary. Archive checks
validate EDTASM records separately from BASIC. Browser evidence is in
app/tests/browser/learning.spec.js; LIFE also has an original-Z80 blinker fixture.

## Gallery illustrations

On November 2, 2026, the user asked to improve the unreadable screenshot
previews on the more page. Its ten PNG-based cards now use program-specific
`app/assets/*-gallery.svg` illustrations. Keep their cobalt/cream palette and
large, legible shapes. These are illustrative artwork, not execution evidence.
Original emulator PNG captures remain separate; CAPTURE_GALLERY_ART=1 updates
those evidence captures only, not the live gallery illustrations. Provenance
records the illustration under artwork and the original under emulator_capture.
Gallery-only illustration changes do not require rebuilding frozen players.

Poker now plays only the minimally corrected derivative of tape12b save 6
(import v02), in programs/poker/corrected/. Rebuild with
`npm run build:poker-corrected`. Preserve all recovered originals and snapshots.
The patch reverses line 2190, removes debug STOP 1005, corrects THEEN at 3310,
and fixes quoted spelling. Keep its web release at unshared v1. Tests cover
executable patch scope, real-ROM card evaluation/drawing, and browser showdown.

On November 2, 2026, the user requested a new LIFE version fixing its corner-copy
bug. LIFE now advances to immutable web v2; preserve its existing web v1.
The one playable edition is the corrected derivative of v06 in
`programs/life/corrected/`: LD BC,991 becomes LD BC,992 after CALL GEN.
Run `npm run build:life-corrected` to reproduce it; `build:life` still reproduces
the untouched recovered-source assembly in `derived/`. The full-loop Z80 tests
cover six generations of stationary, oscillating, moving, and wrapped patterns,
plus the old corner failure. Preserve recovered sources and both derived builds.

On November 2, 2026, the user requested removing Poker from the website.
`programs/poker/program.json` now has `website: false`. Keep its recovered
sources and corrections as archive material; do not restore a gallery entry,
player route, redirect, or public release without a new request. Its withdrawn
web v1 is preserved byte for byte in programs/poker/website-archive/v1. The
release checker validates archived snapshots but excludes them from active
release counts; the build and release helper respect the withdrawal flag.

## Six additional games and experiments

On November 2, 2026, the user requested Worm One (`worm`), Peoria Grand Prix
(`peoria`), Pendulum (`pendulum`), Sentence Generator (`sentences`), Learning
Tic-Tac-Toe (`learningttt`), and Superpower Investing (`spi`) in More. Keep them
at unshared web v1 and offer one selected player apiece. Their 21 snapshots and
canonical tagged histories preserve complete captured sources, including drafts
and empty-price templates. Peoria includes the related two-mile race forms.
Exclude the quarantined file8b sentence item; preserve names and vocabulary in
the two tape10b sources. Use the shared real-ROM emulator, not a rewrite.

Tic-Tac-Toe’s v04 needs its DEF FN expressions expanded for stock Level II ROM;
rebuild the separate derivative with `npm run build:learningttt-runtime`.
Keep every other record body unchanged and document historical prototype bugs.
The loader adaptation does not make its learning or rule enforcement correct.
Browser checks live in `next-six.spec.js`; artifact/ROM checks in `next-six.test.mjs`.

SPI personal history: “Superpower Investing was my first professional program,
unless the bond-amortization program I wrote for my dad came earlier.” This is
user recollection, not a proven date order. SPI has a 1974 notice; BOND on tape31a
has a 1979 Carl Kadie notice. Neither dates these saves or settles their order.
Do not import BOND or claim it executes in the TRS-80 emulator: its recovered
payload is Commodore BASIC, likely PET/CBM, with the exact machine unverified.

Worm One’s About/Help cites Gardner’s November 1973 Mathematical Games column
and links to the publisher and Beeler’s June 1973 MIT memo. Research notes are
in programs/worm/history/scientific-american.md. Its Speed selector offers
original 1× (default) and nominal 20× through the shared emulator; changing speed
keeps the current path, survives Restart, and respects Pause/Help. Keep its
unshared web experience at v1 and preserve every recovered payload byte.

## Five further More programs

The user requested all five on November 2, 2026: Trigectior (`trigectior`),
Relativity (`relativity`), Reflex Tests (`reflex`), Nuclear Equation Completer
(`nuclear`), and John’s Circle (`johnscircle`). Preserve their seven complete
captures with snapshots and canonical per-save tags. Keep one selected player
each and unshared web v1. User-approved display titles may normalize source
title spelling; recovered listings and bytes remain unchanged.

Trigectior v02 is tape22a save 4; its explicit source credit is October 24, 1978.
Relativity is tape22a save 10, credited May 9, 1979. John’s Circle, tape21b save
13, credits John Hartman and Carl Kadie jointly. These are source notices, not
save dates. Reflex and the nuclear source do not establish an author/date.
Relativity offers optional 20× pacing for its slow graph; Reflex stays at 1×.
Preserve original clock labels, timing estimates, and other historical quirks.

Nuclear’s complete reference is tape14a save 8. Keep the separate damaged
tape22a save 6 in partial/: 1294 prefix bytes, 32 records through 4010, no added
end marker, independent-channel confirmation. Run
`python3 app/scripts/verify-science-five.py /path/to/trs80` to verify archive,
prefix structure, and channel provenance. Do not splice the two recordings.
The separately titled feet-per-second Projectile Trajectory on tape21b is not
assumed to be a Trigectior revision. Browser checks live in science-five.spec.js.

The user requested correcting the apparent Trigectior misspelling: display
Trajectory as its title. Keep the existing trigectior internal ID and historical
filenames/tags for provenance; do not change recovered program comments/bytes.
Reflex’s original line 5000 spells CATALOGUE in both identical saves; that is
quoted historical text, so retain it. All new prose still uses American catalog.
