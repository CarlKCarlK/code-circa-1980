# Code Circa 1980

**Original programs. New possibilities.**

My programs from the late 1970s and early 1980s, recovered from cassette recordings
and preserved in their original form. Selected programs will be reimagined for
modern browsers. Games, utilities, mathematics, graphics, and experiments belong
here; the collection grows one program at a time.

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Choose **Castles**, read its instructions,
then launch the original program in the embedded TRS-80 emulator.

Open `code-circa-1980.code-workspace` to work with this collection and the `trs80`
recovery archive together. Node.js 22.12+ (or 24+) is required.

## First program

[Castles](programs/castles/README.md) has five recovered versions, each in its
own Git commit in a documented, inferred development order. Four recovered BASIC versions are playable: v01–v03 are self-contained, and v05
loads a modern assembly of its recovered FALL v6 source. v04 remains source only.
The default original is now v05. Choose **TypeScript** on the instructions page
for the first native browser port, based on v05 and its assembly routine.

## Organization

- `programs/<slug>/`: instructions, metadata, provenance, and recovered versions.
- `site/`: shared collection, instructions, player, and emulator integration.
- `tests/`: archive integrity and browser playback checks.

See [the program workflow](programs/README.md). Historical source stays unchanged;
translations and modern versions must be separate.

## Verify

```sh
npm test
npm run build
npx playwright install chromium  # once per machine
npm run test:browser
```

## License

Code authored by Carl Kadie is available under either [MIT](LICENSE-MIT) or
[Apache-2.0](LICENSE-APACHE), at your option (`MIT OR Apache-2.0`). Preserve historical
copyright notices. Third-party dependencies retain their own terms; see
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

Future ideas are tracked in [TODO.md](TODO.md).
