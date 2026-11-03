# Verification

Original-ROM checks passed for file8b save 18: R loads and executes the embedded addition deck, prints the exact encoded result 10009671948, and reaches FINISHED. Pause/resume and restart passed. No claim of full TUTAC instruction-set coverage; the multiplication/debugging version and suspect candidate are source only.

Run `python3 app/scripts/verify-five-history.py /path/to/trs80` from the repository root. It checks archived bytes, canonical tagged blobs, matching payloads, upstream hashes, and suspect-candidate/prefix provenance. `npm test` checks full BASIC structure, exact EOF, detokenized listings and line counts. From app/: `npm run build` and `npm run test:browser -- history-five.spec.js` test integration. These tests send real keyboard input to the original ROM. Recovery-inventory execution flags are unchanged; new evidence is separate.
