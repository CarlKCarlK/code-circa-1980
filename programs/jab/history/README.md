# JAB: source and dating

Jack Hauber’s Amazing, in David H. Ahl’s BASIC Computer Games (1978), pp. 2–3, is a verified algorithmic source for the early tape16a maze forms. The complete electronic transcription from the Vintage BASIC mirror is preserved byte for byte in upstream/ and starts canonical comparison history (`jab-amazing`). It is a modern transcription of a published source, not historical recovered bytes. The early recovered generator rearranges line numbers and replaces printed walls with screen graphics; it retains W/V arrays, Q/Z flags, scanning, randomized neighbor choices, and carving branches.

Tape16a saves 1 and 2 contain the Amazing generator plus monster-game code, even though save 1’s archive label emphasizes the maze. Save 3 and tape30a save 1 share the literal title THE BEST OF THE MONSTER GAMES ---- JAB and a different generator. Those later sources retain much of the same monster/explosive machinery. The inferred sequence follows local save order, then the revised tape30a controls/random routine; the latter cross-tape order is uncertain. Do not describe all of JAB as Hauber’s published program.

Tape16a save 5 is a genuine damaged alternate: its 270-byte prefix through line 71 remains separate and is not a complete version. No complete JAB source or author credit was located externally. JAB is not Jaberwocky, and its abbreviation is not evidence of common code with that game.

No direct date appears in JAB. Same-side context includes `20 'COPYRIGHT 1980  CARL KADIE` in Tank Game and `10 REM CHEMISTRY BALANCER II   COPYRIGHT 1981 C. KADIE` in Chemistry Balancer II; those later notices suggest the side contains material from 1980–81, but do not date JAB’s creation or each save. Tape30a supplies no firm date.

Sources: https://www.atariarchives.org/basicgames/showpage.php?page=3 and https://raw.githubusercontent.com/GReaperEx/bcg/master/amazing.bas

Compare `git diff -w jab-amazing jab-v01 -- programs/jab/original/JAB.ASC`, then tags jab-v01 through jab-v04.
