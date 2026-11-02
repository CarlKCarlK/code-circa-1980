# Peoria Grand Prix

Four related race saves; selected v04 (tape15b save 12). All recovered payloads and listings remain unchanged in `versions/`
and `original/`; tags `peoria-vNN` identify canonical historical revisions.
Only one selected edition is playable. Web releases begin at unshared v1.

## Play

Enter skill `1`, then drivers `1`. After the countdown, Left Arrow moves right and Right Arrow moves left, as in the recovered code. With two drivers, A moves driver 2 left and C moves right. Answer YES at AGAIN to repeat.

Click the player for keyboard focus. Help pauses and restores the previous
pause state; Pause/Resume holds the machine; Restart begins a fresh session.
Held keys are released on blur, navigation, pause, and restart.

## History and limits

Inferred development: single-driver race, two-driver race, changing-width race, five-stage Grand Prix. Cross-tape order is uncertain. Collisions and reversed arrow directions are historical behavior.

Read `provenance.json` for archive paths, SHA-256 hashes, exact capture/save IDs,
source-structure validation, and inferred ordering. Recovery validation is
separate from emulator execution; see `VERIFICATION.md` for actual checks.
Run locally from `app/` with `npm run dev`, then open
`/?development=1#/program/peoria` directly in the player.
