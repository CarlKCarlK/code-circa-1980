//! CISAB v14 as a UCI engine, for rating matches (see ../README.md).
//!
//! Each `go` replays the game from the start through the Rust port, exactly as an
//! operator would have typed it, then answers with CISAB's reply. CISAB's moves are
//! not checked or corrected: an illegal one is sent as is (one that leaves the
//! board is sent as 0000), so the match program records it as an illegal move.
//! A BASIC error that would stop the original ends this process, which the match
//! program records as a crash. When CISAB would think forever (it is checkmated
//! in its own eyes), no move is sent, and the clock runs out.
//! With CISAB_LOG set to a file, each illegal move and crash is appended to it with
//! the reason, for summarize.py.

use cisab_chess::engine::End;
use cisab_chess::rules::Square;
use cisab_chess::Game;
use std::io::{self, BufRead, Write};

/// CISAB's squares to and from UCI squares. CISAB's own pieces start in row 8.
fn to_uci((r, c): Square, cisab_white: bool) -> Option<String> {
    if !(1..=8).contains(&r) || !(1..=8).contains(&c) {
        return None;
    }
    let (file, rank) = if cisab_white { (c - 1, 9 - r) } else { (8 - c, r) };
    Some(format!("{}{}", (b'a' + file as u8) as char, rank))
}

fn from_uci(s: &str, cisab_white: bool) -> Square {
    let b = s.as_bytes();
    let (file, rank) = ((b[0] - b'a') as i16, (b[1] - b'0') as i16);
    if cisab_white { (9 - rank, file + 1) } else { (rank, 8 - file) }
}

enum Answer {
    /// A move, and why it is illegal if it is.
    Move(String, Option<&'static str>),
    Crash(String),
    Silent,
}

fn reply_text(from: Square, to: Square, promotes: bool, cisab_white: bool) -> String {
    match (to_uci(from, cisab_white), to_uci(to, cisab_white)) {
        (Some(f), Some(t)) => format!("{f}{t}{}", if promotes { "q" } else { "" }),
        _ => "0000".into(),
    }
}

fn ended(game: &Game) -> Option<Answer> {
    match game.end()? {
        End::ThinksForever => Some(Answer::Silent),
        End::Error { code, line } => Some(Answer::Crash(format!("?{code} Error in {line}"))),
        End::Stalemate => Some(Answer::Move("0000".into(), Some("no move: i CAN'T MOVE.  STALEMATE"))),
        End::TheyWin => Some(Answer::Crash("DARN THEY BEAT YOU!".into())),
    }
}

/// Replays the game from the start and returns CISAB's answer to the last move.
fn answer(moves: &[String], opening: bool) -> Answer {
    let cisab_white = moves.len() % 2 == 0;
    let mut game = Game::new(!cisab_white);
    let mut last = None;
    if cisab_white {
        if let Some(a) = ended(&game) {
            return a;
        }
        last = game.take_first_reply().map(|(f, t)| (reply_text(f, t, false, true), None));
    }
    for (i, m) in moves.iter().enumerate() {
        let theirs = (i % 2 == 0) != cisab_white;
        if !theirs {
            // A move of CISAB's from earlier in the game: it should be the one it made.
            if last.as_ref().map(|(text, _)| text.as_str()) != Some(m.as_str()) {
                return Answer::Crash(format!("replay mismatch at ply {}: {m} vs {last:?}", i + 1));
            }
            continue;
        }
        let promote = match m.as_bytes().get(4) {
            Some(b'q') => 2,
            Some(b'r') => 5,
            Some(b'b') => 3,
            Some(b'n') => 4,
            _ => 0,
        };
        let iq = !opening;
        match game.make_move(from_uci(&m[0..2], cisab_white), from_uci(&m[2..4], cisab_white), promote, iq) {
            Ok((reply, _)) => {
                if let Some(a) = ended(&game) {
                    return a;
                }
                last = reply.map(|r| (reply_text(r.from, r.to, r.promotes, cisab_white), r.illegal));
            }
            Err(e) => return Answer::Crash(format!("site rules rejected {m}: {e}")),
        }
    }
    last.map(|(text, why)| Answer::Move(text, why)).unwrap_or(Answer::Crash("no reply".into()))
}

fn log(line: &str) {
    if let Ok(path) = std::env::var("CISAB_LOG") {
        if let Ok(mut f) = std::fs::OpenOptions::new().create(true).append(true).open(path) {
            writeln!(f, "{line}").ok();
        }
    }
}

fn main() {
    let stdin = io::stdin();
    let mut out = io::stdout();
    let mut moves: Vec<String> = Vec::new();
    let mut opening = true;
    for line in stdin.lock().lines() {
        let line = line.unwrap_or_default();
        let words: Vec<&str> = line.split_whitespace().collect();
        match words.first().copied() {
            Some("uci") => {
                writeln!(out, "id name CISAB v14 (Rust port)\nid author Carl Kadie\noption name Opening type check default true\nuciok").ok();
            }
            Some("isready") => {
                writeln!(out, "readyok").ok();
            }
            Some("setoption") => {
                if line.contains("name Opening") {
                    opening = !line.ends_with("false");
                }
            }
            Some("ucinewgame") => moves.clear(),
            Some("position") => {
                if words.get(1) != Some(&"startpos") {
                    writeln!(out, "info string CISAB only plays from the starting position").ok();
                }
                moves = words.iter().skip_while(|w| **w != "moves").skip(1).map(|w| w.to_string()).collect();
            }
            Some("go") => match answer(&moves, opening) {
                Answer::Move(m, why) => {
                    if let Some(why) = why {
                        log(&format!("illegal\t{}\t{m}\t{why}", moves.len() + 1));
                    }
                    writeln!(out, "bestmove {m}").ok();
                }
                Answer::Crash(why) => {
                    log(&format!("crash\t{}\t-\t{why}", moves.len() + 1));
                    writeln!(out, "info string {why}").ok();
                    out.flush().ok();
                    std::process::exit(1);
                }
                Answer::Silent => {
                    log(&format!("forever\t{}\t-\tevery move loses its king", moves.len() + 1));
                    writeln!(out, "info string CISAB is thinking forever: every move it can find loses its king").ok();
                }
            },
            Some("quit") => break,
            _ => {}
        }
        out.flush().ok();
    }
}
