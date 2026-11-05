# JAB — The Best of the Monster Games

Explore a maze, evade Jabberwockies, and set timed explosive drops.

The website plays a corrected v04, tape30a save 1, through the real TRS-80 ROM, from the single file in source/. Line 3525 makes each bomb use its own drops; `git diff jab-v04-bomb-fix~1 jab-v04-bomb-fix -- programs/jab/source/JAB.ASC` shows it. Instructions are in the player Help and in the expandable link above its field. Auto is the default: 20× except while a visible monster steps (1×) or an explosion flashes (4×), chosen by reading the running BASIC line. Original (1×) is optional.

Inferred development sequence: Amazing-based maze/monster forms, then the replacement maze generator on tape16a, then the closely related tape30a save with revised controls and random routine. Tape numbers alone do not establish chronology. The damaged tape16a save 5 is preserved separately and is not filled from any complete save.

[Source history and dating](history/README.md) · [Execution checks and limits](VERIFICATION.md) · [All source provenance](provenance.json)

JAB keeps one version plus Git, at the user's request: source/ holds the current file, and tags jab-v01 through jab-v05 hold every earlier save, with its recovered snapshot under versions/ in that tag's tree. partial/ keeps the damaged tape16a save. All recovered bytes also stay in the tape archive.
