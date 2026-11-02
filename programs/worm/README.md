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

## Article and speed control

The citation is Martin Gardner’s November 1973 Mathematical Games column,
[“Fantastic patterns traced by programmed ‘worms’”](https://www.scientificamerican.com/article/mathematical-games-1973-11/),
Scientific American 229(5), starting on page 116,
DOI [10.1038/scientificamerican1173-116](https://doi.org/10.1038/scientificamerican1173-116).
The publisher’s page identifies the article but does not provide the full text.

These worms model feeding paths selected by local rules and previous trails.
[Michael Beeler’s Paterson’s Worm](https://dspace.mit.edu/handle/1721.1/6210),
MIT AI Memo 290 (June 1973), is available through MIT with a PDF download.
The recovered program’s six-direction grid and rule tables support the connection
to this family; exact equivalence to every published rule is not established.
See [the research notes](history/scientific-american.md).

The player starts at Original (1×). Select Fast (20×) to accelerate the same
emulated program without clearing the current path. The selected speed survives
Restart; Pause and Help still stop the machine. Actual speed depends on the
browser and available processing time. Held keys temporarily use original-speed
pacing through the shared emulator to avoid unwanted auto-repeat.
