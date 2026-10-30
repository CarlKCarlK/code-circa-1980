import {Castles} from './engine.ts';
import {patterns} from './patterns.ts';
import {saveBrickPng,loadBricks,placeBricks} from './bricks.ts';
import {previewPicture} from './picture-import.ts';
import {createPalette} from './palette.ts';
import {StrokeGuide,screenCell,paintStroke} from './pointer.ts';
import type {Cell,Tool} from './pointer.ts';
/** Browser adapter only; all rules live in engine.ts. */
export async function createPlayer(host: HTMLElement, _url: string, status: HTMLElement, title: string) {
  const game = new Castles();
  const background='#1e4b8f';
  const canvas = document.createElement('canvas'); canvas.width = 532; canvas.height = 404;
  canvas.setAttribute('aria-label', `${title} TypeScript playing field`);
  const wrapper = document.createElement('div'); wrapper.append(canvas); host.replaceChildren(wrapper);
  host.tabIndex = 0; host.setAttribute('role', 'group'); host.setAttribute('aria-label', `${title} TypeScript player. Focus here to use the game keys.`);
  const ctx = canvas.getContext('2d')!;
  let paused = false, disposed = false, previous = 0, elapsed = 0, handle = 0;
  let previewing=false, importAbort:AbortController|null=null;
  let importFall:Generator<number>|null=null,fallWait=0;
  const dock=document.getElementById('control-dock')!;host.append(dock);
  const tools = document.createElement('div'); tools.className = 'drawing-tools';
  tools.innerHTML = '<div role="group" aria-label="Mouse tool"><button type="button" data-tool="draw" aria-pressed="true">Draw</button><button type="button" data-tool="erase" aria-pressed="false">Erase</button></div>';
  const feedback = document.createElement('p'); feedback.className = 'drawing-feedback'; feedback.setAttribute('role','status'); feedback.setAttribute('aria-live','polite');
  const directionLabel=document.createElement('label');directionLabel.innerHTML='Direction <select aria-label="Drawing direction"><option value="grid">Grid assist</option><option value="diagonal">Diagonal</option><option value="free">Free</option></select>';
  const direction=directionLabel.querySelector('select')!;
  const guideHint=document.createElement('p');guideHint.className='small';guideHint.textContent='Grid assist keeps strokes straight. Diagonal locks a clean diagonal; Free turns snapping off.';
  const launch=document.createElement('button');launch.textContent='Fire cannons';launch.type='button';launch.className='launch';
  const building=document.createElement('div');building.className='build-panel';building.append(...tools.childNodes,feedback,launch);tools.append(building);
  const scene=document.createElement('div');scene.className='scene-picker';
  const patternLabel=document.createElement('label');patternLabel.textContent='Start from ';
  const patternSelect=document.createElement('select');patternSelect.setAttribute('aria-label','Starting scene');
  // Works as a menu: choosing an item acts at once, then the menu returns to its prompt.
  patternSelect.innerHTML='<option value="">Choose a scene…</option>';
  for(const pattern of patterns){const option=document.createElement('option');option.value=pattern.id;option.textContent=pattern.label;patternSelect.append(option);}
  patternSelect.append(new Option('Load any image…','image'));
  patternLabel.append(patternSelect);
  scene.append(patternLabel);building.append(scene);
  const advanced=document.createElement('details');advanced.className='advanced-tools';advanced.innerHTML='<summary>More options</summary>';
  const assist=document.createElement('div');assist.append(directionLabel,guideHint);advanced.append(assist);tools.append(advanced);
  patternSelect.onchange=()=>{
    const choice=patternSelect.value;patternSelect.value='';release();
    if(choice==='image'){picker.click();return;}
    const pattern=patterns.find(p=>p.id===choice);if(!pattern)return;
    if(hasWork()&&!confirm('Replace your construction with this scene?'))return;
    loadBricks(game,pattern.create());tool='draw';elapsed=previous=0;draw(performance.now());
    hint(`${pattern.label} loaded. Ready to build or fire.`);
  };
  const cannons=document.createElement('div');cannons.hidden=true;
  cannons.className='cannon-panel';
  cannons.innerHTML='<h3>Cannons firing</h3><p>Two cannons take turns automatically. Adjust power and arc to change where shots land.</p><label class="cannon-setting"><span>Power</span><input aria-label="Cannon power" type="range" min="0" max="9" value="0"><output>0</output></label><label class="cannon-setting"><span>Arc</span><input aria-label="Cannon angle" type="range" min="0" max="25" value="0"><output>0°</output></label><p class="cannon-feedback small" role="status"></p>';
  const backToBuild=document.createElement('button');backToBuild.type='button';backToBuild.textContent='Return to building';
  cannons.append(backToBuild);tools.append(cannons);
  backToBuild.onclick=()=>{release();keyboardActive=false;game.beginBuilding();elapsed=previous=0;draw(performance.now());};

  const files=document.createElement('div');files.className='palette-session';
  const save=document.createElement('button');save.type='button';save.textContent='Save as image';
  const picker=document.createElement('input');picker.type='file';picker.accept='image/*';picker.hidden=true;picker.setAttribute('aria-label','Image file');
  const fileStatus=document.createElement('p');fileStatus.setAttribute('role','status');fileStatus.className='small';
  files.append(save,picker,fileStatus);advanced.append(files);
  save.onclick=async()=>{
    release();
    const requested=prompt('Save your blocks as a PNG image. File name:', 'castles-blocks');
    if(requested===null)return;
    const filename=(requested.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').replace(/\.png$/i,'')||'castles-blocks')+'.png';
    fileStatus.textContent='Saving image…';
    try{
      const blob=await saveBrickPng(game);if(disposed)return;
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);fileStatus.textContent='Saved as a PNG image.';
    }catch(error){fileStatus.textContent=error instanceof Error?error.message:'Could not save the image.';}
  };
  picker.onchange=async()=>{
    const file=picker.files?.[0];if(!file)return;fileStatus.textContent='Loading image…';
    release();previewing=true;previous=elapsed=0;
    const controller=new AbortController();importAbort=controller;
    try{
      const mask=await previewPicture(file,host,canvas,controller.signal,background);if(disposed)return;
      if(!mask){fileStatus.textContent='Image loading canceled.';return;}
      release();placeBricks(game,mask);importFall=game.settle(46);game.activity='settling';fallWait=0;
      tool='draw';paused=false;elapsed=previous=0;host.dispatchEvent(new CustomEvent('playerpause',{detail:false}));
      fileStatus.textContent='Image loaded; loose blocks are falling.';draw(performance.now());
    }catch{fileStatus.textContent='Could not load this image. Choose a PNG, JPEG, or other image file.';}
    finally{if(importAbort===controller)importAbort=null;previewing=false;previous=elapsed=0;picker.value='';}
  };
  const palette=createPalette(host,tools,title,()=>{stopStroke();hover=null;game.release();});
  // New players start from the original instructions' 5 + M aim (power 5, about 42°), which reaches
  // typical constructions; the BASIC starts at 0/0, so keyboard Q keeps the original behavior.
  let startingAim=false;
  launch.onclick=()=>{const {power,angle}=game.cannonSettings();startingAim=power===0&&angle===0;press('q',true);press('q',false);};
  for(const input of cannons.querySelectorAll('input'))input.oninput=()=>{
    const key=input.getAttribute('aria-label')==='Cannon power'?input.value:String.fromCharCode(97+Number(input.value));
    game.setCannonSetting(input.getAttribute('aria-label')==='Cannon power'?'power':'angle',Number(input.value));input.nextElementSibling!.textContent=input.getAttribute('aria-label')==='Cannon power'?key:`${Math.round(Number(input.value)*90/26)}°`;
  };
  const toolButtons = [...tools.querySelectorAll<HTMLButtonElement>('button[data-tool]')];
  let tool:Tool='draw', pointerActive=false, keyboardActive=false, launchPending=false, hover:Cell|null=null;
  let stroke:{id:number; tool:Tool; last:Cell|null;guide:StrokeGuide|null}|null=null;
  let lastUi='';
  const hint = (message:string) => {if(feedback.textContent!==message)feedback.textContent=message;};
  const defaultHint = () => tool==='erase' ? 'Drag down from the top to remove blocks. Choose Draw to build again.' : tool==='move' ? 'Move: position the cursor without changing blocks.' : 'Drag up from the ground to build. Each block needs one below it or diagonally below.';
  function stopStroke() {
    const id=stroke?.id; stroke=null;
    if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  function syncTools() {
    const available=game.phase==='building'&&!paused&&!launchPending&&!importFall;
    const state=`${available}/${tool}/${game.phase}/${launchPending}/${paused}/${!!importFall}`;
    if(state===lastUi)return;lastUi=state;
    save.disabled=game.phase!=='building'||!!importFall;
    patternSelect.disabled=!available;
    backToBuild.disabled=paused;
    direction.disabled=!available;launch.disabled=!available;
    building.hidden=advanced.hidden=game.phase!=='building';cannons.hidden=game.phase!=='bombarding';
    for(const input of cannons.querySelectorAll('input'))input.disabled=paused;
    for(const button of toolButtons){button.disabled=!available;button.setAttribute('aria-pressed',String(button.dataset.tool===tool));}
    canvas.style.touchAction=available?'none':'auto';
    canvas.style.cursor=available?'crosshair':'default';
    if(!available){stopStroke();hover=null;hint(paused?'Resume to continue.':importFall?'Loose blocks are falling.':launchPending?'Firing…':'Choose Return to building to edit the structure again.');}
    else hint(defaultHint());
  }
  function activatePointer() {
    keyboardActive=false;
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
    if(!event.isPrimary||!!importFall||paused||launchPending||game.phase!=='building'||![0,2].includes(event.button))return;
    event.preventDefault();stopStroke();activatePointer();hover=pointerAt(event);
    stroke={id:event.pointerId,tool:event.button===2?'erase':tool,last:null,guide:null};
    canvas.setPointerCapture(event.pointerId);if(hover)applyPointer(hover);
  };
  canvas.onpointermove=event=>{
    if(!event.isPrimary||!!importFall||paused||launchPending||game.phase!=='building')return;
    if(stroke&&!(event.buttons&3))stopStroke();
    activatePointer();hover=pointerAt(event);
    if(hover){game.cursor={...hover};if(stroke?.id===event.pointerId)applyPointer(hover);else hint(defaultHint());}
    else if(stroke){stroke.last=null;stroke.guide=null;}
  };
  canvas.onpointerup=event=>{if(stroke?.id===event.pointerId){const cell=pointerAt(event);if(cell)applyPointer(cell,true);stopStroke();}};
  canvas.onpointercancel=()=>{stopStroke();hover=null;};
  canvas.onlostpointercapture=event=>{if(stroke?.id===event.pointerId)stopStroke();};
  canvas.onpointerleave=()=>{hover=null;if(stroke){stroke.last=null;stroke.guide=null;}};
  canvas.oncontextmenu=event=>{if(!paused&&game.phase==='building')event.preventDefault();};
  for(const button of toolButtons)button.onclick=()=>{
    release();keyboardActive=false;tool=button.dataset.tool as Tool;pointerActive=true;game.mode='move';syncTools();host.focus({preventScroll:true});
  };
  function release() {stopStroke();hover=null;pointerActive=false;launchPending=false;game.release();}
  const press = (key: string, down: boolean) => {
    if(paused||disposed||importFall)return;
    if(down){
      stopStroke();hover=null;keyboardActive=true;
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
    ctx.fillStyle = background; ctx.fillRect(0, 0, 532, 404); ctx.fillStyle = '#e6e7fc';
    game.screen.forEach((code, position) => {
      if (code >= 128 && code < 192) for (let bit = 0; bit < 6; bit++) if (code & (1 << bit))
        ctx.fillRect(10 + (position % 64) * 8 + (bit % 2) * 4, 10 + Math.floor(position / 64) * 24 + Math.floor(bit / 2) * 8, 4, 8);
    });
    // Mark each cannon (a gap in the ground) in the margin below the field.
    if(game.cannons[0]){ctx.fillStyle='#f2b36b';for(const x of game.cannons){const cx=10+x*4+2;ctx.beginPath();ctx.moveTo(cx-5,403);ctx.lineTo(cx+5,403);ctx.lineTo(cx,396);ctx.fill();}}
    if(game.phase==='building'&&pointerActive&&hover&&!paused){
      const activeTool=stroke?.tool??tool;const result=activeTool==='move'?'unchanged':game.editStatus(hover.x,hover.y,activeTool);
      ctx.strokeStyle=result==='unsupported'||result==='protected'?'#f29d8b':activeTool==='erase'?'#f2d490':'#c1eca8';
      ctx.lineWidth=1;ctx.strokeRect(10+hover.x*4+.5,10+hover.y*8+.5,3,7);
    } else if (game.phase === 'building' && !importFall && keyboardActive && Math.floor(time / 300) % 2 === 0) {
      const {x,y} = game.cursor; ctx.fillStyle = game.point(x,y) ? background : '#e6e7fc'; ctx.fillRect(10+x*4, 10+y*8, 4, 8);
    }
    const buildMode=!keyboardActive ? (stroke?.tool??tool)==='erase'?'erasing':'drawing' : `keyboard ${game.mode}`;
    const description = importFall ? 'Loose blocks falling' : game.phase === 'building' ? `Building · ${buildMode}` : `Firing · shot ${game.shots}`;
    if(game.phase!=='building')launchPending=false;
    if(startingAim&&game.phase==='bombarding'){game.setCannonSetting('power',5);game.setCannonSetting('angle',12);startingAim=false;}
    syncTools();
    const settings=game.cannonSettings();
    for(const input of cannons.querySelectorAll('input')){
      const power=input.getAttribute('aria-label')==='Cannon power',value=power?settings.power:settings.angle;
      input.value=String(value);input.nextElementSibling!.textContent=power?`${value} / 9`:`${Math.round(value*90/26)}°`;
    }
    const pending=settings.power!==Math.round(game.power*10)||settings.angle!==Math.round(game.angle*26);
    const cannonMessage=pending?'Applies to the next shot.':'';
    const cannonFeedback=cannons.querySelector('.cannon-feedback')!;
    if(cannonFeedback.textContent!==cannonMessage)cannonFeedback.textContent=cannonMessage;
    const statusMessage = paused ? 'Paused' : game.phase === 'error' ? `Stopped: ${game.error}. Choose Erase all to begin again.` : description;
    if(status.textContent!==statusMessage)status.textContent=statusMessage;
  }
  function frame(time: number) {
    if (disposed) return;
    if (!paused&&!previewing) {
      if (previous) elapsed += Math.min(time-previous, 250);
      if(importFall){
        while(importFall&&elapsed>=fallWait){
          elapsed-=fallWait;const result=importFall.next();
          if(result.done){importFall=null;game.activity='building';game.stepMs=150;elapsed=0;fileStatus.textContent='Image loaded; unsupported blocks have settled.';}
          else fallWait=Math.max(.001,result.value);
        }
      }else{
        let interval = game.stepMs;
        while (elapsed >= interval) {elapsed -= interval; game.step(); interval = game.stepMs;}
      }
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
  function hasWork(){return game.phase!=='building'||game.screen.some((code,i)=>code>=128&&code<192&&(code&(i<960?63:15))!==0);}
  return {
    hasWork,
    loadStartingPattern(id:string){const pattern=patterns.find(p=>p.id===id);if(pattern){loadBricks(game,pattern.create());draw(performance.now());}},
    press, release, togglePause, get paused() {return paused;},
    restart() {release();importFall=null;game.reset();tool='draw';keyboardActive=false;paused=false;elapsed=previous=0;fileStatus.textContent='';draw(performance.now());},
    snapshot() {return [...game.screen];},
    diagnostics() {return {ticks:game.ticks, paused, held:[...game.held], phase:game.phase, mode:game.mode, pointerTool:tool,direction:direction.value, dragging:!!stroke, cursor:{...game.cursor}, shots:game.shots,cannonSettings:game.cannonSettings(), activity:game.activity, stepMs:game.stepMs, error:game.error};},
    dispose() {disposed=true; importAbort?.abort();release(); cancelAnimationFrame(handle);
      palette.dispose();
      canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=canvas.onpointerleave=null;canvas.oncontextmenu=null;
      document.removeEventListener('keydown',keydown); document.removeEventListener('keyup',keyup);
      host.removeEventListener('blur',release); window.removeEventListener('blur',release); document.removeEventListener('visibilitychange',visibility);}
  };
}
