# Sentence Generator

Two consecutive tape10b saves; selected v02 (save 12). All recovered payloads and listings remain unchanged in `versions/`
and `original/`; tags `sentences-vNN` identify canonical historical revisions.
Only one selected edition is playable. Web releases begin at unshared v1.

## Play

Text starts automatically. Pause to read it, Resume to continue, Escape to break into BASIC, and Restart to begin again.

Click the player for keyboard focus. Help pauses and restores the previous
pause state; Pause/Resume holds the machine; Restart begins a fresh session.
Held keys are released on blur, navigation, pause, and restart.

## History and limits

The original first names and vocabulary are preserved. The later form disables adjective/adverb text and adds clauses/prepositions. The quarantined file8b item is excluded.

Read `provenance.json` for archive paths, SHA-256 hashes, exact capture/save IDs,
source-structure validation, and inferred ordering. Recovery validation is
separate from emulator execution; see `VERIFICATION.md` for actual checks.
Run locally from `app/` with `npm run dev`, then open
`/?development=1#/program/sentences` directly in the player.
