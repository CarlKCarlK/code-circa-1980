# Castles verification — October 29, 2026

## Preserved source

All five recovered BAS/ASC pairs retain their original SHA-256 hashes. Checked
BASIC headers, increasing line numbers, one consistent pointer base, the final
zero pointer at exact EOF, listing line counts, and decoded listing agreement.
The original claimed matching recovery payloads were also checked against the
archive during import. No historical bytes or listings were edited.

## Browser execution

Chromium with the production Vite build, using the original BASIC payloads in
`trs80-emulator` / `trs80-emulator-web` 2.3.1 (Model III, Level II BASIC):

- Collection opens the instructions page before launching the emulator.
- All three self-contained versions start and accept construction controls.
- v03: drawing a tower creates new graphics in emulated screen memory.
- v03: Q begins bombardment; power/angle input produces cannon trajectories
  away from the construction. This checks execution, not just a rendered screen.
- v03: pause freezes emulated time; restart removes the construction and returns
  to building. Leaving keyboard focus clears held keys; navigation stops playback.
- At a 390 × 844 viewport, instructions and player have no horizontal overflow;
  on-screen button input builds a tower and releases its keys correctly.
- Source/provenance download links return successfully from the production build.

The earlier drafts use Enter taps between small movements. The initial automated
sequence assumed persistent drawing and was corrected after examining the actual
emulator behavior. Early drafts also start with two ground openings for cannons;
v03 creates those when bombardment begins. Their original code is unchanged.

v04 and v05 were not executed: their external FALL machine-code dependency is not
loaded by this release. No claims are made about every collision, collapse,
random trajectory, long session, other browser, or physical-device touch behavior.

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

For an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its
full executable path. Browser tests use production preview on localhost:5181.
`?test` exposes read-only screen/clock inspection for the tests; it does not patch
or replace the historical program. Recovery `execution_tested: false` fields in
provenance describe the original recovery pass, not this later browser verification.

## Later v05 / TypeScript verification

v05 is now executed with a documented modern build of recovered FALL assembly v6.
The earlier statement that v05 was not executed describes the initial import only.
See [TypeScript parity notes](typescript/PARITY.md) for the newer execution and
comparison tests. v04 remains unexecuted. Original recovery evidence is unchanged.

## Timing calibration after play feedback

The TypeScript player now separates BASIC projectile/setup/impact delays from
the much faster Z80 settling work. See [timing measurements](typescript/TIMING.md).
Five settling fixtures match executed Z80 cycle totals to floating-point
tolerance; eight scattered-block fixtures match within 0.1 percent. A browser
check measures actual flight advance over 600ms. Archive/gameplay comparisons,
all six browser tests, typechecking, and production build pass.

## Pointer editing

Added mouse/pen/touch pointer input to the TypeScript player, preserving shared
support/erase predicates and the calibrated keyboard path. Five pointer model
tests and three browser scenarios cover interpolation, legality, right-drag,
mode switches, cancellation, pause/bombardment locks, and scaled touch taps.
The previous ROM/Z80/timing comparisons and original emulator tests still apply.
