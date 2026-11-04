# Programs that run from recovered floppy disks

November 3, 2026. Fifteen images came from floppy disks read for me. Their unpacked
form and notes live in the recovery archive under `disks/`. This site runs the
actual disks; it does not extract a program and load it some other way.

## How a disk player works

`site/model1-disks.js` adds the Model I Expansion Interface to the emulator library:
its memory-mapped disk controller, the 40 Hz timer interrupt, the density command
sent to doubler boards, and the WD1771's status bit for a directory's 0xFA data mark.
The library covers only the Model III's ports and a WD1793. Writing is not emulated,
so disks act as write-protected.

A version's `disk` metadata names its images and startup `steps` (`site/disk-session.js`):
`wait` for screen text, `type`, `press`, `swap` a disk into drive 0, and `delay`.
Startup runs at 20× and then returns to the chosen speed. `sound: true` uses the
library's Web Audio player, unmuted by the first key.

## What was added

- **From the Games Diskette:** Coldwar, Quorum in Space, Blockade Robot, Blockade in 3-D,
  Race, and Amazing Maze now play their disk forms under NEWDOS/80. Illiad and Football
  take the menu's names; their code is identical to the tape saves.
- **MMSFORTH:** Go, Growth, Screen Fun, Sound & Tones, Turtle Graphics, Space Station Zap.
- **LISP:** Deriv and GPS Planner on LISP 3.72. The user confirmed the LISP programs are theirs.
- **Source only:** Forth Drafts and Fragments, Expert-2 Rule Sets, Spell, Combination
  Lister, Permutation Lister, Timer, Disk Tools and Menu.

Left out at the user's request or by design: "Today's News," the Security rule set,
Tedd Pierce's report, and commercial software, including Meteor, Eliminator, ZAP2,
Soccer, Talker, and the VS-100 programs.

Credit: the Decoder is by Rich Losey (RWL). The other Forth programs say he may have
contributed, on the user's instruction; "Today's News" is his only other named mention
in the Forth blocks, and it is not imported.

## Known limits

- GPS Planner's PUSH-RIGHT and CLIMB-UP were overwritten on the disk because file names
  stopped at the hyphen. The player types mirror images of their partners at startup.
- MMSFORTH and LISP are commercial software. The user judged their inclusion to be fair
  use for small-scale archival work, and every player keeps its credit visible.
- Sound & Tones produces audio values in the browser player, but nobody has judged by ear
  how close they are to the real machine.

## Checks

`node scripts/check-disk-programs.mjs` starts all fourteen players through the real ROM
and checks a first screen. `tests/disk-programs.test.mjs` runs three in `npm test`, and
`disk-programs.spec.js` covers the browser player. Per the More testing policy, these do
not test gameplay beyond those first screens.
