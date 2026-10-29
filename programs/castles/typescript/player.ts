import {Castles} from './engine.ts';
/** Browser adapter only; all rules live in engine.ts. */
export async function createPlayer(host: HTMLElement, _url: string, status: HTMLElement, title: string) {
  const game = new Castles();
  const canvas = document.createElement('canvas'); canvas.width = 532; canvas.height = 404;
  canvas.setAttribute('aria-label', `${title} TypeScript playing field`);
  const wrapper = document.createElement('div'); wrapper.append(canvas); host.replaceChildren(wrapper);
  host.tabIndex = 0; host.setAttribute('role', 'group'); host.setAttribute('aria-label', `${title} TypeScript player. Focus here to use the game keys.`);
  const ctx = canvas.getContext('2d')!;
  let paused = false, disposed = false, previous = 0, elapsed = 0, handle = 0;
  const release = () => game.release();
  const press = (key: string, down: boolean) => { if (!paused && !disposed) game.key(key, down); };
  const keydown = (event: KeyboardEvent) => {
    if (document.activeElement !== host || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^[0-9a-z]$/i.test(event.key) || event.key === 'Shift') {event.preventDefault(); press(event.key, true);}
  };
  const keyup = (event: KeyboardEvent) => { if (game.held.has(event.key.toLowerCase())) {event.preventDefault(); press(event.key, false);} };
  function draw(time: number) {
    ctx.fillStyle = '#334843'; ctx.fillRect(0, 0, 532, 404); ctx.fillStyle = '#e6e7fc';
    game.screen.forEach((code, position) => {
      if (code >= 128 && code < 192) for (let bit = 0; bit < 6; bit++) if (code & (1 << bit))
        ctx.fillRect(10 + (position % 64) * 8 + (bit % 2) * 4, 10 + Math.floor(position / 64) * 24 + Math.floor(bit / 2) * 8, 4, 8);
    });
    if (game.phase === 'building' && Math.floor(time / 300) % 2 === 0) {
      const {x,y} = game.cursor; ctx.fillStyle = game.point(x,y) ? '#334843' : '#e6e7fc'; ctx.fillRect(10+x*4, 10+y*8, 4, 8);
    }
    const description = game.phase === 'building' ? `Building · ${game.mode}` : `Bombardment · shot ${game.shots} · power ${Math.round(game.power*10)} · angle ${String.fromCharCode(65+Math.round(game.angle*26))}`;
    status.textContent = paused ? 'Paused' : game.phase === 'error' ? `Stopped: ${game.error}. Restart to begin again.` : `TypeScript · ${description}`;
  }
  function frame(time: number) {
    if (disposed) return;
    if (!paused) {
      if (previous) elapsed += Math.min(time-previous, 250);
      let interval = game.phase === 'building' ? 150 : 20;
      while (elapsed >= interval) {game.step(); elapsed -= interval; interval = game.phase === 'building' ? 150 : 20;}
    }
    previous = time; draw(time); handle = requestAnimationFrame(frame);
  }
  function togglePause() {
    release(); paused = !paused; previous = 0; elapsed = 0;
    host.dispatchEvent(new CustomEvent('playerpause', {detail:paused})); draw(performance.now());
  }
  const visibility = () => {if (document.hidden && !paused) togglePause();};
  document.addEventListener('keydown', keydown); document.addEventListener('keyup', keyup);
  host.addEventListener('blur', release); window.addEventListener('blur', release); document.addEventListener('visibilitychange', visibility);
  draw(0); handle = requestAnimationFrame(frame);
  return {
    press, release, togglePause, get paused() {return paused;},
    restart() {game.reset(); paused=false; elapsed=previous=0; draw(performance.now());},
    snapshot() {return [...game.screen];},
    diagnostics() {return {ticks:game.ticks, paused, held:[...game.held], phase:game.phase, mode:game.mode, shots:game.shots, error:game.error};},
    dispose() {disposed=true; release(); cancelAnimationFrame(handle);
      document.removeEventListener('keydown',keydown); document.removeEventListener('keyup',keyup);
      host.removeEventListener('blur',release); window.removeEventListener('blur',release); document.removeEventListener('visibilitychange',visibility);}
  };
}
