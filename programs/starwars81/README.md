# Star Wars cockpit

The correct internal and URL short name is **starwars81**. Neither recovered
listing prints an explicit title; the display title is descriptive. The match
to the remembered X-wing game remains tentative.

The site plays one selected version: v02, tape30a save 2, with arrow-key steering
and Space to fire. v01 (tape23b save 5) uses digit controls and remains source
only. Both recovered payloads and listings are unchanged, and the earlier
damaged tape23b save 4 remains separate in partial/.

The decoder’s `[` is the BASIC exponent operator. The earlier development note
calling line 190 suspect was incorrect; original ROM execution confirms `2[3`
prints 8, and the untouched later version reaches the cockpit and responds to
ArrowLeft. That note is corrected here rather than changing historical bytes.

Canonical files use STARWARS81; original historical paths and import tags are
recorded by canonical_history_id. All related headers store cassette name `S`.
Locations: tape23b save 4 at 7:18 (damaged) and save 5 at 8:20 (complete), and
tape30a save 2 at 2:42. These are recording times, not physical tape counters.

The unshared web experience stays at v1 until the user says otherwise. No web
version menu is offered. See VERIFICATION.md for executed checks and limits.
