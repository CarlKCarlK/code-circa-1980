# Verification

Imported November 2, 2026. Recovery validation is separate from execution.
`cd app && npm test` validates complete snapshot hashes, BASIC pointer chains,
end markers, ordered line numbers, and listings. Run
`python3 app/scripts/verify-second-gallery.py` to check the canonical tags,
current originals, partial hashes, and untouched raw prefix ranges.

The browser check runs v01 (tape23b save 5), enters CODE 1, reaches the cockpit,
checks radar movement while holding digit 4, and exercises pause/resume and
restart. Results are in docs/second-gallery.md. An initial check incorrectly
required the fleeting countdown value 300; it already read 293 when inspected.

No claim of a completed Death Star attack or exhaustive control testing.
The X-wing identification remains tentative. v02 is source only because its
alternate control expression at line 190 is suspect. No recovery bytes have
been repaired or replaced. The damaged earlier save remains separate.

The internal identifier was migrated from xwing to startwar81 after the user
clarified the naming preference. Neither listing prints an explicit title; the
user-facing title is the descriptive "Star Wars cockpit." New playback uses
startwar81/v3. Old xwing/v1 and v2 releases remain byte for byte unchanged, and
legacy hash/query routes resolve to the current short name. All canonical tag
blobs and payload hashes were rechecked after the folder/file rename.
