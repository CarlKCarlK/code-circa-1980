//! CISAB, in Rust.
//!
//! A port of the chess program in Carl Kadie's TRS-80 Level II BASIC listing
//! CISAB V9 (v14, tape13b save 8), as corrected for the site (programs/chess/corrected/). `engine` follows the original's move
//! generator, scores, shuffle and look-ahead with Level II's RND and rounding,
//! so for the same answers it makes the same moves, illegal ones included, and
//! stops where the original stops. `rules` checks only your moves. See PARITY.md.

pub mod engine;
pub mod mbf;
pub mod rules;
#[cfg(test)]
mod tests;

use engine::{Cisab, End, Event, Prompt, ADJECTIVES};
use rules::{HumanMove, Rights, Square};
use wasm_bindgen::prelude::wasm_bindgen;

fn json_str(s: &str) -> String {
    format!("\"{}\"", s.replace('\\', "\\\\").replace('"', "\\\""))
}
fn json_sq((r, c): Square) -> String {
    format!("[{r},{c}]")
}

pub fn end_json(end: &End) -> String {
    match end {
        End::TheyWin => r#"{"kind":"theyWin","text":"DARN THEY BEAT YOU!"}"#.into(),
        End::Stalemate => r#"{"kind":"stalemate","text":"I CAN'T MOVE.  STALEMATE"}"#.into(),
        End::ThinksForever => r#"{"kind":"forever","text":""}"#.into(),
        End::Error { code, line } => format!(r#"{{"kind":"error","text":"?{code} Error in {line}"}}"#),
    }
}

pub fn event_json(e: &Event) -> String {
    match e {
        Event::Adjective(a) => format!(r#"{{"kind":"adjective","word":{}}}"#, json_str(ADJECTIVES[a - 1])),
        Event::Cheat => r#"{"kind":"cheat"}"#.into(),
        Event::OhDarn => r#"{"kind":"ohDarn"}"#.into(),
        Event::OkPrompt => r#"{"kind":"ok"}"#.into(),
        Event::AddPrompt => r#"{"kind":"add"}"#.into(),
        Event::OurTurn => r#"{"kind":"ourTurn"}"#.into(),
        Event::Keyfree => r#"{"kind":"keyfree"}"#.into(),
        Event::Promoted => r#"{"kind":"promoted"}"#.into(),
        Event::Moved { from, to, book } => format!(r#"{{"kind":"moved","from":{},"to":{},"book":{book}}}"#, json_sq(*from), json_sq(*to)),
        Event::Ended(end) => format!(r#"{{"kind":"ended","end":{}}}"#, end_json(end)),
    }
}

fn prompt_name(p: Prompt) -> &'static str {
    match p {
        Prompt::Color => "color",
        Prompt::Move => "move",
        Prompt::Ok => "ok",
        Prompt::Add => "add",
        Prompt::Ended => "ended",
    }
}

fn board_json(b: &[[i8; 11]; 11]) -> String {
    let rows: Vec<String> = b.iter().map(|row| format!("[{}]", row.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(","))).collect();
    format!("[{}]", rows.join(","))
}

fn snapshot_json(e: &Cisab) -> String {
    format!(
        r#"{{"prompt":"{}","board":{},"seed":{},"adjective":{},"opening":{},"weAreWhite":{},"end":{}}}"#,
        prompt_name(e.prompt),
        board_json(&e.b),
        e.rnd.seed,
        e.adjective,
        e.opening,
        e.we_are_white,
        e.end.as_ref().map(end_json).unwrap_or("null".into())
    )
}

/// The original program's prompts, answered one typed line at a time.
#[wasm_bindgen]
pub struct Engine(Cisab);

#[wasm_bindgen]
impl Engine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Engine {
        Engine(Cisab::new())
    }
    /// The events up to the next prompt, as JSON; an error string for malformed input.
    pub fn input(&mut self, line: &str) -> Result<String, String> {
        let events = self.0.input(line)?;
        Ok(format!("[{}]", events.iter().map(event_json).collect::<Vec<_>>().join(",")))
    }
    pub fn snapshot(&self) -> String {
        snapshot_json(&self.0)
    }
}

impl Default for Engine {
    fn default() -> Self {
        Self::new()
    }
}

/// Why CISAB's move breaks the rules of chess, if it does. `before` is the board
/// it moved on, `after` the board it left.
pub fn illegal_reason(before: &[[i8; 11]; 11], after: &[[i8; 11]; 11], from: Square, to: Square) -> Option<&'static str> {
    let on = |(r, c): Square| (1..=8).contains(&r) && (1..=8).contains(&c);
    if !on(to) {
        return Some("moves a piece off the board");
    }
    let at = |(r, c): Square| before[r as usize][c as usize];
    if !rules::cisab_move_is_pseudo_legal(before, from, to) {
        let pawn = at(from) == -6;
        return Some(if at(to) < 0 {
            "takes its own piece"
        } else if pawn && from.1 == to.1 && at(to) != 0 {
            "moves a pawn straight onto a piece"
        } else if pawn && from.1 == to.1 && from.0 - to.0 == 2 && from.0 != 7 {
            "moves a pawn two squares after its first move"
        } else if pawn && from.1 != to.1 && at(to) == 0 {
            "moves a pawn diagonally without taking"
        } else {
            "jumps over a piece"
        });
    }
    if !rules::cisab_move_is_legal(before, from, to) {
        return Some(if rules::in_check(before, -1) { "ignores check" } else { "puts its own king in check" });
    }
    if to.0 == 1 && after[1][to.1 as usize] == -6 {
        return Some("leaves a pawn unpromoted on the last row");
    }
    None
}

/// A game on the site: your legal move becomes the lines an operator would type.
#[wasm_bindgen]
pub struct Game {
    engine: Cisab,
    rights: Rights,
    passant: Option<Square>,
    /// Every line typed into CISAB, for the transcript.
    typed: Vec<String>,
    events: Vec<String>,
}

#[wasm_bindgen]
impl Game {
    /// Starts a game. You play White or Black; CISAB answers WHAT COLOR ARE WE with the other.
    #[wasm_bindgen(constructor)]
    pub fn new(you_are_white: bool) -> Game {
        let mut g = Game { engine: Cisab::new(), rights: Rights { col1: true, col8: true }, passant: None, typed: Vec::new(), events: Vec::new() };
        g.send(if you_are_white { "BLACK" } else { "WHITE" });
        g
    }

    /// The opening move CISAB makes as White before your first move, as JSON (or null).
    pub fn first_reply(&mut self) -> String {
        self.take_first_reply().map(|(from, to)| format!(r#"{{"from":{},"to":{},"legal":true}}"#, json_sq(from), json_sq(to))).unwrap_or("null".into())
    }

    fn send(&mut self, line: &str) {
        self.typed.push(line.to_string());
        let events = self.engine.input(line).expect("the site types only well-formed answers");
        self.events.extend(events.iter().map(event_json));
    }

    /// A move from or onto a corner square ends castling with that rook.
    fn touch(&mut self, sq: Square) {
        if sq == (1, 1) {
            self.rights.col1 = false;
        } else if sq == (1, 8) {
            self.rights.col8 = false;
        }
    }

    fn after_cisab(&mut self) {
        self.passant = None;
        if let Some((from, to)) = self.engine.last_move.take() {
            self.touch(from);
            self.touch(to);
            let (r, c) = to;
            if (0..=10).contains(&r) && self.engine.b[r as usize][c as usize] == -6 && from.0 - to.0 == 2 && from.1 == c {
                self.passant = Some((r + 1, c));
            }
        }
    }

    fn legal(&self) -> Vec<HumanMove> {
        if self.engine.prompt != Prompt::Move {
            return Vec::new();
        }
        rules::legal_moves(&self.engine.b, self.rights, self.passant)
    }

    /// Plays your move (CISAB's squares), then CISAB's reply. `promote` is 2-5 for a
    /// pawn reaching row 8; `iq` answers IQ instead of OK, ending CISAB's opening.
    /// Returns the new events as JSON, or an error if the move is not legal.
    pub fn play(&mut self, fr: i16, fc: i16, tr: i16, tc: i16, promote: i8, iq: bool) -> Result<String, String> {
        let (reply, after_you) = self.make_move((fr, fc), (tr, tc), promote, iq)?;
        let reply = reply.map(|r| {
            format!(r#"{{"from":{},"to":{},"legal":{},"reason":{}}}"#, json_sq(r.from), json_sq(r.to), r.illegal.is_none(), r.illegal.map(json_str).unwrap_or("null".into()))
        });
        Ok(format!(r#"{{"events":[{}],"afterYou":{},"reply":{}}}"#, self.events.join(","), board_json(&after_you), reply.unwrap_or("null".into())))
    }

    /// Board, prompt, your legal moves and status, as JSON.
    pub fn state(&self) -> String {
        let e = &self.engine;
        let moves: Vec<String> = self
            .legal()
            .iter()
            .map(|m| format!(r#"{{"from":{},"to":{},"promotes":{},"castles":{},"passant":{}}}"#, json_sq(m.from), json_sq(m.to), m.promotes, m.rook.is_some(), m.passant.is_some()))
            .collect();
        format!(
            r#"{{"engine":{},"moves":[{}],"inCheck":{},"cisabInCheck":{},"hasKing":{},"typed":[{}]}}"#,
            snapshot_json(e),
            moves.join(","),
            rules::in_check(&e.b, 1),
            rules::in_check(&e.b, -1),
            rules::king(&e.b, 1).is_some(),
            self.typed.iter().map(|t| json_str(t)).collect::<Vec<_>>().join(",")
        )
    }
}

/// CISAB's answer to your move, and why it breaks the rules of chess if it does.
pub struct Reply {
    pub from: Square,
    pub to: Square,
    /// A pawn reaching row 1 became a queen (line 1300).
    pub promotes: bool,
    pub illegal: Option<&'static str>,
}

impl Game {
    /// Plays your move, then CISAB's reply; returns the reply and the board after your move.
    pub fn make_move(&mut self, (fr, fc): Square, (tr, tc): Square, promote: i8, iq: bool) -> Result<(Option<Reply>, rules::Board), String> {
        let m = self.legal().into_iter().find(|m| m.from == (fr, fc) && m.to == (tr, tc)).ok_or("Not a legal move")?;
        if m.promotes && !(2..=5).contains(&promote) {
            return Err("Choose a piece to promote to".into());
        }
        self.events.clear();
        let mut after_you = rules::apply(&self.engine.b, &m);
        if m.promotes {
            after_you[tr as usize][tc as usize] = promote;
        }
        let king_moved = self.engine.b[fr as usize][fc as usize] == 1;
        self.send(&format!("{fr},{fc},{tr},{tc}"));
        if self.engine.prompt == Prompt::Ok {
            let mut edits: Vec<(Square, i8)> = Vec::new();
            if let Some((from, to)) = m.rook {
                edits.push((to, 5));
                edits.push((from, 0));
            }
            if let Some(s) = m.passant {
                edits.push((s, 0));
            }
            if m.promotes {
                edits.push((m.to, promote));
            }
            for (sq, v) in edits {
                self.send("ADD");
                self.send(&format!("{},{},{v}", sq.0, sq.1));
            }
            if king_moved {
                self.rights = Rights { col1: false, col8: false };
            }
            self.touch(m.from);
            self.touch(m.to);
            self.send(if iq { "IQ" } else { "OK" });
        }
        let reply = self.engine.last_move.map(|(from, to)| Reply {
            from,
            to,
            promotes: (1..=8).contains(&from.0) && after_you[from.0 as usize][from.1 as usize] == -6 && to.0 == 1,
            illegal: illegal_reason(&after_you, &self.engine.b, from, to),
        });
        self.after_cisab();
        Ok((reply, after_you))
    }

    /// CISAB's opening move as White, made before your first move.
    pub fn take_first_reply(&mut self) -> Option<(Square, Square)> {
        let reply = self.engine.last_move;
        self.after_cisab();
        reply
    }

    /// How the program ended, if it has.
    pub fn end(&self) -> Option<&End> {
        self.engine.end.as_ref()
    }

    pub fn board(&self) -> &rules::Board {
        &self.engine.b
    }
}

/// For tests: the move steps derived from 45° angles, as JSON.
#[wasm_bindgen]
pub fn steps_json() -> String {
    let dirs = |piece: i8| {
        engine::slide_directions(piece)
            .iter()
            .map(|&a| format!("[{}]", engine::slide_steps(a).into_iter().map(json_sq).collect::<Vec<_>>().join(",")))
            .collect::<Vec<_>>()
            .join(",")
    };
    format!(
        r#"{{"rook":[{}],"bishop":[{}],"queen":[{}],"knight":[{}]}}"#,
        dirs(5),
        dirs(3),
        dirs(2),
        engine::knight_steps().into_iter().map(json_sq).collect::<Vec<_>>().join(",")
    )
}

/// For tests: every score lines 3000-3030 and 1205 can produce, as MBF bytes,
/// in the order of the BASIC program in tests/chess-rust.test.mjs.
#[wasm_bindgen]
pub fn score_table() -> Vec<u8> {
    use engine::V;
    let point_91 = mbf::from_bytes(engine::POINT_91);
    let mut out = Vec::new();
    for p1i in 0..7 {
        let p1 = V[p1i];
        for qq in [1.0, 9.0] {
            for k in 0..7 {
                for f in 0..9 {
                    let mut p2 = if k == 0 { 0.5 } else { V[k] };
                    if f == 0 {
                        p2 = mbf::mul(p2, point_91);
                    } else if f < 8 {
                        p2 = mbf::add(p2, mbf::mul(V[f - 1], 1.0));
                    }
                    if p1 == 100.0 {
                        p2 = 0.5;
                    }
                    let d = mbf::div(mbf::mul(p1, qq), p2);
                    out.extend(mbf::to_bytes(d));
                    for va in [1.0, 3.0, 5.0, 9.0, 100.0] {
                        out.extend(mbf::to_bytes(mbf::div(-d.abs(), va)));
                    }
                }
            }
        }
    }
    out
}

/// For tests: RND(N) for N = 1, 2, … 120, 1, 2, … (`count` calls), then the seed's three bytes.
#[wasm_bindgen]
pub fn rnd_sequence(count: u32) -> Vec<u8> {
    let mut rnd = mbf::Rnd { seed: 0 };
    let mut out: Vec<u8> = (1..=count).map(|i| rnd.int((i % 120) as i32 + 1) as u8).collect();
    out.extend([rnd.seed as u8, (rnd.seed >> 8) as u8, (rnd.seed >> 16) as u8]);
    out
}

/// For the parity recorder: your legal moves on a B(0-10,0-10) board (row by row),
/// as JSON. `passant` is the skipped square as row*16+column, or 0.
#[wasm_bindgen]
pub fn legal_moves_json(board: &[i8], col1: bool, col8: bool, passant: i16) -> String {
    let mut b = [[0i8; 11]; 11];
    for (i, v) in board.iter().enumerate().take(121) {
        b[i / 11][i % 11] = *v;
    }
    let p = (passant != 0).then_some((passant / 16, passant % 16));
    let moves: Vec<String> = rules::legal_moves(&b, Rights { col1, col8 }, p)
        .iter()
        .map(|m| {
            let opt = |s: Option<Square>| s.map(json_sq).unwrap_or("null".into());
            format!(
                r#"{{"from":{},"to":{},"promotes":{},"rook":{},"passant":{}}}"#,
                json_sq(m.from),
                json_sq(m.to),
                m.promotes,
                m.rook.map(|(f, t)| format!("[{},{}]", json_sq(f), json_sq(t))).unwrap_or("null".into()),
                opt(m.passant)
            )
        })
        .collect();
    format!("[{}]", moves.join(","))
}
