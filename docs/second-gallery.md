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
