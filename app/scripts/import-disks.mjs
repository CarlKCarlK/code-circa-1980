// Imports programs from the recovered floppy images in the sibling trs80 archive.
// Copies bytes unchanged and commits one canonical revision per save. Startup steps
// were refined in each program.json afterward. Run once:
//   node scripts/import-disks.mjs /path/to/trs80
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {decodeBasicProgram} from 'trs80-base';

const archive=process.argv[2];
if(!archive)throw Error('Usage: import-disks.mjs /path/to/trs80');
const repo=path.resolve(import.meta.dirname,'../..');
const extracted=path.join(archive,'disks/extracted');
const manifest=JSON.parse(fs.readFileSync(path.join(extracted,'manifest.json')));
const today='2026-11-03';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
const diskInfo=folder=>manifest.find(d=>d.folder===folder);
const COPYRIGHT='Preserved here for small-scale archival use.';

// Disks copied into a program folder, by short name.
const IMAGES={
 games:['BASIC Programs Games','games-diskette.dmk'],forth:['MMSFORTH Forth System','forth-system.dmk'],
 newprograms:['MMSFORTH New Programs','new-programs.dmk'],utilities:['Archive MMSForth Utilities v1.3','mmsforth-utilities.dmk'],
 lisp:['LISP','lisp.dmk'],lispdos:['LISP Dos','lisp-dos.dmk'],
};
function copyImages(folder,names){
 const files=[];
 for(const name of names){
  const [disk,file]=IMAGES[name];
  const bytes=fs.readFileSync(path.join(archive,'disks',diskInfo(disk).image));
  assertHash(bytes,diskInfo(disk).image_sha256,disk);
  fs.mkdirSync(path.join(folder,'disks'),{recursive:true});
  fs.writeFileSync(path.join(folder,'disks',file),bytes);
  files.push({path:`disks/${file}`,archive_path:`disks/${diskInfo(disk).image}`,bytes:bytes.length,sha256:sha(bytes)});
 }
 return files;
}
function assertHash(bytes,expected,label){if(sha(bytes)!==expected)throw Error(`Hash mismatch: ${label}`);}
const imagePaths=names=>names.map(name=>`disks/${IMAGES[name][1]}`);

// One BASIC file exactly as the disk's directory defines it.
function basicFile(disk,name){
 const raw=fs.readFileSync(path.join(extracted,disk,'files',name));
 const item=diskInfo(disk).items.find(i=>i.name===name&&i.status==='active');
 assertHash(raw,item.sha256,name);
 const decoded=decodeBasicProgram(raw);
 const listing=item.end_marker&&decoded&&!decoded.error?decoded.asAscii():fs.readFileSync(path.join(extracted,disk,'readable',`${name}.ASC`),'latin1');
 return {raw,listing,item,lines:listing,base:name};
}
// A run of MMSFORTH blocks: raw bytes plus their 64-column screens.
function blocks(disk,first,last){
 const raws=[],texts=[];
 for(let k=first;k<=last;k++){
  const id=String(k).padStart(3,'0');
  raws.push(fs.readFileSync(path.join(extracted,disk,'blocks-raw',`block-${id}.bin`)));
  const screen=path.join(extracted,disk,'screens',`block-${id}.txt`);
  texts.push(fs.existsSync(screen)?fs.readFileSync(screen,'latin1'):`==== Block ${k} ====\n(not text)\n`);
 }
 return {raw:Buffer.concat(raws),listing:texts.join('\n')};
}
function excerpt(listing,count=12){return listing.replaceAll('\r\n','\n').split('\n').filter(Boolean).slice(0,count).join('\n');}

function writeSave(folder,meta,evidence,{id,label,disk,source,rawName,listingName,raw,listing,extra=[],playable=false,unavailableReason=null,note,recovery,diskRun,sound,running}){
 const dir=path.join(folder,'versions',id);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,rawName),raw);
 fs.writeFileSync(path.join(dir,listingName),listing,'latin1');
 const rel=name=>`versions/${id}/${name}`;
 const files=[{name:rawName,bytes:raw,archive:source},{name:listingName,bytes:Buffer.from(listing,'latin1'),archive:'derived listing'},...extra];
 for(const f of extra)fs.writeFileSync(path.join(dir,f.name),f.bytes);
 const version={id,label,capture:`disk: ${disk}`,raw:rel(rawName),listing:rel(listingName),playable,note,unavailableReason,
  exports:files.map(f=>({path:rel(f.name),label:f.name})),startupSource:excerpt(listing),controlSource:[]};
 if(diskRun){version.disk=diskRun;version.running=running??'Running from the original disk';version.slug='basic';if(sound)version.sound=true;}
 meta.versions.push(version);
 evidence.saves.push({version:id,disk,disk_image:diskInfo(disk).image,disk_image_sha256:diskInfo(disk).image_sha256,source,
  imported_files:files.map(f=>({path:rel(f.name),archive_path:f.archive??source,bytes:f.bytes.length,sha256:sha(f.bytes)})),
  recovery_item:{format:recovery.format,sha256:sha(raw),bytes:raw.length,import_date:today,...recovery}});
 // The stable canonical paths advance one commit per version.
 fs.mkdirSync(path.join(folder,'original'),{recursive:true});
 const ext=path.extname(rawName),listExt=path.extname(listingName),stem=meta.id.toUpperCase();
 fs.writeFileSync(path.join(folder,'original',stem+ext),raw);
 fs.writeFileSync(path.join(folder,'original',stem+listExt),listing,'latin1');
 fs.writeFileSync(path.join(folder,'original/provenance.json'),JSON.stringify(evidence.saves.at(-1),null,2)+'\n');
}
function commitSave(meta,evidence,folder,id,message){
 fs.writeFileSync(path.join(folder,'program.json'),JSON.stringify(meta,null,2)+'\n');
 fs.writeFileSync(path.join(folder,'provenance.json'),JSON.stringify(evidence,null,2)+'\n');
 git('add',path.relative(repo,folder));git('commit','-q','-m',message);git('tag',`${meta.id}-${id}`);
}
const nextId=meta=>`v${String(Math.max(0,...meta.versions.map(v=>Number(v.id.slice(1))||0))+1).padStart(2,'0')}`;
const load=id=>{const folder=path.join(repo,'programs',id);return {folder,meta:JSON.parse(fs.readFileSync(path.join(folder,'program.json'))),evidence:JSON.parse(fs.readFileSync(path.join(folder,'provenance.json')))};};

// ---- Existing programs: the Games Diskette's later forms and names.
const GAMES='BASIC Programs Games';
const menu=letter=>({images:imagePaths(['games']),steps:[{wait:'SELECT A LETTER'},{press:letter}]});
const diskNote=name=>`Complete disk file ${name} (directory size, ordered records, consistent pointers, end marker). Runs under NEWDOS/80 Disk BASIC from the original disk image; the disk's menu starts it, and it can return there. Runtime limited to the startup check.`;
const updates=[
 {id:'presidential-crisis-game',title:'Coldwar',file:'COLDWAR.BAS',letter:'b',menuText:'A SIMULATION OF INTERNATIONAL TENSIONS'},
 {id:'argyle-88',title:'Quorum in Space',file:'QUORUM.BAS',letter:'e',menuText:'A SIMULATION OF HIGH-STAKES GOVERNMENT FOR ONE'},
 {id:'two-player-trail-game',title:'Blockade Robot',file:'BLOCKRB.BAS',letter:'h',menuText:'CLASSIC VIDEO GAME FOR TWO'},
 {id:'three-dimensional-trail-game',title:'Blockade in 3-D',file:'BLOCK3D.BAS',letter:'i',menuText:'A VIDEO GAME FOR TWO IN A CUBE'},
 {id:'race',title:'Race',file:'RACE.BAS',letter:'f',menuText:'A VIDEO GAME FOR TWO'},
 {id:'amazing-maze',title:'Amazing Maze',file:'MAZE.BAS',letter:'j',menuText:'A GAME FOR ONE OR TWO'},
];
for(const u of updates){
 const {folder,meta,evidence}=load(u.id);
 const old=meta.title;const id=nextId(meta);
 const file=basicFile(GAMES,u.file);
 const images=copyImages(folder,['games']);
 for(const v of meta.versions){
  if(v.playable){v.playable=false;v.unavailableReason=`Earlier save, kept as source. The site plays the later form from the Games Diskette (${id}).`;}
  delete v.slug;
 }
 meta.title=u.title;meta.defaultVersion=id;delete meta.sourceOnly;delete meta.actionVerb;meta.kind='BASIC';
 meta.description=`${u.menuText}, in the disk menu's words. ${meta.versions.length+1} recovered forms; the disk form plays.`;
 if(old!==u.title){evidence.official_title=u.title;evidence.title_authority=`Title from the Games Diskette menu (HELP.BAS). Earlier recovery label: ${old}. Recovered text and filenames are unchanged.`;}
 writeSave(folder,meta,evidence,{id,label:`${u.title} (Games Diskette)`,disk:GAMES,source:`files/${u.file}`,rawName:u.file,listingName:u.file.replace('.BAS','.ASC'),raw:file.raw,listing:file.listing,
  playable:true,note:diskNote(u.file),recovery:{format:'BASIC disk file',lines:file.item.lines,last:file.item.last_line,normal_end_marker:true,memory_base:file.item.memory_base,tape_relation:file.item.tape_relation},diskRun:menu(u.letter)});
 evidence.saves.at(-1).imported_files.push(...images);
 commitSave(meta,evidence,folder,id,`Preserve ${u.title} ${id}: Games Diskette ${u.file}`);
}

// ---- Existing programs: disk forms kept as source only.
const sourceReason='Disk form, kept as source. It is not the selected player for this program.';
const sourceOnly=[
 {id:'market',disk:GAMES,file:'MARKET.BAS',note:'Same as the last tape form except that it accepts N and returns to the disk menu.'},
 {id:'amazing-maze',disk:'More Voice',file:'MAZE.BAS',note:'Voice form: PRINT* calls the VS-100 speech synthesizer, which is not emulated.'},
 {id:'jab',disk:GAMES,file:'JAB.BAS',note:'Disk form with number-key input and debugging stubs. Not clearly better than the selected save.'},
 {id:'race',disk:'TRSDOS Basic System',file:'RACE',note:'62 records and no end marker. Preserved as found; the marker is not added.',raw:true},
];
for(const s of sourceOnly){
 const {folder,meta,evidence}=load(s.id);const id=nextId(meta);
 const file=basicFile(s.disk,s.file);
 const rawName=s.file.includes('.')?s.file:`${s.file}.BAS`;
 writeSave(folder,meta,evidence,{id,label:`${s.file} (${s.disk})`,disk:s.disk,source:`files/${s.file}`,rawName,listingName:rawName.replace('.BAS','.ASC'),raw:file.raw,listing:file.listing,
  unavailableReason:sourceReason,note:s.note,recovery:{format:'BASIC disk file',lines:file.item.lines,last:file.item.last_line,normal_end_marker:file.item.end_marker,memory_base:file.item.memory_base,tape_relation:file.item.tape_relation}});
 // A source form does not replace the canonical player: restore its stable files from the default.
 const chosen=meta.versions.find(v=>v.id===meta.defaultVersion);
 if(chosen){const stem=meta.id.toUpperCase();for(const [p,e] of [[chosen.raw,path.extname(rawName)],[chosen.listing,'.ASC']])fs.copyFileSync(path.join(folder,p),path.join(folder,'original',stem+e));}
 commitSave(meta,evidence,folder,id,`Preserve ${meta.title} ${id}: ${s.disk} ${s.file}`);
}

// ---- Same code as a tape save: new names and a provenance note, no new version.
const sameCode=[
 {id:'location-editor',title:'Illiad',description:'The Illni Adventure Game, in the disk menu’s words. This is its 25-line location editor, not a finished game.',file:'ILLIAD.BAS'},
 {id:'football-chase',title:'Football',description:'A (very) simple football video game, in the disk menu’s words.',file:'FOOTBALL.BAS'},
 {id:'spacecolony',file:'KING.BAS'},{id:'olympics',file:'OLYMPICS.BAS'},{id:'stable-matching',file:'VAL.BAS'},
];
for(const s of sameCode){
 const {folder,meta,evidence}=load(s.id);
 const item=diskInfo(GAMES).items.find(i=>i.name===s.file);
 evidence.also_on_disk={disk:GAMES,file:s.file,sha256:item.sha256,relation:item.tape_relation};
 if(s.title){
  const old=meta.title;meta.title=s.title;meta.description=s.description;evidence.official_title=s.title;
  evidence.title_authority=`Title from the Games Diskette menu (HELP.BAS). Earlier recovery label: ${old}.`;
  fs.writeFileSync(path.join(folder,'program.json'),JSON.stringify(meta,null,2)+'\n');
 }
 fs.writeFileSync(path.join(folder,'provenance.json'),JSON.stringify(evidence,null,2)+'\n');
 git('add',path.relative(repo,folder));git('commit','-q','-m',`Record ${meta.title} on the Games Diskette`);
}

// ---- New programs.
function newProgram({id,title,description,attribution,howTo,quickHelp,kind,language,sourceOnly:source}){
 const folder=path.join(repo,'programs',id);
 if(fs.existsSync(folder))throw Error(`Refusing to replace ${id}`);
 fs.mkdirSync(folder,{recursive:true});
 const meta={id,title,description,kind,language,gallery:'more',media:'disk',archiveImport:true,showWebVersions:false,unsharedWebV1:true,defaultVersion:'v01',
  versionOrder:'Disk saves have no recorded order or dates beyond their source comments. Any ordering here is a presentation guess.',versions:[],listingLabel:'Download recovered listing',
  attribution:{text:attribution}};
 if(howTo)meta.howTo=howTo;if(quickHelp)meta.quickHelp=quickHelp;
 if(source){meta.sourceOnly=true;meta.actionVerb='View source';}
 const evidence={official_title:title,title_authority:'Title from the recovered source or a descriptive display title; recovered text is unchanged.',import_date:today,order_inferred:true,saves:[]};
 const readme=`# ${title}\n\n${attribution}\n\n${description}\n\nPermanent snapshots are in versions/; canonical files advance per save in Git with program-specific tags. Disk images and hashes are in provenance.json. The recovered bytes are unchanged.\n`;
 fs.writeFileSync(path.join(folder,'README.md'),readme);
 fs.writeFileSync(path.join(folder,'VERIFICATION.md'),`# Verification\n\nFiles were copied byte for byte and SHA-256 checked against the disk manifest. app/scripts/check-disk-programs.mjs starts each playable program from its original disks through the real ROM and checks its first screen. This does not validate every routine or any historical gameplay claim.\n`);
 return {folder,meta,evidence};
}
const forthCredit='From a 1982 MMSFORTH disk; the source names no author. Runs on MMSFORTH V2.0, © 1981 Miller Microcomputer Services. '+COPYRIGHT;
const lispCredit='I wrote this in LISP. It runs on LISP 3.72, © 1981 Ronald L. Nicol, distributed by SuperSoft. '+COPYRIGHT;
const NP='MMSFORTH New Programs',NB='MMSFORTH New Program Backup',FS='MMSFORTH Forth System',KB='MMSFORTH Knowledge Base';
const boot=[{wait:'HI CARL'}];
const load1=n=>[{type:`${n} LOAD\n`},{wait:`^${n} LOAD[ ]+OK`}];
const swapTo=index=>[{swap:index},{type:'EMPTY-BUFFERS\n'},{wait:'^EMPTY-BUFFERS[ ]+OK'}];

const forth=[
 {id:'go',title:'Go',blocks:[22,28],name:'GO',description:'Two-player Go on a 19-by-19 board drawn in TRS-80 graphics.',
  howTo:['Black and white take turns. Move the cursor with the arrow keys or 1, 2, 3, 4 (up, down, left, right), then press Enter to place a stone. Captured stones are removed after each move.','The game has no ending; use Restart for a new board.'],quickHelp:'Arrow keys or 1 2 3 4 move; Enter places a stone.',
  steps:[...boot,...load1(49),...swapTo(1),...load1(20),{type:'22 LOAD\n'},{wait:'DUP-NAME: RIGHT.*OK'},{type:'GO\n'}],images:['forth','newprograms']},
 {id:'growth',title:'Growth',blocks:[34,40],name:'GROWTH',description:'A two-player board game: dice rolls and chosen strategies grow X and O until the board holds 64 pieces.',
  howTo:['At WHICH STRATEGY each player picks a number from the choices shown, then press Enter to keep the current value. Higher numbers grow faster but carry their own risks. The pieces then grow by themselves; press the keys the game shows to change strategy.'],quickHelp:'Pick a strategy number when asked; the board then grows by itself.',
  steps:[...boot,...swapTo(1),{type:'34 LOAD\n'},{wait:'IS RANDOM LOADED'},{type:'n'}],images:['forth','newprograms']},
 {id:'screenfun',title:'Screen Fun',blocks:[70,71],name:'SCREENFUN',description:'A graphics drawing program, dated 10-12-82.',
  howTo:['Read its help page and press Enter. D draws, E erases, and M moves without drawing. The arrow keys move the cursor, / Z and 1 move diagonally, C clears the screen, W fills it, H shows help, and Q quits.'],quickHelp:'D draw, E erase, M move, arrow keys steer, H help, Q quit.',
  steps:[...boot,...swapTo(1),{type:'70 LOAD\n'},{wait:'GRAPHICS LOADED'},{type:'n'}],images:['forth','newprograms']},
 {id:'tones',title:'Sound & Tones',blocks:[80,84],name:'TONES',description:'Three playable keyboards that make tones through the cassette port, dated 10-14-82.',sound:true,
  howTo:['Click the screen, then type KEYBOARD and press Enter for a piano-like keyboard, OLDBOARD for the one used for demos, or DELTABOARD for an experimental one. Then play on the letter keys. Sound comes from the emulated cassette port.'],quickHelp:'Type KEYBOARD, OLDBOARD, or DELTABOARD, then Enter. Letters play notes.',
  steps:[...boot,...load1(49),...swapTo(1),{type:'80 LOAD\n'},{wait:'THREE KEYBOARDS'}],images:['forth','newprograms']},
 {id:'turtle',title:'Turtle Graphics',blocks:[16,19],name:'TURTLE',description:'Logo-style turtle drawing on the TRS-80 graphics screen, dated October 1982.',
  howTo:['At the OK prompt, type turtle commands and press Enter, for example: 10 F 90 R 10 F. F forward, B backward, R right, L left, D draw, PU pen up, C clear, P page, H home, S speed, ST straight, FF flash, SH show. HELP lists them. TO defines a new command.'],quickHelp:'Try 10 F 90 R 10 F then Enter. HELP lists the commands.',
  steps:[...boot,...swapTo(1),{type:'16 LOAD\n'},{wait:'IS FLOATING POINT IN'},{type:'n'},{wait:'PUT THE UTILITIES DISK IN'},{swap:2},{press:'Enter'},{wait:'PUT TURTLE DISK BACK IN'},{swap:1},{press:'Enter'},{wait:'DUP-NAME: L .*OK'}],images:['forth','newprograms','utilities']},
 {id:'spacestationzap',title:'Space Station Zap',blocks:[74,78],name:'SPACESTATIONZAP',description:'Builds and draws a random space-station map of rooms, walls, doors, and shields. The monsters, keys, and weapons its comments plan were not written.',
  howTo:['It draws a new station when it starts and then returns to the prompt. There is no gameplay. Restart draws another.'],quickHelp:'It draws a random station map. There is no gameplay.',
  steps:[...boot,...load1(49),...load1(53),...load1(54),...swapTo(1),{type:'74 LOAD\n'}],images:['forth','newprograms']},
];
for(const p of forth){
 const made=newProgram({...p,attribution:forthCredit,kind:'MMSFORTH',language:'MMSFORTH V2.0, TRS-80 Model I'});
 const images=copyImages(made.folder,p.images);
 const b=blocks(NP,...p.blocks);
 writeSave(made.folder,made.meta,made.evidence,{id:'v01',label:`${p.title} (blocks ${p.blocks[0]}-${p.blocks[1]})`,disk:NP,source:`blocks ${p.blocks[0]}-${p.blocks[1]}`,rawName:`${p.name}.bin`,listingName:`${p.name}.txt`,raw:b.raw,listing:b.listing,
  playable:true,note:'Source blocks copied unchanged from the New Programs disk. The player boots the Forth System disk and loads them with the original commands. Checked to its first screen only.',recovery:{format:'MMSFORTH blocks',first_block:p.blocks[0],last_block:p.blocks[1]},diskRun:{images:imagePaths(p.images),steps:p.steps},sound:p.sound,running:'Running MMSFORTH from the original disks'});
 made.evidence.saves.at(-1).imported_files.push(...images);
 commitSave(made.meta,made.evidence,made.folder,'v01',`Preserve ${p.title} v01: ${NP} blocks ${p.blocks[0]}-${p.blocks[1]}`);
 if(p.id==='growth'){
  const earlier=blocks(NB,36,40);
  writeSave(made.folder,made.meta,made.evidence,{id:'v02',label:'Growth, 5-page form (New Program Backup)',disk:NB,source:'blocks 36-40',rawName:'GROWTH-5PAGE.bin',listingName:'GROWTH-5PAGE.txt',raw:earlier.raw,listing:earlier.listing,
   unavailableReason:'Shorter form, kept as source. The site plays the 7-page form.',note:'Shorter 5-page form. Its order relative to the 7-page form is inferred from length.',recovery:{format:'MMSFORTH blocks',first_block:36,last_block:40}});
  const original=path.join(made.folder,'original');fs.writeFileSync(path.join(original,'GROWTH.bin'),b.raw);fs.writeFileSync(path.join(original,'GROWTH.txt'),b.listing,'latin1');
  commitSave(made.meta,made.evidence,made.folder,'v02','Preserve Growth v02: New Program Backup blocks 36-40');
 }
}

// LISP: the interpreter stays on its disk; the two function libraries travel with their programs.
// GPS's reconstructed PUSH-RIGHT and CLIMB-UP steps and note were added to its metadata after this import; see programs/gps/provenance.json.
function lispFiles(disk,folder){
 return diskInfo(disk).items.filter(i=>i.status==='active'&&i.kind==='LISP').map(i=>{
  const bytes=fs.readFileSync(path.join(extracted,disk,'files',i.name));assertHash(bytes,i.sha256,i.name);
  const name=i.name.endsWith('.LSP')?i.name:`${i.name}.LSP`;
  return {name,bytes,archive:`files/${i.name}`,source:i.name};
 });
}
const lispStart=[{wait:'DOS READY'},{delay:1},{type:'LISP\n'},{wait:'^-> _? *$'}];
const lispLoad=name=>[{type:`(LOAD (QUOTE ${name}))\n`},{wait:'^-> _? *$'}];
const lisp=[
 {id:'deriv',title:'Deriv',disk:'LISP',file:'DERIV.LSP',description:'A symbolic differentiator in LISP. Give it an expression and a variable, and it prints the derivative.',
  howTo:['At the > prompt, type an infix expression in parentheses and press Enter, then type the variable and press Enter. For example, (X * X) and then X. Use [ for a power, :+: for plus, :-: for minus, * and /, and functions such as (SIN X).','Files cannot be saved: the disk is write-protected in this player. BREAK returns to the LISP prompt.'],quickHelp:'Type (X * X), Enter, then X, Enter. [ is a power; :+: and :-: add and subtract.',
  images:['lisp'],steps:[...lispStart,{type:'(LOAD (QUOTE DERIV/LSP))\n'},{wait:'^NIL *$'},{delay:0.2},{type:'(DERIV)\n'},{wait:'^>_? *$'}]},
 {id:'gps',title:'GPS Planner',disk:'LISP Dos',file:'GPS',description:'A General Problem Solver in LISP: it plans how to push a box, climb, and grasp by working on the largest difference between the current state and the goal.',
  howTo:['A state is a height (ON or OFF), a hand (GRASP or UNGRASP), and a place (DOOR, MIDDLE, or WINDOW). The player runs one plan when it starts. Try your own at the -> prompt:','(GPS (QUOTE (OFF UNGRASP DOOR)) (QUOTE (ON GRASP WINDOW)))','LISP itself starts from the LISP disk, and then the disk holding these functions replaces it, as the two disks were used together.'],quickHelp:'At the -> prompt, type (GPS (QUOTE start) (QUOTE goal)).',
  images:['lisp','lispdos'],steps:[...lispStart,{swap:1},...['GPS','SELECT','PRECON','MAJOR','MATCH','COMBINE','CADDR','LOOKFOR','APPEND','SETPROP','CLIMB','PUSH','GRASP','UNGRASP'].flatMap(lispLoad),{type:'(SETPROP)\n'},{delay:1},{type:'(GPS (QUOTE (OFF UNGRASP DOOR)) (QUOTE (ON GRASP MIDDLE)))\n'}]},
];
for(const p of lisp){
 const made=newProgram({...p,attribution:lispCredit,kind:'LISP',language:'LISP 3.72, TRS-80 Model I'});
 const images=copyImages(made.folder,p.images);
 const files=lispFiles(p.disk);
 const name=p.file.endsWith('.LSP')?p.file:`${p.file}.LSP`;
 const main=files.find(f=>f.name===name);
 const view=fs.readFileSync(path.join(extracted,p.disk,'readable',`${p.file}.txt`),'latin1');
 const others=files.filter(f=>f!==main).map(f=>({name:f.name,bytes:f.bytes,archive:f.archive}));
 writeSave(made.folder,made.meta,made.evidence,{id:'v01',label:`${p.title} (${p.disk} disk)`,disk:p.disk,source:`files/${p.file}`,rawName:name,listingName:`${p.file.replace('.LSP','')}.txt`,raw:main.bytes,listing:view,extra:others,
  playable:true,note:'LISP source file copied unchanged, with the other function files from its disk. Each is exact directory bytes; files carry a .LSP suffix here for download. The readable view removes record padding and marks unrelated leftovers. EDIT prints its own credit to Ronald L. Nicol.',recovery:{format:'LISP source'},diskRun:{images:imagePaths(p.images),steps:p.steps},running:'Running LISP from the original disks'});
 made.evidence.saves.at(-1).imported_files.push(...images);
 commitSave(made.meta,made.evidence,made.folder,'v01',`Preserve ${p.title} v01: ${p.disk} ${p.file}`);
}

// Source only.
const reason='Preserved as source. It is not offered as a player.';
function sourceBlocks({id,title,description,attribution,items}){
 const made=newProgram({id,title,description,attribution,kind:'Source archive',language:'MMSFORTH V2.0, TRS-80 Model I',sourceOnly:true});
 items.forEach((it,i)=>{
  const version=`v${String(i+1).padStart(2,'0')}`;const b=blocks(it.disk,it.first,it.last);
  writeSave(made.folder,made.meta,made.evidence,{id:version,label:`${it.label} (blocks ${it.first}-${it.last})`,disk:it.disk,source:`blocks ${it.first}-${it.last}`,rawName:`${it.file}.bin`,listingName:`${it.file}.txt`,raw:b.raw,listing:b.listing,unavailableReason:it.reason??reason,note:it.note,recovery:{format:'MMSFORTH blocks',first_block:it.first,last_block:it.last}});
  commitSave(made.meta,made.evidence,made.folder,version,`Preserve ${title} ${version}: ${it.disk} blocks ${it.first}-${it.last}`);
 });
}
sourceBlocks({id:'forth-drafts',title:'Forth Drafts and Fragments',description:'Unfinished programs, experiments, and small tools from the 1982 MMSFORTH disks.',attribution:'From 1982 MMSFORTH disks. Most source names no author; the decoder is initialed RWL. '+COPYRIGHT,items:[
 {disk:NP,first:45,last:51,label:'Conquest',file:'CONQUEST',note:'Space strategy game in progress. No start word; some characters are stored as z, j, and p.'},
 {disk:NP,first:60,last:61,label:'Block World',file:'BLOCK-WORLD',note:'Falling-objects world. REFALL is used but never defined.'},
 {disk:NP,first:21,last:21,label:'String Play',file:'STRING-PLAY',note:'A short, unfinished string experiment.'},
 {disk:NP,first:43,last:43,label:'MIU System',file:'MIU',note:'Hofstadter’s MIU formal system: rules I to III and a display word.'},
 {disk:NP,first:56,last:56,label:'Linear Algebra Package',file:'LINEAR-ALGEBRA',note:'One block dated 6/10/82; the listing spells it PACKARE.'},
 {disk:NP,first:73,last:73,label:'Smallest Way',file:'SMALLEST-WAY',note:'Dated 10-20-82. CALC and RSLT are never defined.'},
 {disk:NB,first:63,last:65,label:'Bus Schedule',file:'BUS-SCHEDULE',note:'Dated 11-20-82, with its timetable data. BUS calls words that were never written.'},
 {disk:NB,first:41,last:42,label:'Cipher',file:'CIPHER',note:'Encrypts or decrypts a block buffer with a five-keystroke key. Dated December 1982.'},
 {disk:NP,first:55,last:55,label:'Decoder',file:'DECODER',note:'ROT-13 decoder initialed RWL, dated Nov 11, 1982. The Forth System disk holds a slightly different form.'},
 {disk:NP,first:65,last:66,label:'Digit Recording',file:'DIGIT-RECORDING',note:'Samples the cassette port into an array and plays it back. Needs PSE, defined only in the authors’ compiled system.'},
 {disk:NP,first:30,last:31,label:'Music Assembly Code',file:'MUSIC-ASSEMBLY',note:'A Z80 tone routine as bytes and as assembler source.'},
 {disk:FS,first:21,last:24,label:'Logging',file:'LOGGING',note:'An unfinished screen-logging routine in Pascal-like pseudocode and Forth.'},
 {disk:FS,first:73,last:73,label:'Other Definitions',file:'OTHER-DEFINITIONS',note:'Dated 10/07/82: EDIT guard, RINDEX, and RFIX.'},
]});
sourceBlocks({id:'expert2-rules',title:'Expert-2 Rule Sets',description:'Knowledge bases written for Jack Park’s Expert-2 shell, dated 1984.',attribution:'Written for Expert-2, Jack Park’s rule-based shell in MMSFORTH (Dr. Dobb’s Journal, April 1984). The source names no author for these rule sets. '+COPYRIGHT,items:[
 {disk:KB,first:50,last:85,label:'Forth Wiz',file:'FORTH-WIZ',note:'A help system that recommends Forth words from a description.'},
 {disk:KB,first:30,last:36,label:'Family Relationships',file:'FAMILY-RELATIONSHIPS',note:'Works out relationships through a lowest common ancestor.'},
 {disk:KB,first:40,last:43,label:'Tic-Tac-Toe',file:'TIC-TAC-TOE',note:'Move-choice rules.'},
 {disk:KB,first:46,last:49,label:'Verify Support',file:'VERIFY-SUPPORT',note:'Replacement definitions for Expert-2 internals, dated 05/08/84.'},
]});
function sourceBasic({id,title,description,items,extra=[]}){
 const made=newProgram({id,title,description,attribution:'From a recovered disk; the source names no author. '+COPYRIGHT,kind:'Source archive',language:'TRS-80 Disk BASIC',sourceOnly:true});
 items.forEach((it,i)=>{
  const version=`v${String(i+1).padStart(2,'0')}`;const file=basicFile(it.disk,it.file);
  const rawName=it.file.includes('.')?it.file:`${it.file}.BAS`;
  writeSave(made.folder,made.meta,made.evidence,{id:version,label:`${it.file} (${it.disk})`,disk:it.disk,source:`files/${it.file}`,rawName,listingName:rawName.replace('.BAS','.ASC'),raw:file.raw,listing:file.listing,
   extra:i===0?extra.map(e=>{const bytes=fs.readFileSync(path.join(extracted,e.disk,'files',e.file));return {name:`${e.file}.txt`,bytes,archive:`files/${e.file}`};}):[],
   unavailableReason:reason,note:it.note,recovery:{format:'BASIC disk file',lines:file.item.lines,last:file.item.last_line,normal_end_marker:file.item.end_marker,memory_base:file.item.memory_base,tape_relation:file.item.tape_relation}});
  commitSave(made.meta,made.evidence,made.folder,version,`Preserve ${title} ${version}: ${it.disk} ${it.file}`);
 });
}
const MV='More Voice',TK='Talker';
sourceBasic({id:'spell',title:'Spell',description:'A scored word game that graphs each run against the average and keeps records, with its word list and record file.',items:[{disk:MV,file:'PROTO.BAS',note:'A short test of the score graph.'},{disk:MV,file:'SPELL.BAS',note:'Reads WORDS.DAT and RECORD.DAT, which are kept with the first version here.'}],extra:[{disk:MV,file:'WORDS.DAT'},{disk:MV,file:'RECORD.DAT'}]});
sourceBasic({id:'combo',title:'Combination Lister',description:'Prints the Cth combination of U items taken N at a time, with an option to name a card deck.',items:[{disk:MV,file:'COMBO.BAS',note:'Its comments call the routines at 4110 and 4120 a speedup that needs work.'}]});
sourceBasic({id:'perm',title:'Permutation Lister',description:'Prints a chosen permutation of named objects without listing the others.',items:[{disk:MV,file:'PERM.BAS',note:'Different code from the separate Permutations program on tape.'},{disk:MV,file:'PERMLONG.BAS',note:'Extended form.'}]});
sourceBasic({id:'timer',title:'Timer',description:'A list of timed reminders that announces them through the speech synthesizer.',items:[{disk:MV,file:'TIMER.BAS',note:'Uses the disk clock and PRINT* speech, which is not emulated.'}]});
sourceBasic({id:'disk-tools',title:'Disk Tools and Menu',description:'The Games Diskette menu and small utilities from the recovered disks.',items:[
 {disk:GAMES,file:'HELP.BAS',note:'The Games Diskette’s menu: BASIC GAMES DISKETTE ONE.'},
 {disk:TK,file:'GETDISK.BAS',note:'Copies disk files to cassette.'},{disk:TK,file:'GETTAPE.BAS',note:'Copies tape files back to disk.'},
 {disk:TK,file:'DISKDUMP.BAS',note:'SECTOR DUMP UTILITY 2.2: prints a file’s sectors in hex and text.'},
 {disk:TK,file:'CASEFIX.BAS',note:'Converts a text file’s lowercase to uppercase. Has a bug at line 60.'},{disk:TK,file:'SAVEFIX.BAS',note:'The corrected CASEFIX.'},{disk:TK,file:'DEL',note:'A two-line text file viewer.'},
]});
console.log('Imported at',git('rev-parse','--short','HEAD'));
