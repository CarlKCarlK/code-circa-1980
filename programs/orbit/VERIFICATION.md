# Verification

The selected original is tape11b save 17 (v06). Five earlier complete saves
remain source only. Archive hashes, full BASIC pointer chains, ordered line
numbers, end markers, listing conversion, and canonical tags were checked.
No syntax, physics, rounding, setup text, or spelling was changed.

The tested custom configuration is: expand NO; own situation YES; screen width
8E11; one body at 1.991E30,4E11,3E11; spacecraft mass 5.979E24; starting position
2.5E11,3E11; heading/speed 90,30000. The example button types these answers via
the original ROM keyboard and waits for each actual question. It is canceled
on restart, pause, or navigation and never writes machine state directly.

The browser check runs this setup, observes the velocity field and increasing
trail pixels, exercises Help, pause/resume and restart, and tests restarting
while the automatic answer sequence is in progress. An initial test counted
occupied character cells rather than logical set pixels; it now measures actual
pixel bits, since several trail pixels can share one character cell.

Historical limits: preset-menu options 2–4 jump to missing line 2500; use the
custom example. Setup text remains behind the plot. Invalid/out-of-range input
can cause original BASIC errors. The numerical model has not been checked for
scientific accuracy or long-term stability. No claim of exhaustive trajectories.
The '[' notation in the listing is the BASIC exponent operator.

From app/:
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 npm run test:browser -- tests/browser/experiments.spec.js -g 'orbit simulator'`.
`CAPTURE_GALLERY_ART=1` explicitly refreshes artwork; ordinary tests leave it
unchanged. Final results are in ../../docs/four-more-programs.md.
