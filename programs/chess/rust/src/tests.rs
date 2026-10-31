use crate::engine::{knight_steps, slide_steps, Cisab, End, Event, Prompt};
use crate::mbf::{self, Rnd};
use crate::rules::{legal_moves, Rights};

#[test]
fn rnd_starts_like_a_fresh_trs80() {
    let mut r = Rnd { seed: 0 };
    assert_eq!(r.fraction(), 0x05B065 as f64 / 16_777_216.0); // PRINT RND(0) shows .0222228
    r.fraction();
    assert_eq!(r.int(10), 3);
}

#[test]
fn steps_match_the_emulator_recording() {
    let d = |a| slide_steps(a).into_iter().take(6).collect::<Vec<_>>();
    assert_eq!(d(0), [(1, 0), (2, 0), (2, 0), (3, 0), (3, 0), (4, 0)]);
    assert_eq!(d(4), [(-1, 0), (-1, 0), (-2, 0), (-2, 0), (-3, 0), (-3, 0)]);
    assert_eq!(d(1), [(1, 1), (1, 1), (1, 1), (2, 2), (2, 2), (2, 2)]);
    assert_eq!(knight_steps(), [(-1, 2), (1, 2), (-2, 1), (-2, -1), (1, -2), (-1, -2), (2, -1), (2, 1)]);
}

#[test]
fn mbf_bytes_round_trip() {
    for b in [[0xc3, 0xf5, 0x68, 0x80], [0x60, 0x42, 0x22, 0x1d], [0, 0, 0, 0x80], [0, 0, 0x48, 0x87]] {
        assert_eq!(mbf::to_bytes(mbf::from_bytes(b)), b);
    }
    assert_eq!(mbf::to_bytes(mbf::round(0.91)), [0xc3, 0xf5, 0x68, 0x80]);
}

#[test]
fn opening_as_white_then_a_reply() {
    let mut e = Cisab::new();
    let events = e.input("WHITE").unwrap();
    assert!(events.contains(&Event::Moved { from: (8, 2), to: (6, 3), book: true }));
    assert_eq!(e.prompt, Prompt::Move);
    e.input("2,5,4,5").unwrap();
    assert_eq!(e.prompt, Prompt::Ok);
    let events = e.input("OK").unwrap();
    assert!(events.contains(&Event::Moved { from: (8, 7), to: (6, 6), book: true }));
}

#[test]
fn iq_searches_and_cheat_asks_again() {
    let mut e = Cisab::new();
    e.input("BLACK").unwrap();
    let events = e.input("5,5,6,6").unwrap();
    assert_eq!(events[0], Event::Cheat);
    e.input("2,4,4,4").unwrap();
    let events = e.input("IQ").unwrap();
    assert!(events.iter().any(|ev| matches!(ev, Event::Moved { book: false, .. })), "{events:?}");
    assert_eq!(e.prompt, Prompt::Move);
}

#[test]
fn taking_its_king_ends_the_game() {
    let mut e = Cisab::new();
    e.input("BLACK").unwrap();
    e.input("2,4,4,4").unwrap();
    e.input("ADD").unwrap();
    e.input("7,4,2").unwrap();
    e.input("OK").unwrap();
    e.input("7,4,8,4").unwrap_or_default();
    // Line 100 checks for the king before OK?.
    let mut e = Cisab::new();
    e.input("BLACK").unwrap();
    e.input("1,4,8,4").unwrap();
    assert_eq!(e.end, Some(End::TheyWin));
}

#[test]
fn your_opening_moves() {
    let e = Cisab::new();
    let moves = legal_moves(&e.b, Rights { col1: true, col8: true }, None);
    assert_eq!(moves.len(), 20);
}

#[test]
fn cisab_legality_check() {
    let e = Cisab::new();
    assert!(crate::rules::cisab_move_is_legal(&e.b, (7, 5), (5, 5)));
    assert!(crate::rules::cisab_move_is_legal(&e.b, (8, 2), (6, 3)));
    assert!(!crate::rules::cisab_move_is_legal(&e.b, (8, 6), (5, 3)), "the bishop is blocked by its pawn");
}

#[test]
fn game_types_castling_with_add() {
    let mut g = crate::Game::new(false); // You are Black; CISAB opens with its knight.
    assert!(g.first_reply().contains("[8,2]"));
    for (fr, fc, tr, tc) in [(2, 7, 3, 7), (1, 6, 2, 7), (1, 7, 3, 6)] {
        g.play(fr, fc, tr, tc, 0, false).unwrap();
    }
    let r = g.play(1, 5, 1, 7, 0, false).unwrap();
    assert!(r.contains("\"events\""));
    let state = g.state();
    assert!(state.contains(r#""1,5,1,7","ADD","1,6,5","ADD","1,8,0","OK""#), "{state}");
}
