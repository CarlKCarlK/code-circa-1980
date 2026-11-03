# Five more historical programs

Requested November 3, 2026, appended after JAB in More: Who Donnt? (`whodonnt`), Dungeon Trainer (`dungeon`), TUTAC Computer (`tutac`), Tank Game (`tank`), and Lunar Lander (`ll`). More now has 34 entries. Four have one selected real-ROM player; Tank is an explicitly source-only design draft.

Twelve complete captured payloads and listings retain unchanged snapshots and per-save canonical tagged commits: four Who Donnt?, four Dungeon Trainer, two TUTAC, one Tank, and one Lunar Lander. Complete captured framing does not imply finished or executable program code. Tank’s earlier uncertain tape1a candidate and its 1274-byte prefix (34 ordered records through 320, no added terminator) are separate from the validated tape16a draft. TUTAC’s suspect third candidate stays in review/. No tape recovery or inventory rewrite was performed.

Lunar Lander’s canonical history begins with `ll-storer1969`: the full original FOCAL transcription obtained unchanged from Jim Storer’s historical archive. `ll-basic1978` then preserves a complete electronic transcription of published BASIC Lunar, followed by `ll-v01`, the untouched tape9a save 9. No dates were invented for Git commits. The exact intermediary BASIC edition is not established, and the downloaded code is not represented as recovered historical bytes.

TUTAC is an implementation of the teaching-machine design from Theodore G. Scott’s TutorText. The independent modern Python implementation found in research is not an ancestor and was not inserted into historical Git sequence. No exact published program source was established for Who Donnt?, Dungeon Trainer, or Tank. Their histories start with the recovered saves.

Original-ROM checks verify Who Donnt?’s suspect/weapon lists and interview, Dungeon Trainer’s fight/parry loop, TUTAC’s embedded addition deck (encoded result 10009671948), and Lunar Lander’s free-fall/crash and fuel-consumption scenarios. Tank’s source page has no emulator or misleading playable-version loop. Who Donnt?’s courtroom remains unfinished; Dungeon’s text save leaves combat tables uninitialized; TUTAC’s later multiplication has debugging stops; Lunar’s upward-motion branch is not declared numerically correct. These limits are in each program’s VERIFICATION.md.

Reproduce archive/history verification from the root with `python3 app/scripts/verify-five-history.py /path/to/trs80`. From app/, run `npm test`, `npm run build`, and `npm run test:browser`. Targeted cases live in history-five.spec.js; attribution positioning is checked in more-attributions.spec.js. The inherited shared keyboard, pause/restart, Help, and responsive layout are retained.

Use `just show whodonnt`, `just show dungeon`, `just show tutac`, `just show tank`, or `just show ll`. The existing tools/ workspace keeps both repositories together.
