# Verification

Imported raw and readable files match the recovery archive byte for byte.
Every complete BASIC snapshot has ordered records, one pointer base, and an exact end marker; LIFE instead has valid EDTASM source records and its 1A terminator.
Canonical local commits/tags preserve each original revision.

Browser startup and representative controls are exercised by app/tests/browser/learning.spec.js. Verified November 2, 2026: Configured a one-question German-to-English lesson and marked IT BRINGS correct for ES BRINGT; pause/restart. Not every lesson, grading option, or vocabulary error was exercised. Recovery validation does not establish that every historical routine works.
