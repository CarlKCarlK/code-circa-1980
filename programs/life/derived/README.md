# Derived executable

Run `node scripts/build-life.mjs` from app/. The pinned z80-asm 2.3.0 assembler reads untouched v06 Z80 source. Because that source has no ORG, this build prepends ORG 8000H, choosing a free RAM location explicitly. No historical instruction is edited. The generated BASIC bootstrap sets the Level II USR vector and calls the assembled entry through USR.

The six recovered EDTASM payloads and both exports remain unchanged. The separate incomplete compiled recording contains only a header; this build does not reconstruct its missing bytes or claim to be that recording. build.json records source and executable hashes and symbols.
