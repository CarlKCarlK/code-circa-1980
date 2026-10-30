# Web experience versions

Each program starts at **web v1**. These releases describe the browser experience:
controls, presentation, instructions, TypeScript rules, emulator integration, and
its bundled assets. They are separate from recovered BASIC versions such as
Castles v01–v05.

The public collection and previously shared program links open the latest web
release. The **All web versions** gallery links to every release. A direct URL
such as `experiences/castles/v1/` always opens that frozen experience, including
its instructions and choice of TypeScript or original emulator. Its Collection,
All web versions, and Latest version links lead back to the current collection.

## Stored releases

- `public/experiences/<program>/vN/` contains an immutable, self-contained production build.
- `programs/<program>/web-versions.json` lists releases in order, starting at v1,
  with a release date, source commit, and every file's size and SHA-256 hash.
- `app/site/` and `programs/<program>/typescript/` remain the editable source.

The built snapshot keeps its own JavaScript, CSS, original payloads, and license
notices. Rebuilding the current site copies earlier snapshots rather than
rebuilding their code. The source commit and pinned package lock retain the
source and dependency versions used to create each release.

## Develop and release

Use the local Vite URL with `?development=1`, for example:
`http://127.0.0.1:5173/?development=1#/program/castles/typescript`.
This opens the editable source. A normal URL opens the latest frozen release.
The regular browser tests exercise the editable source; the web-version checks
also exercise published snapshots and the public default links.

1. Make and test the source changes. Commit the source before freezing a release.
2. Run `npm run release:web -- castles --label "Description of this release"`.
   The command chooses the next unused sequential version, builds without copying
   old snapshots into it, and records the source commit and file hashes.
3. Run `npm test`, `npm run build`, and `npm run test:browser`. Check the new
   snapshot as well as the active source. For a new program, add its catalog entry
   and create v1 before publishing.
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
