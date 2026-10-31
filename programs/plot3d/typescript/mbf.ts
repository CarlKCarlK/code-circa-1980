// Level II BASIC single-precision arithmetic (Microsoft Binary Format, 24-bit mantissa),
// including ports of the ROM's LOG, EXP, SIN and ATN routines with the ROM's constants.
// The ROM keeps one extra guard byte while it works and rounds half up on the
// magnitude, unlike IEEE's round-half-even. That difference matters here: with
// IEEE, FOR X=1 TO -1 STEP -1/3 misses 0 by 3E-8; in Level II it lands on 0.
// Values are JavaScript numbers that always hold an exactly representable MBF value.

const MAX = 1.7014117e38;

export class BasicError extends Error {
  readonly code: string;
  constructor(code: string) { super(`?${code} Error`); this.code = code; }
}

function exponent(v: number): number {
  let e = Math.floor(Math.log2(v));
  if (2 ** e > v) e--;
  else if (2 ** (e + 1) <= v) e++;
  return e;
}

// Truncates |v| to 32 significant bits (mantissa plus guard byte), then rounds half up to 24.
export function round(v: number): number {
  if (v === 0) return 0;
  if (Number.isNaN(v)) throw new BasicError('FC');
  const sign = Math.sign(v), a = Math.abs(v);
  if (!Number.isFinite(a)) throw new BasicError('OV');
  const e = exponent(a);
  if (e < -129) return 0;
  const guard = Math.trunc(a / 2 ** (e - 31));
  const mantissa = Math.floor(guard / 256) + ((guard & 0x80) ? 1 : 0);
  const result = mantissa * 2 ** (e - 23);
  if (result > MAX) throw new BasicError('OV');
  return sign * result;
}

export function add(a: number, b: number): number {
  if (a === 0) return b;
  if (b === 0) return a;
  const [big, small] = Math.abs(a) >= Math.abs(b) ? [a, b] : [b, a];
  // Bits of the smaller operand shifted past the guard byte are lost.
  const unit = 2 ** (exponent(Math.abs(big)) - 31);
  const kept = Math.sign(small) * Math.floor(Math.abs(small) / unit) * unit;
  return round(big + kept);
}
export const sub = (a: number, b: number) => add(a, -b);
export const mul = (a: number, b: number) => round(a * b);
export function div(a: number, b: number): number {
  if (b === 0) throw new BasicError('/0');
  return round(a / b);
}

// MBF constants as stored in the ROM: LSB, middle, MSB with sign bit, exponent.
function constant(b0: number, b1: number, b2: number, e: number): number {
  return (b2 & 0x80 ? -1 : 1) * (((b2 | 0x80) << 16) | (b1 << 8) | b0) * 2 ** (e - 0x80 - 24);
}
const table = (...bytes: number[]) => Array.from({length: bytes.length / 4}, (_, i) => constant(...bytes.slice(i * 4, i * 4 + 4) as [number, number, number, number]));
const SQR_HALF = constant(0xf3, 0x04, 0x35, 0x80);   // 0814: LD BC,8035h / LD DE,04F3h
const LN2 = constant(0x18, 0x72, 0x31, 0x80);        // 0841
const LOG2E = constant(0x3b, 0xaa, 0x38, 0x81);      // 143C
const TWO_PI = constant(0xdb, 0x0f, 0x49, 0x83);     // 154A
const HALF_PI = constant(0xdb, 0x0f, 0x49, 0x81);    // 158B
const LOG_TABLE = table(0xaa, 0x56, 0x19, 0x80, 0xf1, 0x22, 0x76, 0x80, 0x45, 0xaa, 0x38, 0x82); // 07FC
const EXP_TABLE = table(0x40, 0x2e, 0x94, 0x74, 0x70, 0x4f, 0x2e, 0x77, 0x6e, 0x02, 0x88, 0x7a, 0xe6, 0xa0, 0x2a, 0x7c,
  0x50, 0xaa, 0xaa, 0x7e, 0xff, 0xff, 0x7f, 0x7f, 0x00, 0x00, 0x80, 0x81, 0x00, 0x00, 0x00, 0x81);  // 1479
const SIN_TABLE = table(0xba, 0xd7, 0x1e, 0x86, 0x64, 0x26, 0x99, 0x87, 0x58, 0x34, 0x23, 0x87, 0xe0, 0x5d, 0xa5, 0x86,
  0xda, 0x0f, 0x49, 0x83);  // 1593
const ATN_TABLE = table(0x4a, 0xd7, 0x3b, 0x78, 0x02, 0x6e, 0x84, 0x7b, 0xfe, 0xc1, 0x2f, 0x7c, 0x74, 0x31, 0x9a, 0x7d,
  0x84, 0x3d, 0x5a, 0x7d, 0xc8, 0x7f, 0x91, 0x7e, 0xe4, 0xbb, 0x4c, 0x7e, 0x6c, 0xaa, 0xaa, 0x7f, 0x00, 0x00, 0x00, 0x81);  // 15E3

// Horner's rule (14A9), and x·P(x²) for odd series (149A).
function poly(x: number, coefficients: number[]): number {
  let r = coefficients[0];
  for (const c of coefficients.slice(1)) r = add(mul(r, x), c);
  return r;
}
const oddPoly = (x: number, coefficients: number[]) => mul(poly(mul(x, x), coefficients), x);
// The ROM's exponent byte: v = 0.1mmm… (binary) × 2^(byte - 128).
const exponentByte = (v: number) => v === 0 ? 0 : exponent(Math.abs(v)) + 129;

// LOG (0809): log2 of the mantissa from an odd series, plus the exponent, times LN2.
export function log(x: number): number {
  if (x <= 0) throw new BasicError('FC');
  const e = exponentByte(x) - 0x80;
  let r = add(x / 2 ** e, SQR_HALF);
  r = div(SQR_HALF * 2, r);
  r = sub(1, r);
  r = oddPoly(r, LOG_TABLE);
  r = add(r, -0.5);
  r = add(r, e);
  return mul(r, LN2);
}
// EXP (1439): e^x = 2^(n+1) · e^-t, with n = INT(x/LN2) and t = (n+1)·LN2 - x.
export function exp(x: number): number {
  const y = mul(x, LOG2E);
  if (exponentByte(y) >= 0x88) { if (x < 0) return 0; throw new BasicError('OV'); }
  const n = Math.floor(y);
  if (n >= 126) throw new BasicError('OV');
  const t = -sub(x, mul(add(n, 1), LN2));
  return round(mul(poly(t, EXP_TABLE), 2 ** (n + 1)));
}
// x^y (13F2) is EXP(y·LOG(x)); a negative base needs a whole-number power.
export function pow(x: number, y: number): number {
  if (y === 0) return exp(0);
  if (x === 0) { if (y < 0) throw new BasicError('/0'); return 0; }
  if (x > 0) return exp(mul(y, log(x)));
  if (Math.floor(y) !== y) throw new BasicError('FC');
  const r = exp(mul(y, log(-x)));
  return Math.floor(y) % 2 !== 0 ? -r : r;
}
// SQR (13E7) is x^.5.
export const sqr = (x: number) => pow(x, 0.5);
// SIN (1547): reduce x/2π to a quarter turn, then an odd series in turns.
export function sin(x: number): number {
  const u = div(x, TWO_PI);
  const v = sub(0.25, sub(u, Math.floor(u)));
  let r: number;
  if (v >= 0) r = add(0.25, -v);
  else {
    const w = add(v, 0.5);
    r = -add(0.25, w >= 0 ? -w : w);
  }
  return oddPoly(r, SIN_TABLE);
}
export const cos = (x: number) => sin(add(HALF_PI, x));  // 1541
export const tan = (x: number) => div(sin(x), cos(x));  // 15A8
// ATN (15BD): odd series below 1; π/2 - ATN(1/x) from 1 up.
export function atn(x: number): number {
  const a = Math.abs(x);
  const r = exponentByte(a) >= 0x81 ? sub(HALF_PI, oddPoly(div(1, a), ATN_TABLE)) : oddPoly(a, ATN_TABLE);
  return x < 0 ? -r : r;
}
export const int = (a: number) => Math.floor(a);
export const fix = (a: number) => Math.trunc(a);

// Relational operators give -1 (true) or 0; AND, OR and NOT work on 16-bit integers.
export function toInteger(a: number): number {
  const i = Math.trunc(a);
  if (i < -32768 || i > 32767) throw new BasicError('OV');
  return i;
}
