# Verification

The imported selection is tape18b save 18, recovery-label V14 (import v15).
Fifteen complete captures are retained; fourteen have distinct complete
listings. Two damaged recordings remain separately in partial/ without repaired
bytes or synthetic terminators. The exact source credit is
`6000 'RICKY RAT  BY CARL KADIE   6 AUG 82   K`.

Archive checks verify hashes, complete BASIC pointer chains, increasing line
numbers, one consistent memory base, end markers, and listing conversion.
`python3 app/scripts/verify-second-gallery.py` also checks every canonical tag
blob and the damaged raw-prefix ranges.

The browser check observes maze generation, the rats and their identifying
message, input release on blur, Help, pause/resume, and restart in the original
ROM/Z80 emulator. Both entrants call routine 6000 in the selected source.
Winner/tie outcomes and every historical algorithm path were not exhaustively
compared. No claim that Restart guarantees a different random maze.

Run from app/:
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 npm run test:browser -- tests/browser/experiments.spec.js -g 'Ricky Rat'`.
To deliberately refresh the gallery screenshot, add `CAPTURE_GALLERY_ART=1`;
ordinary tests do not rewrite tracked artwork. Final results are summarized in
../../docs/four-more-programs.md.
