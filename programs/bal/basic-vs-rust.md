# BASIC and Rust: Reducing a Fraction

Chemistry Balancer II (1981) does all of its arithmetic with exact fractions.
Every fraction is stored as a numerator and a denominator and reduced by their
greatest common divisor (GCD) after each operation. The browser version is a Rust
port of the same algorithm. Here is the reduction routine in both languages.

## The 1981 BASIC

Lines 4000–4090 of v20, exactly as recovered from tape:

```basic
4000 REM
4005 PRINT@60,"-";:IFRND(2)=1THENPRINTCHR$(94)ELSEPRINT" "
4010 IF N8=0 AND D8=0 THEN RETURN ELSE IF N8=0 THEN D8=1:RETURN ELSE IF D8=0 THEN N8=1:RETURN
4020 A8=N8:B8=D8
4030 A8=ABS(A8):B8=ABS(B8)
4040 R8=A8-B8*INT(A8/B8)
4050 IF R8<>0 THEN A8=B8:B8=R8:GOTO4040
4070 N8=N8/B8:D8=D8/B8
4080 IF (N8<0 AND D8<0) OR N8<0 THEN N8=-N8:D8=-D8
4090 RETURN
```

## The same BASIC, rewritten for today's eyes

Back then, you got used to reading BASIC like this. We no longer are, so here is
a one-for-one rewrite into pseudocode. It is still the same program, statement for
statement:

- Only the line numbers that something jumps to remain, written as labels with a colon (`4000:`, `4040:`).
- Each `:` statement gets its own line.
- Keywords are lower case, as in modern code.
- Variables get readable names: `N8` → `num`, `D8` → `den`, `A8` → `a`,
  `B8` → `b`, `R8` → `remainder`.
- Character codes become the characters they stand for: `CHR$(94)` → `"^"`.
- `<>` becomes `!=`.
- One exception to statement for statement: `A8=N8:B8=D8:A8=ABS(A8):B8=ABS(B8)`
  becomes `a = abs(num)` and `b = abs(den)`.

```text
4000: ' reduce the fraction num/den (num and den are globals)
      print @60, "-";                                 ' top-right corner: busy indicator
      if rnd(2) = 1 then print "^" else print " "     ' randomly flicker ^ beside it
      if num = 0 and den = 0 then
          return
      else if num = 0 then
          den = 1
          return
      else if den = 0 then
          num = 1
          return
      end if
      a = abs(num)
      b = abs(den)
4040: remainder = a - b * int(a / b)                  ' a mod b: no MOD operator, so subtract whole multiples of b
      if remainder != 0 then
          a = b
          b = remainder
          goto 4040
      end if
      num = num / b
      den = den / b
      if (num < 0 and den < 0) or num < 0 then
          num = -num
          den = -den
      end if
      return
```

## The Rust port

From [rust/src/fraction.rs](rust/src/fraction.rs):

```rust
pub fn gcd(a: i128, b: i128) -> i128 {
    let (mut a, mut b) = (a.abs(), b.abs());
    while b != 0 {
        (a, b) = (b, a % b);
    }
    a
}

impl Fraction {
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
}
```

## What differs

- **Same algorithm.** Both use Euclid's algorithm: replace (a, b) with
  (b, a mod b) until the remainder is zero.
- **Parameters.** Level II BASIC subroutines take no arguments and return no
  values. Callers put the fraction into the globals `N8` and `D8`, `GOSUB 4000`,
  and copy the answer back out. Rust passes values in and returns a new
  `Fraction`.
- **Numbers.** `DEFDBL` (line 90) makes these variables double-precision floating
  point. BASIC computes the remainder as `A8-B8*INT(A8/B8)` and stays exact only
  while the values remain whole numbers that a double can hold. Line 940 reports
  OVERFLOW when a final coefficient exceeds 1E16. Rust uses true integers:
  `i128` for intermediate products and `i64` for stored values. `try_from` reports
  overflow the moment a reduced value no longer fits.
- **Where the sign goes.** BASIC makes the numerator non-negative, so a negative
  fraction carries its sign in the denominator. Rust keeps the denominator
  positive and puts the sign in the numerator. Both are consistent; they just
  chose differently.
- **Zero denominators.** BASIC quietly turns x/0 into 1/0. Rust treats a zero
  denominator as a bug (`debug_assert!`), because its elimination never divides
  by a zero pivot.
- **Arrays (a point for BASIC).** `DIM N(EN,CN+1)` (line 260) makes a real
  rectangular 2-D array, and `N(I,J)` is a single lookup. The Rust port uses
  `Vec<Vec<Fraction>>`, a vector of separately allocated rows; Rust's true 2-D
  arrays need their size at compile time. BASIC also counts from 0 *to* n, so
  `DIM A(10)` gives 11 elements. C, C++, and Rust count from 0 to n−1; Fortran,
  MATLAB, Lua, and Julia from 1 to n. BASIC pleases both camps, and this program
  uses the extra slots: the equations live in rows and columns 1 and up, while
  row and column 0 hold bookkeeping for free. `N(0,I)` numbers the compounds,
  `N(I,0)` labels groups of related elements for the "MIXED EQUATIONS" check, and
  `D(0,J)` collects the answer's coefficients. Rust needs separate vectors for those.
- **Display mixed with math.** Line 4005 animates the spinner from inside the
  arithmetic, because this routine runs constantly and the program had no other
  convenient place to show it was busy.

## Calling it

The difference is clearest at a call site. This BASIC line divides one matrix entry
by the pivot. (Confusingly, the array `D()` holds numerators and `N()` holds
denominators.)

```basic
3130 FORK5=1TOCM
3140 N8=YD*D(J5+ES-1,K5+CS-1):D8=YN*N(J5+ES-1,K5+CS-1):GOSUB4000:D(J5+ES-1,K5+CS-1)=N8:N(J5+ES-1,K5+CS-1)=D8
3150 NEXT K5
```

The same lines rewritten (`J5` → `j`, `K5` → `k`, `ES` → `first_row`,
`CS` → `first_col`, `CM` → `col_count`, `YD` → `pivot_den`, `YN` → `pivot_num`,
`D()` → `numer[]`, `N()` → `denom[]`; array subscripts use square brackets):

```text
      ' divide each entry of the pivot row by the pivot, p/q:
      ' (a/b) / (p/q) = (a*q) / (b*p)
      for k = 1 to col_count
          num = pivot_den * numer[first_row + j - 1, first_col + k - 1]
          den = pivot_num * denom[first_row + j - 1, first_col + k - 1]
          gosub 4000                  ' reduce the globals num/den
          numer[first_row + j - 1, first_col + k - 1] = num
          denom[first_row + j - 1, first_col + k - 1] = den
      next k
```

Rust, from [rust/src/solve.rs](rust/src/solve.rs):

```rust
let pivot = m[col][col];
for v in m[col].iter_mut() {
    *v = v.div(pivot)?;
}
```

In Rust a fraction is one value with its own `div`, and the `?` passes an overflow
up to the caller. In BASIC a fraction is two numbers in two parallel arrays, and
every operation is written out by hand around a `GOSUB`.
