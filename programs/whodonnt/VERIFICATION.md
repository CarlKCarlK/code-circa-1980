# Verification

Original-ROM checks passed: NO at instructions, suspect and weapon lists, BRING ME PROF. EINS, WHAT ROOM WHERE YOU IN?, NOTHING MORE, pause/resume and restart. The courtroom is unfinished (missing 5050/5500), and no completed verdict is claimed.

Run `python3 app/scripts/verify-five-history.py /path/to/trs80` from the repository root. It checks archived bytes, canonical tagged blobs, matching payloads, upstream hashes, and suspect-candidate/prefix provenance. `npm test` checks full BASIC structure, exact EOF, detokenized listings and line counts. From app/: `npm run build` and `npm run test:browser -- history-five.spec.js` test integration. These tests send real keyboard input to the original ROM. Recovery-inventory execution flags are unchanged; new evidence is separate.
