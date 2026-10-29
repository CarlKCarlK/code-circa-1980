# Adding a program

Create `programs/<slug>/` with `program.json`, `README.md` (instructions),
`provenance.json`, and `versions/<sequence>/` containing untouched recovered
payloads and listings. Register its metadata in `site/catalog.js`. The shared
site provides collection → instructions → emulator navigation.

Explain inferred version order; import each version in a separate local Git
commit using today's import date. Preserve original capture/save IDs and hashes.
Keep modern work separate. Verify the archive and browser experience before
handing off. See ../AGENTS.md for the complete workflow.
