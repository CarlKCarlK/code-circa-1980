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
4. Register the program in `site/catalog.js` and put its presentation functions
   in `site/programs/<slug>.js`. Keep common navigation and emulator
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

`npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run test:browser`.
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
