//! Chemistry Balancer II, in Rust.
//!
//! A port of the balancing algorithm in Carl Kadie's TRS-80 BASIC program
//! Chemistry Balancer II (copyright 1981; recovered version v20, tape23b save 1).
//! It follows the original's steps and error checks with exact integer fractions;
//! control flow is restructured. See PARITY.md for known differences.

mod fraction;
mod parse;
mod solve;

use wasm_bindgen::prelude::wasm_bindgen;

pub use parse::Equation;

/// The original's FATAL ERROR conditions (BASIC lines 2005–2130).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BalanceError {
    TooManyParens,
    MismatchedParens,
    TooManyEquals,
    NoElements,
    /// An element appears on only one side.
    Alchemy(String),
    MultipleReplacement,
    IllegalCharacter,
    Overflow,
    /// More than one independent way to balance the equation.
    Ambiguous,
    SubscriptPosition,
    NegativeSolution,
}

impl BalanceError {
    /// The message the 1981 program printed after "FATAL ERROR: ".
    pub fn original_message(&self) -> &'static str {
        match self {
            Self::TooManyParens => "TOO MANY ('S",
            Self::MismatchedParens => "MISMATCHED ('S",
            Self::TooManyEquals => "TOO MANY ='S",
            Self::NoElements => "NO ELEMENTS GIVEN",
            Self::Alchemy(_) => "ALCHEMY !!!!!",
            Self::MultipleReplacement => "MULTIPLE REPLACEMENT REACTION, CANNOT BE BALANCED",
            Self::IllegalCharacter => "ILLEGAL CHARACTER",
            Self::Overflow => "OVERFLOW",
            Self::Ambiguous => "AMBIGUOUS EQUATION",
            Self::SubscriptPosition => "SUBSCRIPT IN INCORRECT POSITION",
            Self::NegativeSolution => "CANNOT BE BALANCED: NEGATIVE SOLUTION",
        }
    }

    /// A plain-language explanation for the modern interface.
    pub fn explanation(&self) -> String {
        match self {
            Self::TooManyParens => "Parentheses are nested more than nine deep.".into(),
            Self::MismatchedParens => "Every ( needs a matching ).".into(),
            Self::TooManyEquals => "Use one = between the reactants and the products.".into(),
            Self::NoElements => "Type at least one element, such as H2 + O2 = H2.O.".into(),
            Self::Alchemy(e) => format!("{e} appears on only one side. Atoms cannot be created or destroyed."),
            Self::MultipleReplacement => "The element equations contradict each other, so no coefficients work.".into(),
            Self::IllegalCharacter => "Use letters, digits, spaces, periods, ( ) + = and @ for charge.".into(),
            Self::Overflow => "A coefficient would exceed 10^16, the original program's limit.".into(),
            Self::Ambiguous => "More than one independent set of coefficients balances this equation.".into(),
            Self::SubscriptPosition => "Numbers go after an element or ), not before. Leave out coefficients.".into(),
            Self::NegativeSolution => "The only solution needs a zero or negative coefficient: a compound is on the wrong side.".into(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Balanced {
    pub equation: Equation,
    pub coefficients: Vec<i64>,
    /// The equation splits into independent sub-equations ("WARNING: MIXED EQUATIONS").
    pub mixed: bool,
}

pub fn balance(input: &str) -> Result<Balanced, BalanceError> {
    let equation = parse::parse(input)?;
    let solution = solve::solve(&equation)?;
    Ok(Balanced {
        equation,
        coefficients: solution.coefficients,
        mixed: solution.mixed,
    })
}

impl Balanced {
    /// The 1981 output style: `2( H2 )+( O2 )-^ 2( H2.O )`.
    pub fn trs80_text(&self) -> String {
        let mut out = String::new();
        for (i, (compound, &n)) in self
            .equation
            .compounds
            .iter()
            .zip(&self.coefficients)
            .enumerate()
        {
            if i > 0 {
                out.push_str(if i == self.equation.reactants {
                    "-^"
                } else {
                    "+"
                });
            }
            if n != 1 {
                out.push_str(&format!(" {n}"));
            }
            out.push_str("( ");
            out.push_str(&compound.replace('(', "<").replace(')', ">"));
            out.push_str(" )");
        }
        out
    }

    /// Modern notation: `C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O`.
    pub fn pretty_text(&self) -> String {
        let mut out = String::new();
        for (i, (compound, &n)) in self
            .equation
            .compounds
            .iter()
            .zip(&self.coefficients)
            .enumerate()
        {
            if i > 0 {
                out.push_str(if i == self.equation.reactants {
                    " → "
                } else {
                    " + "
                });
            }
            if n != 1 {
                out.push_str(&format!("{n} "));
            }
            out.push_str(&pretty_formula(compound));
        }
        out
    }
}

/// Drop separators, title-case two-letter elements, subscript counts and
/// superscript charges (`@-2` → `²⁻`).
pub fn pretty_formula(compound: &str) -> String {
    const SUPER: [char; 10] = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    let chars: Vec<char> = compound.chars().collect();
    let mut out = String::new();
    let mut after_letter = false;
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        i += 1;
        match c {
            '@' => {
                let negative = chars.get(i) == Some(&'-');
                if negative {
                    i += 1;
                }
                let start = i;
                while i < chars.len() && chars[i].is_ascii_digit() {
                    i += 1;
                }
                let digits: String = chars[start..i].iter().collect();
                if digits != "1" {
                    out.extend(digits.chars().map(|d| SUPER[d as usize - '0' as usize]));
                }
                out.push(if negative { '⁻' } else { '⁺' });
                after_letter = false;
            }
            'A'..='Z' if after_letter => {
                out.push(c.to_ascii_lowercase());
                after_letter = false;
            }
            'A'..='Z' => {
                out.push(c);
                after_letter = true;
            }
            '0'..='9' => {
                out.push(char::from_u32(0x2080 + c as u32 - '0' as u32).unwrap());
                after_letter = false;
            }
            '.' | ' ' => after_letter = false,
            _ => {
                out.push(c);
                after_letter = false;
            }
        }
    }
    out
}

fn json_string(s: &str) -> String {
    let mut out = String::from("\"");
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

fn json_list<T>(items: &[T], f: impl Fn(&T) -> String) -> String {
    format!("[{}]", items.iter().map(f).collect::<Vec<_>>().join(","))
}

/// JSON result for the browser: `{ok:true, …}` or `{ok:false, error, explanation}`.
#[wasm_bindgen]
pub fn balance_json(input: &str) -> String {
    match balance(input) {
        Ok(b) => format!(
            "{{\"ok\":true,\"compounds\":{},\"reactants\":{},\"coefficients\":{},\"elements\":{},\"matrix\":{},\"mixed\":{},\"trs80\":{},\"pretty\":{}}}",
            json_list(&b.equation.compounds, |s| json_string(s)),
            b.equation.reactants,
            json_list(&b.coefficients, |n| n.to_string()),
            json_list(&b.equation.elements, |s| json_string(s)),
            json_list(&b.equation.matrix, |row| json_list(row, |n| n.to_string())),
            b.mixed,
            json_string(&b.trs80_text()),
            json_string(&b.pretty_text()),
        ),
        Err(e) => format!(
            "{{\"ok\":false,\"error\":{},\"explanation\":{}}}",
            json_string(e.original_message()),
            json_string(&e.explanation())
        ),
    }
}

#[cfg(test)]
mod tests;
