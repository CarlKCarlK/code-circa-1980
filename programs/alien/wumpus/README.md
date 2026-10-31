# Hunt the Wumpus, the listing Alien started from

`WUMPUS.ASC` is Gregory Yob's *Hunt the Wumpus* as printed in David H. Ahl (ed.),
*More BASIC Computer Games* (1979), pages 179–180, transcribed from photos of my
copy ([page 180](../history/wumpus-listing-page-180.jpg)). It is not a recovered
file and is not run on the site. SHA-256 `30ca5375434696155e9825ed439340517c0df1b4a1f4b30dfcf959c471de98ff`.

- Printed spelling and typos are kept: WUNPUS (line 375), SET# ARROS, DODECHADRON,
  TTHE ROOM#S, THA TCORRKED.
- The printout's `LIST` and `Ok` lines are left out; apostrophes are ASCII `'`.
- On line 190 the printout overstrikes one character; it reads `INT(4*RND(1))+1`.
- Lines 2510 and 2530 were partly covered by a finger in the photo and were read
  from the visible text: `"SHOOT OR MOVE (S-M)";` and `THEN 2560`.
- Leading spaces inside indented `PRINT` strings are estimated from the photos
  and may be off by one.

## Comparing with Alien in Git

The same text is the first commit of `../original/ALIEN.ASC` (tag
`alien-wumpus`), just before Alien v01 (`alien-v01`) and v02 (`alien-v02`):

```sh
git diff -w alien-wumpus alien-v01 -- programs/alien/original/ALIEN.ASC
git log -p -w --follow programs/alien/original/ALIEN.ASC
```

Use `-w`: the book's listing has spaces between keywords; my TRS-80 listings do
not. On GitHub:
[Wumpus → v01](https://github.com/CarlKCarlK/code-circa-1980/compare/alien-wumpus...alien-v01?w=1),
[v01 → v02](https://github.com/CarlKCarlK/code-circa-1980/compare/alien-v01...alien-v02?w=1).
