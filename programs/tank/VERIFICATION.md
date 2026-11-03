# Verification

Source-only browser entry verified: no emulator or playable-version self-link, working original listing/payload downloads and earlier-prefix links. No Tank program execution is claimed. The validated captured payload contains unfinished syntax, pseudocode, and missing behavior.

Run `python3 app/scripts/verify-five-history.py /path/to/trs80` from the repository root. It checks archived bytes, canonical tagged blobs, matching payloads, upstream hashes, and suspect-candidate/prefix provenance. `npm test` checks full BASIC structure, exact EOF, detokenized listings and line counts. From app/: `npm run build` and `npm run test:browser -- history-five.spec.js` test integration. These tests send real keyboard input to the original ROM. Recovery-inventory execution flags are unchanged; new evidence is separate.
