"""Preserve the four requested programs, canonical commits, and archive evidence."""
import argparse,csv,hashlib,json,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('--commit',action='store_true');args=p.parse_args()
r=Path(__file__).resolve().parents[2];archive=args.archive.resolve()
rows=list(csv.DictReader((archive/'tape-inventory.tsv').open(encoding='utf-8-sig'),delimiter='\t'))
def digest(b):return hashlib.sha256(b).hexdigest()
def write(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,indent=2)+'\n')
def git(*a):return subprocess.check_output(['git',*a],cwd=r).decode().strip()
def structure(b):
 assert b[:3]==b'\xd3'*3
 o=4;last=-1;lines=0;bases=set()
 while int.from_bytes(b[o:o+2],'little'):
  ptr=int.from_bytes(b[o:o+2],'little');line=int.from_bytes(b[o+2:o+4],'little');assert line>last
  end=b.index(0,o+4);bases.add(ptr-end-1);last=line;lines+=1;o=end+1
 assert o+2==len(b) and len(bases)==1
 return dict(lines=lines,last=last,pointer_base=bases.pop(),normal_end_marker=True,sha256=digest(b))
configs=[
 ('skinner','Skinner Box','Discover a hidden reinforcement schedule by acting as the rat.', [('tape10a',n) for n in [1,2,3]],3,'Three successive tape10a forms; later saves add schedule identification and statistics.'),
 ('german','German tutor','Practice German verbs and vocabulary with a configurable original quiz.', [('tape11a',n) for n in [5,8,9,11]]+[('tape25a',n) for n in [7,8,9,10]]+[('tape13a',n) for n in [1,2]]+[('tape19b',n) for n in [14,15]],12,'Inferred grouping by source features and lessons, not tape numbering: early vocabulary forms, timed vocabulary/template forms, then vocabulary and verb forms with configurable grading. Different lessons are not necessarily successive revisions. The two tape19b verb saves are the selected developed form; exact cross-tape chronology remains uncertain.'),
 ('magazine','Magazine Index','An alphabetized subject index of historical magazine articles, printed by the original BASIC.', [('tape7a',1),('tape7a',2),('tape11a',3),('tape7b',1),('tape7b',2)]+[('tape7a',n) for n in range(3,9)],11,'Inferred from source changes: empty templates precede data-bearing forms, and tape7a V2 through V6 expand formatting and article data. Cross-tape template order is uncertain. V6 is the selected complete index.'),
 ('teachvi','TEACH VI','An early German vocabulary quiz credited January 11, 1979.', [('tape12a',2),('tape22b',5)]+[('tape12b',n) for n in [4,7,8,13]],6,'Inferred from added scoring, question-range selection, and retry behavior; the fixed-length tape22b form precedes the configurable tape12b forms in this presentation. Cross-tape chronology is uncertain.'),
 ('poker','Poker','Play five-card draw against the computer with the recovered text version.', [('tape4b',2),('tape12b',6)]+[('tape4b',n) for n in [13,14,15,16]],2,'The self-contained text form and its repeat precede graphical revisions in inferred development order. Later forms use LINE/GET/PUT extensions unavailable in the stock ROM. The text repeat is the playable default.'),
 ('life','LIFE','Draw a population and watch the original Z80 assembly run Conway’s Game of Life.', [('tape10b',n) for n in range(1,7)],6,'Six consecutive EDTASM source saves, ordered by within-side sequence and code changes. Source dates are unknown. The last complete source is assembled separately for execution; the recovered compiled recording is only a header.')]

for slug,*_ in configs:
 if (r/'programs'/slug).exists():raise SystemExit(f'Refusing to overwrite {slug}')
for slug,title,description,saves,selected,order in configs:
 folder=r/'programs'/slug;folder.mkdir(parents=True)
 metadata=dict(id=slug,title=title,description=description,kind='Simulation' if slug in ['logic','orbit'] else 'Game',language='Level II BASIC',gallery='more',showWebVersions=False,unsharedWebV1=True,defaultVersion=f'v{selected:02}',versionOrder=order,versions=[])
 evidence=dict(official_title=title,title_authority='Printed in recovered source' if slug in ['rickyrat','pinball'] else 'Descriptive recovery title inferred from source behavior; no explicit title screen identified.',short_name=slug,import_date='2026-11-02',order_inferred=True,order_evidence=order,execution_testing='Recovery validation is separate from website emulator checks; see VERIFICATION.md.',saves=[])
 if slug=='rickyrat':evidence['dating']={'direct_source_line':"6000 'RICKY RAT  BY CARL KADIE   6 AUG 82   K",'interpretation':'Direct dated source credit; does not establish every revision date or tape save date.'}
 else:evidence['dating']={'direct_date':None,'caution':'No save date is established. Neighboring copyright/source dates provide context only.'}
 for i,(capture,save) in enumerate(saves,1):
  row=next(x for x in rows if x['capture']==capture and int(x['order'])==save)
  source=Path(row['source_file']);raw=source.with_suffix('.BAS');v=f'v{i:02}';dest=folder/'versions'/v;dest.mkdir(parents=True)
  if slug=='life':raw=source.with_suffix('.ASM')
  paths=[raw,source]+([source.with_suffix('.Z80')] if slug=='life' else [])
  b=(archive/raw).read_bytes()
  if slug=='life':
   assert b[0]==0xd3 and b[-1]==0x1a
   records=b[7:-1].split(b'\r');assert records[-1]==b''
   assert all(len(x)>=6 and all(0xb0<=c<=0xb9 for c in x[:5]) and x[5]==32 for x in records[:-1])
   numbered='\n'.join(bytes(c&127 for c in x).decode('ascii') for x in records[:-1])+'\n'
   assert numbered==(archive/source).read_text()
   assert '\n'.join(x[6:] for x in numbered.splitlines())+'\n'==(archive/source.with_suffix('.Z80')).read_text()
   assessment=dict(format='EDTASM',lines=len(records)-1,normal_end_marker=True,sha256=digest(b))
  else:assessment=structure(b)
  files=[]
  for path in paths:
   target=dest/path.name;shutil.copyfile(archive/path,target);data=target.read_bytes();assert data==(archive/path).read_bytes()
   files.append(dict(path=target.relative_to(folder).as_posix(),archive_path=path.as_posix(),bytes=len(data),sha256=digest(data)))
  playable=i==selected
  metadata['versions'].append(dict(id=v,label=row['summary'].split(';')[0],capture=capture,save=save,raw=files[0]['path'],listing=files[1]['path'],playable=playable,**({'slug':'basic'} if playable else {}),note='Untouched recovered save. '+row['validation'],unavailableReason=None if playable else 'Source only. The site plays one selected best version; this save is preserved for comparison.'))
  evidence['saves'].append(dict(version=v,capture=capture,save=save,archive_raw=raw.as_posix(),archive_listing=source.as_posix(),imported_files=files,recovery_item=assessment,inventory_row=row,recovery_inventory=f'tapes/recovered/{capture}/inventory.json',execution_tested=False))
  write(folder/'program.json',metadata);write(folder/'provenance.json',evidence)
  canonical=folder/'original';canonical.mkdir(exist_ok=True)
  for path in paths:shutil.copyfile(archive/path,canonical/(slug.upper()+path.suffix))
  write(canonical/'provenance.json',evidence['saves'][-1])
  if args.commit:
   git('add',str(folder.relative_to(r)));git('commit','-q','-m',f'Preserve {title} {v}: {capture} save {save}');git('tag',f'{slug}-{v}')
   for path in paths:
    relative=(canonical/(slug.upper()+path.suffix)).relative_to(r).as_posix()
    assert digest(subprocess.check_output(['git','show',f'HEAD:{relative}'],cwd=r))==digest((archive/path).read_bytes())
 if slug=='life':metadata['language']='Z80 assembly';metadata['format']='EDTASM'
 write(folder/'program.json',metadata)
 (folder/'README.md').write_text(f'# {title}\n\n{description}\n\n{order}\n\nOnly {metadata["defaultVersion"]} is playable. All recovered bytes are preserved unchanged. See provenance.json and VERIFICATION.md.\n')
 print(slug,len(saves),'complete saves preserved and validated')
