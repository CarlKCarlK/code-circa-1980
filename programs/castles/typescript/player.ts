import {Castles} from './engine.ts';
import {createPalette} from './palette.ts';
import {StrokeGuide,screenCell,paintStroke} from './pointer.ts';
import type {Cell,Tool} from './pointer.ts';
/** Browser adapter only; all rules live in engine.ts. */
export async function createPlayer(host: HTMLElement, _url: string, status: HTMLElement, title: string) {
  const game = new Castles();
  const canvas = document.createElement('canvas'); canvas.width = 532; canvas.height = 404;
  canvas.setAttribute('aria-label', `${title} TypeScript playing field`);
  const wrapper = document.createElement('div'); wrapper.append(canvas); host.replaceChildren(wrapper);
  host.tabIndex = 0; host.setAttribute('role', 'group'); host.setAttribute('aria-label', `${title} TypeScript player. Focus here to use the game keys.`);
  const ctx = canvas.getContext('2d')!;
  let paused = false, disposed = false, previous = 0, elapsed = 0, handle = 0;
  const tools = document.createElement('div'); tools.className = 'drawing-tools';
  tools.innerHTML = '<label><input type="checkbox" checked> Mouse controls</label><div role="group" aria-label="Mouse tool"><button type="button" data-tool="draw" aria-pressed="true">Draw</button><button type="button" data-tool="erase" aria-pressed="false">Erase</button></div>';
  const feedback = document.createElement('p'); feedback.className = 'drawing-feedback'; feedback.setAttribute('role','status'); feedback.setAttribute('aria-live','polite');
  const directionLabel=document.createElement('label');directionLabel.innerHTML='Direction <select aria-label="Drawing direction"><option value="grid">Grid assist</option><option value="diagonal">Diagonal</option><option value="free">Free</option></select>';
  const direction=directionLabel.querySelector('select')!;
  const guideHint=document.createElement('p');guideHint.className='small';guideHint.textContent='Grid assist steadies vertical, horizontal, and one-column-per-row diagonals. Choose Diagonal to lock a clean one-column-per-row line; Free removes snapping.';
  const launch=document.createElement('button');launch.textContent='Start bombardment';launch.type='button';
  const building=document.createElement('div');building.append(...tools.childNodes,directionLabel,guideHint,launch,feedback);tools.append(building);
  const cannons=document.createElement('div');cannons.hidden=true;
  cannons.innerHTML='<p>Adjust before the next shot.</p><label>Power <input aria-label="Cannon power" type="range" min="0" max="9" value="0"><output>0</output></label><label>Angle <input aria-label="Cannon angle" type="range" min="0" max="25" value="0"><output>A</output></label>';
  const backToBuild=document.createElement('button');backToBuild.type='button';backToBuild.textContent='Return to building';
  cannons.append(backToBuild);tools.append(cannons);
  backToBuild.onclick=()=>{release();game.beginBuilding();elapsed=previous=0;draw(performance.now());};
  const session=document.createElement('div');session.className='palette-session';
  for(const id of ['pause','restart','fullscreen']){const button=document.getElementById(id);if(button)session.append(button);}
  tools.append(session);
  const palette=createPalette(host,tools,title,()=>{stopStroke();hover=null;game.release();});
  launch.onclick=()=>{press('q',true);press('q',false);};
  for(const input of cannons.querySelectorAll('input'))input.oninput=()=>{
    const key=input.getAttribute('aria-label')==='Cannon power'?input.value:String.fromCharCode(97+Number(input.value));
    game.setCannonSetting(input.getAttribute('aria-label')==='Cannon power'?'power':'angle',Number(input.value));input.nextElementSibling!.textContent=key.toUpperCase();
  };
  const enabled = tools.querySelector<HTMLInputElement>('input[type=checkbox]')!;
  const toolButtons = [...tools.querySelectorAll<HTMLButtonElement>('button[data-tool]')];
  let tool:Tool='draw', pointerActive=false, launchPending=false, hover:Cell|null=null;
  let stroke:{id:number; tool:Tool; last:Cell|null;guide:StrokeGuide|null}|null=null;
  let lastUi='';
  const hint = (message:string) => {if(feedback.textContent!==message)feedback.textContent=message;};
  const defaultHint = () => !enabled.checked ? 'Mouse controls off. Use the original keyboard controls.' : tool==='erase' ? 'Drag to erase exposed blocks, starting at the top. Choose Draw to build again.' : tool==='move' ? 'Move: position the cursor without changing blocks.' : 'Drag to draw. Right-drag erases temporarily. Blocks need support; erase from the top down.';
  function stopStroke() {
    const id=stroke?.id; stroke=null;
    if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  function syncTools() {
    const available=game.phase==='building'&&!paused&&!launchPending;
    const state=`${available}/${enabled.checked}/${tool}/${game.phase}/${launchPending}/${paused}`;
    if(state===lastUi)return;lastUi=state;
    backToBuild.disabled=paused;
    enabled.disabled=!available;direction.disabled=!available;launch.disabled=!available;
    building.hidden=game.phase!=='building';cannons.hidden=game.phase!=='bombarding';
    for(const input of cannons.querySelectorAll('input'))input.disabled=paused;
    for(const button of toolButtons){button.disabled=!available||!enabled.checked;button.setAttribute('aria-pressed',String(button.dataset.tool===tool));}
    canvas.style.touchAction=available&&enabled.checked?'none':'auto';
    canvas.style.cursor=available&&enabled.checked?'crosshair':'default';
    if(!available){stopStroke();hover=null;hint(paused?'Resume to draw or erase.':launchPending?'Starting bombardment…':'Choose Return to building to edit the structure again.');}
    else hint(defaultHint());
  }
  function activatePointer() {
    if(!pointerActive){game.release();game.mode='move';pointerActive=true;}
  }
  function pointerAt(event:PointerEvent):Cell|null {return screenCell(event.clientX,event.clientY,canvas.getBoundingClientRect());}
  function applyPointer(cell:Cell,finish=false) {
    if(!stroke)return;
    if(direction.value!=='free'&&stroke.tool!=='move'){
      stroke.guide??=new StrokeGuide(cell,direction.value==='diagonal');cell=stroke.guide.update(cell,finish);
    }
    hover=cell;
    const blocked=paintStroke(game,stroke.last??cell,cell,stroke.tool);stroke.last=cell;
    hint(blocked==='unsupported'?'Needs support below or diagonally below.':blocked==='protected'?'Erase from the top: a block directly or diagonally above prevents removal.':stroke.tool==='move'?'Move: cursor only.':stroke.tool==='erase'?'Erasing: remove exposed blocks from the top down.':defaultHint());
  }
  canvas.onpointerdown=event=>{
    host.focus({preventScroll:true});
    if(!event.isPrimary||!enabled.checked||paused||launchPending||game.phase!=='building'||![0,2].includes(event.button))return;
    event.preventDefault();stopStroke();activatePointer();hover=pointerAt(event);
    stroke={id:event.pointerId,tool:event.button===2?'erase':tool,last:null,guide:null};
    canvas.setPointerCapture(event.pointerId);if(hover)applyPointer(hover);
  };
  canvas.onpointermove=event=>{
    if(!event.isPrimary||!enabled.checked||paused||launchPending||game.phase!=='building')return;
    if(stroke&&!(event.buttons&3))stopStroke();
    activatePointer();hover=pointerAt(event);
    if(hover){game.cursor={...hover};if(stroke?.id===event.pointerId)applyPointer(hover);else hint(defaultHint());}
    else if(stroke){stroke.last=null;stroke.guide=null;}
  };
  canvas.onpointerup=event=>{if(stroke?.id===event.pointerId){const cell=pointerAt(event);if(cell)applyPointer(cell,true);stopStroke();}};
  canvas.onpointercancel=()=>{stopStroke();hover=null;};
  canvas.onlostpointercapture=event=>{if(stroke?.id===event.pointerId)stopStroke();};
  canvas.onpointerleave=()=>{hover=null;if(stroke){stroke.last=null;stroke.guide=null;}};
  canvas.oncontextmenu=event=>{if(enabled.checked&&!paused&&game.phase==='building')event.preventDefault();};
  for(const button of toolButtons)button.onclick=()=>{
    release();tool=button.dataset.tool as Tool;pointerActive=true;game.mode='move';syncTools();host.focus({preventScroll:true});
  };
  enabled.onchange=()=>{release();pointerActive=false;game.mode='move';syncTools();};
  function release() {stopStroke();hover=null;pointerActive=false;launchPending=false;game.release();}
  const press = (key: string, down: boolean) => {
    if(paused||disposed)return;
    if(down){
      stopStroke();hover=null;
      if(pointerActive){game.release();game.mode=tool;pointerActive=false;}
      const selected=({'8':'draw','9':'erase'} as Record<string,Tool>)[key];if(selected){tool=selected;syncTools();}
    }
    game.key(key,down);
    if(down&&key.toLowerCase()==='q'&&game.phase==='building'){launchPending=true;syncTools();}
  };
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
    if(game.phase==='building'&&pointerActive&&hover&&enabled.checked&&!paused){
      const activeTool=stroke?.tool??tool;const result=activeTool==='move'?'unchanged':game.editStatus(hover.x,hover.y,activeTool);
      ctx.strokeStyle=result==='unsupported'||result==='protected'?'#f29d8b':activeTool==='erase'?'#f2d490':'#c1eca8';
      ctx.lineWidth=1;ctx.strokeRect(10+hover.x*4+.5,10+hover.y*8+.5,3,7);
    } else if (game.phase === 'building' && Math.floor(time / 300) % 2 === 0) {
      const {x,y} = game.cursor; ctx.fillStyle = game.point(x,y) ? '#334843' : '#e6e7fc'; ctx.fillRect(10+x*4, 10+y*8, 4, 8);
    }
    const buildMode=pointerActive&&enabled.checked ? stroke?.tool??tool : game.mode;
    const description = game.phase === 'building' ? `Building · ${buildMode}` : `Bombardment · shot ${game.shots} · power ${Math.round(game.power*10)} · angle ${String.fromCharCode(65+Math.round(game.angle*26))}`;
    if(game.phase!=='building')launchPending=false;
    syncTools();
    const settings=game.cannonSettings();
    for(const input of cannons.querySelectorAll('input')){
      const power=input.getAttribute('aria-label')==='Cannon power',value=power?settings.power:settings.angle;
      input.value=String(value);input.nextElementSibling!.textContent=power?String(value):String.fromCharCode(65+value);
    }
    status.textContent = paused ? 'Paused' : game.phase === 'error' ? `Stopped: ${game.error}. Restart to begin again.` : `TypeScript · ${description}`;
  }
  function frame(time: number) {
    if (disposed) return;
    if (!paused) {
      if (previous) elapsed += Math.min(time-previous, 250);
      let interval = game.stepMs;
      while (elapsed >= interval) {elapsed -= interval; game.step(); interval = game.stepMs;}
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
    restart() {release();game.reset();tool='draw';paused=false;elapsed=previous=0;draw(performance.now());},
    snapshot() {return [...game.screen];},
    diagnostics() {return {ticks:game.ticks, paused, held:[...game.held], phase:game.phase, mode:game.mode, pointerTool:tool, mouseControls:enabled.checked,direction:direction.value, dragging:!!stroke, cursor:{...game.cursor}, shots:game.shots,cannonSettings:game.cannonSettings(), activity:game.activity, stepMs:game.stepMs, error:game.error};},
    dispose() {disposed=true; release(); cancelAnimationFrame(handle);
      palette.dispose();
      canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=canvas.onpointerleave=null;canvas.oncontextmenu=null;
      document.removeEventListener('keydown',keydown); document.removeEventListener('keyup',keyup);
      host.removeEventListener('blur',release); window.removeEventListener('blur',release); document.removeEventListener('visibilitychange',visibility);}
  };
}
