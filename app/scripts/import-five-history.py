"""Preserve the requested five mystery, computing, and simulation programs and canonical per-save history."""
import argparse,csv,hashlib,json,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('--commit',action='store_true');p.add_argument('--resume',action='store_true');args=p.parse_args()
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
 ('whodonnt','Who Donnt?','Question suspects, inspect weapons, and investigate a household murder.', [('tape12a',6),('tape12a',9),('tape12a',10),('tape12a',12)],4,'Consecutive tape12a saves progressively add weapons, interrogation, and courtroom code. v04 is the most developed captured draft; its courtroom ending is unfinished.'),
 ('dungeon','Dungeon Trainer','Practice fantasy combat with armor, weapons, parrying, and withdrawal.', [('file8b',8),('file8b',9),('tape3a',15),('tape3a',16)],2,'Text prototypes precede the graphics-extension branch by source features; cross-tape chronology is inferred. The self-contained text v02 is playable; later LINE/GET/PUT animation forms require an unavailable graphics extension.'),
 ('tutac','TUTAC Computer','Run a decimal computer simulator and its embedded punched-card program.', [('file8b',18),('file8b',19)],1,'Consecutive complete saves add subtraction and experimental multiplication. v01 runs its embedded addition deck; v02 contains debugging STOP statements. A separate suspect v03 candidate remains in review/.'),
 ('tank','Unfinished Tank Game','Study an unfinished design for programmable battling tanks.', [('tape16a',4)],0,'One validated captured design draft, with an earlier uncertain tape1a candidate preserved separately. Its 1980 Carl Kadie notice is a source credit, not a save date. No runnable captured edition exists.'),
 ('ll','Lunar Lander','Land a lunar capsule by choosing rocket burn rate and duration.', [('tape9a',9)],1,'Comparison history starts with Jim Storer’s 1969 FOCAL listing, then an electronic transcription of the published BASIC Lunar. The recovered BASIC adaptation adds plotting and adjustable duration; its exact intermediate source edition and save date are unknown.')]




for slug,*_ in configs:
 if git('tag','--list',slug+'-v*'):raise SystemExit(f'Refusing to replace completed tagged history for {slug}')
 if (r/'programs'/slug/'program.json').exists() and not args.resume:raise SystemExit(f'Refusing to overwrite {slug}')
for slug,title,description,saves,selected,order in configs:
 folder=r/'programs'/slug;folder.mkdir(parents=True,exist_ok=True)
 metadata=dict(id=slug,title=title,description=description,kind='Game',language='Level II BASIC',gallery='more',showWebVersions=False,unsharedWebV1=True,defaultVersion=f'v{max(1,selected):02}',versionOrder=order,versions=[])
 if slug=='tank':metadata.update(sourceOnly=True,actionVerb='View source')
 evidence=dict(official_title=title,title_authority='Recovered title or descriptive title from the recovered behavior; archive labels retained.',short_name=slug,import_date='2026-11-03',order_inferred=True,order_evidence=order,execution_testing='Recovery validation is separate from website emulator checks; see VERIFICATION.md.',saves=[])
 evidence['dating']={'direct_source_lines':[], 'caution':'Source/publication dates do not establish tape-save dates. See history/README.md for direct and contextual evidence.'}
 if (folder/'upstream/provenance.json').exists():evidence['upstream']=json.loads((folder/'upstream/provenance.json').read_text())
 for i,(capture,save) in enumerate(saves,1):
  row=next(x for x in rows if x['capture']==capture and int(x['order'])==save)
  source=Path(row['source_file']);raw=source.with_suffix('.BAS');v=f'v{i:02}';dest=folder/'versions'/v;dest.mkdir(parents=True,exist_ok=True)
  paths=[raw,source]
  b=(archive/raw).read_bytes()
  assessment=structure(b)
  files=[]
  for path in paths:
   target=dest/path.name;shutil.copyfile(archive/path,target);data=target.read_bytes();assert data==(archive/path).read_bytes()
   files.append(dict(path=target.relative_to(folder).as_posix(),archive_path=path.as_posix(),bytes=len(data),sha256=digest(data)))
  (dest/'README.md').write_text(f'# {title} {v}\n\nUntouched {capture} save {save}. The raw payload and listing are copied byte for byte. See ../../provenance.json.\n')
  playable=i==selected
  metadata['versions'].append(dict(id=v,label=row['summary'].split(';')[0],capture=capture,save=save,raw=files[0]['path'],listing=files[1]['path'],playable=playable,**({'slug':'basic'} if playable else {}),note='Untouched recovered save. '+row['validation'],unavailableReason=None if playable else ('Unfinished design draft: pseudocode, incomplete syntax, missing setup and DESTROYED routine. No runnable recovered version exists.' if slug=='tank' else 'Source only: earlier prototype, debugging stops, or unavailable graphics extension. The site offers one selected self-contained reference.')))
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
 write(folder/'program.json',metadata)
 (folder/'README.md').write_text(f'# {title}\n\n{description}\n\n{order}\n\nSelected reference: {metadata["defaultVersion"]}; Tank Game is source only. All recovered bytes are preserved unchanged. See provenance.json and VERIFICATION.md.\n')
 print(slug,len(saves),'complete saves preserved and validated')
