# Alien — corrected spelling (derived)

`ALIEN.BAS` and `ALIEN.ASC` are **not** recovered files. They are Alien v02
(`../versions/v02/08-ALIEN-HUNT-EXPANDED-SAVE01.BAS`, SHA-256
`578c336cb89f68eea9c0b1c5b05ffa6bf3848274fb5ccfe03ea8dfe9995e7bad`) with the spelling in its printed text corrected, made at
my request in 2026 because the misspellings (ALEIN, JUCTION, TO LATE, ...) get in
the way of play. The website plays only this edition; the recovered v02 files are
unchanged and downloadable as source.

Rules, from [corrections.json](corrections.json):

- Only bytes inside quoted strings change. Tokens, line numbers, program logic,
  REM comments and spacing are unchanged.
- Two line-specific layout fixes keep corrected lines within 63 columns: on the
  TRS-80 a 64-column line leaves a blank line and a 65-column line wraps.
- Line pointers are recomputed for the new lengths using the original memory base.

Regenerate with `node scripts/build-alien-corrected.mjs` from `app/`.
`npm test` rebuilds it and checks it against these files.

Result: 7571 bytes (v02: 7560), SHA-256 `eea9e3638c75a0d4322ce7fe0e0b2e5bc2ae4dc7632d9a1c331de6f18fbcda21`.

| Line | Original | Corrected | Times | Why |
|---|---|---|---|---|
| 1010 | `IS TO LATE` | `IS TOO LATE` | 1 | spelling |
| 1010 | `GOTTEN ON-BOARD, ALREADY` | `GOTTEN ONBOARD, ALREADY` | 1 | layout: TOO makes this line 64 columns, which prints an extra blank line |
| 1030 | `THOUGHOUT` | `THROUGHOUT` | 1 | spelling |
| 1040 | `JUCTION` | `JUNCTION` | 3 | spelling |
| 1080 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 1080 | `LEAD TWO SPACE` | `LEAD TO SPACE` | 1 | spelling |
| 1080 | `VACUM ` | `VACUUM ` | 1 | spelling |
| 1100 | `FALIURE` | `FAILURE` | 1 | spelling |
| 1120 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 1120 | `DIS-OREINT` | `DISORIENT` | 1 | spelling |
| 1125 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 1140 | `ALEIN` | `ALIEN` | 1 | spelling |
| 1150 | `ALEIN` | `ALIEN` | 1 | spelling |
| 1230 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 1240 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 1245 | `JUCTION` | `JUNCTION` | 2 | spelling |
| 1245 | `NIETHER` | `NEITHER` | 1 | spelling |
| 1245 | `  CLOSING A JUNCTION:` | `CLOSING A JUNCTION:` | 1 | layout: Corrected spelling makes this line 65 columns, which wraps YOU onto its own line |
| 1300 | `ALEIN` | `ALIEN` | 1 | spelling |
| 1350 | `ALEIN` | `ALIEN` | 1 | spelling |
| 1380 | `VACUME` | `VACUUM` | 1 | spelling |
| 1390 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 1390 | `FALIURE` | `FAILURE` | 1 | spelling |
| 1390 | `BOOBIE-TRAPPED` | `BOOBY-TRAPPED` | 1 | spelling |
| 2100 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 2100 | `BOOBIE-TRAPPED` | `BOOBY-TRAPPED` | 1 | spelling |
| 2130 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 2130 | `YOUR ARE IN` | `YOU ARE IN` | 1 | spelling |
| 2148 | ` NO WHERE.` | ` NOWHERE.` | 1 | spelling |
| 3040 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 3080 | `JUCTION` | `JUNCTION` | 1 | spelling |
| 3420 | `GLOP TO SLIME` | `GLOP OF SLIME` | 1 | spelling |
| 4160 | `TENICALS` | `TENTACLES` | 1 | spelling |
| 4280 | `JUCTIONOS` | `JUNCTIONS` | 1 | spelling |
| 6015 | `JUCTION` | `JUNCTION` | 1 | spelling |
