// Original BASIC players; the helpers send real keyboard input, never change RAM.
const common='<p>Click the screen to give it keyboard focus. Pause freezes the original machine; Help pauses it and restores the prior pause state when closed. Restart begins a fresh run. Held keys are released on blur, navigation, pause, and restart.</p>';
const art=id=>({src:new URL(`../../assets/${id}-gallery.svg`,import.meta.url).href});
export const answers=(instance,{dock},example)=>{
 const form=document.createElement('form');form.className='original-answer';
 form.innerHTML='<label>Type an answer or command<input aria-label="Answer for the original program" autocomplete="off" autocapitalize="characters" spellcheck="false"></label><button type="submit">Send + Enter</button>';
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 form.onsubmit=async e=>{
  e.preventDefault();if(instance.paused){dock.querySelector('#status').textContent='Resume before sending an answer.';return;}const field=form.querySelector('input'),submit=form.querySelector('button');
  const value=field.value.toUpperCase();form.reset();field.disabled=true;submit.disabled=true;
  document.querySelector('#display').focus({preventScroll:true});instance.type(`${value}\n`);
  while(instance.typing&&form.isConnected&&!instance.paused)await delay(25);
  await delay(200);field.disabled=false;submit.disabled=false;
 };
 dock.append(form);
 if(example){
  const button=document.createElement('button');button.textContent='Run Sun/planet example';let generation=0;
  const restore=()=>{button.disabled=false;button.textContent='Run Sun/planet example';};
  dock.querySelector('#restart').addEventListener('click',()=>{generation++;restore();});
  button.onclick=async()=>{
   if(instance.paused){dock.querySelector('#status').textContent='Resume before entering the example.';return;}
   const token=++generation;
   const text=()=>String.fromCharCode(...instance.snapshot());
   if(!text().slice(0,text().lastIndexOf('?')).endsWith('EXPAND SCREEN OPTION')){dock.querySelector('#status').textContent='Restart, then use this example at the first setup question.';return;}
   button.disabled=true;button.textContent='Entering example…';document.querySelector('#display').focus({preventScroll:true});
   const steps=[['EXPAND SCREEN OPTION','NO'],['PUT IN YOU OWN SITUATION','YES'],['HOW MANY METERS WIDE','8E11'],['HOW MANY OBJECTS','1'],['MASS,X,Y','1.991E30,4E11,3E11'],['MASS SPACE SHIP','5.979E24'],['X,Y OF SPACE SHIP','2.5E11,3E11'],['HEADING (DEG.)','90,30000']];
   try{
    for(const [prompt,value] of steps){
     const until=Date.now()+20000;
     while(!text().includes(prompt)||instance.typing){
      if(token!==generation||!button.isConnected||instance.paused||Date.now()>until)throw Error('interrupted');
      await delay(40);
     }
     await delay(200);if(token!==generation||!button.isConnected||instance.paused)throw Error('interrupted');instance.type(`${value}\n`);
    }
   }catch{if(token===generation&&button.isConnected)dock.querySelector('#status').textContent='Example interrupted. Restart to begin the setup again.';}
   finally{if(token===generation)restore();}
  };
  dock.append(button);
 }
};
export const rickyratView={art:art('rickyrat'),aboutOpen:true,
 instructions:()=>`<section><h2>Two rats, one maze</h2><p>My Ricky Rat source is signed <code>RICKY RAT BY CARL KADIE 6 AUG 82</code>. The program draws a maze, starts two rats at opposite entrances, and compares their progress using the original algorithms. That date belongs to the source credit; it does not date every save.</p><h3>Start here</h3><p>Let the maze draw and watch the rats. This selected version runs both rats automatically; there is no player-controlled rat to steer. Use Pause to inspect their routes. At a winner message, Restart reruns the maze and race. <kbd>Escape</kbd> is the original BASIC BREAK key and returns to BASIC.</p>${common}<p>The player runs tape18b save 18, recovery-label V14 (import v15). Fifteen complete saves are preserved, including a repeated first form. Two damaged later/fragment recordings remain source only. Both entrants call routine 6000 in this form. Historical loops and quirks are unchanged.</p></section>`,
 onScreenKeys:()=>[{label:'Original',keys:[['Escape','Break']]}],quickHelp:()=> 'The maze and rat race start automatically. Pause to inspect; Restart reruns the maze and race. At a winner message the original waits in a loop.'};
export const pinballView={art:art('pinball'),aboutOpen:true,
 instructions:()=>`<section><h2>Pinball in BASIC</h2><p>I wrote a pinball table with text-character bumpers and a moving ball. The title screen credits Carl Kadie. This site runs the recovered BASIC; the collisions, scoring, and unusual historical reflections are preserved.</p><h3>Start here</h3><ol><li>Wait for the title and table to draw.</li><li>Press <kbd>Enter</kbd> to launch a ball. The original rejects Space at this prompt.</li><li>Press or hold <kbd>Space</kbd> to operate the bottom flipper while the ball is moving.</li><li>After YOU MISSED, press Enter for the next ball. The game starts with five balls; scoring can award free balls.</li></ol>${common}<p>The selected reference is tape12a save 11 (import v07). Tape9b keeps three earlier forms, each saved twice. The later form adds display-address rounding and revised collision/miss handling; its inferred place in the sequence is based on edits, not tape numbering.</p></section>`,
 onScreenKeys:()=>[{label:'Play',keys:[['Enter','Launch / next ball'],[' ','Flipper']]}],quickHelp:()=> 'Wait for the table, then Enter to launch. Space operates the bottom flipper; Enter starts the next ball after YOU MISSED.'};
export const logicView={art:art('logic'),aboutOpen:true,
 instructions:()=>`<section><h2>Build a logic circuit</h2><p>Create switches, lights, NAND/NOR/XOR gates, joints, and branches. Wire numbered device points together, set switches, and run the original circuit evaluation. The display title is descriptive; no explicit title screen was found.</p><h3>Try a switch and light</h3><ol><li>At WHAT IS YOUR WISH, enter <code>H</code> for the original help.</li><li>Enter <code>C</code>, then <code>SWITCH</code>. It becomes device 1.</li><li>Enter <code>C</code>, then <code>LIGHT</code>. It becomes device 2.</li><li>Enter <code>W</code>, then <code>1,1,2,1</code> to wire switch point 1 to light point 1.</li><li>Enter <code>S</code>, then <code>1,Y</code> to set the switch on.</li><li>Enter <code>G</code> to evaluate; inspect the light output. Try <code>S</code>, <code>1,N</code>, then <code>G</code> to compare.</li><li><code>T</code> prints a truth table; <code>L</code> lists devices. Enter completes each answer.</li></ol>${common}<p>The answer field sends ordinary keyboard text plus Enter to the emulator. The player runs tape15b save 18 (v05). Four earlier saves remain source only. Inputs and unfinished/error-prone commands are historical code; they have not been corrected or validated for every possible circuit.</p></section>`,
 onScreenKeys:()=>[{label:'Input',keys:[['Enter','Enter'],['Escape','Break']]}],quickHelp:()=> 'At WHAT IS YOUR WISH, H shows help. Use the answer field or focus the screen and type commands. Help includes a complete switch-and-light example.',decoratePlayer:(instance,context)=>answers(instance,context,false)};
export const orbitView={art:art('orbit'),aboutOpen:true,
 instructions:()=>`<section><h2>A spacecraft under gravity</h2><p>Supply body masses, positions, a spacecraft mass, and an initial velocity. The original BASIC advances its gravity simulation and plots a trail. The display title is descriptive.</p><h3>Start with a Sun/planet example</h3><p>At the first setup question, choose <strong>Run Sun/planet example</strong>. It types these original answers through the emulator keyboard: <code>NO</code> (expand), <code>YES</code> (own situation), <code>8E11</code> (screen width), <code>1</code> (body), <code>1.991E30,4E11,3E11</code> (body mass/x/y), <code>5.979E24</code> (spacecraft mass), <code>2.5E11,3E11</code> (spacecraft x/y), and <code>90,30000</code> (heading in degrees and speed in meters/second).</p>${common}<p>Alternatively, type each answer with Enter. Masses are kilograms, coordinates and width are meters. A new setup starts with Restart. The extra answer field sends ordinary keys; the example does not alter program bytes or machine state directly.</p><p>The original leaves setup text behind the plotted trail; the elapsed-time field measures simulation time. The selected reference is tape11b save 17 (v06), the latest of six complete saves. Some historical preset-menu branches point to missing line 2500; use the custom example above. Out-of-range coordinates, coincident positions, and other inputs can cause original BASIC errors. These are historical program limitations, separate from cassette recovery completeness. In these listings <code>[</code> denotes the BASIC exponent operator.</p></section>`,
 onScreenKeys:()=>[{label:'Input',keys:[['Enter','Enter'],['Escape','Break']]}],quickHelp:()=> 'At the first setup prompt, Run Sun/planet example types a safe custom setup through the original keyboard. Pause to inspect the trail; Restart returns to setup.',decoratePlayer:(instance,context)=>answers(instance,context,true)};
