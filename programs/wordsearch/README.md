# Word Search

## Play

Generation starts automatically at a 200× target. Actual speed depends on the browser; select 1× or 20× if desired. The original exhaustive placement search can take several minutes even when accelerated. At DONE, Space lists the included words; another Space redraws the same puzzle. Restart makes another puzzle.

The original BASIC runs through the shared Z80/ROM emulator. Click the screen
for keyboard focus. Help pauses/restores the prior state; Pause freezes execution;
Restart begins fresh. Keys are released on blur, navigation, pause, and restart.

## Source and history

The only complete identified save is tape4a save 7. The original generator and word lists remain intact; no shortened demo list or modern placement algorithm replaces them. Stored words include workshop names and terms. The later DATA block and earlier editor routines remain in source. No author/date is established by a source credit.

One complete captured source containing a generator, editor routines, and two stored word lists. No author/date is established by a source credit.

Recovered payloads/listings are unchanged in versions/ and original/. Tags
wordsearch-vNN identify canonical per-save revisions. provenance.json records paths,
hashes, structure, and recovery evidence separately from new emulator testing.
See VERIFICATION.md for execution checks and limits. The experience stays at
unshared web v1. From app/ run `npm run dev` and open
`/?development=1#/program/wordsearch` directly.
