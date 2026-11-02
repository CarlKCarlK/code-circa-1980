# Unlinked second gallery

Open `http://127.0.0.1:5187/#/more` in the local preview. The gallery uses the
main collection's shared card renderer and stylesheet, with no inbound link
from the main collection. Players return here. The site is unlinked, not
access-controlled.

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
npm run verify:web-versions -- --against e951413
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
