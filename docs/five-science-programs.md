# Five additional More programs

Requested November 2, 2026. All use the shared real-ROM emulator, open directly
in a player, and keep historical payloads/listings byte for byte. The new
browser experiences stay at unshared web v1. Main-gallery links remain unchanged.

| Program | Selected capture/save | Complete snapshots | Evidence and limits |
|---|---|---:|---|
| Trigectior | tape22a / 4 | 2 | Carl Kadie, October 24, 1978 source credit; later form adds scale and summary |
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
