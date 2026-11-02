# Verification

The player selection is tape12a save 11 (import v07). Seven complete saved
copies represent four different listings. Raw/listing hashes, pointer-chain
structure, listing conversion, canonical tags, and archive provenance were
checked. The payload and its historical collision rules are unchanged.

The browser check waits for the complete table (the first wall appears before
keyboard input is ready), launches with Enter, holds Space and observes the
flipper, checks for BASIC errors, pauses/resumes, and restarts. Scoring, all five
balls, free-ball awards, and every bumper/collision were not exhaustively tested.

The artwork is the actual emulator canvas during this check. Ordinary tests do
not alter it; `CAPTURE_GALLERY_ART=1` explicitly refreshes it. From app/:
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 npm run test:browser -- tests/browser/experiments.spec.js -g Pinball`.
See ../../docs/four-more-programs.md for final results.
