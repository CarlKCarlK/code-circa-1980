# Bomb

Co-designed by Rich Losey, my roommate, and me.

A bomb-defusing game that is really a memory and spelling test. The screen
flashes three to five wire colors, one at a time. Then you type them back, in
order, against the clock. One wrong letter and the bomb goes off. Each bomb you
defuse shows the next one's wires faster and gives you less time to type them.

There are 38 colors, some of them hard to spell under pressure (TURQUOISE,
SAPPHIRE, KHAKI, AUBURN, CINNAMON), and the list has both GREY and GRAY, so one bomb can ask for both.

## Two versions on one tape side

Both recovered versions are on tape17a:

- **v01** (save 1) is a menu of three programs: `1) BOMB`, `2) RADIO
  INTERSECTION` (draws circles around two random radio stations and their
  intersection: "PROGRAM TO TEST THEORIES OF THE RELAY PROBLEM") and `3) BINARY
  SEARCH` ("BINARY SEARCH RESEARCH"). A negative choice lists that program's
  source. In this Bomb the villain is still a placeholder, MR. XX, two
  alternative intro paragraphs are commented out, and there is one high score,
  preset to 38 by CMK, my initials (Carl Myers Kadie).
- **v02** (save 3) is Bomb on its own, rewritten with new line numbers. The
  bomb-maker now has a name, Thomas Nicholas Taggert, "known to the police as
  'Nefarious Nick'" (Mr. TNT). It adds an arcade-style attract screen ("TO PLAY
  DEPOSIT $.25 IN BOX, THEN PRESS ANY BUTTON"), a top-ten ranking with
  posthumous ranks, and a slightly different color list (it adds PURPLE, EBONY,
  AQUA and CRIMSON and drops CHARCOAL).

The order v01 then v02 is inferred, not dated: v01 comes first on the tape and
reads like a draft of v02. The site plays v02 unchanged in the emulator; v01 is
kept as source.

The site runs Bomb on a stock Model I. The source has `yOU`, `kEEP` and
`mR. TNT`: holding Shift for a capital stores a lowercase letter. A Model I
without the lowercase kit shows those as capitals, as they would have looked in
1981; a Model III would show the lowercase.

## Date

Probably 1981. Neither version is dated. Chemistry Balancer II, saved three
times on the same side and four times on the other side (tape17b), says
`COPYRIGHT 1981 C. KADIE`. Programs were sometimes saved again later, so this
is a contextual estimate.

## Files

- `versions/v01/`, `versions/v02/`: the recovered payloads (`.BAS`) and
  listings (`.ASC`), byte for byte as recovered.
- `original/`: the same files under stable names, advanced one commit per
  version (tags `bomb-v01`, `bomb-v02`).
- `provenance.json`: archive paths, hashes and recovery evidence.
- `VERIFICATION.md`: what was run in the emulator, separately from recovery.
