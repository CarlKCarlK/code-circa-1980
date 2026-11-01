# Web experience versions

Each program starts at **web v1**. These releases describe the browser experience:
controls, presentation, instructions, TypeScript rules, emulator integration, and
its bundled assets. They are separate from recovered BASIC versions such as
Castles v01–v05.

The public collection links directly to the latest web release. Permanent URLs
contain only the short program name and its web version:

- `https://carlkcarlk.github.io/code-circa-1980/bomb/v1/`
- `https://carlkcarlk.github.io/code-circa-1980/chess/v1/`

A release URL opens its frozen default player directly, without a hash, query,
start page, or further redirect. Bomb and Alien default to BASIC; Castles and
3-D Plot to TypeScript; bal and CISAB Chess to Rust/WASM. A release freezes the
default choice as well as its code, instructions, assets and licenses. A future
release cannot change an earlier URL's behavior.

Existing implementation and historical-source links use query parameters such as
`?lang=basic` and `?source=v01`. They are optional navigation inside a release;
ordinary play links never include them. There is no new configuration interface.
Editable development routes retain the older hash scheme for local testing.

## Stored releases

- `public/<program>/vN/` contains an immutable, self-contained production build.
- `programs/<program>/web-versions.json` lists releases in order, starting at v1,
  with their relative `path`, release date, source commit, and every file's size
  and SHA-256 hash.
- `app/site/` and implementation directories remain the editable source.

On 2026-10-31 the user explicitly authorized rebuilding all six unshared v1
releases at these shorter URLs. The one-time migration was
`node scripts/migrate-web-v1.mjs --replace-unshared-v1`, after committing source.
It refuses to run after migration or when any later release exists. The old
`public/experiences/` snapshots remain in Git history. The migration deployment
uses `[reset-web-versions]` once to permit the authorized replacement. This does
not authorize future resets: subsequent changes must become v2, v3, and so on.
The tag `web-v1-clean-urls` identifies the rebuilt six-program release; older
program web tags remain available as historical references.

The built snapshot keeps its own JavaScript, CSS, original payloads, and license
notices. Rebuilding the collection copies earlier snapshots rather than
rebuilding their code. The source commit and pinned package lock retain the
source and dependency versions used to create each release. Historical source
files and recovery evidence are unchanged by the URL migration.

## Develop and release

Run the npm commands below from `app/` (`cd app` from the repository root).

Use the local Vite URL with `?development=1`, for example:
`http://127.0.0.1:5173/?development=1#/program/castles/typescript`.
This opens the editable source. A normal URL opens the latest frozen release.
The regular browser tests exercise the editable source; the web-version checks
also exercise published snapshots and the public default links.

1. Make and test the source changes. Commit the source before freezing a release.
2. Run `npm run release:web -- castles --label "Description of this release"`.
   The command chooses the next unused sequential version, builds without copying
   old snapshots into it, and records the source commit and file hashes.
3. Run `npm test` and `npm run build`; start `npm run test:browser` in the
   background. Check the new snapshot as well as the active source. For a new
   program, add its catalog entry and create v1 before publishing. As authorized
   on 2026-10-31, browser checks do not block publishing: GitHub runs them in
   a separate workflow. Deployment still requires build, unit tests and release
   integrity to pass. Report and fix browser failures afterward.
4. Commit the new snapshot and its catalog entry. Add a program-specific tag such
   as `castles-web-v2`, then push the commit and tag. GitHub Actions verifies and
   publishes the site. The newest catalog entry becomes the public default.

Use a new version for public changes to a program's web experience. Never update
or remove files from an existing release, even for a small correction. Fix the
editable source and freeze the next release instead. The gallery and shared
collection can evolve independently.

`npm run verify:web-versions` checks snapshot hashes and catalog order. CI also
compares against the previous commit and rejects changes or deletion of published
releases. `npm run verify:web-versions -- --against <commit>` runs the same
preservation check locally.

`node scripts/check-release-urls.mjs` verifies all six live default-player URLs,
their exact frozen HTML hashes, and the collection's direct version links.
Pass a different base URL to check a local preview, for example
`node scripts/check-release-urls.mjs http://127.0.0.1:5279/`.
