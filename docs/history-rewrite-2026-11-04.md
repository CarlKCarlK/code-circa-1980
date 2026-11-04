# History rewrite — 2026-11-04

Forty-four commits from 2026-10-30 carried an AI co-author trailer. That trailer
was removed from every branch and tag with `git filter-repo`. Nothing else changed:
each commit keeps its tree, author, committer, dates, and order, but it and every
later commit received a new hash.

[history-rewrite-2026-11-04.tsv](history-rewrite-2026-11-04.tsv) maps all 1,090
old hashes to new ones.

Frozen release manifests (`programs/*/web-versions.json`) and bundled release
files still name old hashes in `sourceCommit`. They are immutable, so those values
were not changed; look them up in the map. Current docs and scripts that ran
commands against an old hash were updated, apart from
`docs/url-migration-verification.md`, which describes what the manifests contain.
