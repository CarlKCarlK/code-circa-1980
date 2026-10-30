# Brick pictures

Save bricks downloads `castles-bricks.png` to the browser's download location.
Load picture accepts PNG, JPEG, and other image formats decoded by the browser.
Loading opens a preview of the full game field. The red, green, and blue sliders
adjust the black-and-white conversion live; negative values subtract that color's
contribution. White becomes bricks and black stays empty, regardless of which shade
is more common. OK shows the picture in the field and then visibly settles loose
bricks; Cancel keeps the current construction. The game waits while the preview
is open. Pause and Resume also work while the bricks are falling.

Saved pictures are 128 × 96 PNGs with square pixels. Each logical block occupies
two vertically adjacent pixels: white for a brick and black for empty space. The
bottom two rows are black because the game supplies its own ground. Cannon state,
score, controls, cursor, and historical screen encoding are not stored.

The PNG has square-pixel pHYs metadata and a private `caSt` chunk that identifies
the saved format. This lets Castles restore exact block positions. An image editor that removes this chunk
may cause the picture to be handled as an ordinary image on import.

Ordinary imports are centered within the 128 × 47 usable cells. Square-pixel
images are resampled to account for the game's twice-tall pixels, so their displayed
shape stays proportional. They shrink to fit when needed and are sampled with
nearest-neighbor pixels. PNG images whose pHYs metadata already specifies twice-tall
pixels keep that pixel aspect. Saved brick PNGs are restored to their exact
128 × 48 logical grid and positions. Transparency is composited on black. The
initial sliders use red, green, and blue weights of 0.21, 0.72, and 0.07; each
channel contributes its signed distance from the midpoint. Negative values reverse
the corresponding channel's contribution; a white pixel becomes a brick.

Earlier 128 × 48 and 128 × 96 black-on-white saves remain supported and interpret
black as bricks. The bottom row is replaced by the game's ground. The original
FALL routine visibly settles unsupported bricks before editing resumes. Cannon settings and other
session state start fresh. A saved unsupported arrangement may therefore settle
when loaded, just as an imported picture does.

Save is available in building mode so the moving cannon shot is excluded.
Return to building before saving during bombardment. Loading is available in
either mode and replaces the previous session only after OK.
Images remain local: loading and conversion run in the browser.
