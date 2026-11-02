# Development

Node.js 22.12+ (or 24+) is required. The quickest start, from the repository root,
is `just show` (or `just show bal`, `just show castles`): it installs dependencies
if needed, starts the dev server on a free port and opens your browser. Or:

```sh
cd app
npm ci
npm run dev
```

The Vite development server opens editable source by default. Production links
open the latest frozen release; add `?development=1` to inspect editable source
in a production preview.

Open `tools/code-circa-1980.code-workspace` to keep the collection and cassette recovery
archive together. Configuration lives in `app/config/`; the npm commands select
those files explicitly. Run npm commands from `app/`, or use `npm --prefix app`
from the repository root.

```sh
npm test
npm run build
npx playwright install chromium  # once per machine
npm run test:browser
npm run test:dev-route  # ordinary Vite routes, without a development query
```

For a nonstandard browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. To use an
already running production preview, set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:PORT`
when running `npm run test:browser`; this skips the automatic server probe.
See [web releases](WEB-VERSIONS.md) for freezing a new version and verifying
published snapshots. Publication is separate from preparing a local release.

- `programs/<slug>/`: instructions, metadata, provenance, historical snapshots.
- `app/site/`: shared collection, instructions, player, emulator integration.
- `app/scripts/`: release, verification, assembly and development tooling.
- `app/tests/`: archive integrity, rules, and actual browser playback checks.
- `app/assets/`: artwork used by the website and README.
- `app/config/`: Vite, TypeScript and Playwright configuration.
- `app/index.html`, `app/package.json`, `app/package-lock.json`: website entry and pinned dependencies.
- `tools/`: the VS Code workspace for this repository and the recovery archive.
- `docs/`: planning, verification context, and release/development guidance.

See [program workflow](../programs/README.md) and [agent instructions](../AGENTS.md).

Repository layout verification: after the file moves, all seven unit/integrity
suites and all 28 browser checks passed, along with the production build,
`test:dev-route`, and `build:fall`. Relative imports, documentation links and both
workspace folders were checked. The recovered program paths and frozen web v1/v2
files are unchanged; this maintenance change needs no new game release.

The HTML entry and npm manifests also live in `app/`; configuration uses browser
module resolution for the TypeScript sources outside that package. CI installs
from `app/package-lock.json`, runs commands in `app/`, and uploads root `dist/`.

### Six further unlinked programs

The `second-gallery` worktree adds Skinner Box, German tutor, Magazine Index,
TEACH VI, Poker, and LIFE at `#/more`. No main-gallery inbound link is added.
All six use unshared web v1 and one playable reference. Source and canonical
history preserve 44 complete recovered saves, plus German's damaged fragment
and LIFE's incomplete compiled header. `npm run build:life` assembles the
separate LIFE executable; `npm test` checks a blinker in the actual Z80 code.
`tests/browser/learning.spec.js` covers original startup, representative input,
printing, pause/restart, and direct frozen v1 paths. Set CAPTURE_GALLERY_ART=1
only to deliberately update their original-screen PNGs.
