# Separate working derivative

Rebuild with `npm run build:cipher-corrected` from app/. The original stays in
versions/v01 and original/. changes.json records every changed line and hash.
Only lines 50, 80, 440, 520, and 550 change; all other record bodies are copied.

Missing STEP -1 clauses otherwise read only the first message/key characters.
The result codes are already characters, so adding 64 again corrupts output.
The 27-symbol alphabet uses @ (code 64) as its internal space slot rather than
the source’s backtick (96). The derived code preserves the book-code attribution.
Actual-ROM fixtures check encoding and decoding, including space/wrap boundaries.
