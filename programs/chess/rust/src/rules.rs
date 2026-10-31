//! Chess rules for your side only. CISAB never checks its opponent's moves; the
//! site does, so you play real chess while CISAB plays exactly as it did.
//! Board coordinates are CISAB's: rows 1-8 from the top of its screen, where
//! your pieces (positive) start; your pawns move toward row 8.

pub type Square = (i16, i16);

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct HumanMove {
    pub from: Square,
    pub to: Square,
    /// Castling: the rook's move, made with ADD.
    pub rook: Option<(Square, Square)>,
    /// En passant: the pawn taken, removed with ADD.
    pub passant: Option<Square>,
    /// A pawn reaching row 8, replaced with ADD.
    pub promotes: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Rights {
    /// The king and the rook in column 1 or 8 have not moved.
    pub col1: bool,
    pub col8: bool,
}

pub type Board = [[i8; 11]; 11];

const ROOK: [Square; 4] = [(1, 0), (-1, 0), (0, 1), (0, -1)];
const BISHOP: [Square; 4] = [(1, 1), (1, -1), (-1, 1), (-1, -1)];
const KNIGHT: [Square; 8] = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)];

fn on_board((r, c): Square) -> bool {
    (1..=8).contains(&r) && (1..=8).contains(&c)
}

fn at(b: &Board, (r, c): Square) -> i8 {
    b[r as usize][c as usize]
}

/// Whether a piece of `side` (1 yours, -1 CISAB's) attacks the square.
pub fn attacked(b: &Board, sq: Square, side: i8) -> bool {
    let is = |s: Square, piece: i8| on_board(s) && at(b, s) == side * piece;
    // A pawn of yours attacks toward row 8, one of CISAB's toward row 1.
    let back = -(side as i16);
    if is((sq.0 + back, sq.1 - 1), 6) || is((sq.0 + back, sq.1 + 1), 6) {
        return true;
    }
    if KNIGHT.iter().any(|&(dr, dc)| is((sq.0 + dr, sq.1 + dc), 4)) {
        return true;
    }
    for dr in -1..=1 {
        for dc in -1..=1 {
            if (dr, dc) != (0, 0) && is((sq.0 + dr, sq.1 + dc), 1) {
                return true;
            }
        }
    }
    for (dirs, piece) in [(ROOK, 5), (BISHOP, 3)] {
        for (dr, dc) in dirs {
            let mut s = (sq.0 + dr, sq.1 + dc);
            while on_board(s) {
                let p = at(b, s);
                if p == side * piece || p == side * 2 {
                    return true;
                }
                if p != 0 {
                    break;
                }
                s = (s.0 + dr, s.1 + dc);
            }
        }
    }
    false
}

pub fn king(b: &Board, side: i8) -> Option<Square> {
    (1..=8).flat_map(|r| (1..=8).map(move |c| (r, c))).find(|&s| at(b, s) == side)
}

pub fn in_check(b: &Board, side: i8) -> bool {
    king(b, side).is_some_and(|k| attacked(b, k, -side))
}

pub fn apply(b: &Board, m: &HumanMove) -> Board {
    let mut n = *b;
    n[m.to.0 as usize][m.to.1 as usize] = at(b, m.from);
    n[m.from.0 as usize][m.from.1 as usize] = 0;
    if let Some((from, to)) = m.rook {
        n[to.0 as usize][to.1 as usize] = 5;
        n[from.0 as usize][from.1 as usize] = 0;
    }
    if let Some(s) = m.passant {
        n[s.0 as usize][s.1 as usize] = 0;
    }
    n
}

/// Your legal moves. `passant` is the square a CISAB pawn just skipped, if any.
pub fn legal_moves(b: &Board, rights: Rights, passant: Option<Square>) -> Vec<HumanMove> {
    let mut moves = Vec::new();
    let plain = |from: Square, to: Square| HumanMove { from, to, rook: None, passant: None, promotes: false };
    for r in 1..=8 {
        for c in 1..=8 {
            let from = (r, c);
            let p = at(b, from);
            if p <= 0 {
                continue;
            }
            let mut targets: Vec<HumanMove> = Vec::new();
            match p {
                6 => {
                    let one = (r + 1, c);
                    if on_board(one) && at(b, one) == 0 {
                        targets.push(plain(from, one));
                        let two = (r + 2, c);
                        if r == 2 && at(b, two) == 0 {
                            targets.push(plain(from, two));
                        }
                    }
                    for dc in [-1, 1] {
                        let to = (r + 1, c + dc);
                        if !on_board(to) {
                            continue;
                        }
                        if at(b, to) < 0 {
                            targets.push(plain(from, to));
                        } else if passant == Some(to) && at(b, (r, c + dc)) == -6 {
                            targets.push(HumanMove { passant: Some((r, c + dc)), ..plain(from, to) });
                        }
                    }
                    for m in &mut targets {
                        m.promotes = m.to.0 == 8;
                    }
                }
                4 | 1 => {
                    let steps: Vec<Square> = if p == 4 { KNIGHT.to_vec() } else { ROOK.iter().chain(BISHOP.iter()).copied().collect() };
                    for (dr, dc) in steps {
                        let to = (r + dr, c + dc);
                        if on_board(to) && at(b, to) <= 0 {
                            targets.push(plain(from, to));
                        }
                    }
                    if p == 1 && r == 1 {
                        for (rook_col, ok) in [(1, rights.col1), (8, rights.col8)] {
                            let dir = if rook_col > c { 1 } else { -1 };
                            let between = |a: i16, z: i16| (a.min(z) + 1..a.max(z)).all(|x| at(b, (1, x)) == 0);
                            if ok
                                && at(b, (1, rook_col)) == 5
                                && between(c, rook_col)
                                && (c - rook_col).abs() >= 3
                                && !attacked(b, from, -1)
                                && !attacked(b, (1, c + dir), -1)
                            {
                                targets.push(HumanMove { rook: Some(((1, rook_col), (1, c + dir))), ..plain(from, (1, c + 2 * dir)) });
                            }
                        }
                    }
                }
                5 | 3 | 2 => {
                    let dirs: Vec<Square> = match p {
                        5 => ROOK.to_vec(),
                        3 => BISHOP.to_vec(),
                        _ => ROOK.iter().chain(BISHOP.iter()).copied().collect(),
                    };
                    for (dr, dc) in dirs {
                        let mut to = (r + dr, c + dc);
                        while on_board(to) && at(b, to) <= 0 {
                            targets.push(plain(from, to));
                            if at(b, to) < 0 {
                                break;
                            }
                            to = (to.0 + dr, to.1 + dc);
                        }
                    }
                }
                _ => {}
            }
            // With no king (CISAB's opening can land on it), any move is allowed.
            let has_king = king(b, 1).is_some();
            moves.extend(targets.into_iter().filter(|m| !has_king || !in_check(&apply(b, m), 1)));
        }
    }
    moves
}

/// Whether CISAB's move would be legal chess: your rules, on the board turned upside
/// down with the colors swapped. (CISAB never castles or takes en passant.)
pub fn cisab_move_is_legal(b: &Board, from: Square, to: Square) -> bool {
    if !on_board(from) || !on_board(to) {
        return false;
    }
    let mut m = [[0i8; 11]; 11];
    for r in 1..=8 {
        for c in 1..=8 {
            m[r][c] = -b[9 - r][c];
        }
    }
    let flip = |(r, c): Square| (9 - r, c);
    legal_moves(&m, Rights { col1: false, col8: false }, None).iter().any(|mv| mv.from == flip(from) && mv.to == flip(to))
}
