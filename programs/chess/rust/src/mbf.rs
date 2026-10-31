//! The two pieces of Level II BASIC arithmetic that change CISAB's choices.
//!
//! Single precision (Microsoft Binary Format) keeps a 24-bit mantissa and, while it
//! works, one guard byte; it rounds half up on the magnitude. Ties between move
//! scores such as 9/(3*.91) and 3/.91 depend on that rounding, so scores are kept
//! as f64 values that always hold an exact MBF number, as 3-D Plot's mbf.ts does.
//! RND is the ROM's 24-bit generator (14F0h), which starts from 0 at power-up.

fn exponent(v: f64) -> i32 {
    let mut e = v.log2().floor() as i32;
    if 2f64.powi(e) > v {
        e -= 1;
    } else if 2f64.powi(e + 1) <= v {
        e += 1;
    }
    e
}

/// Truncates |v| to 32 significant bits (mantissa and guard byte), then rounds half up to 24.
pub fn round(v: f64) -> f64 {
    if v == 0.0 {
        return 0.0;
    }
    let a = v.abs();
    let e = exponent(a);
    if e < -129 {
        return 0.0;
    }
    let guard = (a / 2f64.powi(e - 31)).trunc() as u64;
    let mantissa = (guard >> 8) + ((guard >> 7) & 1);
    v.signum() * mantissa as f64 * 2f64.powi(e - 23)
}

pub fn mul(a: f64, b: f64) -> f64 {
    round(a * b)
}

pub fn div(a: f64, b: f64) -> f64 {
    round(a / b)
}

pub fn add(a: f64, b: f64) -> f64 {
    if a == 0.0 {
        return b;
    }
    if b == 0.0 {
        return a;
    }
    let (big, small) = if a.abs() >= b.abs() { (a, b) } else { (b, a) };
    // Bits of the smaller operand shifted past the guard byte are lost.
    let unit = 2f64.powi(exponent(big.abs()) - 31);
    let kept = small.signum() * (small.abs() / unit).floor() * unit;
    round(big + kept)
}

/// A constant as BASIC stores it: LSB, middle, MSB with the sign bit, exponent.
pub fn from_bytes(b: [u8; 4]) -> f64 {
    if b[3] == 0 {
        return 0.0;
    }
    let mantissa = ((b[2] as u32 | 0x80) << 16) | (b[1] as u32) << 8 | b[0] as u32;
    let sign = if b[2] & 0x80 != 0 { -1.0 } else { 1.0 };
    sign * mantissa as f64 * 2f64.powi(b[3] as i32 - 128 - 24)
}

pub fn to_bytes(v: f64) -> [u8; 4] {
    if v == 0.0 {
        return [0; 4];
    }
    let e = exponent(v.abs());
    let mantissa = (v.abs() / 2f64.powi(e - 23)) as u32;
    let sign = if v < 0.0 { 0x80 } else { 0 };
    [mantissa as u8, (mantissa >> 8) as u8, ((mantissa >> 16) as u8 & 0x7f) | sign, (e + 129) as u8]
}

/// The ROM's random-number generator. The seed lives at 40AAh-40ACh.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Rnd {
    pub seed: u32,
}

impl Rnd {
    /// RND(0) (14F0h): seed = seed × 40E64Dh + 05B065h (mod 2^24), as a fraction.
    pub fn fraction(&mut self) -> f64 {
        self.seed = (self.seed.wrapping_mul(0x40E64D).wrapping_add(0x05B065)) & 0xFF_FFFF;
        self.seed as f64 / 16_777_216.0
    }

    /// RND(n) for n ≥ 1 (14C9h): INT(n × RND(0) + 1). Rounding can, very rarely, give n + 1.
    pub fn int(&mut self, n: i32) -> i32 {
        let r = self.fraction();
        add(mul(n as f64, r), 1.0).floor() as i32
    }
}
