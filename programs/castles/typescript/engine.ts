import timing from './timing-calibration.json' with {type:'json'};
const milliseconds = (cycles: number) => cycles * 1000 / timing.clockHz;
/** Castles v05 rules, translated from recovered BASIC and FALL assembly v6.
 * Historical inputs stay separate. No emulator or DOM is needed by this model.
 */
export type Random = (upper: number) => number;
export type Mode = 'move' | 'draw' | 'erase';
export function seededRandom(seed = 1): Random {
  let state = seed >>> 0;
  return upper => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const value = state / 0x100000000; return upper ? 1 + Math.floor(value * upper) : value; };
}
// Level II single precision rounds intermediate arithmetic, not just final pixels.
export function projectileHeight(vx: number, vy: number, distance: number): number {
  const f = Math.fround; vx=f(vx); vy=f(vy);
  const rise=f(f(vy*distance)/vx);
  let drop=f(.5*f(.01)); drop=f(drop*distance); drop=f(drop*distance); drop=f(drop/vx); drop=f(drop/vx);
  return f(rise-drop);
}
export class Castles {
  readonly screen = new Uint8Array(1024);
  readonly held = new Set<string>();
  phase: 'building' | 'bombarding' | 'error' = 'building';
  mode: Mode = 'move';
  activity: 'building' | 'aiming' | 'flight' | 'impact' | 'settling' | 'between-shots' = 'building';
  stepMs = 150;
  private fallCycles = 0;
  cursor = { x: 64, y: 46 };
  cannons = [0, 0];
  power = 0;
  angle = 0;
  shots = 0;
  ticks = 0;
  error = '';
  private hasBombarded = false;
  private previousMask = -1;
  private dx = 0;
  private dy = 0;
  private short = false;
  private queued: string[] = [];
  private pendingPower:number|undefined;
  private pendingAngle:number|undefined;
  private action: Generator<number> | undefined;
  private previousPoint = { x: 0, y: 0 };
  /** Counts block moves while falling; observation only (used for sound), not a rule. */
  fallSteps = 0;
  readonly random: Random;
  constructor(random: Random = upper => upper ? 1 + Math.floor(Math.random() * upper) : Math.random()) {
    this.random = random; this.reset();
  }
  reset(): void {
    this.screen.fill(32); this.screen.fill(128, 0, 960); // v05 line 15
    for (let x = 0; x < 128; x++) this.plot(x, 47, true);
    this.phase = 'building'; this.mode = 'move'; this.activity = 'building'; this.stepMs = 150; this.fallCycles = 0; this.cursor = { x: 64, y: 46 };
    this.power = this.angle = this.shots = this.ticks = 0; this.error = '';
    this.pendingPower=this.pendingAngle=undefined;this.hasBombarded=false;
    this.previousMask = -1; this.dx = this.dy = 0; this.short = false;
    this.action = undefined; this.previousPoint = { x: 0, y: 0 }; this.release();
  }
  key(key: string, down: boolean): void {
    key = key.toLowerCase();
    if (down) { if (!this.held.has(key)) this.queued.push(key); this.held.add(key); }
    else this.held.delete(key);
  }
  /** Modern UI settings take effect between shots, like keyboard aiming. */
  setCannonSetting(kind:'power'|'angle',value:number):void {
    if(this.phase!=='bombarding'||!Number.isFinite(value))return;
    const index=Math.round(Math.max(0,Math.min(kind==='power'?9:25,value)));
    if(kind==='power')this.pendingPower=index/10;else this.pendingAngle=index/26;
  }
  cannonSettings(){return {power:Math.round((this.pendingPower??this.power)*10),angle:Math.round((this.pendingAngle??this.angle)*26)};}
  release(): void { this.held.clear(); this.queued.length = 0; this.dx = this.dy = 0; this.previousMask = -1; }
  /** BASIC graphics operations truncate positive fractional coordinates. */
  point(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= 128 || y >= 48) throw Error('BASIC graphics coordinate out of range');
    x = Math.floor(x); y = Math.floor(y);
    const code = this.screen[Math.floor(y / 3) * 64 + Math.floor(x / 2)];
    return code >= 128 && (code & (1 << ((y % 3) * 2 + x % 2))) !== 0;
  }
  plot(x: number, y: number, set: boolean): void {
    if (x < 0 || y < 0 || x >= 128 || y >= 48) throw Error('BASIC graphics coordinate out of range');
    x = Math.floor(x); y = Math.floor(y);
    const address = Math.floor(y / 3) * 64 + Math.floor(x / 2), bit = 1 << ((y % 3) * 2 + x % 2);
    let code = this.screen[address]; if (code < 128) code = 128;
    this.screen[address] = set ? code | bit : code & ~bit;
  }
  /** Shared keyboard/pointer legality checks; no relaxed support or erase rules. */
  editStatus(x: number, y: number, tool: 'draw' | 'erase'): 'changed' | 'unchanged' | 'unsupported' | 'protected' | 'outside' | 'unavailable' {
    if (this.phase !== 'building') return 'unavailable';
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || x > 126 || y < 2 || y > 46) return 'outside';
    if (tool === 'draw' && ![-1,0,1].some(d=>this.point(x+d,y+1))) return 'unsupported';
    if (tool === 'erase' && [-1,0,1].some(d=>this.point(x+d,y-1))) return 'protected';
    return this.point(x,y) === (tool === 'draw') ? 'unchanged' : 'changed';
  }
  editAt(x: number, y: number, tool: 'draw' | 'erase'): ReturnType<Castles['editStatus']> {
    const result = this.editStatus(x,y,tool);
    if (result !== 'outside' && result !== 'unavailable') this.cursor = {x,y};
    if (result === 'changed') this.plot(x,y,tool === 'draw');
    return result;
  }
  /** One builder iteration (BASIC 510–650), independent of display frame rate. */
  buildStep(): void {
    if (this.phase !== 'building') return;
    if (this.queued.shift() === 'q') { this.beginBombardment(); return; }
    let mask = 0;
    for (let i = 0; i <= 9; i++) if (this.held.has(String(i))) mask |= 1 << i;
    if (this.held.has('shift')) mask |= 1024;
    if (mask !== this.previousMask) {
      this.previousMask = mask; this.dx = this.dy = 0;
      const increment = this.held.has('shift') ? 5 : 1;
      if (mask & 2) this.dy = -increment; else if (mask & 4) this.dy = increment;
      if (mask & 128) this.mode = 'move'; else if (mask & 256) this.mode = 'draw'; else if (mask & 512) this.mode = 'erase';
      if (mask & 8) this.dx = -increment; else if (mask & 16) this.dx = increment;
      if (mask & 1) { this.short = true; this.mode = 'move'; }
    }
    const { x, y } = this.cursor;
    if (x + this.dx >= 1 && x + this.dx <= 126 && y + this.dy >= 2 && y + this.dy <= 46)
      this.cursor = { x: x + this.dx, y: y + this.dy };
    const target = this.cursor;
    if (this.mode === 'move' && !this.short) return;
    if (this.short) this.mode = 'draw';
    if (this.mode === 'draw' || this.mode === 'erase') {
      const result = this.editAt(target.x,target.y,this.mode);
      if (result === 'unsupported' || result === 'protected') this.dx = this.dy = 0;
    }
    if (this.short) { this.short = false; this.mode = 'move'; }
  }
  /** Modern control: stop the current action and return to editing the same field. */
  beginBuilding():void {
    if(this.phase!=='bombarding')return;
    if(this.activity==='flight')this.plot(this.previousPoint.x,this.previousPoint.y,false);
    this.action=undefined;this.previousPoint={x:0,y:0};this.fallCycles=0;
    this.release();this.short=false;this.mode='move';this.phase='building';this.activity='building';this.stepMs=150;
  }
  beginBombardment(): void {
    if(this.phase!=='building')return;
    this.phase = 'bombarding'; this.queued.length = 0;
    if(!this.hasBombarded){
      this.cannons = [20 + this.random(15), 127 - (this.random(15) + 20)];
      for (const x of this.cannons) this.plot(x, 47, false);
      this.hasBombarded=true;
    }
    this.action = this.bombardment();
  }
  step(): void {
    this.ticks++;
    try {
      if (this.phase === 'building') { this.stepMs = 150; this.buildStep(); }
      else if (this.phase === 'bombarding') {
        const delay = this.action?.next().value;
        this.stepMs = typeof delay === 'number' && delay > 0 ? delay : 150;
      }
    }
    catch (error) { this.phase = 'error'; this.error = error instanceof Error ? error.message : String(error); }
  }
  /** Direct VRAM access used by FALL v6, including its 8-bit X arithmetic. */
  private assemblyBit(x: number, y: number, operation: 'test' | 'set' | 'reset'): boolean {
    x &= 255; y &= 255;
    this.fallCycles += timing.fall.testBaseCycles + timing.fall.testRowIncrementCycles * Math.floor(y / 3)
      + (x & 1) * timing.fall.oddXAdjustmentCycles + (operation === 'test' ? 0 : timing.fall.writeExtraCycles);
    const address = Math.floor(y / 3) * 64 + (x >> 1), bit = 1 << ((y % 3) * 2 + (x & 1));
    // Reads beyond VRAM are treated as zero here. The Z80 can instead see BASIC
    // workspace RAM there: this is a documented edge-case parity limitation.
    if (address >= this.screen.length) return false;
    const before = this.screen[address]; let after = before | 128;
    if (operation === 'set') after |= bit; else if (operation === 'reset') after &= ~bit;
    this.screen[address] = after; return (before & bit) !== 0;
  }
  private takeFallTime(): number { const cycles = this.fallCycles; this.fallCycles = 0; return milliseconds(cycles); }
  private *fallBlock(x: number, y: number): Generator<number> {
    const present = this.assemblyBit(x, y, 'test');
    this.fallCycles += present ? timing.fall.occupiedEntryControlCycles : timing.fall.emptyEntryControlCycles;
    if (!present) { yield this.takeFallTime(); return; }
    let falling = false;
    while (y !== 46) {
      const below = this.assemblyBit(x, y + 1, 'test');
      const right = this.assemblyBit(x + 1, y + 1, 'test');
      const left = this.assemblyBit(x - 1, y + 1, 'test');
      const mask = (below ? 0 : 1) | (left ? 0 : 2) | (right ? 0 : 4);
      this.fallCycles += timing.fall.loopControlCycles[falling ? 1 : 0][mask];
      // At rest: any of the three supports holds a block. Once moving, it
      // continues through an available center/left/right route (CHK/FIRM).
      if ((!falling && (below || right || left)) || (falling && below && right && left)) { yield this.takeFallTime(); return; }
      falling = true; this.fallSteps++; this.assemblyBit(x, y, 'reset'); y++;
      if (!below) { /* straight down */ } else if (!left) { x--; if (x < 0) { yield this.takeFallTime(); return; } }
      else { x++; if (x === 128) { yield this.takeFallTime(); return; } }
      this.assemblyBit(x, y, 'set'); yield this.takeFallTime();
    }
    this.fallCycles += timing.fall.groundReturnCycles; yield this.takeFallTime();
  }
  *settle(row: number): Generator<number> {
    this.activity = 'settling'; this.fallCycles = timing.fall.routineStartCycles;
    yield this.takeFallTime();
    for (let y = row; y >= 0; y--) {
      for (let x = 127; x >= 0; x--) {this.fallCycles += timing.fall.outerCellCycles; yield* this.fallBlock(x, y);}
      yield milliseconds(timing.fall.outerRowCycles);
    }
    yield milliseconds(timing.fall.routineReturnCycles);
  }
  *impact(x: number, y: number): Generator<number> {
    this.activity = 'impact';
    this.plot(x, y, false); this.plot(this.previousPoint.x, this.previousPoint.y, false);
    for (let i = 0; i < 9; i++) {
      const x4 = this.random(3) - 2 + x, y4 = this.random(3) - 2 + y;
      const x5 = this.random(3) - 2 + x, y5 = this.random(3) - 2 + y;
      const first = this.point(x4, y4), second = this.point(x5, y5);
      if (first === second) {yield milliseconds(timing.basic.impactAttemptCycles); continue;}
      const from = first ? { x: x4, y: y4 } : { x: x5, y: y5 };
      const to = first ? { x: x5, y: y5 } : { x: x4, y: y4 };
      this.plot(from.x, from.y, false); this.plot(to.x, to.y, true);
      // BASIC 980/990: half the scattered destination blocks are removed.
      if (this.random(2) !== 1) this.plot(to.x, to.y, false);
      yield milliseconds(timing.basic.impactAttemptCycles);
    }
    if (y < 46) yield* this.settle(Math.floor(y + 1));
  }
  private *bombardment(): Generator<number> {
    for (;;) for (let cannon = 0; cannon < 2; cannon++) {
      const input = this.queued.shift() ?? [...this.held].find(k => /^[a-z0-9]$/.test(k));
      if (input && /^[0-9]$/.test(input)) this.power = Number(input) / 10;
      else if (input && /^[a-z]$/.test(input)) this.angle = (input.charCodeAt(0) - 97) / 26;
      if(this.pendingPower!==undefined){this.power=this.pendingPower;this.pendingPower=undefined;}
      if(this.pendingAngle!==undefined){this.angle=this.pendingAngle;this.pendingAngle=undefined;}
      const speed = this.random(0) / 10 + this.power + 0.5;
      const angle = (this.random(0) / 26 + this.angle) * 3.14159 / 2;
      const vx = speed * Math.cos(angle) * (cannon === 0 ? 1 : -1), vy = speed * Math.sin(angle);
      this.shots++; this.activity = 'aiming'; yield milliseconds(timing.basic.shotSetupCycles);
      this.activity = 'flight';
      for (let distance = Math.sign(vx); ; distance += Math.sign(vx)) {
        const height = projectileHeight(vx, vy, distance);
        const x = this.cannons[cannon] + distance, y = Math.fround(46 - height);
        if (x < 0 || y < 0 || x > 127 || y > 46) { this.activity = 'between-shots'; yield milliseconds(timing.basic.shotExitCycles); break; }
        if (this.point(x, y)) { yield* this.impact(x, y); break; }
        this.plot(this.previousPoint.x, this.previousPoint.y, false);
        this.plot(x, y, true); this.previousPoint = { x, y }; yield milliseconds(timing.basic.flightCycles);
      }
      // The original leaves the last plotted point when a shot exits the field.
    }
  }
}
