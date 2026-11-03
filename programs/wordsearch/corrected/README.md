# Corrected playable copy

Derived from tape4a save 7, historical v01. Reproduce from app/ with
`npm run build:wordsearch-corrected`. changes.json records source/output hashes
and every changed line. Four record bodies change:

- Line 1065: pad the current word to 40 columns to erase the previous word,
  preserving the position counter at column 40.
- Line 1330: RERRINT → REPRINT in the redraw prompt.
- Line 2000: DISSCUSSION → DISCUSSION in the active word list.
- Line 3000: SOLVEN → SOLVENT in the unused chemistry word list.

Names and possible abbreviations remain unchanged. Pointer addresses are
recomputed at the original memory base. The recovered original and historical
snapshots remain byte for byte unchanged. A different word length may change
placements and the resulting puzzle; the placement algorithm is unchanged.

The single playable edition uses this derivative and remains unshared web v1.
