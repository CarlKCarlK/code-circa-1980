//! CISAB v14 (CISAB V9, tape13b save 8), statement for statement where it matters,
//! with the corrections the site plays (programs/chess/corrected/): pawns promote
//! on the last row (lines 110 and 1300) and step two squares only from their
//! first row (line 335); move lists hold 300 entries (line 14); and the opening
//! plays only moves that fit the board (lines 9500-9540).
//!
//! The struct holds the BASIC program's variables; methods are named after the
//! line numbers they follow. It answers the same typed lines the original reads
//! with INPUT, so the two can be run side by side. Display-only statements
//! (PRINT@, the move animation) become events. Errors BASIC would stop with,
//! such as ?BS Error in 3500 when a move list passes 120 entries, end the game
//! the same way. See PARITY.md.

use crate::mbf::{self, Rnd};

/// V(0)-V(6), line 65: empty, king, queen, bishop, knight, rook, pawn.
pub const V: [f64; 7] = [0.5, 100.0, 9.0, 3.0, 3.0, 5.0, 1.0];
pub const ADJECTIVES: [&str; 10] = [
    "FOOLISH", "DESPERATE", "IRREDEEMABLE", "LUDICROUS", "SERIOCOMIC",
    "DROLL", "RIDICULOUS", "WHIMSICAL", "PREPOSTEROUS", "ABSURD",
];
/// .91 (line 3005) and 1E-30 (line 9000) as Level II parses them.
pub const POINT_91: [u8; 4] = [0xc3, 0xf5, 0x68, 0x80];
pub const TINY: [u8; 4] = [0x60, 0x42, 0x22, 0x1d];
/// PM=300 in line 14 sizes the move arrays: subscripts 0-300 (120 in the recovered v14).
const DIM: usize = 300;

/// Steps along one direction: FOR M=1 TO 12 STEP .5 with RN=INT(COS(A)*M+.5)+R and
/// CN=INT(.5+SIN(A)*M)+C (line 430). A is a multiple of 45°, so exact cosines give
/// the ROM's answers; tests compare this table with the emulator's.
pub fn slide_steps(a_eighths: u32) -> Vec<(i16, i16)> {
    let (c, s) = match a_eighths % 8 {
        0 => (1.0, 0.0),
        1 => (std::f64::consts::FRAC_1_SQRT_2, std::f64::consts::FRAC_1_SQRT_2),
        2 => (0.0, 1.0),
        3 => (-std::f64::consts::FRAC_1_SQRT_2, std::f64::consts::FRAC_1_SQRT_2),
        4 => (-1.0, 0.0),
        5 => (-std::f64::consts::FRAC_1_SQRT_2, -std::f64::consts::FRAC_1_SQRT_2),
        6 => (0.0, -1.0),
        _ => (std::f64::consts::FRAC_1_SQRT_2, -std::f64::consts::FRAC_1_SQRT_2),
    };
    (0..23)
        .map(|k| {
            let m = 1.0 + 0.5 * k as f64;
            ((c * m + 0.5).floor() as i16, (0.5 + s * m).floor() as i16)
        })
        .collect()
}

/// Directions of line 410's FOR A loops, in eighths of a turn.
pub fn slide_directions(piece: i8) -> &'static [u32] {
    match piece {
        5 => &[0, 2, 4, 6],
        3 => &[1, 3, 5, 7],
        2 => &[0, 1, 2, 3, 4, 5, 6, 7],
        _ => &[],
    }
}

/// Lines 560-580: A = 90°, 180°, 270°, 360°; AF = -1, 1;
/// RN = R+INT(.5+COS(A)*2+AF*SIN(A)), CN = C+INT(.5+SIN(A)*2+AF*COS(A)).
pub fn knight_steps() -> Vec<(i16, i16)> {
    let mut steps = Vec::new();
    for (c, s) in [(0.0, 1.0), (-1.0, 0.0), (0.0, -1.0), (1.0, 0.0)] {
        for af in [-1.0, 1.0] {
            steps.push((((0.5 + c * 2.0 + af * s) as f64).floor() as i16, ((0.5 + s * 2.0 + af * c) as f64).floor() as i16));
        }
    }
    steps
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Prompt {
    /// Line 70: WHAT COLOR ARE WE?
    Color,
    /// Line 80: WHAT WAS THEIR … MOVE (ROW,COLUMN,NEW ROW,COLUMN)?
    Move,
    /// Line 107: OK?
    Ok,
    /// Line 8000: GIVE R,C,V
    Add,
    Ended,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum End {
    /// Line 100: their move lands on our king.
    TheyWin,
    /// Line 1005: no moves at all.
    Stalemate,
    /// BASIC stopped with an error, such as ?BS Error in 3500.
    Error { code: &'static str, line: u16 },
    /// Every move loses its king: lines 1010-1220 repeat forever.
    ThinksForever,
}

#[derive(Clone, Debug, PartialEq)]
pub enum Event {
    Adjective(usize),
    Cheat,
    OhDarn,
    OkPrompt,
    AddPrompt,
    OurTurn,
    Keyfree,
    /// Our move, from line 9500's opening or the search.
    Moved { from: (i16, i16), to: (i16, i16), book: bool },
    /// Line 1300 turns a pawn into a queen.
    Promoted,
    Ended(End),
}

type Run<T> = Result<T, End>;
const fn bs(line: u16) -> End {
    End::Error { code: "BS", line }
}

#[derive(Clone)]
pub struct Cisab {
    /// B(0-10, 0-10). Our pieces are negative. Rows 1-8 show on the screen.
    pub b: [[i8; 11]; 11],
    j: [[bool; 11]; 11],
    pub rnd: Rnd,
    rn: [i16; DIM + 1],
    cn: [i16; DIM + 1],
    ro: [i16; DIM + 1],
    co: [i16; DIM + 1],
    d: [f64; DIM + 1],
    rp: [i16; DIM + 1],
    pm: usize,
    qq: f64,
    va: f64,
    ba: f64,
    kd: bool,
    fv: bool,
    cv: i16,
    rv: i16,
    sw: bool,
    qt: bool,
    /// S$="YES": the four-move opening is still on.
    pub opening: bool,
    pub we_are_white: bool,
    pub prompt: Prompt,
    /// RO, CO, RN, CN as typed at line 80.
    typed: (i16, i16, i16, i16),
    pub adjective: usize,
    pub end: Option<End>,
    pub last_move: Option<((i16, i16), (i16, i16))>,
    pub events: Vec<Event>,
    steps: Vec<Vec<(i16, i16)>>,
    knight: Vec<(i16, i16)>,
    tiny: f64,
    point_91: f64,
}

impl Default for Cisab {
    fn default() -> Self {
        Self::new()
    }
}

impl Cisab {
    /// Lines 14-70: the board and tables, waiting at WHAT COLOR ARE WE.
    pub fn new() -> Self {
        let mut b = [[0i8; 11]; 11];
        let back = [5, 4, 3, 2, 1, 3, 4, 5];
        for c in 1..=8 {
            b[1][c] = back[c - 1];
            b[2][c] = 6;
            b[8][c] = -back[c - 1];
            b[7][c] = -6;
        }
        Cisab {
            b,
            j: [[false; 11]; 11],
            rnd: Rnd { seed: 0 },
            rn: [0; DIM + 1],
            cn: [0; DIM + 1],
            ro: [0; DIM + 1],
            co: [0; DIM + 1],
            d: [0.0; DIM + 1],
            rp: [0; DIM + 1],
            pm: DIM,
            qq: 1.0,
            va: 0.5,
            ba: 0.0,
            kd: false,
            fv: false,
            cv: 0,
            rv: 0,
            sw: false,
            qt: false,
            opening: true,
            we_are_white: false,
            prompt: Prompt::Color,
            typed: (0, 0, 0, 0),
            adjective: 0,
            end: None,
            last_move: None,
            events: Vec::new(),
            steps: (0..8).map(slide_steps).collect(),
            knight: knight_steps(),
            tiny: mbf::from_bytes(TINY),
            point_91: mbf::from_bytes(POINT_91),
        }
    }

    /// Answers the current prompt with one line, as typed at INPUT.
    /// Returns the events up to the next prompt. Malformed numbers are rejected
    /// before anything changes (the original would print ?REDO).
    pub fn input(&mut self, line: &str) -> Result<Vec<Event>, String> {
        self.events.clear();
        let result = match self.prompt {
            Prompt::Color => {
                self.line70(line.trim_start());
                Ok(())
            }
            Prompt::Move => {
                let n = numbers(line, 4)?;
                self.typed = (n[0], n[1], n[2], n[3]);
                self.line90()
            }
            Prompt::Ok => {
                self.line107(line.trim_start());
                Ok(())
            }
            Prompt::Add => {
                let n = numbers(line, 3)?;
                if !(-6..=6).contains(&n[2]) {
                    return Err("V must be a piece from -6 to 6".into());
                }
                self.line8000(n[0], n[1], n[2] as i8);
                Ok(())
            }
            Prompt::Ended => return Err("The program has ended".into()),
        };
        if let Err(end) = result {
            self.stop(end);
        }
        Ok(std::mem::take(&mut self.events))
    }

    fn stop(&mut self, end: End) {
        self.events.push(Event::Ended(end.clone()));
        self.end = Some(end);
        self.prompt = Prompt::Ended;
    }

    /// Level II stops with ?FC for a negative subscript and ?BS for one past the DIM.
    fn get(&self, r: i16, c: i16, line: u16) -> Run<i8> {
        if r < 0 || c < 0 {
            Err(End::Error { code: "FC", line })
        } else if r > 10 || c > 10 {
            Err(bs(line))
        } else {
            Ok(self.b[r as usize][c as usize])
        }
    }

    fn set(&mut self, r: i16, c: i16, v: i8, line: u16) -> Run<()> {
        self.get(r, c, line)?;
        self.b[r as usize][c as usize] = v;
        Ok(())
    }

    fn line70(&mut self, answer: &str) {
        if answer.starts_with('W') {
            self.we_are_white = true;
            if let Err(end) = self.line200() {
                self.stop(end);
            }
        } else {
            // Line 71: seen from Black's side, the kings and queens trade columns.
            self.b[8].swap(4, 5);
            self.b[1].swap(4, 5);
            if let Err(end) = self.line80() {
                self.stop(end);
            }
        }
    }

    fn line80(&mut self) -> Run<()> {
        self.ba = 100.0;
        self.kd = false;
        let a = self.rnd.int(10);
        if a > 10 {
            return Err(bs(80));
        }
        self.adjective = a as usize;
        self.events.push(Event::Adjective(self.adjective));
        self.prompt = Prompt::Move;
        Ok(())
    }

    fn line90(&mut self) -> Run<()> {
        let (ro, co, rn, cn) = self.typed;
        if self.get(ro, co, 90)? <= 0 {
            self.events.push(Event::Cheat);
            return self.line80();
        }
        let target = self.get(rn, cn, 100)?;
        if target == -1 {
            return Err(End::TheyWin);
        }
        if target != 0 {
            self.events.push(Event::OhDarn);
        }
        self.events.push(Event::OkPrompt);
        self.prompt = Prompt::Ok;
        Ok(())
    }

    fn line107(&mut self, answer: &str) {
        let result = if answer == "ADD" {
            self.line110().map(|_| {
                self.events.push(Event::AddPrompt);
                self.prompt = Prompt::Add;
            })
        } else if answer.starts_with("IQ") {
            self.opening = false;
            self.line110().and_then(|_| self.line200())
        } else if answer != "OK" {
            self.line80()
        } else {
            self.line110().and_then(|_| self.line200())
        };
        if let Err(end) = result {
            self.stop(end);
        }
    }

    /// Makes their move; a pawn reaching row 8 becomes a queen. Line 111 then sets
    /// RN, CN, RO and CO to 0, so a second ADD moves B(0,0).
    fn line110(&mut self) -> Run<()> {
        let (ro, co, rn, cn) = self.typed;
        let piece = self.get(ro, co, 110)?;
        self.set(rn, cn, piece, 110)?;
        self.set(ro, co, 0, 110)?;
        if piece.abs() == 6 && rn == 8 {
            self.set(rn, cn, piece.signum() * 2, 110)?;
        }
        self.typed = (0, 0, 0, 0);
        Ok(())
    }

    fn line8000(&mut self, r: i16, c: i16, v: i8) {
        match self.set(r, c, v, 8000) {
            Ok(()) => {
                self.events.push(Event::OkPrompt);
                self.prompt = Prompt::Ok;
            }
            Err(end) => self.stop(end),
        }
    }

    /// NOW IT IS OUR TURN: the opening, or the search.
    fn line200(&mut self) -> Run<()> {
        self.events.push(Event::OurTurn);
        let opening = if self.opening { self.line9500() } else { None };
        let book = opening.is_some();
        let (from, to) = match opening {
            Some(m) => m,
            None => self.search()?,
        };
        self.last_move = Some((from, to));
        self.events.push(Event::Moved { from, to, book });
        self.line80()
    }
}

// The opening (lines 9500-9530) and the search (lines 210-2050, 3000-4020).
impl Cisab {
    /// Each opening move needs its own piece at home, a clear path, and a square
    /// without one of its own pieces. When none can be played, line 9540 ends the
    /// opening and CISAB thinks.
    fn line9500(&mut self) -> Option<((i16, i16), (i16, i16))> {
        let b = |r: usize, c: usize| self.b[r][c];
        let moves = [
            ((8, 2), (6, 3), b(8, 2) == -4 && b(6, 3) >= 0),
            ((8, 7), (6, 6), b(8, 7) == -4 && b(6, 6) >= 0),
            ((7, 5), (5, 5), b(7, 5) == -6 && b(6, 5) == 0 && b(5, 5) == 0),
            ((8, 6), (5, 3), b(8, 6) == -3 && b(7, 5) == 0 && b(6, 4) == 0 && b(5, 3) >= 0),
        ];
        for (k, (from, to, ok)) in moves.into_iter().enumerate() {
            if ok {
                self.b[to.0][to.1] = self.b[from.0][from.1];
                self.b[from.0][from.1] = 0;
                if k == 3 {
                    self.opening = false;
                }
                return Some(((from.0 as i16, from.1 as i16), (to.0 as i16, to.1 as i16)));
            }
        }
        self.opening = false;
        None
    }

    fn flip(&mut self) {
        for r in 1..=8 {
            for c in 1..=8 {
                self.b[r][c] = -self.b[r][c];
            }
        }
    }

    /// Line 2000: the other side's view, with the attack map cleared.
    fn line2000(&mut self) {
        self.sw = true;
        self.flip();
        self.j = [[false; 11]; 11];
        if !self.qt {
            self.pm = 0;
        }
    }

    /// Line 2020: back to our view.
    fn line2020(&mut self) {
        self.cv = 9;
        self.rv = 9;
        self.fv = false;
        self.sw = false;
        self.flip();
    }

    fn search(&mut self) -> Run<((i16, i16), (i16, i16))> {
        // Line 210: GOSUB 2000 (which never returns), their moves, then 2030's attack map.
        self.line2000();
        self.line280()?;
        self.line2020();
        for m in 1..=self.pm {
            let (r, c) = (self.rn[m] as usize, self.cn[m] as usize);
            self.j[r][c] = true;
            let t = self.b[r][c];
            if (!self.fv && t < 0) || (t > self.b[self.rv as usize][self.cv as usize] && self.fv && t < 0) {
                self.fv = true;
                self.cv = c as i16;
                self.rv = r as i16;
            }
        }
        // Line 279: our moves.
        self.pm = 0;
        self.line280()?;
        if self.pm == 0 {
            return Err(End::Stalemate);
        }
        loop {
            // Lines 1010-1040: the moves with the best |score|.
            let mut count = 0usize;
            self.rp[1] = 0;
            for i in 1..=self.pm {
                let best = self.d[self.rp[1] as usize].abs();
                if self.d[i].abs() > best || i == 1 {
                    count = 0;
                }
                if self.d[i].abs() >= best || i == 1 {
                    count += 1;
                    self.rp[count] = i as i16;
                }
            }
            // Line 1050: shuffle them.
            for j in 1..=count {
                let q = self.rnd.int(count as i32);
                if q as usize > DIM {
                    return Err(bs(1050));
                }
                self.rp.swap(j, q as usize);
            }
            // Lines 1060-1210: try each and look at their best capture in reply.
            for j in 1..=count {
                let h = self.rp[j] as usize;
                let (r7, c7, r8, c8) = (self.ro[h], self.co[h], self.rn[h], self.cn[h]);
                let oc = self.get(r8, c8, 1070)?;
                let nc = self.get(r7, c7, 1070)?;
                self.set(r8, c8, nc, 1070)?;
                self.set(r7, c7, 0, 1070)?;
                if self.d[h] < 0.0 && self.ba != 100.0 {
                    self.set(r8, c8, oc, 1082)?;
                    self.set(r7, c7, nc, 1082)?;
                    return self.line1400();
                }
                self.va = 0.5;
                self.qt = true;
                self.line2000();
                self.line280()?;
                self.line2020();
                if self.ba > self.va {
                    self.ba = self.va;
                }
                self.qt = false;
                self.set(r7, c7, nc, 1205)?;
                self.set(r8, c8, oc, 1205)?;
                if self.va == 0.5 {
                    return self.line1300(r7, c7, r8, c8);
                }
                self.d[h] = mbf::div(-self.d[h].abs(), self.va);
                if self.va == 100.0 {
                    self.d[h] = -self.tiny;
                }
                if self.ba != 100.0 {
                    self.events.push(Event::Keyfree);
                }
                self.va = 0.5;
            }
            // Line 1220 goes back to 1010. If every move loses the king, nothing changes.
            if self.ba == 100.0 && (1..=self.pm).all(|i| self.d[i] == -self.tiny) {
                return Err(End::ThinksForever);
            }
        }
    }

    /// Line 1400: the move with the lowest score.
    fn line1400(&mut self) -> Run<((i16, i16), (i16, i16))> {
        let mut zz = 30000.0;
        let mut rx = 0;
        for i in 1..=self.pm {
            if self.d[i] < zz {
                zz = self.d[i];
                rx = i;
            }
        }
        self.line1300(self.ro[rx], self.co[rx], self.rn[rx], self.cn[rx])
    }

    /// Lines 1300-1320: a pawn moving to row 1 becomes a queen.
    fn line1300(&mut self, r7: i16, c7: i16, r8: i16, c8: i16) -> Run<((i16, i16), (i16, i16))> {
        if self.get(r7, c7, 1300)? == -6 && r8 == 1 {
            self.set(r7, c7, -2, 1300)?;
            self.events.push(Event::Promoted);
        }
        let piece = self.get(r7, c7, 1320)?;
        self.set(r8, c8, piece, 1320)?;
        self.set(r7, c7, 0, 1320)?;
        Ok(((r7, c7), (r8, c8)))
    }

    /// Lines 280-1000: every move of the side whose pieces are negative.
    fn line280(&mut self) -> Run<()> {
        for r in 1..=8i16 {
            for c in 1..=8i16 {
                let p = self.b[r as usize][c as usize];
                if p >= 0 {
                    continue;
                }
                match -p {
                    6 => self.pawn(r, c)?,
                    5 | 3 | 2 => self.slide(r, c, -p)?,
                    4 => {
                        for k in 0..self.knight.len() {
                            let (dr, dc) = self.knight[k];
                            let (rn, cn) = (r + dr, c + dc);
                            let inside = rn >= 1 && cn >= 1 && rn <= 8 && cn <= 8;
                            if inside && (self.get(rn.abs(), cn.abs(), 590)? >= 0 || self.sw) {
                                self.line3000(r, c, rn, cn)?;
                            }
                        }
                    }
                    1 => {
                        if !self.sw && self.fv && self.cv == c && self.rv == r {
                            self.kd = true;
                        }
                        for cn in c - 1..=c + 1 {
                            for rn in r - 1..=r + 1 {
                                if (cn == c && rn == r) || cn < 1 || rn < 1 || cn > 8 || rn > 8 {
                                    continue;
                                }
                                if self.b[rn as usize][cn as usize] < 0 && !self.sw {
                                    continue;
                                }
                                self.line3000(r, c, rn, cn)?;
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
        Ok(())
    }

    /// Lines 300-340 and 4000-4010. Our pawns go up the screen and step two squares
    /// from row 7; theirs only count their diagonal captures.
    fn pawn(&mut self, r: i16, c: i16) -> Run<()> {
        if self.sw {
            if c + 1 <= 8 && self.get(r + 1, c + 1, 4000)? >= 0 {
                self.line3000(r, c, r + 1, c + 1)?;
            }
            if self.get(r + 1, c - 1, 4010)? >= 0 && c - 1 >= 1 {
                self.line3000(r, c, r + 1, c - 1)?;
            }
            return Ok(());
        }
        if self.get(r - 1, c - 1, 310)? > 0 && c - 1 >= 1 {
            self.line3000(r, c, r - 1, c - 1)?;
            if r - 1 == 1 {
                self.qq = 9.0;
                self.line3000(r, c, r - 1, c - 1)?;
            }
        }
        if self.get(r - 1, c + 1, 320)? > 0 && c + 1 <= 8 {
            self.line3000(r, c, r - 1, c + 1)?;
            if r == 2 {
                self.qq = 9.0;
                self.line3000(r, c, r - 1, c + 1)?;
            }
        }
        if self.get(r - 1, c, 330)? == 0 {
            self.line3000(r, c, r - 1, c)?;
            if r == 2 {
                self.qq = 9.0;
                self.line3000(r, c, r - 1, c)?;
            }
        }
        // BASIC evaluates every operand: from row 1, B(R-2,C) is B(-1,C), ?FC Error in 335.
        let (two, one) = (self.get(r - 2, c, 335)?, self.get(r - 1, c, 335)?);
        if r == 7 && two == 0 && one == 0 {
            self.line3000(r, c, r - 2, c)?;
        }
        Ok(())
    }

    /// Lines 410-500: bishops, rooks and queens.
    fn slide(&mut self, r: i16, c: i16, piece: i8) -> Run<()> {
        for &a in slide_directions(piece) {
            for k in 0..23 {
                let (dr, dc) = self.steps[a as usize][k];
                let (rn, cn) = (r + dr, c + dc);
                if rn < 1 || cn < 1 || cn > 8 || rn > 8 {
                    break;
                }
                let t = self.b[rn as usize][cn as usize];
                if t > 0 {
                    self.line3000(r, c, rn, cn)?;
                    break;
                }
                if t == 0 {
                    self.line3000(r, c, rn, cn)?;
                } else if !self.sw {
                    break;
                } else {
                    self.line3000(r, c, rn, cn)?;
                    break;
                }
            }
        }
        Ok(())
    }

    fn v(&self, index: i8, line: u16) -> Run<f64> {
        V.get(index as usize).copied().filter(|_| index >= 0).ok_or(bs(line))
    }

    /// Lines 3000-3030 score one of our moves; 3500 records one of theirs, or
    /// during a trial (QT=1) the most valuable piece of ours it could take.
    fn line3000(&mut self, r: i16, c: i16, rn: i16, cn: i16) -> Run<()> {
        let target = self.b[rn as usize][cn as usize];
        if self.sw {
            if !self.qt {
                self.pm += 1;
                if self.pm > DIM {
                    return Err(bs(3500));
                }
                self.rn[self.pm] = rn;
                self.cn[self.pm] = cn;
                self.d[self.pm] = 1.0;
            } else if self.v(target.abs(), 3500)? > self.va && target >= 0 {
                self.va = self.v(target, 3500)?;
            }
            return Ok(());
        }
        let p1 = self.v(target, 3000)?;
        let attacked = self.j[rn as usize][cn as usize];
        let mut p2 = if attacked { self.v(-self.b[r as usize][c as usize], 3000)? } else { 0.5 };
        if self.kd && attacked {
            p2 = mbf::mul(p2, self.point_91);
        } else if c != self.cv || r != self.rv {
            let threatened = self.v(-self.get(self.rv, self.cv, 3010)?, 3010)?;
            p2 = mbf::add(p2, mbf::mul(threatened, if self.fv { 1.0 } else { 0.0 }));
        }
        if self.qq != 9.0 {
            self.pm += 1;
            if self.pm > DIM {
                return Err(bs(3015));
            }
            self.rn[self.pm] = rn;
            self.cn[self.pm] = cn;
            self.ro[self.pm] = r;
            self.co[self.pm] = c;
        }
        if p1 == 100.0 {
            p2 = 0.5;
        }
        self.d[self.pm] = mbf::div(mbf::mul(p1, self.qq), p2);
        self.qq = 1.0;
        Ok(())
    }
}

/// Whole numbers separated by commas, as INPUT reads them into integer variables.
fn numbers(line: &str, n: usize) -> Result<Vec<i16>, String> {
    let parts: Vec<i16> = line
        .split(',')
        .map(|p| p.trim().parse::<i16>().map_err(|_| format!("Not a whole number: {p:?}")))
        .collect::<Result<_, _>>()?;
    if parts.len() != n {
        return Err(format!("Expected {n} numbers"));
    }
    Ok(parts)
}
