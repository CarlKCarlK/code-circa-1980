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

### Floating controls (2026-10-29)

`npm test`: 32 passing checks, including logical-grid direction assist and
between-shot cannon settings. `npm run build`: typecheck and production build pass.
The nine existing Chromium browser checks pass, including actual emulator startup,
TypeScript input, and emulated touch. An additional floating-panel browser check
passes: drag, resize, opacity, layout persistence, collapse/expand, no painting
through panel gestures, cannon sliders, pause, and restart. Physical touch devices
and exhaustive gameplay equivalence have not been tested.

### TypeScript default and cleaner diagonals (2026-10-29)

The collection and unversioned Castles route now default to TypeScript; explicit
historical version links retain emulator playback. All 34 unit/comparison checks
and the production build pass. Browser regression checks confirm the default
route, original selection, and thin supported diagonal strokes in both Grid
assist and Diagonal mode, including an initially uneven mouse movement.

### Return to building (2026-10-29)

All 36 unit/comparison checks pass, including mode changes preserving construction,
cannon settings and positions, stopping an active flight, and restarting shooting.
Typecheck and production build pass. The panel browser check exercises shooting,
returning to building, shooting again, pause and restart.

### Brick PNG save and image load (2026-10-29)

All 40 unit/comparison checks pass; production build and typecheck pass. Three
Chromium browser checks pass covering downloaded PNG dimensions and pHYs data,
actual PNG save/reload of a supported tower, JPEG and ordinary PNG import,
upper-left cropping, original settling, invalid-file handling without erasing
the existing field, and the floating controls. No upload service is used.

Image imports now choose the less common thresholded shade as foreground, counting
only actual cropped pixels. All 41 unit/comparison checks and the build pass.
Browser save/reload and JPEG/PNG import checks pass for dark-on-light and
light-on-dark artwork. Native brick PNGs retain black-as-bricks semantics so dense
saved constructions do not invert when reloaded.

### Train trestle preset (2026-10-29)

42 unit/comparison checks and the production build pass. The preset's full-width
deck occupies row 24, with three ground-contact bricks (x=21,64,107 at row 46).
Each foot can support at most 45 deck columns at that height, so two feet cannot
support the 128-column span. Branching diagonal supports, a locomotive and four
cars survive a full settling pass, including execution of the original Z80 code.
A Chromium browser check passes for selecting/loading the pattern, its deck,
feet and train details, and clearing with the Empty field preset. Visually
reviewed the rendered field screenshot.

Oversized picture imports now shrink proportionally to the usable 128 × 47 grid
with nearest-neighbor sampling instead of cropping. The build and both image
browser tests pass, including features outside the former crop area, JPEG/PNG
on both backgrounds, and exact native saved-PNG reloads.
### Picture import preview (2026-10-29)

The TypeScript importer now previews the full game field with signed red, green,
and blue controls before accepting a picture. Chromium checks confirm the preview
matches the field's display width, slider changes alter the preview, Cancel retains
an existing brick, and OK imports the selected conversion and settles unsupported
bricks. Saved PNG reloads, JPEG/PNG imports, and invalid-file handling also pass.
The production build, unit suite, and all 16 browser checks passed; the browser
suite used a local preview server on an alternate port.

Picture imports now center the sampled image and account for the field's twice-tall
pixels. Chromium checks cover the preview of square-pixel images and PNGs marked
with twice-tall pixels, as well as an unchanged saved-field round trip. The build,
unit suite, and all 17 browser checks passed on a separate local preview port.

Square-pixel saves (2026-10-29) are 128 × 96 PNGs with two identical pixels per
logical block. Chromium checks verify every pixel pair, PNG geometry, the full
field after a save and reload, and dense images in both the current and older
save formats. The production build, unit suite, and all 18 browser checks passed.

White-on-black saves and visible import settling (2026-10-29): Chromium checks
confirm the PNG's white bricks, black background and paired pixels, exact reload,
and compatibility with earlier black-brick saves. They also confirm ordinary
images keep white as bricks regardless of which shade is more common, the loaded
image appears before falling, intermediate falling positions are visible, and
Pause freezes the fall. The unit suite and all 20 browser checks passed.

Floating controls (2026-10-30): Chromium checks drag the panel completely outside
the game field, reload its position, constrain it within full screen even after
further movement, and restore the normal-view position when leaving full screen.
The production build, unit suite, and all 21 browser checks passed.

The draggable title now has a dotted grip. Chromium checks confirm it can be used
to move the controls. Both the TypeScript game and the v05 emulator also started
from a locally served GitHub Pages-style subpath with no failed asset requests.

Web experience versioning (2026-10-30): Castles web v1 is a frozen production
build with its source commit and asset hashes recorded. The build, unit suite,
and all 23 browser checks pass, covering active-source controls, the frozen v1
player, the gallery, and legacy links that resolve to the newest web release.
In an isolated checkout, a temporary v2 became the default while v1 remained
playable and unchanged. The preservation gate rejected deliberate alteration of
v1 even when its file hashes were updated. Only v1 is registered for publication.
