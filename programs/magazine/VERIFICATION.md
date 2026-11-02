# Verification

Imported raw and readable files match the recovery archive byte for byte.
Every complete BASIC snapshot has ordered records, one pointer base, and an exact end marker; LIFE instead has valid EDTASM source records and its 1A terminator.
Canonical local commits/tags preserve each original revision.

Browser startup and representative controls are exercised by app/tests/browser/learning.spec.js. Verified November 2, 2026: Actual original LPRINT output includes subject, article title, magazine/date/page; pause freezes execution and restart clears/reprints. Printer defaults to 20× emulation; all article sorting is not exhaustively checked. Recovery validation does not establish that every historical routine works.
