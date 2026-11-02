# Pinball

A BASIC pinball table with bumpers, scoring, five balls, and a Space-controlled flipper.

Internal/URL name: `pinball`. The unlinked second gallery (`#/more`) offers only
one playable reference: **v07**, tape12a save 11.
The web experience starts at **v1** and stays there until the user says otherwise.
Other recovered saves are downloadable source, not additional player editions.

## Recovered history

Inferred from source changes: the three tape9b forms each have repeated saves; tape12a save 11 adds rounded display addresses and changed collision/miss handling. Cross-tape order is an inference from these edits, not tape numbering or an established date.

7 complete saves are preserved in `versions/`, including repeats.
Their raw payloads and readable listings were copied byte for byte from the
recovery archive. Source spelling, bugs, pointers, and line numbers are unchanged.
Canonical `PINBALL.ASC`, `PINBALL.BAS`, and provenance paths in
`original/` advance through individual `pinball-vNN` Git commits/tags; permanent
snapshots remain alongside them. `provenance.json` records hashes, original
archive paths, inventory evidence, and dating limits.

Instructions live in the player's Help and About/source section. See
`VERIFICATION.md` for commands, executed checks, and remaining limits.
