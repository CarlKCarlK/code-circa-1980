# Web v2 TODO

Every program is published at web v1. Changes below become v2; v1 URLs stay frozen.
Completed Castles web v1 items are archived in [TODO-web-v1.md](TODO-web-v1.md).

- [x] README points to the gallery. Link the main call to action and the Castles
      image to `https://carlkcarlk.github.io/code-circa-1980/`. Keep only a short
      list of program names, with no direct player or release links (decide whether
      to keep `programs/<slug>/` source links). Keep About, License, and AI policy.
- [x] One link preview for every page. The gallery and every release page (for
      example `bomb/v1/`) share the same preview, keeping the Castles artwork as
      the image. Replace the "Code Circa 1980: Castles" title and Castles
      description with the gallery's own wording:
      - Title: "Code, circa 1980. Running again."
      - Description: "Original programs from the early days of personal computing.
        Recovered from cassette tapes, updated with new controls."
      Applies to the gallery and v2 releases; v1 pages stay frozen. Verify the
      deployed tags with a server-side fetch (curl) or a server-side checker such as
      opengraph.xyz; browser-only previewers such as previewer.pro cannot read
      cross-origin pages and wrongly report "Not detected".
- [x] Unversioned program URLs. `https://carlkcarlk.github.io/code-circa-1980/castles/`
      (and `bal/`, `alien/`, `plot3d/`, `chess/`, `bomb/`) currently return 404.
      Each should open that program's latest web release (today `vN` = `v1`) and
      move forward automatically when a newer release is published, driven by
      `programs/<program>/web-versions.json`. Versioned URLs stay permanent and frozen.
      Decide whether it redirects to `castles/vN/` or serves the latest release in
      place; either way, also handle the form without the trailing slash.
- [x] Castles: start with "About, history & source" open, like the other five
      programs. Castles is the only one without `export const aboutOpen = true;`
      (see `app/site/programs/*.js`); check the phone layout still shows the field first.
- [x] Castles: explain the TypeScript version on the page (Castles is first in the
      gallery, so most visitors meet TypeScript here). Points to cover, kept accurate
      to [PARITY.md](../programs/castles/typescript/PARITY.md):
      - Written with AI tools from the original v05 BASIC and its FALL v6 Z80
        assembly routine (not BASIC alone), so mouse/touch controls and sound could
        be added; the original runs unchanged in the emulator alongside it.
      - Tested against the original: construction, projectile paths, and falling
        blocks match in representative scenarios, with settling checked against the
        executed Z80 code. Avoid claiming identical behavior in every game: random
        draws use the browser's generator, trig is not proven bit-identical, and
        complete sessions have not been compared end to end.
      Draft wording: "This version was written with AI tools from my original BASIC
      and Z80 assembly, so it could have mouse controls and sound. It was tested
      against the original to make sure blocks, cannon shots, and falling debris
      behave the same way. The original program runs unchanged under Original."
- [x] bal: give the BASIC (emulator) version a "1979 speed | Fast (×20)" toggle,
      defaulting to 1979 speed. Reuse the existing `setSpeed` emulator support and the
      3-D Plot toggle (`app/site/programs/plot3d.js`), which already defaults to 1979
      speed. (CISAB Chess's toggle defaults to Fast.)
- [x] Alien: make the intro quicker to get past without editing the BASIC. Any key
      already skips the title while its letters draw (line 5020 checks INKEY$), but
      the stars/ship/"IN SPACE NO ONE CAN HEAR YOU SCREAM" phase (5080-5110) and the
      ~20 s "PLEASE WAIT" setup cannot be skipped. (A speed toggle was tried and
      declined: Alien doesn't need it.) Add a visible note by
      the player (not only in Help) telling users that pressing a key during the first
      part of the intro, while the title letters draw, skips ahead.
- [x] Alien: shift the page's emphasis toward my changes to Yob's *Hunt the Wumpus*
      code (the *Alien* reskin, closing junctions, and other remixes) and toward how
      typing in a program from a book teaches you how it works. Also trim: the page has
      too much text and some of it repeats; cut redundancy while doing this rewrite.
- [x] 3-D Plot: show its *TRS-80 Applications Software Sourcebook* listing ("3-D
      Plotter", $9.95 on cassette) with the address redacted, in the page history and
      `programs/plot3d/history/`. Still unknown: which volume and year.
- [x] 3-D Plot: rewrite the first two history paragraphs. Drop the `LINE`-statement
      detail. Instead cover:
      - Non-square dots: a block-graphics dot is about twice as tall as it is wide.
        Every version, from the first draft on, scales X by 30 dots and Y by 15
        (`DX=30:DY=15`, later `XS*30`/`YS*15`), so one unit spans about the same
        distance across and down and the funnel isn't stretched. (The code shows the
        2:1 factors; whether that was the conscious reason is for Carl to confirm.)
      - New formulas: there was no formula prompt. Owners changed the program
        itself, editing line 200 and typing RUN; the finished version defines `PI`
        and `E` (line 180) for that purpose. Link to the "Your own surface" section.
      - Projection: explain that it uses an oblique projection, not perspective.
        Farther points aren't pulled toward a vanishing point; they are just slid up
        and to the right (nearer ones down and to the left; the middle row stays put),
        by an amount set by TILT. No hidden-line removal. At TILT .5 with the 30/15
        scaling it is specifically a cabinet projection (45° at half depth; derived).
- [x] 3-D Plot: fix the TILT help text (page table and `programs/plot3d/README.md`).
      It says the far edge shifts "up and to the left", but by lines 220-230 the back
      row (Z = -1) shifts up and to the right. "Larger values look down on the grid
      more" is also loose: TILT lengthens the diagonal depth offset. Confirm against
      an emulator drawing before rewording.
- [x] CISAB Chess (Rust/JS): replace the prompt above the mouse board, "WHAT WAS
      THEIR FOOLISH MOVE?" (`programs/chess/modern/player.js:173`, adjective rotates
      through the original's DATA list), with wording that makes clear the 1979
      original didn't look like this: it had only a text screen, and an operator typed
      each move as ROW,COLUMN,NEW ROW,COLUMN. Keep the original prompt and its
      rotating adjectives in the transcript (line 68) and the emulator version.
- [x] CISAB Chess: replace "a mediocre player like me" with "a very casual player
      like me" (Sargon paragraph in `app/site/programs/chess.js` history and
      `programs/chess/README.md`).
- [x] CISAB Chess: remove the version-by-version paragraph from the page history
      ("Fourteen versions survive on three cassette sides…" through "v14: A four-move
      opening and IQ. Both players on this site run this version") in
      `app/site/programs/chess.js`. The versions stay in `programs/chess/versions/`.
- [x] CISAB Chess: add its approximate playing strength and how it was measured,
      from `programs/chess/rating/RESULTS.md`:
      - About 100 Elo on Texel's calibrated scale (104 ± 50, 95%): very weak, roughly a
        player who knows the moves but little else. It never lost to random legal moves
        (32 games: 5 wins, 27 draws). Rating applies to the corrected v14 the site
        plays; the as-recovered v14 scored under 10% even against random moves
        because of its pawn bugs.
      - Method: the Rust engine wrapped as a UCI engine, 200 games against Texel
        1.12 with UCI_LimitStrength at Elo 0 and 200, run by Fastchess at 30+0.2 s;
        illegal moves, crashes, and time forfeits count as losses. Caveat: only as
        good as Texel's own calibration.
      - Its weak spot: it knows nothing of check, mate, or stalemate, so it
        stalemated the opponent in 129 of 200 games while ahead by a queen or more.
- [x] CISAB Chess: explain the Rust engine in plain terms: a statement-by-statement
      port of corrected v14 to Rust/WebAssembly that reproduces the TRS-80's RND
      generator and single-precision rounding, so given the same moves it makes the
      same replies, illegal ones and BASIC errors included. Checked against games
      recorded from the emulator (`programs/chess/rust/PARITY.md`). The site adds
      only what the original lacked: it checks moves and disqualifies an illegal one.
- [x] CISAB Chess: add a (long is fine) paragraph on how it worked and why BASIC
      made it hard. Draft points, from the v14 source (verify each before publishing):
      - How it chooses: lists every move, scores each as roughly (value of what it
        captures) ÷ (risk to the moving piece if the square is attacked), with a bonus
        for rescuing its most valuable threatened piece; shuffles the tied best moves
        with RND.
      - Look-ahead: for each best candidate it makes the move, negates every square
        on the board so the same move generator plays for the other side, finds the
        most valuable piece the reply could take, undoes the move, and lowers that
        candidate's score; it repeats until a candidate survives. That is Sargon's
        question: after this move, what can they take?
      - Why BASIC made it hard: no procedures with parameters, local variables, or
        recursion, so look-ahead could not simply call itself; one GOSUB/GOTO maze
        shares global variables, with flags (SW, QT) deciding which side it is
        working for, and the board saved and restored by hand (OC, NC). Level II
        reads only the first two letters of a variable name (R7, C8, QQ, VA…), the
        program has to fit in a few KB, and the interpreter is slow enough that each
        look-ahead takes noticeable time.
      - Close with: I didn't learn the theory behind programs like this (game-tree
        search, minimax, evaluation functions) until years later, in AI classes in
        college.
- [x] Bomb: remove the two-versions paragraph from the page history ("Two versions
      survive on one tape side…" through "…a top-ten table that ranks you even after
      you blow up.") in `app/site/programs/bomb.js`. Both versions stay in the repo.
- [x] Bomb: add to the history, in my voice:
      - Backspacing always kills you: line 620 adds every key but Enter to the
        answer, so a backspace erases the letter on screen but stays in the answer,
        which can never match (line 900, the bomb goes off). Currently only a tip.
      - GREY and GRAY are both wires (line 1000), and you have to type the one shown,
        which Rich and I thought was very funny. Currently only a small note.
      - I'm a poor speller, but thanks to this game I learned to spell AZURE.
- [x] Bomb on phones (built and published as Bomb web v2, untested on a real phone): add a "Keyboard" button that brings up the phone's own keyboard
      (a hidden text input focused by the tap, with autocorrect, autocomplete, spell
      check, and predictive text off and capitals on), forwarding each typed letter to
      the emulator. Use `input`/`beforeinput` events, since Android often reports
      keydown as code 229. Pass Backspace through unchanged (it still blows you up).
      Keep the screen visible above the keyboard (visualViewport). Test on a real
      phone. Could later serve Alien's and Chess's BASIC versions too.
- [x] bal: add a section comparing the BASIC code with the Rust port: how the 1981
      Chemistry Balancer II algorithm reads in each (data structures, exact fraction
      arithmetic, control flow), with short side-by-side excerpts. Draft in
      `programs/bal/basic-vs-rust.md`: the GCD routine (lines 4000–4090) as BASIC,
      a one-for-one readable pseudocode rewrite, and Rust; the line 3140 call site;
      and "What differs" (including BASIC's real 2-D arrays and 0-to-n indexing).
      Put it on the bal page (`app/site/programs/bal.js`) once the draft is final.
- [ ] Article for This Week in Rust (via Medium): a survey of all six programs,
      working title "Why BASIC Is Better than TypeScript and Rust". Real thesis: the
      ideas in a program matter more than its syntax; syntax, typing, and tooling help,
      but come second. Draft in `docs/article-draft.md`; builds on the bal draft. Castles and 3-D Plot have TypeScript
      versions, bal and Chess have Rust; Alien and Bomb have no modern port yet.
- [ ] New browser icon. Redraw the "80" in lettering evoking either the TRS-80
      nameplate or Zilog's Z80 marking (inspired by, not a copy of, either trademark).
      Draw it as SVG paths rather than font text so it renders the same everywhere,
      and check legibility at 16 px. Applies to the gallery and v2 releases only.
