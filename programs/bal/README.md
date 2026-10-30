# Chemical Equation Balancer

Type an unbalanced chemical equation such as `C3.H8 + O2 = C.O2 + H2.O`; the
program finds the whole-number coefficients that conserve every element:
`(C3.H8) + 5(O2) -^ 3(C.O2) + 4(H2.O)`.

I wrote two generations of it in TRS-80 BASIC:

- **Chemical Equation Balancer** (source remark: copyright 1979). About 80 lines.
  It builds one equation per element and solves them with floating-point
  Gaussian elimination, then rescales until the coefficients are whole numbers.
- **Chemistry Balancer II** (copyright 1981, "Kadie Software"). About 225 lines,
  a rewrite. It parses formulas with nested parentheses, merges proportional
  element rows, and eliminates with exact fractions kept as numerator/denominator
  pairs reduced by a GCD routine. It also reports when an equation has only a
  negative solution or is ambiguous (more than one independent way to balance it).
  I advertised both programs in Radio Shack's *TRS-80 Applications Software
  Sourcebook*; see the [catalog listings](history/).

Balancing is linear algebra: each element gives one homogeneous linear equation,
each compound one unknown coefficient. A balanced equation is a strictly positive
vector in the null space of the element-by-compound matrix. Rational solutions can
always be scaled to integers, so the real constraints are positivity and a
one-dimensional null space. Version II checks both.

The website's default **browser version** runs a Rust port of the v20 algorithm,
compiled to WebAssembly ([rust/](rust/), [modern/player.js](modern/player.js)). It
answers instantly, offers sample problems in a side panel, and shows the linear
equations it solves. Differences from the original are in
[rust/PARITY.md](rust/PARITY.md); test evidence is in [VERIFICATION.md](VERIFICATION.md).
The generated `rust/pkg/` is committed because the site build has no Rust
toolchain; run `npm run build:balancer` from `app/` after changing the Rust code.

## Entering equations

Separate elements with periods (`H2.O`, `NA.CL`), compounds with `+`, and sides
with `=`. Parentheses group atoms: `CA(O.H)2`. The results use `-^` as the arrow
and show parentheses as `< >`.

## Versions

All 20 distinct recovered versions are kept in [versions/](versions/), in an
inferred development order (see [provenance.json](provenance.json)). Repeated
identical saves and two damaged saves are recorded there as other saves of the
same version. The Original tab defaults to v20, the latest Chemistry Balancer II.
v06 is the most capable 1979 version and is much faster. Several intermediate saves are
debugging snapshots that stop or fail; they are kept unchanged for study.

Dates: the copyright remarks give 1979 and 1981. Old programs were sometimes saved
again later, so these are not exact save dates.

[original/](original/) holds stable paths that advance through one Git commit per
version (tags `balancer-v01` … `balancer-v20`) so source changes can be compared.
