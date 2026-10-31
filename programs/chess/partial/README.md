# CISAB Chess — damaged saves

Unchanged copies of the recovery archive's files for two damaged saves. They are
not playable and are not numbered versions. `*-PREFIX` and the main `.ASC` hold
only the validated prefix; `-UNCERTAIN.ASC` is the decoder's full listing,
including later corrupt text, and is not validated. `-RAW.BAS` and the
damaged-save `.BAS` are the raw candidates. Nothing was added or repaired.

## tape1b save 9 (`tape1b-save09/`)

Damaged save between v01 and v02 on the tape. Its validated 50-line prefix (lines 10-610) is identical to the first 50 lines of v02, so it is probably an earlier save of v02. tape1b2 save 9 has the same validated prefix.

Recovery: Validated untouched prefix: 50 lines through 610; exact left/right prefix agreement; no synthetic end marker; No complete end marker recovered in any sweep. 50 ordered lines through 610 (1981-byte prefix) match both channels; later partial line is unvalidated. Not filled from another chess save.

## tape13b save 7 (`tape13b-save07/`)

Damaged save between v13 and v14. Its validated 38-line prefix (lines 10-310) has v14's normal board DATA but v13's DAMN wording and no opening (no S$), so it falls between them.

Recovery: Exact 1493-byte prefix and raw candidate match both channels; later stream damaged

Hashes and archive paths are in ../provenance.json under `partial_saves`.
