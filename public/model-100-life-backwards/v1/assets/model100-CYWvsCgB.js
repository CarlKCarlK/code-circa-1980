var e=new URL(`virtualt-CHiBXa60.js`,import.meta.url).href,t=new URL(`virtualt-AiL3Ufaf.wasm`,import.meta.url).href,n=`VirtualT — Tandy TRS-80 Model 100 / 102 / 200 (and NEC PC-8201 / Kyotronic)
portable-computer emulator.

Copyright 2004 Stephen Hurd and Ken Pettit

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS \`\`AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.

--------------------------------------------------------------------------

The headless build units in this directory — frontend_sdl.c,
display_headless.c, file_headless.c, clock_headless.c and stubs.c — are
original work for the GenX-DOS project. display_headless.c, file_headless.c
and clock_headless.c are FLTK-free re-implementations / extractions of logic
from VirtualT's display.cpp, file.cpp and clock.cpp respectively, and are
offered under the same terms as the VirtualT copyright above.

Upstream VirtualT: https://sourceforge.net/projects/virtualt/
`;function r(e){if(e.length<27||e[0]!==141||e.slice(1).reduce((e,t)=>e+t,0)%256!=0)throw Error(`Invalid Model 100 cassette block/checksum`);if(!e.slice(-20).every(e=>e===0))throw Error(`Invalid Model 100 cassette trailer`);let t=e.slice(1,-21),n=0,r=-1,i;for(;n<t.length;){if(n+5>t.length)throw Error(`Truncated Model 100 record`);let e=t[n]|t[n+1]<<8,a=t[n+2]|t[n+3]<<8,o=t.indexOf(0,n+4);if(o<0||a<=r||!e)throw Error(`Invalid Model 100 record`);let s=e-(o+1);if(i!==void 0&&i!==s)throw Error(`Inconsistent Model 100 line pointers`);i=s,r=a,n=o+1}let a=new Uint8Array(t.length+2);return a.set(t),a}async function i(i,a,o,s){let[c,l]=await Promise.all([fetch(a),fetch(e)]);if(!c.ok||!l.ok)throw Error(`Could not load Model 100 program/emulator`);let u=r(new Uint8Array(await c.arrayBuffer())),d=await l.text(),f=`let innerFunc = () => new Promise((resolve) => setTimeout(resolve, ms));`;if(d.split(f).length!==2)throw Error(`Unexpected VirtualT sleep implementation`);let p=d.replace(f,`let innerFunc = () => new Promise((resolve) => setTimeout(function tick() {
    if (window.collectionPaused) setTimeout(tick, 16);
    else { window.collectionFrames++; resolve(); }
  }, ms));`);if(!i.isConnected)throw Error(`Navigation canceled Model 100 startup`);let m=document.getElementById(`control-dock`),h=document.createElement(`iframe`),g=document.createElement(`details`);g.className=`model100-notices`;let _=document.createElement(`summary`);_.textContent=`Model 100 emulator credits`;let v=document.createElement(`pre`);v.textContent=n,g.append(_,v),i.replaceChildren(h,m,g),i.setAttribute(`aria-label`,`${s} Model 100 emulator. Focus here to use the keys.`);let y=!1,b=!1,x=0,S=!1,C=new Map,w=new Map,T=new Map,E={Enter:13,Backspace:8,Tab:9,Escape:27,Shift:16,Control:17,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Pause:19," ":32,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119},D={"-":189,"=":187,"[":219,"]":221,"\\":220,";":186,"'":222,",":188,".":190,"/":191,"`":192};function O(e,t,n=!1){let r=h.contentWindow;if(!r?.Module?._gx_ram_ptr)return;let i=E[e]??D[e]??e.toUpperCase().charCodeAt(0),a=/^[a-z]$/i.test(e)?`Key${e.toUpperCase()}`:/^[0-9]$/.test(e)?`Digit${e}`:{" ":`Space`,Shift:`ShiftLeft`,Control:`ControlLeft`,"-":`Minus`,"=":`Equal`,"[":`BracketLeft`,"]":`BracketRight`,"\\":`Backslash`,";":`Semicolon`,"'":`Quote`,",":`Comma`,".":`Period`,"/":`Slash`,"`":`Backquote`}[e]??e;r.document.querySelector(`canvas`).dispatchEvent(new r.KeyboardEvent(t?`keydown`:`keyup`,{key:e,code:a,keyCode:i,which:i,shiftKey:n,bubbles:!0,cancelable:!0}))}function k(){for(let e of T.values())clearTimeout(e);T.clear(),w.clear();for(let[e,t]of C)O(e,!1,t);O(`Shift`,!1),C.clear()}function A(e,t){if(!(b||y)){if(t){if(C.has(e))return;C.set(e,!1),w.set(e,performance.now()),O(e,!0)}else if(C.has(e)){let t=Math.max(0,80-(performance.now()-(w.get(e)??0)));clearTimeout(T.get(e)),T.set(e,setTimeout(()=>{O(e,!1),C.delete(e),w.delete(e),T.delete(e)},t))}}}function j(){k(),x++,S=!1,y=!1;let e=document.createElement(`iframe`);e.className=`model100-frame`,e.title=`${s} — original Model 100`,e.tabIndex=-1,h.replaceWith(e),h=e;let n=h.contentDocument;n.open(),n.write(`<!doctype html><html><head><style>html,body{margin:0;background:#8fb89a;overflow:hidden}canvas{width:100%;height:auto;display:block;image-rendering:pixelated}</style></head><body><canvas aria-label="Original Model 100 LCD" id="canvas" width="720" height="192"></canvas></body></html>`),n.close();let r=h.contentWindow;r.collectionPaused=!1,r.collectionFrames=0,r.Module={canvas:n.querySelector(`canvas`),locateFile:()=>new URL(t,location.href).href,preRun:[()=>r.Module.FS.writeFile(`/game.ba`,u)],printErr:e=>console.warn(`VirtualT:`,e),onAbort:e=>{o.textContent=`Model 100 stopped: ${e}`}};let a=n.createElement(`script`);a.textContent=p,n.body.append(a),n.addEventListener(`pointerdown`,()=>i.focus({preventScroll:!0})),o.textContent=`Running original Model 100 BASIC · click the screen to use the keys`}function M(){k(),x++,S=!1,y=!y,h.contentWindow.collectionPaused=y,o.textContent=y?`Paused`:`Running original Model 100 BASIC`,i.dispatchEvent(new CustomEvent(`playerpause`,{detail:y}))}async function N(e){if(b||y||S)return;let t=x;S=!0;let n=e=>new Promise(t=>setTimeout(t,e));try{for(let r of e.replace(/\r\n?/g,`
`)){if(b||y||t!==x)break;r===`
`&&(r=`Enter`);let e=`~!@#$%^&*()_+{}|:"<>?`.indexOf(r),i=e>=0||/^[A-Z]$/.test(r);if(e>=0?r="`1234567890-=[]\\;',./"[e]:/^[A-Z]$/.test(r)&&(r=r.toLowerCase()),i&&O(`Shift`,!0),C.set(r,i),O(r,!0,i),await n(90),b||t!==x)break;O(r,!1,i),C.delete(r),i&&O(`Shift`,!1),await n(70)}}finally{t===x&&(k(),S=!1)}}let P=e=>{if(!(document.activeElement!==i||e.metaKey||e.altKey||e.ctrlKey||e.key===`Tab`)&&(e.key.length===1||E[e.key])){if(e.preventDefault(),e.repeat)return;A(e.key,!0)}},F=e=>{C.has(e.key)&&(e.preventDefault(),A(e.key,!1))},I=e=>{document.activeElement===i&&(e.preventDefault(),N(e.clipboardData.getData(`text`)))},L=()=>{k(),x++,S=!1},R=()=>{document.hidden&&!y&&M()};document.addEventListener(`keydown`,P),document.addEventListener(`keyup`,F),document.addEventListener(`paste`,I),i.addEventListener(`blur`,L),window.addEventListener(`blur`,L),document.addEventListener(`visibilitychange`,R);let z=e=>{let t=h.contentWindow?.Module;return t?._gx_ram_ptr?t.HEAPU8[t._gx_ram_ptr()+e-32768]:0};return j(),{cacheable:!1,press:A,release:k,type:N,restart:j,togglePause:M,keys:e=>N(e.map(e=>e===`Enter`?`
`:e).join(``)),get paused(){return y},get typing(){return S},hasWork:()=>!1,snapshot:()=>Array.from({length:320},(e,t)=>z(65024+t)),readMemory:z,diagnostics:()=>({model:`Model 100`,frames:h.contentWindow?.collectionFrames??0,paused:y,held:[...C.keys()]}),dispose(){k(),b=!0,x++,h.remove(),document.removeEventListener(`keydown`,P),document.removeEventListener(`keyup`,F),document.removeEventListener(`paste`,I),i.removeEventListener(`blur`,L),window.removeEventListener(`blur`,L),document.removeEventListener(`visibilitychange`,R)}}}export{i as createPlayer};