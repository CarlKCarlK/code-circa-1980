# Armatron-80

A new Level II BASIC program, written on November 13, 2026 by Carl Kadie with Claude.
It is **not** a recovered tape. It brings two modern projects back to the TRS-80:

- the Armatron demo in [Linkage Blaze](https://github.com/CarlKCarlK/linkage-blaze), a
  Rust 3-D turtle-graphics library (`armatron1.lb.rs`, `camera_control.lb.rs`,
  `grid_9x9.lb.rs`, and `reverse_kinematics.rs`), and
- the 3D Robot Arm sheet of [Excel 2D & 3D Robot Arms](https://github.com/CarlKCarlK/excel-3d-robot-arm).

Both model Radio Shack's Armatron toy arm.

## Play

Click the player. Hold the joint keys (Q/A base, W/S arm, E/D elbow, R/F wrist, T/G twist,
Y/H grip) to put the arm's fingertips on the target cross, whose dotted line drops to the floor. The arrow keys orbit
and tilt the camera, and Z/X zoom it. Space runs auto-reach, N/P change the target,
and 0 resets the pose. The player starts at Max speed, which is about 60× in a typical browser.
At Original (1×) each frame takes several seconds, as it would have in 1980.

## Files

- `versions/v01/ARMATRON.ASC` is the source. Edit it, then run `npm run build:armatron`
  from `app/`. That tokenizes it into `ARMATRON.BAS`, fills in Level II line pointers, checks
  the round trip, and updates the hashes in `provenance.json`.
- `npm run check:armatron` runs the built program on the stock Level II ROM headlessly. It
  holds keys, prints the screen as text, and records `verification/rom-check.json`
  (pass `--json`).

## Level II performance notes

The interpreter rereads every numeric literal in the program text and searches variables in
order of creation. The listing therefore keeps constants in variables (`Z0`, `Z1`, `ZH`, `R3`,
...) and creates its hottest variables first, in lines 90–97. Those two changes cut the first
frame from about 50 to about 27 emulated seconds. Fixed ±90° finger turns are column swaps
instead of SIN/COS calls.

The joints are read straight from the keyboard matrix (`PEEK(14337)` and the following rows),
so holding a key works like a joystick. One-shot commands use `INKEY$`, whose Model III
type-ahead buffer keeps a tap made during a slow redraw. The site's player keeps fast mode on
while keys are held for this program (`setFastWhileHeld`). Other programs still drop to 1×
then, so a held key doesn't auto-repeat.
