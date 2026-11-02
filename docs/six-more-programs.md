# Six further programs in the unlinked gallery

These local additions stay on branch `second-gallery`. Open
[the local gallery](http://localhost:5187/#/more) over HTTP. The main gallery has
no link to it. Each program has one selected player and an unshared web v1;
other recovered saves are source only.

| Short name | Display title | Selected original | Complete saves |
|---|---|---|---:|
| skinner | Skinner Box | tape10a save 3, import v03 | 3 |
| german | German tutor | tape19b save 15, import v12 | 12 |
| magazine | Magazine Index | tape7a save 8, import v11 | 11 |
| teachvi | TEACH VI | tape12b save 13, import v06 | 6 |
| poker | Poker | tape12b save 6, import v02 | 6 |
| life | LIFE | tape10b save 6, import v06 | 6 |

All 44 complete saves preserve raw payloads and readable exports byte for byte.
Each has a canonical commit/tag and an immutable side-by-side source snapshot.
Cross-tape development order is inferred from source differences, not tape
numbers; vocabulary lessons and templates can be branches rather than revisions.
German's damaged fragment and LIFE's compiled filename header remain separate.
The recovery archive and authoritative inventory were not rewritten.

## Execution and limits

Skinner Box is a reinforcement-schedule identification exercise. Its Model III
TIME$ calls run in the emulator; reward tones remain silent. German tutor's
selected verb lesson and TEACH VI's range-selection lesson accept answers and
print feedback. German's introductory message can be skipped with Space.

Magazine Index uses original LPRINT output. The printer panel starts at 20×
emulation and can switch to original speed; BASIC bytes remain unchanged.
Poker uses the self-contained text form credited to Creative Computing. Later
saves require unavailable LINE/GET/PUT extensions, so they remain source only.

LIFE uses the original Z80 instructions assembled separately with pinned
z80-asm 2.3.0. The recovered source has no ORG: the derived build explicitly
chooses 0x8000 and adds a separate BASIC USR bootstrap. No source instruction is
edited. This is newly assembled code, not recovered historical machine code.
Reproduce it with `npm run build:life` in app/. The original editor draws in the
left half of the screen and computes the next generation in the right half.
At original speed a generation takes roughly ten seconds.

The six VERIFICATION.md files record representative runtime checks and their
limits. These checks do not validate every historical path or correct original
bugs. The native LIFE test verifies a horizontal blinker becomes vertical.
Gallery artwork is captured from the actual original canvas, or the original
printer output for Magazine Index. Ordinary tests do not rewrite these PNGs.

## Verification commands

From app/: `npm test`, `npm run build`, and
`npm run verify:web-versions -- --against e951413`.
From the root: `python3 app/scripts/verify-second-gallery.py` checks all 93
complete extra-program snapshots, their canonical tags, originals, artwork, and
partial-file hashes. The release checker covers 20 web experiences and proves
previously published main-gallery bytes remain unchanged.

Browser checks run against the completed build on port 5187:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 PLAYWRIGHT_WORKERS=3 npm run test:browser
```

The six startup/control checks and six direct frozen-v1 checks live in
app/tests/browser/learning.spec.js. Final regression results follow completion
of the full suite.
