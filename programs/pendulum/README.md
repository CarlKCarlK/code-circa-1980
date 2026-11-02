# Pendulum

Two saves; selected v02 (tape22a save 5). All recovered payloads and listings remain unchanged in `versions/`
and `original/`; tags `pendulum-vNN` identify canonical historical revisions.
Only one selected edition is playable. Web releases begin at unshared v1.

## Play

Enter `2` swings, `EARTH`, and a `1`-meter string. Wait for period, total time, and frequency. For another world, supply its name and gravity. Any key repeats after completion.

Click the player for keyboard focus. Help pauses and restores the previous
pause state; Pause/Resume holds the machine; Restart begins a fresh session.
Held keys are released on blur, navigation, pause, and restart.

## History and limits

Timing and elapsed-time counters are historical approximations, not calibrated browser timing. The later source adds a half-swing input check.

Read `provenance.json` for archive paths, SHA-256 hashes, exact capture/save IDs,
source-structure validation, and inferred ordering. Recovery validation is
separate from emulator execution; see `VERIFICATION.md` for actual checks.
Run locally from `app/` with `npm run dev`, then open
`/?development=1#/program/pendulum` directly in the player.
