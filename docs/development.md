# Development

Node.js 22.12+ (or 24+) is required. From the repository root:

```sh
npm ci
npm run dev
```

The Vite development server opens editable source by default. Production links
open the latest frozen release; add `?development=1` to inspect editable source
in a production preview.

Open `tools/code-circa-1980.code-workspace` to keep the collection and cassette recovery
archive together. Configuration lives in `config/`; the npm commands select
those files explicitly, so the commands above still run from the repository root.

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
- `config/`: Vite, TypeScript and Playwright configuration.
- `tools/`: the VS Code workspace for this repository and the recovery archive.
- `docs/`: planning, verification context, and release/development guidance.

See [program workflow](../programs/README.md) and [agent instructions](../AGENTS.md).

Repository layout verification: after the file moves, all seven unit/integrity
suites and all 28 browser checks passed, along with the production build,
`test:dev-route`, and `build:fall`. Relative imports, documentation links and both
workspace folders were checked. The recovered program paths and frozen web v1/v2
files are unchanged; this maintenance change needs no new game release.
