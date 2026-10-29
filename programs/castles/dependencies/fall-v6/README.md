# Recovered FALL assembly v6

The unchanged source/editor payload is tape18a save 23, immediately preceding
the v05 BASIC save. Its ORG 0x7F00 and TST byte at 0x7FD5 match that BASIC's USR
entry and parameter addresses exactly.

`derived.bin` is a **modern assembly**, not a recovered historical executable.
Run `npm run build:fall` at the repo root to reproduce it with z80-asm 2.3.0.
Only the EDTASM editor's decimal line-number prefixes are removed before assembly.
`derived.json` records hashes, symbols, tool version, and the transformation.
`provenance.json` retains the original recovery evidence for the source payload.

The browser schedules loading after the BASIC program is initialized and before
its construction phase can reach the USR call. The recovered BASIC remains
unchanged. Automated tests verify the interface, initial screen, direct routine
execution, and a BASIC USR call that returns with the expected settled screen.
