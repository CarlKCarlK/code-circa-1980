// A small Level II BASIC interpreter for one program line: the surface formula.
// It accepts the same text you could type as line 200 of the original, such as
//   IF X<>0 OR Z<>0 THEN Y=-1/SQR(X^2*18+Z^2*18)+1 ELSE Y=-1
// Statements: [LET] var = expr, IF expr THEN statements [ELSE statements], joined by ':'.
// Like Level II, spaces are optional, keywords can sit inside names, only the
// first two letters of a variable name count, and unset variables are 0.
import * as m from './mbf.ts';

export type Env = Map<string, number>;
type Expr = (env: Env) => number;
type Statement = (env: Env) => void;

const functions: Record<string, (a: number) => number> = {
  SIN: m.sin, COS: m.cos, TAN: m.tan, ATN: m.atn, EXP: m.exp, LOG: m.log, SQR: m.sqr,
  ABS: Math.abs, INT: m.int, FIX: m.fix, SGN: Math.sign,
};
const keywords = ['THEN', 'ELSE', 'LET', 'AND', 'NOT', 'IF', 'OR', ...Object.keys(functions)]
  .sort((a, b) => b.length - a.length);

export class FormulaError extends Error {}

type Token = {kind: 'num', value: number} | {kind: 'name', value: string} | {kind: 'word', value: string} | {kind: 'op', value: string};

function tokenize(text: string): Token[] {
  const s = text.toUpperCase().replaceAll('↑', '^').replaceAll('[', '^');
  const tokens: Token[] = [];
  const keywordAt = (i: number) => keywords.find(k => s.startsWith(k, i));
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    const word = keywordAt(i);
    if (word) { tokens.push({kind: 'word', value: word}); i += word.length; continue; }
    if (/[0-9.]/.test(c)) {
      const match = /^(\d*\.?\d*)(E[+-]?\d+)?/.exec(s.slice(i))!;
      if (match[1] === '.' || match[1] === '') throw new FormulaError('?SN Error: a lone decimal point');
      tokens.push({kind: 'num', value: m.round(Number(match[0]))}); i += match[0].length; continue;
    }
    if (/[A-Z]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[A-Z0-9]/.test(s[j]) && !keywordAt(j)) j++;
      tokens.push({kind: 'name', value: s.slice(i, j).slice(0, 2)}); i = j; continue;
    }
    const two = s.slice(i, i + 2);
    if (['<>', '><', '<=', '=<', '>=', '=>'].includes(two)) {
      tokens.push({kind: 'op', value: {'><': '<>', '=<': '<=', '=>': '>='}[two] ?? two}); i += 2; continue;
    }
    if ('+-*/^()=<>:'.includes(c)) { tokens.push({kind: 'op', value: c}); i++; continue; }
    throw new FormulaError(`?SN Error: unexpected "${c}"`);
  }
  return tokens;
}

const truth = (b: boolean) => b ? -1 : 0;

// Compiles a statement list into a function that updates the variables.
export function compile(text: string): Statement {
  const body = text.trim().replace(/^\d+\s*/, '');
  if (!body) throw new FormulaError('Type a formula, such as Y=X*X-Z*Z');
  const tokens = tokenize(body);
  let p = 0;
  const peek = () => tokens[p];
  const is = (kind: Token['kind'], value?: string) => peek()?.kind === kind && (value === undefined || peek().value === value);
  const expect = (kind: Token['kind'], value: string) => {
    if (!is(kind, value)) throw new FormulaError(`?SN Error: expected ${value}`);
    p++;
  };

  // Precedence, lowest first: OR, AND, NOT, relations, + -, * /, unary minus, ^.
  function or(): Expr {
    let left = and();
    while (is('word', 'OR')) { p++; const a = left, b = and(); left = env => m.toInteger(a(env)) | m.toInteger(b(env)); }
    return left;
  }
  function and(): Expr {
    let left = not();
    while (is('word', 'AND')) { p++; const a = left, b = not(); left = env => m.toInteger(a(env)) & m.toInteger(b(env)); }
    return left;
  }
  function not(): Expr {
    if (is('word', 'NOT')) { p++; const a = not(); return env => ~m.toInteger(a(env)); }
    return relation();
  }
  function relation(): Expr {
    let left = sum();
    while (peek()?.kind === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(String(peek().value))) {
      const op = String(tokens[p++].value), a = left, b = sum();
      left = {
        '=': (env: Env) => truth(a(env) === b(env)), '<>': (env: Env) => truth(a(env) !== b(env)),
        '<': (env: Env) => truth(a(env) < b(env)), '>': (env: Env) => truth(a(env) > b(env)),
        '<=': (env: Env) => truth(a(env) <= b(env)), '>=': (env: Env) => truth(a(env) >= b(env)),
      }[op]!;
    }
    return left;
  }
  function sum(): Expr {
    let left = product();
    while (is('op', '+') || is('op', '-')) {
      const op = tokens[p++].value, a = left, b = product();
      left = op === '+' ? env => m.add(a(env), b(env)) : env => m.sub(a(env), b(env));
    }
    return left;
  }
  function product(): Expr {
    let left = unary();
    while (is('op', '*') || is('op', '/')) {
      const op = tokens[p++].value, a = left, b = unary();
      left = op === '*' ? env => m.mul(a(env), b(env)) : env => m.div(a(env), b(env));
    }
    return left;
  }
  function unary(): Expr {
    if (is('op', '-')) { p++; const a = unary(); return env => -a(env); }
    if (is('op', '+')) { p++; return unary(); }
    return power();
  }
  function power(): Expr {
    let left = atom();
    while (is('op', '^')) { p++; const a = left, b = atom(); left = env => m.pow(a(env), b(env)); }
    return left;
  }
  function atom(): Expr {
    const t = peek();
    if (!t) throw new FormulaError('?SN Error: the formula ends too soon');
    if (t.kind === 'num') { p++; const v = t.value; return () => v; }
    if (t.kind === 'name') { p++; const name = t.value; return env => env.get(name) ?? 0; }
    if (t.kind === 'word' && functions[t.value]) {
      p++; const f = functions[t.value];
      expect('op', '('); const a = or(); expect('op', ')');
      return env => f(a(env));
    }
    if (t.kind === 'op' && t.value === '(') { p++; const a = or(); expect('op', ')'); return a; }
    if (t.kind === 'op' && t.value === '-') return unary();
    throw new FormulaError(`?SN Error: unexpected ${t.value}`);
  }

  function statement(): Statement {
    if (is('word', 'IF')) {
      p++;
      const condition = or();
      expect('word', 'THEN');
      if (is('num')) throw new FormulaError('Line numbers after THEN are not supported here; assign Y instead');
      const then = statements(true);
      let otherwise: Statement = () => {};
      if (is('word', 'ELSE')) { p++; otherwise = statements(true); }
      return env => { if (condition(env) !== 0) then(env); else otherwise(env); };
    }
    if (is('word', 'LET')) p++;
    const t = peek();
    if (t?.kind !== 'name') throw new FormulaError(`?SN Error: expected a variable${t ? `, not ${t.value}` : ''}`);
    p++;
    expect('op', '=');
    const name = String(t.value), value = or();
    return env => { env.set(name, value(env)); };
  }
  // In Level II, ':' after THEN continues the THEN branch, up to ELSE or the end of the line.
  function statements(inIf = false): Statement {
    const list = [statement()];
    while (is('op', ':')) { p++; if (inIf && is('word', 'ELSE')) break; list.push(statement()); }
    return env => { for (const s of list) s(env); };
  }

  const program = statements();
  if (p < tokens.length) throw new FormulaError(`?SN Error: unexpected ${tokens[p].value}`);
  return program;
}
