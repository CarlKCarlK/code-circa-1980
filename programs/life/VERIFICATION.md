# Verification

Imported raw and readable files match the recovery archive byte for byte.
Every complete BASIC snapshot has ordered records, one pointer base, and an exact end marker; LIFE instead has valid EDTASM source records and its 1A terminator.
Canonical local commits/tags preserve each original revision.

Browser startup and representative controls are exercised by app/tests/browser/learning.spec.js. Verified November 2, 2026: Original assembly editor responds to arrows and Space, Enter begins generation output, Escape clears back to editing, pause/restart. A direct Z80 fixture verifies a three-cell horizontal blinker becomes vertical. The executable is newly assembled from untouched v06 source; no recovered machine code is claimed. Recovery validation does not establish that every historical routine works.
