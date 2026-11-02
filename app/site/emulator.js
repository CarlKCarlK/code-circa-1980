import {Config, ModelType, BasicLevel, CGChip, Keyboard, Trs80, CassettePlayer, SilentSoundPlayer} from 'trs80-emulator';
import {CanvasScreen} from 'trs80-emulator-web';
import {decodeBasicProgram} from 'trs80-base';

// Match the TypeScript field (player.ts) instead of the library's gray-green AUTHENTIC_BACKGROUND.
class CobaltScreen extends CanvasScreen {
  getBackgroundColor() { return '#1e4b8f'; }
  // Every program is drawn in the Model III font, including one running on a Model I,
  // whose original character generator has blockier letters.
  setConfig(config) { super.setConfig(config.withModelType(ModelType.MODEL3).withCGChip(CGChip.LOWER_CASE)); }
}

// Model III parallel printer ports. Capture the original ROM's output without
// changing BASIC or intercepting console output from unrelated machines.
class CollectionMachine extends Trs80 {
  writePort(address, value) {
    const port=address & 0xff;
    if(this.onPrint && port>=0xf8 && port<=0xfb) this.onPrint(value);
    else super.writePort(address,value);
  }
}

// Executes recovered tokenized BASIC through the Z80 and original BASIC ROM.
// The library relocates the in-memory line pointers on load. The source file
// and every archived byte remain unchanged.
// A program can ask for a stock Model I (`model: 'MODEL1'`): its ROM shows shifted
// letters in capitals, as 1978 machines without the lowercase kit did.
export async function createPlayer(host, url, status, title, dependency, {running = 'Running original BASIC', model, printer = false} = {}) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load original program (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const program = decodeBasicProgram(bytes);
  if (!program || program.error) throw new Error(program?.error || 'Invalid BASIC payload.');
  let machineBytes;
  if (dependency) {
    const response=await fetch(dependency.url);
    if (!response.ok) throw Error('Could not load machine-code dependency');
    machineBytes=new Uint8Array(await response.arrayBuffer());
  }
  const config = model === 'MODEL1'
    ? Config.makeDefault().withModelType(ModelType.MODEL1).withBasicLevel(BasicLevel.LEVEL2).withCGChip(CGChip.ORIGINAL)
    : Config.makeDefault().withModelType(ModelType.MODEL3).withBasicLevel(BasicLevel.LEVEL2);
  const screen = new CobaltScreen(1);
  const keyboard = new Keyboard();
  const machine = new CollectionMachine(config, screen, keyboard, new CassettePlayer(), new SilentSoundPlayer());
  host.replaceChildren(screen.getNode());
  host.append(document.getElementById('control-dock'));
  let printout;
  if(printer){
    const sheet=document.createElement('details');sheet.className='printer-output';sheet.open=true;sheet.hidden=true;
    sheet.innerHTML='<summary>Printer output</summary><pre aria-label="Original printer output"></pre>';
    printout=sheet.querySelector('pre');host.append(sheet);
    machine.onPrint=value=>{
      sheet.hidden=false;
      if(value===13)printout.textContent+='\n';
      else if(value===12)printout.textContent+='\n────────\n';
      else if(value>=32&&value<127)printout.textContent+=String.fromCharCode(value);
    };
  }
  host.tabIndex = 0;
  host.setAttribute('role', 'group');
  host.setAttribute('aria-label', `${title} emulator. Focus here to use the game keys.`);
  screen.getNode().querySelector('canvas').setAttribute('aria-label', 'Original TRS-80 screen');
  let disposed = false, paused = false;
  const held = new Set();
  const release = () => { held.clear(); keyboard.keyQueue.length = 0; keyboard.clearKeyboard(); };
  const press = (key, down) => {
    if (paused || disposed) return;
    // Lower-case physical letters avoid synthesizing a held Shift key; the ROM
    // returns upper-case INKEY$ letters. PEEK-based controls still see real keys.
    key = key.length === 1 ? key.toLowerCase() : key;
    if (down) { if (held.has(key)) return; held.add(key); }
    else { if (!held.delete(key)) return; }
    keyboard.keyEvent(key, down);
  };
  const keydown = event => {
    if (document.activeElement !== host || event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;
    if (/^[ -~]$/.test(event.key) || ['Enter','Escape','Shift','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Backspace'].includes(event.key)) {
      event.preventDefault(); press(event.key, true);
    }
  };
  // Typed and pasted text goes through the ROM's keyboard routine, as if keyed in.
  // The library types capitals as Shift+letter, which a Model I stores as lowercase
  // (shown as capitals), so on a Model I letters go in unshifted, as keys do.
  const type = text => { if (!paused && !disposed) keyboard.simulateKeyboardText((model === 'MODEL1' ? text.toLowerCase() : text).replace(/\r\n?/g, '\n')); };
  // Named keys in order, each pressed and released, for keys text cannot name (Escape is BREAK).
  const keys = names => { if (!paused && !disposed) for (const key of names) { keyboard.keyEvent(key, true); keyboard.keyEvent(key, false); } };
  const paste = event => {
    if (document.activeElement !== host) return;
    event.preventDefault(); type(event.clipboardData.getData('text'));
  };
  const keyup = event => { if (held.has(event.key.toLowerCase()) || held.has(event.key)) { event.preventDefault(); press(event.key, false); } };
  const visibility = () => { if (document.hidden && !paused) togglePause(); };
  const onBlur = () => release();
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);
  document.addEventListener('paste', paste);
  host.addEventListener('blur', onBlur);
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', visibility);
  // The library's runBasicProgram types its answers on Model III timing. A Model I
  // boots differently, so answer MEMORY SIZE? and wait for READY on screen first.
  function runOnModel1() {
    machine.reset();
    const screenText = () => String.fromCharCode(...Array.from({length:1024}, (_, i) => machine.readMemory(0x3c00 + i) & 0x7f));
    let answered = false;
    const check = () => {
      const text = screenText();
      if (!answered && text.includes('MEMORY SIZE')) { keyboard.simulateKeyboardText('\n'); answered = true; }
      else if (answered && text.includes('READY')) { machine.loadBasicProgram(program); keyboard.simulateKeyboardText('RUN\n'); return; }
      machine.eventScheduler.add(undefined, machine.tStateCount + machine.clockHz * 0.05, check);
    };
    machine.eventScheduler.add(undefined, machine.tStateCount + machine.clockHz * 0.05, check);
  }
  function restart() {
    release(); machine.stop(); paused = false;
    if(printout)printout.textContent='';
    if (model === 'MODEL1') runOnModel1(); else machine.runBasicProgram(program);
    if (machineBytes) machine.eventScheduler.add(undefined, machine.tStateCount+machine.clockHz*0.31, () => machine.writeMemoryBlock(dependency.address,machineBytes));
    machine.start();
    status.textContent = `${running} · click the screen to use the keys`;
  }
  function togglePause() {
    release(); paused = !paused;
    if (paused) { machine.stop(); status.textContent = 'Paused'; }
    else { machine.start(); status.textContent = running; }
    host.dispatchEvent(new CustomEvent('playerpause', {detail:paused}));
  }
  // Optional fast mode: extra Z80 steps each animation frame, on top of the
  // machine's own real-time pacing. Speed survives Restart. While a key is held
  // the machine runs at real speed, so a normal press does not auto-repeat.
  let speed = 1, fastHandle = 0, lastFrame = 0;
  function fastFrame(time) {
    fastHandle = 0;
    if (disposed || speed <= 1) return;
    if (!paused && held.size === 0) {
      const seconds = lastFrame ? Math.min(0.1, (time - lastFrame) / 1000) : 0;
      const target = machine.tStateCount + machine.clockHz * seconds * (speed - 1);
      const deadline = performance.now() + 12;
      while (machine.tStateCount < target && performance.now() < deadline) for (let i = 0; i < 1000; i++) machine.step();
    }
    lastFrame = time;
    fastHandle = requestAnimationFrame(fastFrame);
  }
  function setSpeed(multiplier) {
    speed = multiplier; lastFrame = 0;
    cancelAnimationFrame(fastHandle); fastHandle = 0;
    if (speed > 1) fastHandle = requestAnimationFrame(fastFrame);
  }
  restart();
  return {
    press, release, restart, togglePause, type, keys, setSpeed,
    get speed() {return speed;},
    get typing() {return keyboard.keyQueue.length>0;},
    hasWork(){return Array.from({length:1024},(_,i)=>machine.readMemory(0x3c00+i)).some((code,i)=>code>=128&&code<192&&(code&(i<960?63:15))!==0);},
    get paused() {return paused;},
    // Memory inspection supports reproducible browser smoke tests. It does not
    // modify the running program or expose a different gameplay implementation.
    snapshot() { return Array.from({length:1024}, (_,i) => machine.readMemory(0x3c00+i)); },
    diagnostics() {return {tStates:machine.tStateCount, pc:machine.z80.regs.pc, paused, held:[...held]};},
    dispose() {
      disposed = true; release(); machine.stop(); cancelAnimationFrame(fastHandle);
      document.removeEventListener('keydown', keydown); document.removeEventListener('keyup', keyup); document.removeEventListener('paste', paste);
      host.removeEventListener('blur', onBlur); window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', visibility);
    }
  };
}
