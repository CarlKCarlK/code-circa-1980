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
