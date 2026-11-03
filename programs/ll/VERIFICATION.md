# Verification

Original-ROM checks passed for tape9a save 9: NO at instructions; 0,10 advances the free fall and plotted point; 0,120 reaches impact at 113.553 seconds and 4008.79 mph; 75,10 after restart leaves 15750 pounds of fuel. Pause/resume and restart passed. No successful soft landing, upward-motion branch, or exhaustive physics parity is claimed. Upstream FOCAL and published BASIC baselines were not executed.

Run `python3 app/scripts/verify-five-history.py /path/to/trs80` from the repository root. It checks archived bytes, canonical tagged blobs, matching payloads, upstream hashes, and suspect-candidate/prefix provenance. `npm test` checks full BASIC structure, exact EOF, detokenized listings and line counts. From app/: `npm run build` and `npm run test:browser -- history-five.spec.js` test integration. These tests send real keyboard input to the original ROM. Recovery-inventory execution flags are unchanged; new evidence is separate.
