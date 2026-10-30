//! Equation parsing (BASIC lines 200–470 and the scanner at 1000–1280).
//!
//! Like the original: input is upper-cased; an element is a letter optionally
//! followed by a second letter, so `NA.CL` is sodium chloride while `CO` is cobalt.
//! Periods and spaces only separate. `@` is a charge pseudo-element whose count
//! may be negative (`@-2`). A number after an element or `)` multiplies it.

use crate::BalanceError;

/// Parentheses may nest this deep (the BASIC PR() stack holds nine levels).
const MAX_DEPTH: usize = 9;

#[derive(Debug, Clone)]
pub struct Equation {
    /// Compound text as typed (upper-cased, trimmed).
    pub compounds: Vec<String>,
    /// Number of compounds on the left of `=`.
    pub reactants: usize,
    /// Elements in order of first appearance.
    pub elements: Vec<String>,
    /// `matrix[element][compound]`: atom count, negative on the product side.
    pub matrix: Vec<Vec<i64>>,
}

pub fn parse(input: &str) -> Result<Equation, BalanceError> {
    let text = input.to_ascii_uppercase();
    let mut previous = ' ';
    for c in text.chars() {
        let allowed = c.is_ascii_uppercase()
            || c.is_ascii_digit()
            || " ()+.@=".contains(c)
            || (c == '-' && previous == '@');
        if !allowed {
            return Err(BalanceError::IllegalCharacter);
        }
        previous = c;
    }
    let sides: Vec<&str> = text.split('=').collect();
    if sides.len() > 2 {
        return Err(BalanceError::TooManyEquals);
    }
    let mut compounds = Vec::new();
    let mut counts = Vec::new();
    for (side, part) in sides.iter().enumerate() {
        let sign = if side == 0 { 1 } else { -1 };
        for compound in part.split('+') {
            counts.push(parse_compound(compound, sign)?);
            compounds.push(compound.trim().to_string());
        }
    }
    let reactants = sides[0].split('+').count();

    let mut elements: Vec<String> = Vec::new();
    for compound in &counts {
        for (element, _) in compound {
            if !elements.contains(element) {
                elements.push(element.clone());
            }
        }
    }
    if elements.is_empty() {
        return Err(BalanceError::NoElements);
    }
    let matrix = elements
        .iter()
        .map(|e| {
            counts
                .iter()
                .map(|c| c.iter().filter(|(x, _)| x == e).map(|(_, n)| n).sum())
                .collect()
        })
        .collect();
    Ok(Equation {
        compounds,
        reactants,
        elements,
        matrix,
    })
}

/// Returns (element, signed count) pairs; repeated elements are summed later.
fn parse_compound(text: &str, sign: i64) -> Result<Vec<(String, i64)>, BalanceError> {
    // Periods and spaces stay in place: they also keep `C.O` from reading as cobalt.
    let chars: Vec<char> = text.chars().collect();
    // Each open group collects (element, count) pairs until its `)`.
    let mut stack: Vec<Vec<(String, i64)>> = vec![Vec::new()];
    // What a following number would multiply: the last element, or the last closed group.
    let mut last: Option<Vec<(String, i64)>> = None;
    let mut i = 0;
    let flush = |stack: &mut Vec<Vec<(String, i64)>>, last: &mut Option<Vec<(String, i64)>>| {
        if let Some(items) = last.take() {
            stack.last_mut().unwrap().extend(items);
        }
    };
    while i < chars.len() {
        let c = chars[i];
        if c == '.' || c == ' ' {
            i += 1;
        } else if c.is_ascii_uppercase() || c == '@' {
            flush(&mut stack, &mut last);
            let mut name = c.to_string();
            if c != '@' && i + 1 < chars.len() && chars[i + 1].is_ascii_uppercase() {
                name.push(chars[i + 1]);
                i += 1;
            }
            last = Some(vec![(name, 1)]);
            i += 1;
        } else if c.is_ascii_digit() || c == '-' {
            let start = i;
            i += 1;
            while i < chars.len() && chars[i].is_ascii_digit() {
                i += 1;
            }
            let digits: String = chars[start..i].iter().collect();
            let n: i64 = digits.parse().map_err(|_| BalanceError::Overflow)?;
            match last.as_mut() {
                Some(items) => items.iter_mut().for_each(|(_, count)| *count *= n),
                None => return Err(BalanceError::SubscriptPosition),
            }
            flush(&mut stack, &mut last);
        } else if c == '(' {
            flush(&mut stack, &mut last);
            if stack.len() > MAX_DEPTH {
                return Err(BalanceError::TooManyParens);
            }
            stack.push(Vec::new());
            i += 1;
        } else {
            // ')'
            flush(&mut stack, &mut last);
            if stack.len() < 2 {
                return Err(BalanceError::MismatchedParens);
            }
            last = stack.pop();
            i += 1;
        }
    }
    flush(&mut stack, &mut last);
    if stack.len() != 1 {
        return Err(BalanceError::MismatchedParens);
    }
    Ok(stack
        .pop()
        .unwrap()
        .into_iter()
        .map(|(e, n)| (e, n * sign))
        .collect())
}
