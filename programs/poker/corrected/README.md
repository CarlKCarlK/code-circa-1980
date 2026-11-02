# Minimally corrected Poker

Reference: tape12b save 6, import v02. Recovered versions and canonical originals
remain untouched. This separate derived edition is the only playable Poker.

Three code corrections:

- Line 2190: reverse `A(Z)=BB` to `BB=A(Z)` so evaluation reads cards without overwriting them. The other recovered text save has this assignment in the correct direction.
- Remove line 1005 `STOP`, a debugging stop inside the computer draw loop, absent from the other text save.
- Line 3310: replace misspelled `THEEN` with the BASIC `THEN` token. Keep the comparison and target unchanged.

Quoted text corrections include YOOU, WWELCOME, OPEEN, DRAWW, DOWWN,
CHREATIVE/MORRISTIWN, WITH/WISH in the continue prompt, SELL YOU/YOUR WATCH,
WWATCH, and WAS/WAD in the closing money message. Rules, strategy, variable
names, and all other executable bodies remain unchanged.

Run `npm run build:poker-corrected` in app/. The builder patches recovered
tokenized records directly and recalculates their linked pointers. changes.json
records the source/output hashes and every logical change. It does not
retokenize unaffected source.

Tests verify the exact patch, unchanged executable bytes outside the specified
code lines, preservation of ten distinct cards through repeated evaluation,
recognition of a real full house and flush, and execution through the computer
draw without STOP. The browser test plays through betting, drawing, and
showdown, checks five distinct computer cards, and exercises pause/restart.

These are focused corrections, not an exhaustive poker-rule audit. Other
historical limitations remain, including the malformed watch-sale condition
at line 3890; no missing probability threshold has been guessed.
