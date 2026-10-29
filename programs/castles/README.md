# Castles

Build towers and bridges from supported blocks, then let two cannons bombard them.
**Castles** is the official name, confirmed by Carl Kadie on October 29, 2026.
The older Artillery/FALL filenames are recovery catalog labels.

Probably written around **1982**. The opposite side of the tape containing the
later Castles versions holds Ricky Rat, with a source comment dated **6 August
1982**. This is contextual evidence, not a direct date for Castles. Earlier drafts
also share tape23b with Chemistry Balancer II, copyright 1981.

Castles began in TRS-80 BASIC. Later versions added a **Z80 assembly routine for
falling blocks after cannon impacts**, likely to speed up the simulation. Our
current reference is **v05 BASIC plus FALL assembly v6**; both now run together in
the emulator, and the TypeScript port follows their rules. v03 remains available
as the earlier, entirely BASIC version.

The collection opens the instructions before offering the emulator. Start the
website with `npm run dev` from the repository root, choose Castles, and select
**Play Castles**. The default original is v05, with its FALL assembly routine loaded automatically.
Choose **TypeScript** to play the native browser implementation of v05. The
self-contained v03 remains available among the recovered versions.

## Mouse controls in TypeScript

Click and drag to build with the original support rules. Use **Erase** and drag
from the top down, or **right-drag** to erase temporarily. **Move** repositions the
cursor without editing. The pointer can move freely, but floating starts are
rejected and blocks with a block directly or diagonally above cannot be erased.

Touch and pen use the same tools. Turn off **Mouse controls** for keyboard-only
play. The original emulator remains unchanged, and the calibrated TypeScript
keyboard baseline is preserved at tag `castles-typescript-v02`.

## Playing with the original keyboard controls

1. Click the emulator screen.
2. Tap **8** to enable drawing.
3. Hold **1** briefly to build a tower. **2** moves down, **3** left, **4** right.
4. Tap **7** to move without drawing, **8** to draw again, or **9** to erase.
5. Press **Q** to begin bombardment.
6. During bombardment, hold **5** until a shot changes, then **M** for an angle near
   45 degrees. **0–9** controls power and **A–Z** controls angle, sampled between shots.

Use the top number row. Drawing modes remain selected after a key is released.
Blocks need support below or diagonally below. The printed period “stars” are
not support or obstacles. Pause freezes the machine; Restart begins a new build.
On-screen buttons provide the same original key inputs.

v01 and v02 use different construction controls: tap Enter to place a block,
then make a small movement with 1–4 and tap Enter again; Space starts bombardment. Their instruction pages reflect this.

## Versions in source control

| Order | Version | Capture / save | Development evidence |
| --- | --- | --- | --- |
| 1 | v01 · Artillery draft 1 | tape23b / 9 | Early builder, simpler impact routine |
| 2 | v02 · Artillery draft 2 | tape23b / 10 | Revised impact and falling-block routines |
| 3 | v03 · Artillery draft 3 | tape23b / 11 | Persistent draw/erase modes and Q; refined falling routine |
| 4 | v04 · FALL BASIC 1 | tape18a / 14 | Same builder; adds calls to machine-code falling routine |
| 5 | v05 · FALL BASIC 2 | tape18a / 24 | Related machine-code variant; changed background |

**This is an inferred development sequence, not a dated history.** Within-tape
save order is evidence; the cross-tape ordering is a best guess based on source
changes. No original writing dates have been invented. Each version was imported
in its own Git commit, using the actual import date.

We preserve both useful views:

- `versions/` retains all five recovered listings and payloads side by side for
  downloads, study, and website version selection.
- [original/CASTLES.ASC](original/CASTLES.ASC) and `original/CASTLES.BAS` evolve
  through five consecutive commits, so GitHub shows readable source diffs.
  `original/provenance.json` records the source of each revision.

Tags `castles-v01` through `castles-v05` identify the canonical history commits.
For example, `git diff castles-v01 castles-v03 -- programs/castles/original/CASTLES.ASC`
compares the early builder with the persistent-mode version. The current canonical
source is v05, the latest inferred historical version; the website now defaults to v05 with its derived FALL dependency loaded.
Self-contained v03 remains available for comparison.

Every recovered listing and tokenized BASIC payload remains unchanged.
[provenance.json](provenance.json) contains source paths, hashes, capture times,
structural validation, and matching-channel evidence from the recovery archive.
The emulator's loader relocates in-memory BASIC pointers for execution. It does
not modify the recovered files.

v04 and v05 require external FALL machine code via POKE/USR. v05 now loads a
214-byte executable assembled from recovered FALL assembly v6. The unchanged
editor payload/listing and a reproducible build manifest are in
[dependencies/fall-v6](dependencies/fall-v6/README.md). This is a modern build,
not a recovered historical executable. v04 remains source only.

## First TypeScript implementation

[typescript/engine.ts](typescript/engine.ts) contains the v05 construction,
projectile, debris, and FALL v6 rules; `player.ts` provides Canvas and input.
The emulator is kept alongside it for comparison. See
[typescript/PARITY.md](typescript/PARITY.md) for comparison evidence and limits.
The current player adds pointer editing to the preserved keyboard baseline.
Comparison evidence does not imply cycle-exact or exhaustive equivalence.

## Verification

See [VERIFICATION.md](VERIFICATION.md). Recovery validation and website execution
testing are separate. Original recovery records are retained unchanged even where
the website now has newer execution evidence.
