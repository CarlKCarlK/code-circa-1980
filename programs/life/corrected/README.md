# Corrected LIFE v06

The player uses a modern assembly of tape10b save 6 with one instruction operand
changed: `LD BC,991` becomes `LD BC,992` immediately after `CALL GEN`.
The left half of the final display row ends at byte offset 991, so copying offsets
0 through 991 requires 992 bytes. The original stops at offset 990 and leaves
cells (62–63, 45–47) stale. This patch includes that final graphics character.

Recovered `original/` and `versions/` files, the untouched executable in
`derived/`, and frozen web v1 remain unchanged. This is a modern derivative,
not recovered historical machine code or a seventh historical save.

From `app/`, run `npm run build:life-corrected` to reproduce `LIFE.Z80`,
`life.bin`, `build.json`, and the unchanged BASIC bootstrap copied from `derived/`.
The build manifest records the original and corrected hashes and every changed
binary byte. The only binary difference is offset 35: DF becomes E0.

Run `node tests/life-corrected.test.mjs` from `app/` for full-loop Z80 comparisons
against Conway rules, including wrapping and the original failing corner case.
