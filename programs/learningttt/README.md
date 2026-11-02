# Learning Tic-Tac-Toe

Four captured sources; selected v04 (tape8a save 8), with a separate stock-ROM loading adaptation. All recovered payloads and listings remain unchanged in `versions/`
and `original/`; tags `learningttt-vNN` identify canonical historical revisions.
Only one selected edition is playable. Web releases begin at unshared v1.

## Play

Answer `YES` to go first. At YOUR MOVE enter `1,1,` (including the trailing comma). Coordinates are 1–3. Report a result with `0,0,C` (draw), `0,0,W` (human win), or `0,0,L` (human loss). A new round keeps in-memory experience; Restart clears it.

Click the player for keyboard focus. Help pauses and restores the previous
pause state; Pause/Resume holds the machine; Restart begins a fresh session.
Held keys are released on blur, navigation, pause, and restart.

## History and limits

This is an unfinished experimental opponent with numeric diagnostics and manual outcome reporting. Original learning bugs remain: line 800 tests C$ rather than N$ for a human win, integer P storage discards fractional feedback, and board-index bookkeeping is inconsistent. No claim of optimal play, reliable learning, or complete rule enforcement. See runtime/README.md for the DEF FN expansion required by the stock ROM.

Read `provenance.json` for archive paths, SHA-256 hashes, exact capture/save IDs,
source-structure validation, and inferred ordering. Recovery validation is
separate from emulator execution; see `VERIFICATION.md` for actual checks.
Run locally from `app/` with `npm run dev`, then open
`/?development=1#/program/learningttt` directly in the player.
