type Layout={x:number;y:number;width:number;height:number;collapsed:boolean;opacity:number};
/** A persistent overlay. Pointer gestures never reach the playfield. */
export function createPalette(host:HTMLElement,body:HTMLElement,title:string,onInteract:()=>void){
  const storageKey='cc80.castles.palette.v1';
  const panel=document.createElement('aside');panel.className='floating-palette';panel.setAttribute('aria-label',`${title} controls`);
  panel.innerHTML='<header class="palette-title"><button type="button" class="palette-grip" aria-label="Move controls" title="Drag to move; arrow keys move the panel"></button><button type="button" class="palette-collapse" aria-label="Collapse controls" aria-expanded="true">−</button></header><div class="palette-body"></div><button type="button" class="palette-resize" aria-label="Resize controls" title="Drag to resize; arrow keys resize the panel">↘</button>';
  const grip=panel.querySelector<HTMLButtonElement>('.palette-grip')!;grip.textContent=`${title} controls`;
  const collapse=panel.querySelector<HTMLButtonElement>('.palette-collapse')!,resize=panel.querySelector<HTMLButtonElement>('.palette-resize')!;
  const content=panel.querySelector<HTMLElement>('.palette-body')!;content.append(body);
  const opacityLabel=document.createElement('label');opacityLabel.className='palette-opacity';
  opacityLabel.innerHTML='Panel opacity <input type="range" aria-label="Panel opacity" min="55" max="100" value="88"><output>88%</output>';
  content.append(opacityLabel);const opacity=opacityLabel.querySelector('input')!,opacityOutput=opacityLabel.querySelector('output')!;
  host.append(panel);
  let state:Layout={x:12,y:12,width:250,height:380,collapsed:host.clientWidth<500,opacity:88};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&['x','y','width','height','opacity'].every(k=>Number.isFinite(saved[k]))&&typeof saved.collapsed==='boolean')state=saved;}catch{}
  let gesture:{id:number;kind:'move'|'resize';x:number;y:number;layout:Layout;handle:HTMLElement}|null=null;
  let wasFullscreen=document.fullscreenElement===host;
  let normalPosition:{x:number;y:number}|null=null;
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(normalPosition?{...state,...normalPosition}:state));}catch{}};
  function layout(){
    const fullscreen=document.fullscreenElement===host;
    if(fullscreen&&!wasFullscreen)normalPosition={x:state.x,y:state.y};
    else if(!fullscreen&&wasFullscreen&&normalPosition){state.x=normalPosition.x;state.y=normalPosition.y;normalPosition=null;}
    wasFullscreen=fullscreen;
    const maxW=Math.max(100,(fullscreen?host.clientWidth:document.documentElement.clientWidth)-16);
    const maxH=Math.max(44,(fullscreen?host.clientHeight:window.innerHeight)-16);
    state.width=Math.max(Math.min(210,maxW),Math.min(state.width,maxW));
    state.height=Math.max(Math.min(180,maxH),Math.min(state.height,maxH));
    state.opacity=Math.max(55,Math.min(100,state.opacity));
    const height=state.collapsed?42:state.height;
    const rect=host.getBoundingClientRect();
    const originX=rect.left+host.clientLeft,originY=rect.top+window.scrollY+host.clientTop;
    const minX=fullscreen?8:8-originX,minY=fullscreen?8:8-originY;
    const maxX=fullscreen?host.clientWidth-state.width-8:document.documentElement.clientWidth-state.width-8-originX;
    const maxY=fullscreen?host.clientHeight-height-8:Math.max(document.documentElement.scrollHeight,window.innerHeight)-height-8-originY;
    state.x=Math.max(minX,Math.min(state.x,maxX));
    state.y=Math.max(minY,Math.min(state.y,maxY));
    Object.assign(panel.style,{left:`${state.x}px`,top:`${state.y}px`,width:`${state.width}px`,height:`${height}px`});
    panel.style.setProperty('--palette-opacity',String(state.opacity/100));
    panel.classList.toggle('is-collapsed',state.collapsed);content.hidden=state.collapsed;resize.hidden=state.collapsed;
    collapse.textContent=state.collapsed?'+':'−';collapse.setAttribute('aria-expanded',String(!state.collapsed));collapse.setAttribute('aria-label',state.collapsed?'Expand controls':'Collapse controls');
    opacity.value=String(state.opacity);opacityOutput.value=`${state.opacity}%`;
  }
  function end(){const current=gesture;gesture=null;if(current?.handle.hasPointerCapture(current.id))current.handle.releasePointerCapture(current.id);save();}
  function begin(event:PointerEvent,kind:'move'|'resize'){
    if(!event.isPrimary||event.button!==0)return;
    event.preventDefault();event.stopPropagation();onInteract();end();
    const handle=event.currentTarget as HTMLElement;handle.focus();
    gesture={id:event.pointerId,kind,x:event.clientX,y:event.clientY,layout:{...state},handle};handle.setPointerCapture(event.pointerId);
  }
  function move(event:PointerEvent){
    if(!gesture||gesture.id!==event.pointerId)return;event.preventDefault();event.stopPropagation();
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(gesture.kind==='move'){state.x=gesture.layout.x+dx;state.y=gesture.layout.y+dy;}
    else{state.width=gesture.layout.width+dx;state.height=gesture.layout.height+dy;}
    layout();
  }
  grip.onpointerdown=e=>begin(e,'move');resize.onpointerdown=e=>begin(e,'resize');
  for(const handle of [grip,resize]){
    handle.onpointermove=move;handle.onpointerup=end;handle.onpointercancel=end;handle.onlostpointercapture=()=>{if(gesture?.handle===handle)end();};
    handle.onkeydown=event=>{if(!event.key.startsWith('Arrow'))return;event.preventDefault();event.stopPropagation();onInteract();
      const step=event.shiftKey?1:10,dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;
      if(handle===grip){state.x+=dx;state.y+=dy;}else{state.width+=dx;state.height+=dy;}layout();save();};
  }
  panel.onpointerdown=event=>{event.stopPropagation();onInteract();};
  panel.onpointermove=event=>event.stopPropagation();panel.onpointerup=event=>event.stopPropagation();
  collapse.onclick=()=>{onInteract();state.collapsed=!state.collapsed;layout();save();};
  opacity.oninput=()=>{state.opacity=Number(opacity.value);layout();save();};
  const observer=new ResizeObserver(()=>{layout();});observer.observe(host);layout();
  const fullscreenChange=()=>layout();
  document.addEventListener('fullscreenchange',fullscreenChange);window.addEventListener('resize',layout);
  const blur=()=>end();window.addEventListener('blur',blur);
  return {element:panel,dispose(){end();observer.disconnect();document.removeEventListener('fullscreenchange',fullscreenChange);window.removeEventListener('resize',layout);window.removeEventListener('blur',blur);panel.remove();}};
}
