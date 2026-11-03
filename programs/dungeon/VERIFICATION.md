# Verification

Original-ROM checks passed for the self-contained file8b save 9: equipment/HP display, F to fight, Y to parry, a monster response, pause/resume and restart. Combat tables are never initialized in this captured text save. Later graphics-extension variants were not executed; exhaustive random encounters and tabletop-rule correctness were not tested.

Run `python3 app/scripts/verify-five-history.py /path/to/trs80` from the repository root. It checks archived bytes, canonical tagged blobs, matching payloads, upstream hashes, and suspect-candidate/prefix provenance. `npm test` checks full BASIC structure, exact EOF, detokenized listings and line counts. From app/: `npm run build` and `npm run test:browser -- history-five.spec.js` test integration. These tests send real keyboard input to the original ROM. Recovery-inventory execution flags are unchanged; new evidence is separate.
