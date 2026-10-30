# Development

Node.js 22.12+ (or 24+) is required. From the repository root:

```sh
npm ci
npm run dev
```

The Vite development server opens editable source by default. Production links
open the latest frozen release; add `?development=1` to inspect editable source
in a production preview.

Open `code-circa-1980.code-workspace` to keep the collection and cassette recovery
archive together. The workspace and standard Vite/TypeScript/Playwright configs
stay in root so ordinary commands and IDE discovery keep working.

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
- `site/`: shared collection, instructions, player, emulator integration.
- `tests/`: archive integrity, rules, and actual browser playback checks.
- `docs/`: planning, verification context, and release/development guidance.

See [program workflow](../programs/README.md) and [agent instructions](../AGENTS.md).
