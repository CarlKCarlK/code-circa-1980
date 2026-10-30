//! The Chemistry Balancer II (1981, v20) solving steps:
//!
//! 1. Each element must appear on both sides ("ALCHEMY", lines 480–500, 7500).
//! 2. Drop element rows proportional to an earlier row (lines 505–570).
//! 3. Group elements that share compounds into independent sub-equations
//!    ("MIXED EQUATIONS", lines 585–850) and solve each block separately.
//! 4. Per block: fix the last compound's coefficient at 1, move its column to the
//!    right-hand side and run exact Gauss–Jordan elimination with row dropping and
//!    swapping (lines 3000–3320, 5510–5530, 11000–11030).
//! 5. Scale to whole numbers and require positive coefficients (lines 920–940).
//!
//! Control flow is restructured; the original GOTO web is not reproduced.

use crate::fraction::{gcd, Fraction};
use crate::parse::Equation;
use crate::BalanceError;

/// The original rejected coefficients above 1E16 as OVERFLOW (line 940).
const LIMIT: i64 = 10_000_000_000_000_000;

pub struct Solution {
    pub coefficients: Vec<i64>,
    /// True when the equation splits into independent sub-equations.
    pub mixed: bool,
}

pub fn solve(eq: &Equation) -> Result<Solution, BalanceError> {
    let compounds = eq.compounds.len();
    for (row, element) in eq.matrix.iter().zip(&eq.elements) {
        let positive = row.iter().any(|&n| n > 0);
        let negative = row.iter().any(|&n| n < 0);
        if !(positive && negative) {
            return Err(BalanceError::Alchemy(element.clone()));
        }
    }
    let rows = drop_proportional_rows(&eq.matrix);
    let blocks = connected_blocks(&rows, compounds);
    if blocks.iter().any(|(_, cs)| cs.is_empty())
        || blocks.iter().map(|(_, cs)| cs.len()).sum::<usize>() != compounds
    {
        return Err(BalanceError::Ambiguous);
    }
    let mut coefficients = vec![0; compounds];
    for (element_rows, block_compounds) in &blocks {
        let values = solve_block(&rows, element_rows, block_compounds)?;
        for (&c, v) in block_compounds.iter().zip(values) {
            coefficients[c] = v;
        }
    }
    Ok(Solution {
        coefficients,
        mixed: blocks.len() > 1,
    })
}

fn drop_proportional_rows(matrix: &[Vec<i64>]) -> Vec<Vec<i64>> {
    let mut kept: Vec<Vec<i64>> = Vec::new();
    'rows: for row in matrix {
        for earlier in &kept {
            let Some(pivot) = earlier.iter().position(|&n| n != 0) else {
                continue;
            };
            let proportional = row.iter().zip(earlier).all(|(&r, &e)| {
                r as i128 * earlier[pivot] as i128 == e as i128 * row[pivot] as i128
            });
            if proportional {
                continue 'rows;
            }
        }
        kept.push(row.clone());
    }
    kept
}

/// Elements connected through shared compounds, with the compounds they use.
fn connected_blocks(rows: &[Vec<i64>], compounds: usize) -> Vec<(Vec<usize>, Vec<usize>)> {
    let mut label: Vec<Option<usize>> = vec![None; rows.len()];
    let mut blocks = Vec::new();
    for start in 0..rows.len() {
        if label[start].is_some() {
            continue;
        }
        let id = blocks.len();
        label[start] = Some(id);
        let mut members = vec![start];
        let mut i = 0;
        while i < members.len() {
            let r = members[i];
            for other in 0..rows.len() {
                let shares = (0..compounds).any(|c| rows[r][c] != 0 && rows[other][c] != 0);
                if label[other].is_none() && shares {
                    label[other] = Some(id);
                    members.push(other);
                }
            }
            i += 1;
        }
        members.sort();
        let used = (0..compounds)
            .filter(|&c| members.iter().any(|&r| rows[r][c] != 0))
            .collect();
        blocks.push((members, used));
    }
    blocks
}

fn solve_block(
    rows: &[Vec<i64>],
    element_rows: &[usize],
    compounds: &[usize],
) -> Result<Vec<i64>, BalanceError> {
    let unknowns = compounds.len() - 1;
    if compounds.len() > element_rows.len() + 1 {
        return Err(BalanceError::Ambiguous);
    }
    let last = *compounds.last().unwrap();
    // Augmented rows: unknown columns, then the right-hand side (last compound = 1).
    let mut m: Vec<Vec<Fraction>> = element_rows
        .iter()
        .map(|&r| {
            let mut row: Vec<Fraction> = compounds[..unknowns]
                .iter()
                .map(|&c| Fraction::from_int(rows[r][c]))
                .collect();
            row.push(Fraction::from_int(-rows[r][last]));
            row
        })
        .collect();
    let mut active = m.len();
    let mut col = 0;
    while col < unknowns {
        if (0..=unknowns).all(|k| m[col][k].is_zero()) {
            // A row with nothing left moves to the end (line 5510).
            m[col..active].rotate_left(1);
            active -= 1;
            if active < unknowns {
                return Err(BalanceError::Ambiguous);
            }
            continue;
        }
        if m[col][col].is_zero() {
            // Swap with a lower row that has this column (line 11000).
            let Some(swap) = (col + 1..active).find(|&r| !m[r][col].is_zero()) else {
                return Err(BalanceError::Ambiguous);
            };
            m.swap(col, swap);
        }
        let pivot = m[col][col];
        for v in m[col].iter_mut() {
            *v = v.div(pivot)?;
        }
        let pivot_row = m[col].clone();
        for (r, row) in m.iter_mut().enumerate().take(active) {
            if r != col && !row[col].is_zero() {
                let factor = row[col];
                for (v, p) in row.iter_mut().zip(&pivot_row) {
                    *v = v.sub(factor.mul(*p)?)?;
                }
            }
        }
        col += 1;
    }
    // Leftover rows must agree, or the system is inconsistent (line 3260).
    if (unknowns..active).any(|r| !m[r][unknowns].is_zero()) {
        return Err(BalanceError::MultipleReplacement);
    }
    let mut values: Vec<Fraction> = (0..unknowns).map(|r| m[r][unknowns]).collect();
    values.push(Fraction::ONE);
    to_whole_numbers(&values)
}

/// Multiply by the common denominator and divide by the common factor.
fn to_whole_numbers(values: &[Fraction]) -> Result<Vec<i64>, BalanceError> {
    let mut lcm: i128 = 1;
    for v in values {
        lcm = lcm / gcd(lcm, v.den as i128) * v.den as i128;
        if lcm > LIMIT as i128 {
            return Err(BalanceError::Overflow);
        }
    }
    let scaled: Vec<i128> = values
        .iter()
        .map(|v| v.num as i128 * (lcm / v.den as i128))
        .collect();
    let common = scaled.iter().fold(0, |g, &n| gcd(g, n)).max(1);
    let whole: Vec<i128> = scaled.iter().map(|n| n / common).collect();
    if whole.iter().any(|&n| n <= 0) {
        return Err(BalanceError::NegativeSolution);
    }
    whole
        .into_iter()
        .map(|n| {
            if n > LIMIT as i128 {
                Err(BalanceError::Overflow)
            } else {
                Ok(n as i64)
            }
        })
        .collect()
}
