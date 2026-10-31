// 3-D Plot v03 drawing rules, step for step (original lines 130-420).
// Each grid point is projected to the 128 × 48 block-graphics screen and joined to
// the previous point with the original's SET line routine, in the same order and
// with Level II single-precision arithmetic, so the same dots appear.
import * as m from './mbf.ts';
import {compile, type Env} from './basic.ts';

export const ORIGINAL_LINE_200 = 'IF X<>0 OR Z<>0 THEN Y=-1/SQR(X^2*18+Z^2*18)+1 ELSE Y=-1';
export type Settings = {tilt: number, xScale: number, yScale: number, lines: number, formula: string, switchOn?: boolean};
export const standard: Settings = {tilt: 0.5, xScale: 1, yScale: 1, lines: 7, formula: ORIGINAL_LINE_200};

// 'point' marks each pass through line 200, for pacing; 'set' is one SET(x, y).
export type Step = {kind: 'set', x: number, y: number} | {kind: 'point'};
export const WIDTH = 128, HEIGHT = 48;

// FOR var=from TO to STEP step: the body always runs once; NEXT adds the step and
// continues while the value has not passed the limit.
function* forLoop(from: number, to: number, step: number): Generator<number> {
  let v = from;
  do { yield v; v = m.add(v, step); } while (step >= 0 ? v <= to : v >= to);
}

export function* plot(settings: Settings, env: Env = new Map()): Generator<Step> {
  const run = compile(settings.formula);
  const L = m.round(settings.lines);
  // Line 130: S=1/((L-1)/2)
  const S = m.div(1, m.div(m.sub(L, 1), 2));
  const XX = 127, YY = 47;
  // Line 170: DX=XS*30:DY=YS*15:DZ=TI
  const DX = m.mul(m.round(settings.xScale), 30), DY = m.mul(m.round(settings.yScale), 15), DZ = m.round(settings.tilt);
  // The program's own variables, which a formula can read as it could in BASIC.
  for (const [name, value] of Object.entries({XX, YY, TI: DZ, XS: m.round(settings.xScale), YS: m.round(settings.yScale),
    SW: settings.switchOn ? -1 : 1, L, S, DX, DY, DZ, Z1: 67, Z2: 75, Z3: 65, Z4: 68, Z5: 73, Z6: 69})) env.set(name, value);
  // Line 180: PI and E, ready for formulas.
  env.set('PI', m.mul(m.atn(1), 4)); env.set('E', m.exp(1));
  let P = 1, OX = 0, OY = 0;
  const half = m.div(XX, 2), halfY = m.div(YY, 2);
  function* point(X: number, Z: number): Generator<Step> {
    yield {kind: 'point'};
    env.set('X', X); env.set('Z', Z);
    run(env);
    const Y = env.get('Y') ?? 0;
    // Line 210: a formula can set NO=1 to lift the pen before this point.
    if (env.get('NO') === 1) { env.set('NO', 0); P = 1; }
    // Lines 220-230
    const GX = m.sub(m.add(half, m.mul(X, DX)), m.mul(m.mul(Z, DX), DZ));
    const GY = m.add(m.sub(halfY, m.mul(Y, DY)), m.mul(m.mul(Z, DY), DZ));
    if (GX < 0 || GX > XX || GY < 0 || GY > YY) { P = 1; return; }
    if (P === 1) { OX = GX; OY = GY; }
    yield* line(GX, GY);
    OX = GX; OY = GY; P = 0;
  }
  // Lines 360-420
  function* line(GX: number, GY: number): Generator<Step> {
    const dx = m.sub(GX, OX), dy = m.sub(GY, OY);
    const D = m.sqr(m.add(m.pow(dx, 2), m.pow(dy, 2)));
    if (D === 0) { yield set(GX, GY); return; }
    const SX = m.div(dx, D), SY = m.div(dy, D);
    for (const DD of forLoop(1, D, 1)) yield set(m.add(m.add(m.mul(DD, SX), OX), 0.5), m.add(m.add(m.mul(DD, SY), OY), 0.5));
  }
  function set(x: number, y: number): Step {
    const X = Math.trunc(x), Y = Math.trunc(y);
    if (X < 0 || X >= WIDTH || Y < 0 || Y >= HEIGHT) throw new m.BasicError('FC');
    return {kind: 'set', x: X, y: Y};
  }
  // Line 330 draws everything again when SWITCH ON was YES.
  for (let pass = 0; pass < (settings.switchOn ? 2 : 1); pass++) {
    P = 1;
    for (const A of [1, 2]) {
      env.set('A', A);
      for (const outer of forLoop(1, -1, -S)) {
        for (const inner of forLoop(1, -1, -S)) yield* A === 1 ? point(inner, outer) : point(outer, inner);
        P = 1;
      }
    }
  }
}

// Runs a whole plot and returns the lit dots as a 128 × 48 bitmap (row-major).
export function render(settings: Settings): Uint8Array {
  const dots = new Uint8Array(WIDTH * HEIGHT);
  for (const step of plot(settings)) if (step.kind === 'set') dots[step.y * WIDTH + step.x] = 1;
  return dots;
}
