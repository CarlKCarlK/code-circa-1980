# Chemical Equation Balancer — verification

Recovery evidence (tape captures, cross-channel agreement, BASIC structure) is in
the archive and summarized in `provenance.json`. This file records new execution
evidence from 2026-10-30. Neither the archive nor this file claims that every
historical routine has been exercised.

## Import checks (`npm test`, `tests/archive.test.mjs`)

All 20 snapshots match the archive SHA-256 hashes and the recovery records:
pointer-consistent BASIC lines, end markers, line counts and last lines, and
listings identical to `decodeBasicProgram`. Each `balancer-vNN` tag's
`original/BALANCER.BAS` matches its snapshot hash. v10's listing has 190 text
lines for 186 BASIC lines because a string contains embedded line breaks.

## Original versions in the emulator

Every complete version was run headlessly (scratch harness equivalent to `app/tests/helpers/balancer-reference.mjs`) in trs80-emulator 2.3.1 (Model III,
Level II BASIC) with ten typed equations: water, propane, rust, sucrose,
Ca(OH)₂ with parentheses, permanganate, borax, copper in nitric acid, alumina, and
the impossible `H2=O2`. Up to 400 emulated seconds per equation.

| Versions | Correct of 10 | Observed |
|---|---|---|
| v05, v06 | 10 | All balanced; impossible equation rejected |
| v12, v14, v15, v16, v19, v20 | 10 | All balanced; `H2=O2` → ALCHEMY |
| v18 | 9 | Debug matrix printing; permanganate answer not captured |
| v07, v08 | 6 | Dependent-row reduction bypassed: sucrose, Ca(OH)₂, borax fail |
| v01 | 5 | No parentheses; stops with "IT CAN NOT BE SOLVED" |
| v03 | 4 | Debug trace output and TRON |
| v10, v11, v17 | 1 | Only the impossible equation handled (stops/errors otherwise) |
| v02, v04, v09, v13 | 0 | Hard-coded test equation; missing line 2000 (?UL); integer draft; STOP at line 1 |

v20 emulated solve times range from 4 s (`H2=O2`) to 170 s (permanganate);
see `modern/parity-fixtures.json`. These broken intermediate saves remain
selectable for study; the site default is the Rust version, with v20 as Original.

## Rust engine

- `cargo test` (in `rust/`): 9 tests — the reference equations with exact v20
  printout text, errors, nested groups, charges, mixed equations, overflow.
- `tests/balancer-engine.test.mjs`: the committed WebAssembly matches the hashes
  of the current Rust sources (`rust/pkg/build.json`); its output matches the
  recorded v20 output for all ten equations; and v20 is run live in the emulator
  for two equations and compared.
- Known differences are listed in `rust/PARITY.md`.

## Browser (`npm run test:browser`, `tests/browser/balancer.spec.js`)

Against a production preview: the collection card reads "02 / Science" and runs
the Rust version; the start page opens About, history & source; the entry box
starts with a real equation and nothing is solved until Balance is pressed;
side-panel problems only fill in the equation; the 1981 printout line comes
before modern notation; typed equations, the linear-equation view, an error
case and Clear work; the Rust/JS and Level II BASIC version tabs switch to v20; and v06 accepts
a typed equation in the emulator and prints the correct answer.

Not tested in the browser: every historical version, phone layouts, and full
v20 solves (they take minutes of real time).

## Reproduce

From `app/`: `npm test`, `npm run test:browser`, `npm run build:balancer`
(needs Rust and wasm-pack), `npm run record:balancer` (re-records fixtures),
and in `programs/bal/rust/`: `cargo test`.
