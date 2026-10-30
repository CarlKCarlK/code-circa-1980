# Adding a program

Create `programs/<slug>/` with `program.json`, `README.md` (instructions),
`provenance.json`, and `versions/<sequence>/` containing untouched recovered
payloads and listings. Register its metadata and presentation functions in `app/site/catalog.js`.
Keep program-specific instructions, on-screen keys, and quick help in
`app/site/programs/<slug>.js` (use Castles as the first example). The shared
site provides collection → instructions → emulator navigation.

Explain inferred version order; import each version in a separate local Git
commit using today's import date. Preserve original capture/save IDs and hashes.
Keep modern work separate. Verify the archive and browser experience before
handing off. See ../AGENTS.md for the complete workflow.

## Preserve both views of historical versions

Keep every recovered version together in `programs/<slug>/versions/` for website
selection and downloads. Also maintain stable canonical paths under
`programs/<slug>/original/` for the listing, raw payload, and provenance. Advance
those same files in one commit per version, in documented inferred development
order, verifying each committed blob against its snapshot hash. Add program-specific
tags (for example, `castles-v01`) to make each canonical revision easy to compare.
Append this history when earlier commits are already published; do not rewrite
user history. Use actual import dates, preserve all historical bytes, and explain
when the latest historical source differs from the website's playable default.
