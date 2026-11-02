# Verification

Imported November 2, 2026. All raw payloads and listings are byte-identical to
the recovery archive. Ordered line records, a consistent pointer base, exact
record coverage, and the normal end marker validate every complete payload.
The listing matches the local decoder and the BASIC record count. Historical
bugs and original spelling are preserved.

`python3 app/scripts/verify-second-gallery.py` verifies snapshot hashes, every
canonical tagged Git blob, and the final canonical original. `npm test` runs
archive validation; `npm run build` checks production bundling and types.
Program-specific browser checks are in `app/tests/browser/next-six.spec.js`.
Execution results and their limits will be recorded after the final browser run.
