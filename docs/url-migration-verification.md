# Short web release URLs — 2026-10-31

The user authorized replacing the six unshared v1 releases so ordinary play
URLs contain just the program's short name and its web version. Each release
opens its frozen default player directly at `<program>/v1/`, with no hash or
query. Earlier builds remain in Git history. Future changes must use a new
web version; the one-time migration does not authorize further v1 replacements.

Rebuilt defaults: Castles and 3-D Plot use TypeScript; bal and CISAB Chess use
Rust/WASM; Alien and Bomb use BASIC in the TRS-80 emulator. Historical payloads
and listings are unchanged. Existing alternate implementation/source links use
query parameters, and in-page navigation retains separate paused sessions.

Local validation from `app/`:

- `npm test`: all 14 test files passed, including integrity checks for both old
  and clean release paths and rejection of altered archived assets.
- `npm run build`: TypeScript checking and production build passed.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5279 PLAYWRIGHT_WORKERS=4 npm run test:browser`:
  52 passed, one skipped (the multiple-release selector, since each program has
  only v1). This covers actual emulator startup, representative controls,
  BASIC/modern switching, browser Back, source links, pause/restart, all six clean
  default URLs, reload, and the collection's direct links.
- `node scripts/check-release-urls.mjs http://127.0.0.1:5279/`: all six frozen HTML
  hashes, running default players, unchanged release URLs and collection links
  passed. The same command without the base argument verifies GitHub Pages.

The frozen manifests identify source commit `4cfe833` and every bundled file's
SHA-256. The tag `web-v1-clean-urls` identifies this rebuilt six-program release;
older program web tags are retained as historical references.
