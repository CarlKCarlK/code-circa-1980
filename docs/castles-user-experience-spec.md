# Castles: from GitHub to the first satisfying bombardment

Proposed specification, October 30, 2026. This is an audit and design proposal;
it does not authorize or implement a new game experience.

> **Superseded (2026-10-30):** the compact start page proposed below was removed.
> Every link now opens the player directly; see "No intermediate pages" in AGENTS.md.

## Outcome

A visitor should find the README easily, understand what Castles is, reach the
game without a programming setup, and build or load something they can bombard
within their first minute. Historical originals, sources, and previous web
experiences remain easy to find for visitors who want them.

Treat the whole journey as one experience: repository file list, README,
collection homepage, Castles start page, player, first construction, bombardment,
return to editing, help, saving, and trying the original.

## What exists and what was checked

Inspected the actual GitHub README and live GitHub Pages site in Chromium,
the local editable source, TODO.md, and the local frozen web-v1 production build.
Desktop viewport: 1280 × 960. Phone emulation: 390 × 844.

The public site at audit time did not yet show the local web-release navigation.
The local working tree already contained changes to TODO.md and untracked release
artifacts; those were left alone. Public observations and upcoming local behavior
are distinguished below.

Browser checks exercised launch, supported pointer drawing, loading the bridge,
starting bombardment, returning to building, pause/resume, PNG download, visiting
instructions and relaunching, switching to the original, and original BASIC
startup. Expanded/collapsed phone controls and screenshots were inspected.
No JavaScript page errors appeared in the initial public/editable journey checks.
`npm run build` passed, including typechecking.

This was an expert walkthrough, not a study with new users. No claims about
measured human completion times, physical touch devices, screen-reader usability,
Safari/Firefox, exhaustive gameplay, or original-emulator controls follow from it.
Audit scripts, measurements, and screenshots are in the temporary directory
`/tmp/castles-ux-audit/`; findings needed for this proposal are recorded here.

## Current journey and friction

The existing sequence is:

**GitHub repository file list → README play link → collection homepage →
Castles instructions page → Play Castles → player.**

There is a whole separate instructions page between the collection homepage and
the player. The homepage card says “Instructions & play”; it does not launch the
game. Three link activations are needed from the README to the player. The long
instructions page adds substantial scrolling on top of those transitions.

| Stage | Evidence | Consequence |
| --- | --- | --- |
| Finding the README | GitHub places the repository file list above its rendered README. Root contains planning/release documents, workspace and tool configuration alongside project files. | Visitors must get past maintainer material before the introduction. Root cleanliness is part of onboarding. |
| README | A prominent website link exists, followed immediately by Run locally. Castles details mix BASIC versions, assembly dependencies, and TypeScript. | Readers can mistake installation or implementation choice for a prerequisite. The text also implies original-emulator default although TypeScript is already the site's default. |
| Collection homepage | One program card, decorative castle, broad collection introduction; another click opens instructions. | A Castles-seeking visitor takes a collection detour. Keep this page for browsing, but provide a direct path for someone already choosing Castles. |
| Instructions | History, dating evidence, a dense mouse-controls paragraph, keyboard tutorial, and original key reference precede Play. | The live Play link begins around y=1,764 desktop and y=2,947 phone. Local editable release navigation adds about 64 pixels. |
| Implementation choice | “Original · emulator” precedes selected “TypeScript”. Technical identifiers repeat above the title and in an edition badge. | The default is visually secondary and the choice describes implementation rather than visitor benefit. |
| Player arrival | Large title/description and navigation repeat. Live field starts at y=492 and ends at y=1,152 on desktop; phone field starts at y=533. | Desktop's first viewport cuts off the ground where building begins. Local navigation pushes the field farther down. |
| First construction | Empty field, tiny cursor, support restriction, original numeric keys. Draw is selected in the panel while initial status says “Building · move”. | It is unclear where to begin, why a floating block is rejected, or which control state describes pointer drawing. |
| Control panel | Desktop panel overlays the field. Its 338-pixel body contains about 534 pixels of building controls. Pause/Restart/Full screen are moved into that scrolling body. | Routine actions compete with drawing-assist explanation, pattern loading, file actions, and opacity. Important actions require internal scrolling. |
| Phone controls | Panel starts collapsed. Expanded panel is 250 × 380 over a field about 350 × 268. | Main actions are hidden initially; expansion substantially covers the small playfield and extends below it. No horizontal overflow was observed, but that alone does not establish usability. |
| Bombardment | Power starts at 0, angle at A. Labels are a number and a letter; changes apply between shots. | The player lacks a clear relationship between settings, trajectory, and when adjustments take effect. |
| Learning during play | “← Instructions” navigates away and disposes the player. A drawn tower produced 140 lit pixels including ground; instructions → Play returned to ground only, 128. | Seeking help loses the construction. Switching implementations also returns to a pre-play page and ends the current session. |
| Saving and trying again | Save bricks downloads `castles-bricks.png`. Restart immediately clears the scene; loading a pattern replaces it. | File naming and destructive actions offer weak continuity. “Return to building” is useful but buried among other panel actions. |
| Alternate GitHub entry | `programs/castles/README.md` leads with history and local setup; mentions a Move tool that no longer exists as a visible button. | Visitors browsing source can enter an outdated second onboarding path. |
| Sharing | Root HTML has a description and inline “80” favicon, but no Open Graph/Twitter preview tags or share image. | Shared links do little to explain or demonstrate Castles. Hash routes require care because preview crawlers may only see the collection HTML. |

Strengths to preserve: the README already has a prominent online link; the game
has a clear creative premise; TypeScript already defaults; support feedback,
bridge/empty patterns, return-to-building, local PNG saving and picture preview
already exist; historical originals and provenance remain available. A working
GitHub Pages site and deployment workflow already exist.

## Proposed journey

**README → short Castles start page → player → build/test/edit loop.**

The collection homepage stays available as a browsing destination. Its card
continues to open the same short Castles start page. The README's primary
**Play Castles in your browser** link goes directly to that page, using the
stable latest-program route, not a frozen release URL or immediate `/play` route.
This preserves instructions before launch without requiring a collection detour.

### 1. Make the repository and README welcoming — priority 0

- Keep a compact README: title, one-sentence personal introduction, actual game
  image, primary play link, and “No installation required.” Follow with a short
  first-person historical note and links for source/history, development, and
  licensing. Keep the same online play link near the top of the Castles README.
- Move Run locally, prerequisites, workspace setup, organization, and Verify into
  `docs/development.md`. Retain complete, reproducible commands there.
- Move TODO.md and WEB-VERSIONS.md into `docs/`, updating references. Keep this
  spec there too. Use one docs directory rather than adding several root files.
- Evaluate moving the workspace file to `tools/` and tool configuration to
  `app/config/`. Adjust relative paths and explicit config flags in package scripts,
  CI, and release scripts; do not make these moves unless they reduce root
  clutter without obscuring normal developer commands. Preserve both repositories
  in the workspace. A moved TypeScript config needs its include paths adjusted.
- Keep conventional project entry files in root: README.md, package.json,
  package-lock.json, index.html, workflow instructions, and license files.
  Do not relocate license notices casually; verify references and distribution
  copying before any notice move. Keep AGENTS.md discoverable for agents.
- Inspect the actual tracked GitHub listing after cleanup. Ignored local
  `node_modules/`, `dist/`, and `test-results/` are not GitHub clutter. Hiding
  maintainer content inside README details does not shorten the file list.
- Change explanatory license prose to “My code…” while retaining accurate legal
  notices, authorship, attribution, and both license choices.

### 2. Replace the long instructions gate with a compact start page — priority 0

In order: Castles title, one-line purpose, recognizable game image, three short
instructions, and **Play Castles**. At both audited viewport sizes, the complete
primary button must be visible without scrolling. Suggested quick start:

1. Start with a bridge, or build from the ground up.
2. Drag to draw; blocks need support below or diagonally below.
3. Start bombardment, adjust the cannons, then return to building.

Recommend **Play Castles** starting with the existing bridge, still in Building
mode, and a secondary **Build from scratch** option. Clearly state what each
does before launch. This gives the newcomer something to test immediately while
keeping blank construction a first-class choice. It is a proposed modern-browser
onboarding change, not a change to the recovered original or the physics.

Use **Browser version** first and **Original TRS-80** second, with a short
benefit description: mouse/touch controls versus the recovered program in an
emulator. TypeScript and exact reference versions belong in About/source details.
When Original is selected, substitute its short, accurate keyboard sequence;
do not advertise browser-only bridge or editing conveniences as original features.

Put full keyboard reference, drawing-assist options, image import, history,
dating evidence, recovered revisions, provenance, and web releases below the
start area or in clearly named expandable sections. Preserve the first-person
history and explicit uncertainty about the date. Avoid a full-width release
navigation row above the main action; offer “Previous web releases” in details.

### 3. Put the field and essential controls first — priority 0

Use a compact player header: Castles, Browser version/Original TRS-80 selector,
and Help. Remove the repeated promotional heading, lede, and reference badges
from the player. Keep history and source accessible without displacing the field.

At 1280 × 960, show the whole field including ground, phase action, and
Pause/Resume without page or internal-panel scrolling. At 390 × 844, show the
whole field and the primary phase action on arrival. Retain the logical 128 × 48
geometry and pixel aspect ratio; scale presentation to fit.

Dock controls beside the field on wide screens and below it on phones. The
floating-controls option was removed: a 4:3 field on 16:9 screens leaves room
beside it.
The default must leave the drawing area unobscured. In full screen, keep Help,
phase action, Pause/Resume, and Exit full screen reachable for both implementations.
Primary touch actions should have at least 44 × 44 CSS-pixel targets.

Organize controls by the action being performed:

| Always available | Building | Bombardment | Secondary sections |
| --- | --- | --- | --- |
| Help, Pause/Resume, New construction, Full screen | Draw, Erase, clear support hint, Start bombardment | Power, trajectory angle, Return to building | Starting patterns, Save/Open, keyboard reference, drawing assist, appearance, history/source |

Use phase-appropriate controls. Remove the unexplained numeric on-screen key row
from the default browser view; retain an optional labeled original-key panel and
the actual original-emulator controls. Make pointer tool status agree with Draw
or Erase; show keyboard mode only when relevant.

### 4. Make the first build and shot understandable — priority 0

- For a blank start, point to the ground: “Start here and drag upward.” Show a
  short support hint when a stroke is rejected. Keep the existing support and
  top-down erase rules; do not silently add supports or relax the rules.
- Put Start bombardment prominently next to the field. Explain before activation
  that two cannons fire automatically and alternate; the user adjusts their shared
  settings rather than aiming by clicking or taking turns firing manually.
- Label Power from low to high, and Angle with an understandable trajectory/arc
  cue. If displaying degrees, derive the nominal value from the actual mapping
  and disclose variation; A–Z are not degree values. Keep historical keys in the
  advanced reference.
- Distinguish requested settings from the current shot: “Applies to the next
  shot” while pending, then show the applied setting. Keep the existing initial
  settings and physics in this phase; consider a clearly labeled optional
  suggested shot setting only as a separately reviewed improvement.
- Make Return to building as visible as Start bombardment. Explain that it edits
  the surviving construction. Describe the experience as a construction sandbox;
  do not invent a score, victory condition, or competition absent from the game.

### 5. Let people learn and experiment without losing work — priority 0/1

Priority 0: Help opens beside/over the current player and pauses it while open.
Closing Help restores the same construction, settings, and prior paused/running
state, with focus returned appropriately. Keep input release on blur, pause,
navigation, visibility changes, and restart. Keyboard input remains confined to
the focused game; shortcuts never consume typing in help or filename fields.

Priority 1: preserve separate in-memory Browser and Original sessions when
switching, pausing the inactive one. Never imply that a scene transfers between
implementations. If emulator suspension cannot support this reliably, explicitly
explain the restart before discarding that session and preserve browser work.
Keep the selector in the player rather than routing through the instructions gate.

Priority 1: rename Restart to New construction, explain that it clears the scene,
and offer Cancel before clearing a changed construction or replacing it with a
pattern. Show these prompts only when work would be lost. Saving and Cancel
must preserve the current field. A browser-session draft can later restore
browser work after accidental navigation/reload; it is not an emulator save state.

Priority 1: Save bricks asks for a name with a useful default and downloads a PNG.
Explain that this saves the brick layout, not an entire running game. Keep picture
preview/Cancel and existing RGB conversion as advanced tools. Do not demand an
account or external storage. Preserve local file privacy.

### 6. Strengthen identity and sharing — priority 2

Use a recognizable actual Castles construction for the collection art, README
image, and share image. Add a short first-person biography when personal facts
are supplied. Add suitable Open Graph/Twitter metadata and static icon assets;
test an actual shared URL, since hash-route metadata is not enough. Keep
collection and Castles preview destinations explicit. These tasks complement
an already deployed GitHub Pages site; they do not require new hosting.

## How the current TODO maps to this spec

The TODO opening sentence (“not part of the current controls work”) is stale as
a description of these overlapping UX ideas. Replace it with priorities and
acceptance criteria when this proposal is adopted. No existing TODO was edited
as part of this audit.

| Existing item | Recommendation |
| --- | --- |
| Reduce text before game field | P0: compact start page and player header; measure both. |
| Move actual Play button higher | P0: same start-page task, not a separate cosmetic fix. |
| Improve Original/TypeScript switching | P1: explain choice, stay in player, preserve sessions or disclose restart. |
| Swap tabs, TypeScript first | P0: Browser version first; the actual default already is TypeScript. |
| Illogical castle control panel | P0: dock/group by phase; keep essential actions outside scrolling advanced controls. |
| Friendlier cannon controls | P0: trajectory cues, shared settings, current versus next shot. |
| Remove README Run locally and Verify | P0: move complete material to development docs and keep a link. |
| README license in first person | P0: small accompanying editorial change. |
| Add GitHub Pages with versions, icons, social previews | Split: hosting exists; local frozen-release/gallery infrastructure exists; confirm publication. Icons have a basic inline favicon; improve actual artwork. Social previews remain open. |
| Castle logo from game artwork | P2: actual game imagery across entry points. |
| First-person biography | P2: await supplied biographical facts; do not invent them. |
| Ask filename on Save bricks | P1: named PNG layout saving with Cancel. |
| Background color choice | Decided: no choice. One fixed midnight-blue field (`#1e4b8f`) behind the cool-white pixels; the user setting was removed. |
| Two castle pictures in Downloads | P2: inspect the intended images and permission/provenance when implementing; not needed for the first-play fix. |
| Shared-screen play effort | Separate exploration after solo onboarding; define local/shared versus online before estimating. |
| Optional sound | P2: off by default, explicit sound toggle; separate design/implementation task. |
| Completed PNG save/picture import | Retain; improve access and explain layout versus session. Do not rebuild it. |
| Completed prebuilt picker | Retain bridge/empty presets; use them in the quick start. |
| Completed RGB import preview | Retain as an advanced feature with current Cancel semantics. |

Add missing tasks: root file-list cleanup; direct README-to-Castles navigation;
help without reset; safe clearing/replacement; mobile controls without covering
the field; consistent pointer/keyboard status; correct secondary README;
keyboard/focus/accessibility checks; production and local route verification.

## Delivery order and acceptance

1. **Entry and discovery.** Review tracked root files, relocate supporting docs,
   simplify both READMEs, and link directly to the compact Castles start page.
   Verify every moved link and workspace/config reference. No installation
   commands precede the primary online play link. README → start → player takes
   two link activations, with short instructions before launch.
2. **First play.** Implement the compact player, docked controls, optional bridge
   start, clear construction/shot feedback, and help preserving the scene.
   At both target viewports the start-page Play button is visible immediately;
   player arrival shows the full field and main phase action. Pause is reachable
   without scrolling inside a panel. Expanded controls do not cover the field.
3. **Continuity.** Add safer replacement, named saves, and predictable implementation
   switching. A help round trip preserves exact field bytes and game state;
   Cancel on replacement/name prompts changes nothing. Switching behavior is
   explicit and tested. PNG save/load reproduces a supported test layout.
4. **Identity and optional features.** Artwork, supplied biography, share previews,
   additional patterns, and sound follow the core flow.

Use task-based browser tests rather than visibility assertions alone: start from
the README destination, launch both start choices, create a supported tower,
reject a floating block with useful feedback, erase from the top, bombard, change
the next shot, pause/resume, edit the survivors, open/close Help without loss,
save, cancel replacement, switch implementations, and return via browser Back.
Check keyboard-only traversal, focus restoration, labeled controls, and restrained
live-region updates. Test actual original input separately from browser-only tools.

Have someone unfamiliar with the project attempt the first-play journey without
verbal coaching. Target a meaningful first bombardment within a minute; record
hesitations rather than treating automated timings as evidence of usability.
Validate phone portrait/landscape and desktop, then physical touch and additional
browsers before claiming their support.

Run the project's required integrity/unit tests, typecheck/build, and browser
checks for implementation changes. Keep historical bytes and parity evidence
intact. Do not edit frozen web v1. Release an adopted experience as the next web
version after source review and the established freeze/verification workflow.
Publishing remains a separate action.

## Separate local-development finding

Ordinary navigation in the Vite dev server, without `?development=1`, repeatedly
appended `experiences/castles/v1/` and failed to reach instructions. Editable
routes with `?development=1` worked. The production preview correctly opened
`/experiences/castles/v1/#/program/castles/typescript`.

Investigate Vite's handling of frozen snapshot HTML and define a supported local
default route. Add a dev-server routing check if ordinary `npm run dev` is meant
to work without an extra query parameter. This is a local-development problem,
not evidence that the live website has the same redirect loop.

## Implementation references

- [README](../README.md) and [Castles README](../programs/castles/README.md)
- [Current TODO](TODO.md)
- [Navigation and page layout](../app/site/main.js)
- [Instructions and historical controls](../app/site/programs/castles.js)
- [Player controls and lifecycle](../programs/castles/typescript/player.ts)
- [Floating palette](../programs/castles/typescript/palette.ts)
- [Game rules](../programs/castles/typescript/engine.ts)
- [Styles](../app/site/style.css), [HTML metadata](../app/index.html)
- [Web-release preservation workflow](WEB-VERSIONS.md)
- [Live collection](https://carlkcarlk.github.io/code-circa-1980/)
- [GitHub entry](https://github.com/CarlKCarlK/code-circa-1980)
