# Stock-ROM loading adaptation

The recovered v04 starts with DEF FN declarations. The stock Level II ROM
reports ?L3 Error at line 10 because it lacks that extension. This derivative
removes declarations 10 and 12 and expands the same arithmetic expressions
at their five call-site lines (215, 218, 300, 305, 4010). All other record bodies
are copied unchanged. Line pointers are recomputed at the original base.

No learning, board, outcome-reporting, or debugging bugs are corrected. The
untouched payload and listing remain in ../versions/v04 and ../original.
Run `npm run build:learningttt-runtime` from app/ to reproduce the derived
payload, listing, and line-by-line changes.json. This is an adapted historical
prototype, not a modern tic-tac-toe implementation.
