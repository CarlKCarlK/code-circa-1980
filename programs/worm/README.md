# Worm One

Four tape3a saves, selected v04 (save 14). All recovered payloads and listings remain unchanged in `versions/`
and `original/`; tags `worm-vNN` identify canonical historical revisions.
Only one selected edition is playable. Web releases begin at unshared v1.

## Play

Enter `1B 2D 3CCCC 4B`, then `64,24`. Let the rule-driven path draw. A short trace can be a legitimate result for a rule; D marks a stopped path. Press a key at D to return to setup.

Click the player for keyboard focus. Help pauses and restores the previous
pause state; Pause/Resume holds the machine; Restart begins a fresh session.
Held keys are released on blur, navigation, pause, and restart.

## History and limits

The source credits Carl Kadie and July 27, 1980, and cites Scientific American, November 1973. The latter is an inspiration reference, not a source-program date.

Read `provenance.json` for archive paths, SHA-256 hashes, exact capture/save IDs,
source-structure validation, and inferred ordering. Recovery validation is
separate from emulator execution; see `VERIFICATION.md` for actual checks.
Run locally from `app/` with `npm run dev`, then open
`/?development=1#/program/worm` directly in the player.
