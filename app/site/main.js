import './style.css';
import {programs, allPrograms, morePrograms, assetUrl, provenanceUrl} from './catalog.js';
import {galleryCards} from './gallery.js';
import {aboutAuthor} from './about.js';
import {defaultEdition, releasePath, routeParts, editionSearch, releaseSearch} from './routes.js';

const app = document.querySelector('#app');
const webProgram=import.meta.env.VITE_WEB_PROGRAM;
const webVersion=import.meta.env.VITE_WEB_VERSION;
const collectionUrl=new URL(webProgram?'../../':'./',location.href);
const development=import.meta.env.DEV || new URLSearchParams(location.search).has('development');
if(webProgram)document.querySelector('.brand').href=collectionUrl.href;
let player = null, navigation = 0, activeRoute = null;
const sessions = new Map();
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// A version may route by a fixed slug (bal's playable BASIC is /basic) instead of its ID.
const route = (program, version, play=false) => webProgram===program.id ? `${location.pathname}${editionSearch(program,version,undefined,location.search)}` : `#/program/${program.id}/${version.slug??version.id}${play ? '/play' : ''}`;
const actionVerb = program => program.actionVerb ?? 'Play';
const collectionHref = program => program?.gallery==='more' ? (webProgram?new URL('#/more',collectionUrl).href:'#/more') : (webProgram?collectionUrl.href:'#/');
const crumbs = program => `<nav aria-label="Breadcrumb"><a href="${collectionHref(program)}">Collection</a><span>/</span><span>${escape(program.title)}</span></nav>`;
const experienceUrl=(program,version)=>new URL(releasePath(program.id,version),collectionUrl).href;
// Open straight into the game with the default castle scene.
const playUrl=program=>!development&&!webProgram&&program.webVersions.length?experienceUrl(program,program.webVersions.at(-1)):`${route(program,defaultEdition(program),true)}${program.playSuffix??''}`;
function versionPicker(program,current){
 const versions=[...program.webVersions];
 // The frozen catalog was read before this release was added to it.
 if(current&&!versions.some(v=>v.id===current))versions.push({id:current,path:`${program.id}/${current}/`});
 versions.reverse();
 return `<label class="version-picker">Versions <select onchange="location.href=this.value">${versions.map((v,i)=>`<option value="${experienceUrl(program,v)}" ${(current??versions[0].id)===v.id?'selected':''}>${escape(v.id)}${i===0?' (latest)':''}</option>`).join('')}</select></label>`;
}
function webVersionNavigation(program){
 return `<nav class="web-version-nav" aria-label="Web experience"><span>Web experience ${webVersion?escape(webVersion):'development'}</span>${program.webVersions.length+(webVersion&&!program.webVersions.some(v=>v.id===webVersion)?1:0)>1?versionPicker(program,webVersion):''}${webVersion?`<a href="${collectionUrl.href}?program=${program.id}">Latest version</a>`:''}</nav>`;
}
function versionList(program, selected) {
 return `<details class="versions"><summary>${program.versions.length} recovered versions · development order is inferred</summary><p>${escape(program.versionOrder)}</p><ol>${program.versions.map(v=>`<li><a href="${route(program,v)}" ${selected.id===v.id?'aria-current="page"':''}>${escape(v.id.toUpperCase())} · ${escape(v.label)}</a><span class="small">${escape(v.capture)} / save ${v.save}${v.playable?'':' · source only'}</span><p>${escape(v.note)}</p></li>`).join('')}</ol></details>`;
}
async function render() {
  const thisNavigation = ++navigation;
  if(player && activeRoute){
    const running=!player.paused;
    if(running)player.togglePause();
    const content=document.createDocumentFragment();content.append(...app.childNodes);
    sessions.set(activeRoute,{player,content,running});
  }
  player=null;activeRoute=null;delete window.__circaPlayer;
  const parts=routeParts(location.hash,webProgram,location.search);
  const more=parts[0]==='more';
  const currentProgram=allPrograms.find(p=>parts[0]==='program'&&(p.id===parts[1]||p.legacyProgramIds?.includes(parts[1])));
  document.querySelector('.brand').href=collectionHref(more?{gallery:'more'}:currentProgram);
  document.querySelector('meta[name="robots"]')?.remove();
  if(more||currentProgram?.gallery==='more'){
    const robots=document.createElement('meta');robots.name='robots';robots.content='noindex, nofollow';document.head.append(robots);
  }
  if(more){
    document.title='More from the tapes · Code Circa 1980';
    app.innerHTML=`<section class="intro"><p class="eyebrow">Another shelf of the time capsule</p><h1>More from<br><em>the tapes.</em></h1><p class="lede">A few more original programs, recovered from cassette.<br>Coaching teams, chasing medals, and flying toward the Death Star.</p></section>${galleryCards(morePrograms,{playUrl,versionPicker,actionVerb})}`;
    return;
  }
  if (!parts.length) {
    document.title = 'Code Circa 1980';
    app.innerHTML=`<section class="intro"><p class="eyebrow">A software time capsule</p><h1>Code, circa 1980.<br><em>Running again.</em></h1><p class="lede">Original programs from the early days of personal computing.<br>Recovered from cassette tapes, updated with new controls.</p><p class="intro-links"><a href="#about-author">About this project ↓</a></p></section>${galleryCards(programs,{playUrl,versionPicker,actionVerb})}<section class="about-author" aria-labelledby="about-author"><h2 id="about-author">About this project</h2>${aboutAuthor.map(p=>`<p>${escape(p)}</p>`).join('')}</section>`;
    // The hash holds the route, so scroll to the bio instead of navigating.
    app.querySelector('.intro-links a').onclick=event=>{event.preventDefault();app.querySelector('.about-author').scrollIntoView({behavior:'smooth'});};
    return;
  }
  const program=currentProgram;
  if(program&&((!webProgram&&!development&&program.webVersions.length)||(webProgram&&webProgram!==program.id))){
    const latest=program.webVersions.at(-1);
    if(!latest){app.innerHTML=`${crumbs(program)}<h1>No web releases yet</h1>`;return;}
    const url=new URL(experienceUrl(program,latest));url.search=releaseSearch(program,parts,location.search);location.replace(url);return;
  }
  const version=!parts[2] && program ? defaultEdition(program) : parts[2]===program?.modern?.id ? program.modern : program?.versions.find(v=>(v.slug??v.id)===parts[2]||v.id===parts[2]);
  if(!program || !version){app.innerHTML=`<h1>Program not found</h1><p><a href="${collectionUrl.href}">Back to the collection</a></p>`;return;}
  document.title=`${program.title} · Code Circa 1980`;
  const playing=(Boolean(webProgram)||parts[3]==='play') && version.playable;
  const modern=Boolean(program.modern)&&version.id===program.modern.id;
  if(webProgram){
    const url=`${location.pathname}${editionSearch(program,version,parts[4],location.search)}`;
    if(`${location.pathname}${location.search}${location.hash}`!==url)history.replaceState(null,'',url);
  }
  // No start page: a playable program or version opens straight into its player.
  if(!playing&&version.playable){location.replace(`${route(program,version,true)}${modern?program.playSuffix??'':''}`);return;}
  const reference=program.versions.find(v=>v.id===program.defaultVersion);
  const implementationTabs=program.modern?`<nav class="implementations" aria-label="Implementation"><a href="${route(program,program.modern,playing)}" ${modern?'aria-current="page"':''}>${escape(`${program.modernLanguage??'TypeScript'} version`)}</a><a href="${route(program,reference,playing)}" ${!modern?'aria-current="page"':''}>${escape(`${program.language??'Original'} version`)}</a></nav>`:'';
  const sessionKey=`${program.id}/${version.id}`;
  const cached=playing&&sessions.get(sessionKey);
  if(cached){
    sessions.delete(sessionKey);app.replaceChildren(cached.content);player=cached.player;activeRoute=sessionKey;
    if(cached.running&&player.paused)player.togglePause();
    if(modern&&parts[4]==='blank'){
      player.release();
      if(!player.hasWork()||confirm('Clear this construction and start an empty field?'))player.restart();
    }
    exposePlayer(player);app.querySelector('#display').focus({preventScroll:true});window.scrollTo(0,0);return;
  }
  const sourceDetails=`<details class="source-details" ${program.aboutOpen?'open':''}><summary>About, history & source</summary>${program.instructions(version)}<section class="source-section"><h3>Source</h3><p>${escape(version.note)}${version.derived?'':' Original bytes and historical quirks are preserved.'}</p><p><a href="${assetUrl(program,version.listing)}" download>Download BASIC listing</a> · <a href="${assetUrl(program,version.raw)}" download>Download ${version.derived?'BASIC':'original'} payload</a> · <a href="${provenanceUrl(program)}" download>Recovery provenance</a></p>${versionList(program,version)}${webVersionNavigation(program)}</section></details>`;
  const unavailable=`<p>This version is preserved for study.</p><p>${escape(version.unavailableReason??'')}</p><a href="${route(program,reference,true)}">${actionVerb(program)} the playable version →</a>`;
  app.innerHTML=playing?`<section class="player-section"><header class="player-header"><a href="${collectionHref(program)}">Collection</a><h1>${escape(program.title)}</h1>${implementationTabs}</header><div class="player-workspace"><div id="display" class="screen" tabindex="0" aria-label="Loading player"></div><aside id="control-dock" aria-label="Game controls"><div class="essential-controls"><button id="help">Help</button><button id="pause">Pause</button><button id="restart">${escape(program.restartLabel?.(modern)??'Restart')}</button><button id="fullscreen">Full screen</button></div><p id="status" role="status">Loading ${modern?'the browser version':'the original program'}…</p></aside></div><details class="keyboard-help" ${modern?'':'open'} ${program.onScreenKeys(version).length?'':'hidden'}><summary>Original keyboard controls</summary><div class="quick-controls" aria-label="On-screen game keys">${program.onScreenKeys(version).map(group=>`<div class="key-group${group.pad?' key-pad':''}"><span class="key-group-label">${escape(group.label)}</span><div>${[...group.keys,...(group.extra??[])].map(([k,action])=>`<button class="game-key" data-key="${k}" aria-label="Game key ${k===' '?'Space':escape(k)}"><kbd>${k===' '?'Space':escape(k.toUpperCase())}</kbd><span>${escape(action)}</span></button>`).join('')}</div></div>`).join('')}</div><p>${escape(program.quickHelp(version))}</p></details>${sourceDetails}</section>`:`${crumbs(program)}<section class="source-only"><h1>${escape(program.title)} · ${escape(version.id.toUpperCase())}</h1>${implementationTabs}${unavailable}</section>${sourceDetails}`;
  window.scrollTo(0,0);
  if (!playing) return;
  const host=document.querySelector('#display'), status=document.querySelector('#status');
  try {
    const {createPlayer}=modern?await program.loadModernPlayer():await import('./emulator.js');
    if(thisNavigation!==navigation)return;
    const instance=await createPlayer(host,assetUrl(program,version.raw),status,program.title,version.machineCode?{...version.machineCode,url:assetUrl(program,version.machineCode.file)}:undefined,{running:modern?undefined:version.running,model:modern?undefined:program.model,printer:!modern&&program.printer});
    if(thisNavigation!==navigation){instance.dispose();return;}
    player=instance;activeRoute=sessionKey;
    host.querySelector('#control-dock').append(app.querySelector('.keyboard-help'));
    // '/castle' starts with the default scene; '/bridge' is the older name kept for shared links.
    if(modern&&['castle','bridge'].includes(parts[4]??(webProgram?program.playSuffix?.slice(1):undefined)))instance.loadStartingPattern('arch-tower');
    program.decoratePlayer?.(instance,{dock:host.querySelector('#control-dock'),version,modern,status});
    // Read-only test interface, enabled only for a test URL.
    exposePlayer(instance);
    const pause=document.querySelector('#pause');
    pause.hidden=instance.pausable===false;
    const syncPause=()=>{pause.textContent=instance.paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(instance.paused));};
    host.addEventListener('playerpause',syncPause);
    pause.onclick=()=>{instance.togglePause();syncPause();};
    document.querySelector('#restart').onclick=()=>{
      instance.release();
      if(instance.hasWork()&&!confirm(program.restartConfirm?.(modern)??'Restart the original program?'))return;
      instance.restart();syncPause();host.focus({preventScroll:true});
    };
    const help=document.createElement('dialog');help.className='player-help';help.setAttribute('aria-label',`${program.title} help`);
    help.innerHTML=`<div class="help-head"><h2>How to play</h2><button type="button">Close help</button></div>${program.instructions(version)}`;
    host.append(help);let resumeAfterHelp=false,helpFocus=null;
    document.querySelector('#help').onclick=()=>{helpFocus=document.activeElement;resumeAfterHelp=!instance.paused;if(resumeAfterHelp)instance.togglePause();instance.release();help.showModal();};
    help.querySelector('button').onclick=()=>help.close();
    help.onclose=()=>{if(resumeAfterHelp&&instance.paused)instance.togglePause();helpFocus?.focus({preventScroll:true});};

    const fullscreen=document.querySelector('#fullscreen');
    host.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement===host?'Exit full screen':'Full screen';});
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
  }catch(error){if(thisNavigation===navigation)status.textContent=`Unable to start: ${error.message}. Reload the page to try again.`;}
}
function exposePlayer(instance){
  if(new URLSearchParams(location.search).has('test'))window.__circaPlayer={snapshot:()=>instance.snapshot(),diagnostics:()=>instance.diagnostics()};
}
// Keep the existing implementation/source tabs and paused sessions in-page.
// Their links use query parameters; the default player has neither query nor hash.
app.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!webProgram||!link||link.hasAttribute('download')||link.target||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const url=new URL(link.href);
  if(url.origin!==location.origin||url.pathname!==location.pathname||url.hash)return;
  event.preventDefault();history.pushState(null,'',url);render();
});
window.addEventListener('popstate',render);
window.addEventListener('hashchange',render);
render();
