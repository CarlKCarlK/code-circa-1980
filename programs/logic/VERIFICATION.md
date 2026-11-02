# Verification

The selected original is tape15b save 18 (v05); four earlier complete saves are
source only. Archive hashes, exact BASIC structure and listing conversion, and
every canonical tagged blob were checked. No historical bytes were corrected.

The browser check creates a switch and a light, wires 1,1 to 2,1, sets the switch
YES, evaluates and observes LIGHT I YES, then changes it to NO and observes
LIGHT I NO. It also exercises Help commands, pause/resume, and restart. More
complex gates, cycles, truth tables, and the historical PLUG/UNWIRE paths are
not exhaustively tested; some original input paths remain error-prone.

The answer form sends real keyboard text plus Enter. It waits for the keyboard
queue to drain before accepting another entry, so focusing the form cannot
clear the tail of the preceding answer. It does not change RAM or BASIC logic.
The artwork is captured from the actual successful circuit evaluation.

From app/:
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5187 npm run test:browser -- tests/browser/experiments.spec.js -g 'logic simulator'`.
`CAPTURE_GALLERY_ART=1` explicitly refreshes artwork; ordinary tests leave it
unchanged. Final results are in ../../docs/four-more-programs.md.
