import {Config, ModelType, BasicLevel, Keyboard, Trs80, CassettePlayer, SilentSoundPlayer} from 'trs80-emulator';
import {CanvasScreen} from 'trs80-emulator-web';
import {decodeBasicProgram} from 'trs80-base';

// Match the TypeScript field (player.ts) instead of the library's gray-green AUTHENTIC_BACKGROUND.
class CobaltScreen extends CanvasScreen { getBackgroundColor() { return '#1e4b8f'; } }

// Executes recovered tokenized BASIC through the Z80 and original BASIC ROM.
// The library relocates the in-memory line pointers on load. The source file
// and every archived byte remain unchanged.
export async function createPlayer(host, url, status, title, dependency) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load original program (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const program = decodeBasicProgram(bytes);
  if (!program || program.error) throw new Error(program?.error || 'Invalid BASIC payload.');
  let machineBytes;
  if (dependency) {
    const response=await fetch(dependency.url);
    if (!response.ok) throw Error('Could not load FALL dependency');
    machineBytes=new Uint8Array(await response.arrayBuffer());
  }
  const config = Config.makeDefault().withModelType(ModelType.MODEL3).withBasicLevel(BasicLevel.LEVEL2);
  const screen = new CobaltScreen(1);
  const keyboard = new Keyboard();
  const machine = new Trs80(config, screen, keyboard, new CassettePlayer(), new SilentSoundPlayer());
  host.replaceChildren(screen.getNode());
  host.append(document.getElementById('control-dock'));
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
  const keyup = event => { if (held.has(event.key.toLowerCase()) || held.has(event.key)) { event.preventDefault(); press(event.key, false); } };
  const visibility = () => { if (document.hidden && !paused) togglePause(); };
  const onBlur = () => release();
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);
  host.addEventListener('blur', onBlur);
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', visibility);
  function restart() {
    release(); machine.stop(); paused = false;
    machine.runBasicProgram(program);
    if (machineBytes) machine.eventScheduler.add(undefined, machine.tStateCount+machine.clockHz*0.31, () => machine.writeMemoryBlock(dependency.address,machineBytes));
    machine.start();
    status.textContent = 'Running original BASIC · click the screen to use the keys';
  }
  function togglePause() {
    release(); paused = !paused;
    if (paused) { machine.stop(); status.textContent = 'Paused'; }
    else { machine.start(); status.textContent = 'Running original BASIC'; }
    host.dispatchEvent(new CustomEvent('playerpause', {detail:paused}));
  }
  restart();
  return {
    press, release, restart, togglePause,
    hasWork(){return Array.from({length:1024},(_,i)=>machine.readMemory(0x3c00+i)).some((code,i)=>code>=128&&code<192&&(code&(i<960?63:15))!==0);},
    get paused() {return paused;},
    // Memory inspection supports reproducible browser smoke tests. It does not
    // modify the running program or expose a different gameplay implementation.
    snapshot() { return Array.from({length:1024}, (_,i) => machine.readMemory(0x3c00+i)); },
    diagnostics() {return {tStates:machine.tStateCount, paused, held:[...held]};},
    dispose() {
      disposed = true; release(); machine.stop();
      document.removeEventListener('keydown', keydown); document.removeEventListener('keyup', keyup);
      host.removeEventListener('blur', onBlur); window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', visibility);
    }
  };
}
