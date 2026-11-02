# Verification

The selected player is now tape30a save 2 (v02), the later arrow-key form.
Tape23b save 5 (v01) remains source only. Both complete raw payloads and listings,
canonical tagged blobs, and the damaged prefix/raw ranges were hash-checked.

The earlier note treating '[' at line 190 as suspect was incorrect. The installed
trs80-base 2.3.1 token table uses '[' for exponentiation. Original-ROM execution
of `PRINT 2[3` prints 8. A direct ROM/Z80 run of the untouched v02 reaches the
cockpit, its countdown begins, and ArrowLeft changes the radar. The browser
check also exercises the selected arrow controls, pause/resume, and restart.
No payload bytes were changed to choose this later version.

No claim of a completed Death Star mission, exhaustive combat/bomb testing, or
confirmed X-wing identification. Headers store only cassette name S. The user
specified starwars81 as the internal/URL short name; the display title is the
descriptive Star Wars cockpit because neither listing prints an explicit title.

The user authorized resetting unshared extras to web v1; only the best player
is offered, with earlier saves under Source. The original published main-gallery
releases are outside this exception. Final results are in docs/second-gallery.md
and docs/four-more-programs.md at the repository root.

Reproduce the original-ROM operator and control probe from the repository root:
`node app/scripts/probe-starwars-controls.mjs`.
