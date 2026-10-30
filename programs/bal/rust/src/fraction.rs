//! Exact fractions, as Chemistry Balancer II kept them: a numerator/denominator
//! pair reduced by the GCD after every operation (BASIC lines 4000–4090).
//! Intermediate products use i128; results must fit back into i64.

use crate::BalanceError;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Fraction {
    pub num: i64,
    pub den: i64,
}

pub fn gcd(a: i128, b: i128) -> i128 {
    let (mut a, mut b) = (a.abs(), b.abs());
    while b != 0 {
        (a, b) = (b, a % b);
    }
    a
}

impl Fraction {
    pub const ZERO: Fraction = Fraction { num: 0, den: 1 };
    pub const ONE: Fraction = Fraction { num: 1, den: 1 };

    pub fn from_int(n: i64) -> Self {
        Fraction { num: n, den: 1 }
    }

    /// Reduce and keep the sign in the numerator.
    fn reduce(num: i128, den: i128) -> Result<Self, BalanceError> {
        debug_assert!(den != 0);
        if num == 0 {
            return Ok(Fraction::ZERO);
        }
        let g = gcd(num, den);
        let sign = if den < 0 { -1 } else { 1 };
        let (num, den) = (sign * num / g, sign * den / g);
        Ok(Fraction {
            num: i64::try_from(num).map_err(|_| BalanceError::Overflow)?,
            den: i64::try_from(den).map_err(|_| BalanceError::Overflow)?,
        })
    }

    pub fn is_zero(self) -> bool {
        self.num == 0
    }

    pub fn sub(self, other: Self) -> Result<Self, BalanceError> {
        let (a, b, c, d) = (
            self.num as i128,
            self.den as i128,
            other.num as i128,
            other.den as i128,
        );
        Self::reduce(a * d - c * b, b * d)
    }

    pub fn mul(self, other: Self) -> Result<Self, BalanceError> {
        Self::reduce(
            self.num as i128 * other.num as i128,
            self.den as i128 * other.den as i128,
        )
    }

    pub fn div(self, other: Self) -> Result<Self, BalanceError> {
        debug_assert!(!other.is_zero());
        Self::reduce(
            self.num as i128 * other.den as i128,
            self.den as i128 * other.num as i128,
        )
    }
}
