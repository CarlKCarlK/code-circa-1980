# Verification

Imported November 2, 2026. Recovery validation and new emulator testing are
separate. `cd app && npm test` checks every complete snapshot’s hashes, full
BASIC structure, and listing. `python3 app/scripts/verify-second-gallery.py`
also verifies the canonical tagged blobs and current originals.

The browser check runs v03 (tape3a save 2) unchanged in the TRS-80 emulator,
waits for its full scrolling introduction, answers the nation/coach prompts,
and checks event generation, Help, pause/resume, and restart. Results are in
docs/second-gallery.md. The initial test’s 80-second introduction allowance
was too short; this was a test timing issue, not a recovered payload failure.

No claim of a completed Olympics or exhaustive behavior validation. Rosters
normally print to the screen; optional original printer output is captured
without changing BASIC. The direct 1980 copyright does not date the tape save.
