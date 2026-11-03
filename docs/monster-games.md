# Cave and monster games

The requested three groups preserve seven complete captured saves: Jaberwocky (tape20a:3), Cave Game (tape9a:10–11), and JAB (tape16a:1–3, tape30a:1). JAB’s tape16a:5 damaged alternate retains its raw candidate and 270-byte prefix separately, without a synthetic end marker or any splice.

Each selected player runs an untouched payload through the shared original-ROM emulator. Help describes exact commands, optional acceleration, historical bugs, and restart. These are archival runs, not corrected modern rewrites. All earlier versions are source only. The site uses unshared web v1 and the existing gallery presentation.

Jaberwocky borrows Quest’s dispatcher/descriptions; its canonical history begins with an explicitly incomplete published excerpt, not an invented full original. JAB’s early maze forms borrow Hauber’s Amazing; a complete electronic book transcription starts that comparison history, with its transcription limits stated. No verified original was found for Cave Game. Published-source dates, nearby notices, and inferred ordering remain separate from unknown save dates. Program-specific history notes contain the evidence and comparison commands.

Verification: `python3 app/scripts/verify-monster-games.py /path/to/trs80`, `npm test`, `npm run build`, and `npm run test:browser` from app/. Targeted browser checks are monster-games.spec.js. Do not rerun recovery or modify the archive inventory for a website import.

## Completed verification, November 2, 2026

- The archive verifier passed for seven complete payload/listing pairs, all tagged canonical blobs, both upstream comparison hashes, and all 20 full-payload matching sources claimed by the recovery inventories. The JAB prefix and every claimed matching prefix also passed, including independently processed left/right channels.
- `npm test` and the production build passed. Release integrity verified all 44 active immutable releases, including a comparison against the preceding main branch.
- The production browser suite ran all 130 scenarios: 129 passed on the full run. Its one stale gallery title-list expectation was updated to include the three new cards, then passed in isolation. No unresolved browser failure remains. All seven new monster-game scenarios passed, covering actual original-ROM inputs, frozen URLs, Help, downloads, gallery navigation, and mobile layout.
- Runtime limits remain in each program’s VERIFICATION.md: testing is representative, not exhaustive. Jaberwocky’s historical missing-line error and Cave Game’s dart/move behavior remain visible and documented. No recovered bytes were corrected.

The three unshared v1 players are local artifacts at `/jaberwocky/v1/`, `/cave/v1/`, and `/jab/v1/`. From the repository root, `just show jaberwocky` opens the selected player; use `cave` or `jab` for the others. The workspace in tools/ retains both this repository and the recovery archive. No new tape recovery or inventory rewrite was performed.
