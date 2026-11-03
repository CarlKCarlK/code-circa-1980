# Five additional More programs

Requested November 2, 2026. All use the shared real-ROM emulator, open directly
in a player, and keep historical payloads/listings byte for byte. The new
browser experiences stay at unshared web v1. Main-gallery links remain unchanged.

| Program | Selected capture/save | Complete snapshots | Evidence and limits |
|---|---|---:|---|
| Trajectory | tape22a / 4 | 2 | Carl Kadie, October 24, 1978 source credit; later form adds scale and summary |
| Relativity | tape22a / 10 | 1 | Carl Kadie, May 9, 1979 source credit; historical clock labels and loop timing |
| Reflex Tests | tape9b / 8 | 2 | Exact repeated saves; three modes; uncalibrated timing at 1× |
| Nuclear Equation Completer | tape14a / 8 | 1 | Complete source selected; separate damaged tape22a prefix retained |
| John’s Circle | tape21b / 13 | 1 | Joint John Hartman / Carl Kadie source credit; no established date |

Two Trigectior captures are ordered by source changes, not tape numbers. The
feet-per-second Projectile Trajectory is not silently joined to that lineage.
Repeated Reflex saves stay separate. Source credit dates do not date tape saves.

The nuclear partial archive preserves the raw candidate, unchanged verified
prefix bytes/listing, and explicitly unvalidated full decoder listing. Its 32
ordered records end at line 4010; all 1294 bytes agree across left/right recovery.
No missing bytes are filled from the complete tape14a recording. The read-only
verification method is app/scripts/verify-science-five.py; it also checks 71
unique archive candidates carrying the agreed prefix.

Reproduce from the root with `python3 app/scripts/verify-second-gallery.py` and
`python3 app/scripts/verify-science-five.py /path/to/trs80`. From app/, run
`npm test`, `npm run build`, and `npm run test:browser`; point PLAYWRIGHT_BASE_URL
at a private preview port. Program scenarios are in science-five.spec.js.

Relativity starts at 1× and offers nominal 20× for the slow graph; speed remains
selected after Restart and Pause/Help stop the machine. Reflex deliberately
stays at 1×. Its first mode prints enlarged text, so memory-based browser checks
account for the interleaved spaces used by the ROM’s display mode.

## Final execution and release evidence — November 2, 2026

- Seven new complete snapshots match archive bytes, BASIC pointer/line/end
  structure, and readable exports. The shared verifier passes 121 canonical
  tagged histories/current originals/snapshots, including all seven new saves.
- The additional nuclear verifier passes all preserved partial-file hashes,
  the exact untouched prefix range and 32-record structure, and agreement with
  71 unique archive candidates including independent left/right processing.
- Unit tests (18 test files), the production build, and preservation of all 37
  active release manifests against pre-import commit db1b218 pass.
- The complete browser run passes all 112 cases (5.5 minutes). This includes six
  representative runtime scenarios across the five new programs, every new
  frozen v1 startup/download/return link, and the 23-card desktop/390px gallery.
- Actual emulator captures and their hashes are retained under each new
  program’s verification/ folder; modern gallery SVGs are separate artwork.

Execution limits remain explicit in each program’s README/VERIFICATION.md.
No general nuclear-parser or physics-formula correctness claim, calibrated
reaction-time claim, or exhaustive input/boundary coverage is made.

Work remains local on second-gallery; nothing was published in this task.
All five new browser experiences are unshared web v1. Existing frozen players
were preserved. The six-entry main gallery still has no link to More.
Preview from app/ with `npm run preview -- --port 5317 --strictPort`, then open
http://127.0.0.1:5317/#/more. The shared VS Code workspace remains
`tools/code-circa-1980.code-workspace` alongside the recovery archive.

Title clarification: the user requested correcting the apparent spelling
TRIGECTIOR. The website displays Trajectory; historical labels, source files,
and the existing internal ID trigectior remain for provenance.

The corrected Trajectory title was verified in both gallery layouts, the
ordered More gallery, and the refreshed frozen v1 header (three targeted
browser checks). Reflex’s two identical source saves both retain CATALOGUE
in the original line-5000 prompt, as confirmed from the recovery archive.
