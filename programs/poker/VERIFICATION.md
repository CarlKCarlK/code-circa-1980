# Verification

Imported raw and readable files match the recovery archive byte for byte.
Every complete BASIC snapshot has ordered records, one pointer base, and an exact end marker; LIFE instead has valid EDTASM source records and its 1A terminator.
Canonical local commits/tags preserve each original revision.

Browser startup and representative controls are exercised by app/tests/browser/learning.spec.js. Verified November 2, 2026: Observed a dealt hand and submitted a fold; pause/restart. Complete matches and all historical betting branches were not exercised. Later graphics-extension versions remain source only. Recovery validation does not establish that every historical routine works.

## Minimal corrected edition

The derived v02 patch is reproducible with `npm run build:poker-corrected`.
Five focused emulator/byte tests cover patch scope, deck preservation, a valid
full house and flush, and drawing without the debug STOP. The source-only
snapshots and canonical tagged originals still pass their archive hashes.
Browser round-trip checks are in app/tests/browser/poker-corrected.spec.js.
See corrected/README.md for exact changes and remaining historical limitations.
