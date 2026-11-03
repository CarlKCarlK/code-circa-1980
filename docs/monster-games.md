# Cave and monster games

The requested three groups preserve seven complete captured saves: Jaberwocky (tape20a:3), Cave Game (tape9a:10–11), and JAB (tape16a:1–3, tape30a:1). JAB’s tape16a:5 damaged alternate retains its raw candidate and 270-byte prefix separately, without a synthetic end marker or any splice.

Each selected player runs an untouched payload through the shared original-ROM emulator. Help describes exact commands, optional acceleration, historical bugs, and restart. These are archival runs, not corrected modern rewrites. All earlier versions are source only. The site uses unshared web v1 and the existing gallery presentation.

Jaberwocky borrows Quest’s dispatcher/descriptions; its canonical history begins with an explicitly incomplete published excerpt, not an invented full original. JAB’s early maze forms borrow Hauber’s Amazing; a complete electronic book transcription starts that comparison history, with its transcription limits stated. No verified original was found for Cave Game. Published-source dates, nearby notices, and inferred ordering remain separate from unknown save dates. Program-specific history notes contain the evidence and comparison commands.

Verification: `python3 app/scripts/verify-monster-games.py /path/to/trs80`, `npm test`, `npm run build`, and `npm run test:browser` from app/. Targeted browser checks are monster-games.spec.js. Do not rerun recovery or modify the archive inventory for a website import.
