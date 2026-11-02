# Four more original programs

Requested November 2, 2026, for the unlinked second gallery. Compact IDs used:
`rickyrat`, `pinball`, `logic`, and `orbit`. Each has one playable recovered
reference and starts at unshared web v1, staying at v1 until the user says to
advance it. Other historical saves remain source only.

| Program | Complete saved copies | Selected original | Historical source retained |
|---|---:|---|---|
| Ricky Rat | 15 | tape18b save 18; recovery-label V14, import v15 | 14 different complete listings plus a repeat; two damaged recordings separately |
| Pinball | 7 | tape12a save 11, import v07 | Four different listings, including repeated tape9b saves |
| Logic circuit simulator | 5 | tape15b save 18, v05 | Five different listings |
| Orbit simulator | 6 | tape11b save 17, v06 | Six different listings |

The 33 complete payloads and listings were copied unchanged, with one canonical
source commit and program-specific tag per save, plus permanent side-by-side
snapshots. The two damaged Ricky Rat artifacts retain raw bytes, validated
prefixes without added end markers, and explicitly uncertain listings.

All seven extra programs together retain 49 complete snapshots. The archive
check verifies raw/listing hashes, full BASIC pointer structure, line ordering,
consistent memory base, exact end marker/EOF, and listing conversion. The
canonical verifier also checks committed/tagged blobs, current originals,
partial raw-prefix ranges, and the four emulator-screenshot artwork hashes.
No historical spellings, bugs, line numbers, pointers, or terminators changed.

## Original behavior and helpers

Ricky Rat draws a maze and automatically races two instances of routine 6000.
Pinball uses Enter to launch and Space for its original flipper. The logic
simulator's verified example wires a switch to a light and evaluates YES/NO.
Orbit's example types a custom Sun/planet setup through the original keyboard,
waiting for each BASIC prompt. The answer field waits for its keyboard queue
to finish before allowing the next answer; helpers do not write machine state.
Orbit's helper cancels on restart, pause, or navigation. Its setup text remains
behind the plot, and historical preset branches 2–4 refer to missing line 2500.
Original quirks and unsafe input paths remain documented rather than corrected.

The four card images are screenshots from these actual original players, at
their native canvas aspect ratios. Standard tests do not change artwork. Set
`CAPTURE_GALLERY_ART=1` only to deliberately regenerate it with the browser
checks, then commit and refresh the affected unshared v1 build.

The corrected Olympics card uses circles. `starwars81` is the correct cockpit
short name. Its selected player is now the later tape30a save 2 arrow-key form.
The earlier development note treating `[` as suspect was wrong: it is the
BASIC exponent operator. Original ROM execution confirms `2[3` prints 8, and
the untouched later payload responds to ArrowLeft. The earlier digit-key form
remains source only. No raw bytes were repaired to change the selection.

## Commands

From the repository root:

```sh
python3 app/scripts/verify-second-gallery.py
node app/scripts/probe-starwars-controls.mjs
cd app
npm test
npm run build
npm run verify:web-versions -- --against e951413
npm run preview -- --port 5187 --strictPort
```

With that completed preview build running, in another terminal in app/:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 PLAYWRIGHT_WORKERS=3 npm run test:browser
```

Commit source before generating v1 snapshots. Use `npm run release:web -- ID`
once for a new extra. To update an existing unshared v1 without incrementing it,
use `npm run release:web -- ID --refresh-unshared-v1`. The metadata must mark the
program as both a second-gallery entry and `unsharedWebV1: true`; the helper
refuses to refresh a published/main-gallery release or silently advance an
extra to v2. The seven preexisting main-gallery experiences remain immutable.

## Verification limits

These checks cover selected startup, meaningful input/output, Help, key release,
pause, restart, prompt-synchronized entry, interrupted setup, direct frozen URLs,
source downloads, and gallery navigation. They do not exhaust all rat outcomes,
all Pinball collisions, all logic circuits, or astronomical trajectories. Orbit
has not been validated as a scientifically accurate simulator. Recovery framing
validation and new website execution testing remain distinct in provenance.
