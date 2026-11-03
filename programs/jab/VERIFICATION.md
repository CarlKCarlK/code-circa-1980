# Verification

Original-ROM browser execution: generate maze, select one monster, arrow-key movement, 0 explosive prompt (a second 0 after an unfinished movement burst), 2,3 drops/timer input reducing flask to 998 ML, a subsequent move, pause/resume, and restart. No full maze clear, all enemy states, or exhaustive explosion geometry was tested.

Seven complete payload/listing pairs across this batch were compared byte for byte with the recovery archive. The verifier checks every tagged canonical blob, every full-payload matching source claimed by the recovery inventories, upstream hashes, and the separate JAB prefix with all claimed matching candidates. `npm test` additionally checks ordered BASIC records, pointer bases, exact EOF, listing counts, and detokenized listings.

From app/: `npm test`, `npm run build`, and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5279 npm run test:browser -- monster-games.spec.js`. Start that port using `npm run dev -- --port 5279 --strictPort`, or test a production preview on your own port. From the repository root: `python3 app/scripts/verify-monster-games.py /path/to/trs80`.

Recovery validation and website execution are separate. Only the selected reference was runtime-tested; earlier versions, upstream comparison sources, and the damaged prefix are source only.
