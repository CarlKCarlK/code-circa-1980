import './style.css';
import {programs, assetUrl, provenanceUrl} from './catalog.js';

const app = document.querySelector('#app');
let player = null, navigation = 0;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const route = (program, version, play=false) => `#/program/${program.id}/${version.id}${play ? '/play' : ''}`;
const crumbs = program => `<nav aria-label="Breadcrumb"><a href="#/">Collection</a><span>/</span><span>${escape(program.title)}</span></nav>`;
function versionList(program, selected) {
 return `<details class="versions"><summary>${program.versions.length} recovered versions · development order is inferred</summary><p>${escape(program.versionOrder)}</p><ol>${program.versions.map(v=>`<li><a href="${route(program,v)}" ${selected.id===v.id?'aria-current="page"':''}>${escape(v.id.toUpperCase())} · ${escape(v.label)}</a><span class="small">${escape(v.capture)} / save ${v.save}${v.playable?'':' · source only'}</span><p>${escape(v.note)}</p></li>`).join('')}</ol></details>`;
}
async function render() {
  const thisNavigation = ++navigation;
  player?.dispose(); player = null; delete window.__circaPlayer;
  const parts=location.hash.slice(1).split('/').filter(Boolean);
  if (!parts.length) {
    document.title = 'Code Circa 1980';
    app.innerHTML=`<section class="intro"><p class="eyebrow">A software time capsule</p><h1>Code, circa 1980.<br><em>Running again.</em></h1><p class="lede">Original programs from the early days of personal computing.<br>Recovered from my tapes, one program at a time.</p></section><section aria-label="Programs" class="collection">${programs.map((p,i)=>`<a class="program-card" href="${route(p,p.versions.find(v=>v.id===p.defaultVersion))}"><div class="card-art" aria-hidden="true"><span class="castle-art">▟▙ ▟▙ ▟▙<br>██▄██▄██<br>████████<br>███  ███</span></div><div class="card-copy"><span class="eyebrow">${String(i+1).padStart(2,'0')} / ${escape(p.kind)} / Original BASIC</span><h2>${escape(p.title)} <span>↗</span></h2><p>${escape(p.description)}</p><span class="card-link">Instructions & play →</span></div></a>`).join('')}</section><p class="collection-note">A small collection, with room to grow. Games, tools, mathematics, and experiments.</p>`;
    return;
  }
  const program=programs.find(p=>parts[0]==='program' && p.id===parts[1]);
  const version=program?.versions.find(v=>v.id===(parts[2]||program.defaultVersion));
  if(!program || !version){app.innerHTML='<h1>Program not found</h1><p><a href="#/">Back to the collection</a></p>';return;}
  document.title=`${program.title} · Code Circa 1980`;
  const playing=parts[3]==='play' && version.playable;
  app.innerHTML=`${crumbs(program)}<section class="program-heading"><div><p class="eyebrow">Original program / ${escape(version.id.toUpperCase())} · ${escape(version.capture)}</p><h1>${escape(program.title)}</h1><p class="lede">${escape(program.description)}</p></div><span class="edition">${escape(version.label)}</span></section>${playing ? `<section class="player-section"><div class="player-toolbar"><a href="${route(program,version)}">← Instructions</a><div><button id="pause">Pause</button><button id="restart">Restart</button><button id="fullscreen">Full screen</button></div></div><div id="display" class="screen" tabindex="0" aria-label="Loading emulator"></div><p id="status" role="status">Loading the original program…</p><div class="quick-controls" aria-label="On-screen game keys">${program.onScreenKeys(version).map(k=>`<button class="game-key" data-key="${k}" aria-label="Game key ${k===' '?'Space':escape(k)}">${k===' '?'Space':escape(k.toUpperCase())}</button>`).join('')}</div><p class="small">Click the screen for keyboard controls. ${escape(program.quickHelp(version))} Restart begins a new construction.</p></section>` : `${program.instructions(version)}<div class="launch-panel">${version.playable ? `<div><strong>Ready to build?</strong><p>The original BASIC runs inside a TRS-80 emulator. No typing or tape loading needed.</p></div><a class="primary" href="${route(program,version,true)}">Play ${escape(program.title)} <span>→</span></a>` : `<div><strong>This version is preserved for study.</strong><p>${escape(version.unavailableReason)}</p></div><a class="primary" href="${route(program,program.versions.find(v=>v.id===program.defaultVersion))}">Use the playable version →</a>`}</div>`}<details class="source-details"><summary>Recovered source & provenance</summary><p>${escape(version.note)} Original bytes and historical quirks are preserved.</p><p><a href="${assetUrl(program,version.listing)}" download>Download BASIC listing</a> · <a href="${assetUrl(program,version.raw)}" download>Download original payload</a> · <a href="${provenanceUrl(program)}" download>Recovery provenance</a></p></details>${versionList(program,version)}`;
  window.scrollTo(0,0);
  if (!playing) return;
  const host=document.querySelector('#display'), status=document.querySelector('#status');
  try {
    const {createPlayer}=await import('./emulator.js');
    if(thisNavigation!==navigation)return;
    const instance=await createPlayer(host,assetUrl(program,version.raw),status,program.title);
    if(thisNavigation!==navigation){instance.dispose();return;}
    player=instance;
    // Read-only test interface, enabled only for a test URL.
    if(new URLSearchParams(location.search).has('test'))window.__circaPlayer={snapshot:()=>instance.snapshot(),diagnostics:()=>instance.diagnostics()};
    const pause=document.querySelector('#pause');
    const syncPause=()=>{pause.textContent=instance.paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(instance.paused));};
    host.addEventListener('playerpause',syncPause);
    pause.onclick=()=>{instance.togglePause();syncPause();};
    document.querySelector('#restart').onclick=()=>{instance.restart();syncPause();host.focus({preventScroll:true});};
    document.querySelector('#fullscreen').onclick=async()=>{
      try {if(document.fullscreenElement)await document.exitFullscreen();else await host.requestFullscreen();host.focus();}
      catch {status.textContent='Full screen is unavailable in this browser. You can still play here.';}
    };
    for(const button of document.querySelectorAll('.game-key')){
      const release=()=>instance.press(button.dataset.key,false);
      button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);instance.press(button.dataset.key,true);};
      button.onpointerup=release;button.onpointercancel=release;button.onlostpointercapture=release;
      button.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();instance.press(button.dataset.key,true);}};
      button.onkeyup=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();release();}};
      button.onblur=()=>instance.release();
    }
    host.focus({preventScroll:true});
  }catch(error){if(thisNavigation===navigation)status.textContent=`Unable to start: ${error.message}. Return to instructions and try launching again.`;}
}
window.addEventListener('hashchange',render);
render();
