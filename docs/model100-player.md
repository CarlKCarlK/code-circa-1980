# Model 100 execution

The eight existing Model 100 collections now open an original-firmware player.
This work does not recover tapes again, alter the inventory, or port BASIC to
JavaScript. Changes are isolated on branch `model100-player`, in
`worktrees/model100-player`.

## Selected references and observed limits

| Collection | Reference | Browser observation |
| --- | --- | --- |
| Input Reversal | v08, tape2a2 save 19 | `.X` and Enter prints reversed bits `1 0` and value `2`; waits for another sequence. |
| JAB | v04, tape2bpartial save 4 | Reaches `layout?`. No complete game tested. |
| LIFE Backwards | v06, tape2a2 save 21 | Reaches `Setting up`. This is the complete capture, although the historical source has missing targets including 1105. No completed search claimed. |
| Numeric Processing | v04, tape2a2 save 15 | Actually a packed-bit LIFE calculation. First cells appeared after approximately 25 seconds; no complete-generation validation. |
| Strategy Game | v02, tape2a2 save 6 | Reaches `The Secret War` and initial reports. No full campaign tested. |
| Study Program | v02, tape2a2 save 7 | Reaches `Lesson (.do assumed)?`. No matching complete lesson document is installed; study sessions remain unavailable. |
| Transaction Simulation | v06, tape2a2 save 13 | Reports `?SN Error in 0` from the recovered literal `EN` statement. No correction or successful simulation claimed. |
| Traveling Salesman | v03, tape2a2 save 9 | Accepts 6 cities and random sequence 1, then plots routes. No optimality test. |

LIFE Backwards and Traveling Salesman previously defaulted to damaged later
items because all their saves were source only. Their players now select the
complete references above; the later fragments remain downloadable individually.
All other alternate saves remain source only, with one executable reference per
collection. Complete recovery and a working historical program are different
claims. An executable player can faithfully reproduce an unfinished program's
error.

## Emulator and loading

`app/vendor/virtualt/` retains the unchanged GenX-DOS prebuilt VirtualT emulator
from commit `44e7aa5e3e91a99a16a302877b05abab8e5cb51d`, its headless C sources,
build recipe, BSD notices, and a SHA-256 manifest. It emulates the 8085 and
240×64 LCD and includes the Model 100 firmware distributed by that upstream.
Source: <https://github.com/Retro-Jack/GenX-DOS/tree/44e7aa5e3e91a99a16a302877b05abab8e5cb51d/systems/m100>.
Original VirtualT: <https://sourceforge.net/projects/virtualt/>.
The publisher does not record the exact core revision or compiler version used
to produce this binary; the retained recipe is not a claim of a reproducible,
byte-identical rebuild. Sound, serial, and printer peripherals are stubbed in
this upstream build. Its warnings about missing ROMs for other models do not
indicate a missing Model 100 ROM.

The loader verifies the 8D cassette body marker, additive checksum, 20-byte
zero trailer, increasing records, exact record coverage, and consistent line
pointers. It removes the marker/checksum/trailer in memory and appends a zero
pointer required by VirtualT's host-file loader. VirtualT relocates line
pointers into its RAM filesystem, then the original firmware starts the saved
program. The recovered source bodies are neither retokenized nor edited. The
in-memory terminal pointer is a loading adaptation, not recovered cassette
content. Damaged prefixes never enter this loader or gain archived terminators.

`app/site/model100.js` loads the pinned engine in an iframe. A checked,
single-expression JavaScript adaptation gates the engine's async sleep
continuation for Pause/Help. The vendored engine and WASM stay unchanged. The
firmware clock still follows host time; pause is a CPU pause, not a frozen RTC.
Restart replaces the iframe, discarding its CPU, heap, and timers. Navigation
disposes this player: iframe documents cannot retain a running machine when
detached into the collection's normal session cache. Returning starts fresh.
There is no cross-visit RAM persistence or external runtime fetch.

Keyboard events are forwarded only from the focused player host. SDL receives
physical key codes, including short taps held through a keyboard scan. The
answer field preserves case, which matters for JAB's lowercase commands. Held
keys release on blur, pause, restart, and navigation. F1–F8 and Shift+Pause
(BREAK) are available; a BREAK button also sends that chord.

## Verification and local use

From this worktree's `app/`:

```sh
npm run dev -- --port 5197 --strictPort
npm test
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5197 PLAYWRIGHT_WORKERS=2 \
  npx playwright test --config config/playwright.config.js model100.spec.js
```

Open `http://127.0.0.1:5197/?development=1#/program/model-100-traveling-salesman`.
Replace the final program ID to visit another Model 100 collection.

Unit checks validate every complete Model 100 payload's record/listing coverage,
exact preservation through the loading adaptation, corruption rejection, and
pinned emulator hashes. Browser tests check original startup, numeric output,
rendered graphics, Help/pause/restart, focus isolation, key release, narrow
layout, and navigation. The archive check is:

```sh
python3 app/scripts/verify-remaining.py /mnt/c/Users/carlk/OneDrive/projects/trs80
```

It verified 716 inventory dispositions, 405 captured items in 241 collections,
946 unchanged imports, and canonical tagged blobs. These are archive checks,
separate from the limited execution observations above. Screenshots in
`docs/evidence/model100/` show route plotting and the numeric program's first
drawn cells. They do not establish exhaustive program correctness.

The eight previously unshared web v1 experiences are refreshed using the
repository's explicit `--refresh-unshared-v1` policy, after committing source.
Other programs' frozen releases remain unchanged. The worktree is prepared for
review; it has not been merged into the main checkout.

### Recorded verification result

On November 3, 2026, all 1,015 unit checks passed, the production build passed,
and release verification against starting commit `e68d30f` accepted all 296
releases. The complete browser run passed 374 of 382 cases; the eight failures
were download checks that assumed the source panel was expanded. After changing
those tests to open the panel, all eight passed on rerun. No production player
change was needed for that correction. All 382 cases are therefore accounted
for across the full run and targeted rerun. The nine dedicated Model 100 cases
passed, and an additional frozen Traveling Salesman startup check reached
`How many cites?` with no JavaScript errors.
