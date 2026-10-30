# Code Circa 1980

This is a local collection of Carl Kadie's original programs, with browser
emulation first and optional modern versions later. The first program's official
name is **Castles**. Do not add remasters or unrelated programs until requested.

## Adding one program

1. Inspect the recovery archive in the sibling VS Code workspace. Identify related
   versions using inventory, listings, clusters, and user descriptions. Follow an
   official title supplied by the user; preserve archive labels and capture/save IDs.
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

## Commands

From `app/`: `npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run test:browser`.

Move fast: this is a personal project. After each change run `npm test` and
`npm run build` (seconds) before committing. Start `npm run test:browser`
(Playwright, minutes) in the background and keep working; report and fix any
failures when it finishes. Wait for browser tests only before publishing a
web release.
For a nonstandard local browser installation, set PLAYWRIGHT_CHROMIUM_EXECUTABLE.

## Preserve both views of historical versions

Keep every recovered version together in `programs/<slug>/versions/` for website
selection and downloads. Also maintain stable canonical paths under
`programs/<slug>/original/` for the listing, raw payload, and provenance. Advance
those same files in one commit per version, in documented inferred development
order, verifying each committed blob against its snapshot hash. Add program-specific
tags (for example, `castles-v01`) to make each canonical revision easy to compare.
Append this history when earlier commits are already published; do not rewrite
user history. Use actual import dates, preserve all historical bytes, and explain
when the latest historical source differs from the website's playable default.

## Native TypeScript implementations

Behavior first, improvements later. Castles now uses v05 plus FALL assembly v6
as its native TypeScript reference; v03 remains the self-contained earlier
comparison. Keep `programs/castles/typescript/` separate from all recovered files.
The modern implementation is a first review baseline, with differences documented
in its PARITY.md. Do not silently claim cycle-exact or exhaustive equivalence.
Use `npm run typecheck`; `npm test` also runs ROM/Z80 comparison fixtures.
Use `npm run build:fall` to reproduce the derived executable; never describe that
modern build as recovered historical machine code. Record provenance for any
new external dependency before enabling a historical version in the player.

Write the collection’s personal history in first person ("I wrote"), not as a
third-person biography. Preserve historical source credits and copyright notices.

## Preserve web experiences

Every program starts with web v1, separately from recovered historical versions.
Follow [WEB-VERSIONS.md](docs/WEB-VERSIONS.md). Published builds under
`public/experiences/<program>/vN/` are immutable. Public program links default to
the latest entry in `programs/<program>/web-versions.json`; the gallery and permanent
version URLs retain every earlier experience. Preserve its entire player, styling,
instructions, original payloads, and license notices.

Develop and test editable source using `?development=1`. Before publishing changes
to a program's experience, commit its source, run `npm run release:web -- <program>`
to freeze the next sequential version, verify it, and commit its snapshot/catalog.
Use tags such as `castles-web-v1`, distinct from historical tags such as `castles-v01`.
Never fix a published snapshot in place or rebuild old releases using newer code.
CI verifies their hashes and rejects modifications to previously published versions.

## Castles web v2 UX

Keep the short start page before play. Browser play starts with a bridge; Build
from scratch opens an empty field. Controls dock beside the field on desktop
and below it on phones; floating controls are optional. Help pauses and restores
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
Preserve `programs/` historical paths and all frozen `public/experiences/` bytes.
The user has authorized pushing verified changes and deploying GitHub Pages;
complete deployment and check the live result before reporting it ready.
