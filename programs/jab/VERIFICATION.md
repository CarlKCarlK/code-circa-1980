# Verification

Original-ROM browser execution: generate maze, select one monster, arrow-key movement, 0 explosive prompt (a second 0 after an unfinished movement burst), 2,3 drops/timer input reducing flask to 998 ML, a subsequent move, pause/resume, and restart. No full maze clear, all enemy states, or exhaustive explosion geometry was tested.

Seven complete payload/listing pairs across this batch were compared byte for byte with the recovery archive. The verifier checks every tagged canonical blob, every full-payload matching source claimed by the recovery inventories, upstream hashes, and the separate JAB prefix with all claimed matching candidates. `npm test` additionally checks ordered BASIC records, pointer bases, exact EOF, listing counts, and detokenized listings.

From app/: `npm test`, `npm run build`, and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5279 npm run test:browser -- monster-games.spec.js`. Start that port using `npm run dev -- --port 5279 --strictPort`, or test a production preview on your own port. From the repository root: `python3 app/scripts/verify-monster-games.py /path/to/trs80`.

Recovery validation and website execution are separate. Only the selected reference was runtime-tested; earlier versions, upstream comparison sources, and the damaged prefix are source only.

The player now runs the corrected source/JAB.BAS (November 4, 2026). `npm test` compares blast sizes for the original and corrected lines on the actual ROM. verify-monster-games.py checks that source/JAB.ASC differs from tag jab-v04 only at line 3525 and the maze-size lines 12, 14, 16, 30, 40, 50, and the AGAIN SAME MAZE prompt on line 4900.
