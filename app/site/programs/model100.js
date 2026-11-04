import {archiveView} from './archive.js';
import {assetUrl} from '../catalog.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guidance={
 'model-100-strategy-game':'The Secret War starts automatically. Read the front/battle report. Type HELP and Enter for the original commands, or use F6. F1–F5 insert the original command shortcuts. Restart starts a new game.',
 'model-100-study-program':'At Lesson (.do assumed), enter a lesson filename without .DO; then answer How many to skip. This program needs a separate lesson document in Model 100 RAM. No complete matching lesson has been installed, so its study session is unavailable. The original setup can still run.',
 'model-100-traveling-salesman':'At How many cites, try 6 and Enter; at random sequence, try 1 and Enter. Watch the route diagrams and distance totals. The program continues searching; Pause freezes the display and Restart returns to setup.',
 'model-100-transaction-simulation':'The recovered program begins with the literal unfinished statement 0 EN. RUN therefore reports an original BASIC syntax error. The emulator is available to inspect it; no source correction or completed simulation is claimed.',
 'model-100-numeric-processing':'This is a packed-bit Game of Life calculation using embedded DATA. It starts automatically; drawing can be slow while it calculates. Pause freezes execution and Restart begins again. No initial answer is required. Historical BASIC errors and termination behavior remain.',
 'model-100-input-reversal':'Type a short sequence of periods and other characters, then Enter. A period represents 0; another character represents 1. The original prints the bits in reverse order and their numeric value, then waits for another sequence. Try .X and Enter.',
 'model-100-life-backwards':'Wait for Setting up, then follow the original screen. This is the complete tape2a2 save 21, not the damaged later fragments. Its historical search, input, and errors remain unchanged.',
 'model-100-jab':'At layout, try 1 and Enter to choose a repeatable starting layout. Follow the original room/status prompts. The original uses immediate keys as well as answers; click the LCD for keyboard focus. Restart returns to layout.'
};
export function model100View(program){const base=archiveView(program);return {...base,aboutOpen:false,
 instructions:version=>`<section><h2>${escape(program.title)}</h2><p>${escape(guidance[program.id])}</p><p>Click the LCD for keyboard focus. Type answers and press Enter, or use the answer field. F1–F8 are the Model 100 function keys. Shift+Pause is the original BREAK combination. Pause freezes CPU execution; Help pauses and restores it, and Restart discards the session and loads the selected original again. Sound and external peripherals are not emulated by this build.</p><p>The original recovered tokenized BASIC runs on VirtualT’s emulated 8085 and Model 100 firmware. Only cassette framing and in-memory line addresses are adapted for loading; historical record bodies stay unchanged. Other saves, including damaged fragments, remain source only.</p><p>Selected reference: ${escape(program.defaultVersion)}. ${escape(program.versionOrder)}</p><p>${escape(version.note)}</p><details><summary>Preserved exports</summary><ul>${(version.exports??[]).map(f=>`<li><a href="${assetUrl(program,f.path)}" download>${escape(f.label)}</a></li>`).join('')}</ul></details></section>`,
 quickHelp:()=> 'Click the LCD for focus. Enter submits an answer. BREAK stops BASIC. Open Help for this program’s starting steps. Leaving this player discards its session.',
 onScreenKeys:()=>[{label:'Model 100',keys:[['Enter','Enter'],[' ','Space'],['ArrowUp','Up'],['ArrowDown','Down'],['ArrowLeft','Left'],['ArrowRight','Right'],...(program.id==='model-100-strategy-game'?[['F1','Assert'],['F2','Invest'],['F3','Spy'],['F4','Defend'],['F5','Call'],['F6','Help']]:[])]}],
 decoratePlayer:(instance,{dock})=>{
   const form=document.createElement('form');form.className='original-answer';
   form.innerHTML='<label>Type an answer or command<input aria-label="Answer for the original program" autocomplete="off" spellcheck="false"></label><button>Send + Enter</button>';
   form.onsubmit=e=>{e.preventDefault();if(instance.paused||instance.typing)return;const input=form.querySelector('input');const value=input.value;input.value='';document.getElementById('display').focus({preventScroll:true});instance.type(value+'\n');};dock.append(form);
   const stop=document.createElement('button');stop.textContent='BREAK';stop.onclick=()=>{instance.press('Shift',true);instance.press('Pause',true);setTimeout(()=>{instance.press('Pause',false);instance.press('Shift',false);},120);};dock.append(stop);
 }
};}
