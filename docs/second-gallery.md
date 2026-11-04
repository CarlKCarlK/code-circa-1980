# Second gallery

Open `http://127.0.0.1:5187/#/more` in the local preview. The gallery uses the
main collection's shared card renderer and stylesheet. Since November 2, 2026,
the only inbound link is a small "More uncurated programs" link below the main
collection's cards. Players return here. Its pages remain noindex, nofollow.

## Release policy

The user confirmed November 2, 2026 that none of the extra-program URLs had
been shared and authorized resetting them to v1. Keep every extra program at
web v1 until the user says to advance it. Do not offer web-version menus here;
play only one selected best recovered version, retaining all other historical
saves as downloadable source. The previously published main-gallery releases
are unaffected by this exception. Discarded development snapshots remain in Git
history; unshared typo URLs were removed from the current build.

`starwars81` is the correct short name, folder, and URL ID. Its display title,
**Star Wars cockpit**, is descriptive because neither recovered listing prints
an explicit title. Historical source bytes and import tags are retained.

The user subsequently requested Ricky Rat, Pinball, the logic-circuit simulator,
and the orbit simulator in this gallery. Each starts at web v1 under this policy.

## Local commands

From the repository root:

```sh
python3 app/scripts/verify-second-gallery.py
cd app
npm test
npm run build
npm run verify:web-versions -- --against 9bd4798
npm run preview -- --port 5187 --strictPort
```

In another terminal in app/:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 PLAYWRIGHT_WORKERS=3 npm run test:browser
```

The workspace in tools/ keeps this worktree and the recovery archive together.
All work remains local on branch `second-gallery`. Program-specific verification
notes distinguish recovery validation from new emulator checks and their limits.
Olympics card artwork uses circles; its corrected aspect ratio was checked in
the rendered gallery, and the build and gallery navigation check passed.

## Current completion

The extra gallery now contains Speech, Olympics, Star Wars cockpit
(`starwars81`), Ricky Rat (`rickyrat`), Pinball (`pinball`), Logic circuit
simulator (`logic`), Orbit simulator (`orbit`), Skinner Box (`skinner`), German
tutor (`german`), Magazine Index (`magazine`), TEACH VI (`teachvi`), Poker
(`poker`), and LIFE (`life`). Every extra has exactly one
web v1 and one playable recovered reference. Older saves remain source only;
there are no web-version menus. Olympic rings are circular.

See [the four-program notes](four-more-programs.md) and [the six-program notes](six-more-programs.md) for provenance, selected references, known historical
limits, reproducible commands, and browser results. All 93 complete
extra-program snapshots and all 20 site snapshots passed integrity checks.
The main gallery remains six entries with no inbound link to this gallery.

## Readable card artwork

The user requested clearer previews after the thirteen-entry gallery was added.
The ten screenshot-based cards now use cobalt-and-cream SVG illustrations with
large shapes and minimal text. Orbit shows a planet and trajectory; the learning
programs show readable examples; the games show a maze, table, cards, or cells.
The earlier emulator PNGs remain as separate evidence, with their hashes retained
in provenance. Speech, Olympics, and starwars81 keep their existing SVG artwork.

Verified: all thirteen images decode, desktop and 390px layouts render without
horizontal overflow, and both gallery navigation checks pass. Unit/archive
checks and production build pass. This affects the shared gallery; existing
frozen players and all published main-gallery bytes remain unchanged.

## Poker withdrawn

Poker was removed at the user’s request on November 2, 2026, after identifying
its Creative Computing provenance. The active more gallery now has twelve
entries. Its standalone player, source-view URLs, and latest-release redirect
are no longer emitted. Sources and corrections remain in programs/poker/; its
exact former web snapshot is retained in website-archive/v1 outside public/.
Earlier completion counts above describe their original import stage.

## Next six additions

Worm One, Peoria Grand Prix, Pendulum, Sentence Generator, Learning Tic-Tac-Toe,
and Superpower Investing add six entries, bringing the active gallery to 18.
They preserve 21 additional complete captures with canonical version tags.
See [the import and history notes](next-six-programs.md), including the uncertain
SPI/BOND professional chronology and the Tic-Tac-Toe stock-ROM adaptation.

## Five science/game additions

Trigectior, Relativity, Reflex Tests, Nuclear Equation Completer, and John’s
Circle bring the active More gallery to 23 programs. Seven complete captured
saves and the separate damaged nuclear recording are preserved. See
[five-science-programs.md](five-science-programs.md) for selections, dates,
source-history uncertainty, and execution verification limits.

AIM is now grouped under SPI’s investing selector, with no separate card.
Keyword Cipher, Word Search, Space Colony, and Computa-Match bring More to 27
entries. See [the related-program notes](related-more-programs.md).

## Cave and monster games

Jaberwocky, Cave Game, and JAB add three entries after Space Colony’s withdrawal, bringing More to 29 cards. Seven complete saves, one damaged prefix, and two separately documented published-source comparison baselines are preserved. See [monster-games.md](monster-games.md).

## Five historical programs and visible credits

Who Donnt?, Dungeon Trainer, TUTAC Computer, Tank Game, and Lunar Lander bring More to 34 entries, appended at the end. Tank is source only. See [five-history-programs.md](five-history-programs.md). Strong documented prior-work connections now appear directly under the player title; see [more-attributions.md](more-attributions.md).
