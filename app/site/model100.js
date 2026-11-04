import engineUrl from '../vendor/virtualt/virtualt.js?url';
import wasmUrl from '../vendor/virtualt/virtualt.wasm?url';
import license from '../vendor/virtualt/src/LICENSE?raw';
import {model100Payload} from './model100-payload.js';

// VirtualT runs in its own document so its SDL listeners, timers, and WASM heap
// are torn down together on restart/navigation. Only this focused host forwards
// keys. The original 8085 CPU and Model 100 firmware execute the tokenized save.
export async function createPlayer(host,url,status,title) {
  const [response,engineResponse]=await Promise.all([fetch(url),fetch(engineUrl)]);
  if(!response.ok||!engineResponse.ok)throw Error('Could not load Model 100 program/emulator');
  const payload=model100Payload(new Uint8Array(await response.arrayBuffer()));
  const upstream=await engineResponse.text();
  const needle='let innerFunc = () => new Promise((resolve) => setTimeout(resolve, ms));';
  if(upstream.split(needle).length!==2)throw Error('Unexpected VirtualT sleep implementation');
  const engine=upstream.replace(needle,`let innerFunc = () => new Promise((resolve) => setTimeout(function tick() {
    if (window.collectionPaused) setTimeout(tick, 16);
    else { window.collectionFrames++; resolve(); }
  }, ms));`);
  if(!host.isConnected)throw Error('Navigation canceled Model 100 startup');
  const dock=document.getElementById('control-dock');
  let frame=document.createElement('iframe');
  const notices=document.createElement('details');notices.className='model100-notices';
  const summary=document.createElement('summary');summary.textContent='Model 100 emulator credits';
  const text=document.createElement('pre');text.textContent=license;
  notices.append(summary,text);host.replaceChildren(frame,dock,notices);
  host.setAttribute('aria-label',`${title} Model 100 emulator. Focus here to use the keys.`);
  let paused=false,disposed=false,generation=0,typing=false;
  const held=new Map();
  const pressedAt=new Map(),releaseTimers=new Map();
  const keyCodes={Enter:13,Backspace:8,Tab:9,Escape:27,Shift:16,Control:17,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Pause:19,' ':32,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119};
  const punctuation={'-':189,'=':187,'[':219,']':221,'\\':220,';':186,"'":222,',':188,'.':190,'/':191,'`':192};
  const shifted='~!@#$%^&*()_+{}|:"<>?',unshifted='`1234567890-=[]\\;\',./';
  function eventKey(key,down,shift=false) {
    const win=frame.contentWindow;if(!win?.Module?._gx_ram_ptr)return;
    const code=keyCodes[key]??punctuation[key]??key.toUpperCase().charCodeAt(0);
    const physical=/^[a-z]$/i.test(key)?`Key${key.toUpperCase()}`:/^[0-9]$/.test(key)?`Digit${key}`:
      ({' ':'Space',Shift:'ShiftLeft',Control:'ControlLeft','-':'Minus','=':'Equal','[':'BracketLeft',']':'BracketRight','\\':'Backslash',';':'Semicolon',"'":'Quote',',':'Comma','.':'Period','/':'Slash','`':'Backquote'}[key]??key);
    win.document.querySelector('canvas').dispatchEvent(new win.KeyboardEvent(down?'keydown':'keyup',{key,code:physical,keyCode:code,which:code,shiftKey:shift,bubbles:true,cancelable:true}));
  }
  function release(){for(const timer of releaseTimers.values())clearTimeout(timer);releaseTimers.clear();pressedAt.clear();for(const [key,shift]of held)eventKey(key,false,shift);eventKey('Shift',false);held.clear();}
  function press(key,down){
    if(disposed||paused)return;
    if(down){if(held.has(key))return;held.set(key,false);pressedAt.set(key,performance.now());eventKey(key,true);}
    else if(held.has(key)){
      // A browser key tap can be shorter than one emulated keyboard scan.
      const delay=Math.max(0,80-(performance.now()-(pressedAt.get(key)??0)));
      clearTimeout(releaseTimers.get(key));releaseTimers.set(key,setTimeout(()=>{eventKey(key,false);held.delete(key);pressedAt.delete(key);releaseTimers.delete(key);},delay));
    }
  }
  function restart(){
    release();generation++;typing=false;paused=false;
    const replacement=document.createElement('iframe');replacement.className='model100-frame';replacement.title=`${title} — original Model 100`;replacement.tabIndex=-1;
    frame.replaceWith(replacement);frame=replacement;
    const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html><head><style>html,body{margin:0;background:#8fb89a;overflow:hidden}canvas{width:100%;height:auto;display:block;image-rendering:pixelated}</style></head><body><canvas aria-label="Original Model 100 LCD" id="canvas" width="720" height="192"></canvas></body></html>');doc.close();
    const win=frame.contentWindow;win.collectionPaused=false;win.collectionFrames=0;
    win.Module={canvas:doc.querySelector('canvas'),locateFile:()=>new URL(wasmUrl,location.href).href,
      preRun:[()=>win.Module.FS.writeFile('/game.ba',payload)],
      printErr:message=>console.warn('VirtualT:',message),
      onAbort:message=>{status.textContent=`Model 100 stopped: ${message}`;}};
    const script=doc.createElement('script');script.textContent=engine;doc.body.append(script);
    // Mouse interaction returns focus to the collection host; SDL receives only
    // forwarded keys, and cannot capture the answer field or collection links.
    doc.addEventListener('pointerdown',()=>host.focus({preventScroll:true}));
    status.textContent='Running original Model 100 BASIC · click the screen to use the keys';
  }
  function togglePause(){release();generation++;typing=false;paused=!paused;frame.contentWindow.collectionPaused=paused;status.textContent=paused?'Paused':'Running original Model 100 BASIC';host.dispatchEvent(new CustomEvent('playerpause',{detail:paused}));}
  async function type(value){
    if(disposed||paused||typing)return;
    const token=generation;typing=true;
    const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    try {for(let key of value.replace(/\r\n?/g,'\n')){
      if(disposed||paused||token!==generation)break;
      if(key==='\n')key='Enter';
      const index=shifted.indexOf(key),shift=index>=0||/^[A-Z]$/.test(key);
      if(index>=0)key=unshifted[index];else if(/^[A-Z]$/.test(key))key=key.toLowerCase();
      if(shift)eventKey('Shift',true);held.set(key,shift);eventKey(key,true,shift);
      await wait(90);if(disposed||token!==generation)break;eventKey(key,false,shift);held.delete(key);if(shift)eventKey('Shift',false);
      await wait(70);
    }}finally{if(token===generation){release();typing=false;}}
  }
  const down=e=>{
    if(document.activeElement!==host||e.metaKey||e.altKey||e.ctrlKey||e.key==='Tab')return;
    if(e.key.length===1||keyCodes[e.key]){e.preventDefault();if(e.repeat)return;press(e.key,true);}
  };
  const up=e=>{if(held.has(e.key)){e.preventDefault();press(e.key,false);}};
  const paste=e=>{if(document.activeElement===host){e.preventDefault();type(e.clipboardData.getData('text'));}};
  const blur=()=>{release();generation++;typing=false;};
  const visibility=()=>{if(document.hidden&&!paused)togglePause();};
  document.addEventListener('keydown',down);document.addEventListener('keyup',up);document.addEventListener('paste',paste);
  host.addEventListener('blur',blur);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  const readMemory=address=>{const m=frame.contentWindow?.Module;return m?._gx_ram_ptr?m.HEAPU8[m._gx_ram_ptr()+address-0x8000]:0;};
  restart();
  return {cacheable:false,press,release,type,restart,togglePause,keys:names=>type(names.map(n=>n==='Enter'?'\n':n).join('')),
    get paused(){return paused;},get typing(){return typing;},hasWork:()=>false,
    // The ROM's text LCD mirror is 40 columns by 8 rows at FE00.
    snapshot:()=>Array.from({length:320},(_,i)=>readMemory(0xfe00+i)),readMemory,
    diagnostics:()=>({model:'Model 100',frames:frame.contentWindow?.collectionFrames??0,paused,held:[...held.keys()]}),
    dispose(){release();disposed=true;generation++;frame.remove();document.removeEventListener('keydown',down);document.removeEventListener('keyup',up);document.removeEventListener('paste',paste);host.removeEventListener('blur',blur);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);}
  };
}
