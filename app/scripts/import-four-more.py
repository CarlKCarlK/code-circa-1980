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
 ('rickyrat','Ricky Rat','Two rats race through a generated maze, using the original 1982 BASIC algorithms.', [('tape18b',n) for n in [2,3,4,5,6,7,8,10,11,12,13,14,16,17,18]],15,
 'Inferred from source changes and within-side save order. All complete saves are on tape18b; saves 2 and 3 repeat the first form. Saves 15 and 19 are damaged and remain separate. Import v15 is recovery-label V14, save 18, the latest complete form. The later damaged V15 is not substituted or repaired.'),
 ('pinball','Pinball','A BASIC pinball table with bumpers, scoring, five balls, and a Space-controlled flipper.', [('tape9b',n) for n in range(16,22)]+[('tape12a',11)],7,
 'Inferred from source changes: the three tape9b forms each have repeated saves; tape12a save 11 adds rounded display addresses and changed collision/miss handling. Cross-tape order is an inference from these edits, not tape numbering or an established date.'),
 ('logic','Logic circuit simulator','Create switches, gates, and lights; wire a circuit and test its output in original BASIC.', [('tape15b',n) for n in range(14,19)],5,
 'Inferred from five consecutive tape15b saves. Later forms add device identification, initialization, reset, and truth-table functionality; source grows from 45 to 116 lines. Dates are not established. The latest complete save is the selected reference.'),
 ('orbit','Orbit simulator','Plot a spacecraft’s motion around massive bodies with an early BASIC gravity simulation.', [('tape11b',n) for n in [11,13,14,15,16,17]],6,
 'Inferred from source changes and tape11b save order: six labeled forms, with later forms adding adaptive scale and setup options. The v1–v4 and v5–v6 groups are parts of the same simulator. Some latest menu branches are unfinished historical code; completeness of cassette recovery is separate from runtime behavior.')]
for slug,*_ in configs:
 if (r/'programs'/slug).exists():raise SystemExit(f'Refusing to overwrite {slug}')
for slug,title,description,saves,selected,order in configs:
 folder=r/'programs'/slug;folder.mkdir(parents=True)
 metadata=dict(id=slug,title=title,description=description,kind='Simulation' if slug in ['logic','orbit'] else 'Game',language='Level II BASIC',gallery='more',showWebVersions=False,defaultVersion=f'v{selected:02}',versionOrder=order,versions=[])
 evidence=dict(official_title=title,title_authority='Printed in recovered source' if slug in ['rickyrat','pinball'] else 'Descriptive recovery title inferred from source behavior; no explicit title screen identified.',short_name=slug,import_date='2026-11-02',order_inferred=True,order_evidence=order,execution_testing='Recovery validation is separate from website emulator checks; see VERIFICATION.md.',saves=[])
 if slug=='rickyrat':evidence['dating']={'direct_source_line':"6000 'RICKY RAT  BY CARL KADIE   6 AUG 82   K",'interpretation':'Direct dated source credit; does not establish every revision date or tape save date.'}
 else:evidence['dating']={'direct_date':None,'caution':'No save date is established. Neighboring copyright/source dates provide context only.'}
 for i,(capture,save) in enumerate(saves,1):
  row=next(x for x in rows if x['capture']==capture and int(x['order'])==save)
  source=Path(row['source_file']);raw=source.with_suffix('.BAS');v=f'v{i:02}';dest=folder/'versions'/v;dest.mkdir(parents=True)
  b=(archive/raw).read_bytes();assessment=structure(b);files=[]
  for path in [raw,source]:
   target=dest/path.name;shutil.copyfile(archive/path,target);data=target.read_bytes();assert data==(archive/path).read_bytes()
   files.append(dict(path=target.relative_to(folder).as_posix(),archive_path=path.as_posix(),bytes=len(data),sha256=digest(data)))
  playable=i==selected
  metadata['versions'].append(dict(id=v,label=row['summary'].split(';')[0],capture=capture,save=save,raw=files[0]['path'],listing=files[1]['path'],playable=playable,**({'slug':'basic'} if playable else {}),note='Untouched recovered save. '+row['validation'],unavailableReason=None if playable else 'Source only. The site plays one selected best version; this save is preserved for comparison.'))
  evidence['saves'].append(dict(version=v,capture=capture,save=save,archive_raw=raw.as_posix(),archive_listing=source.as_posix(),imported_files=files,recovery_item=assessment,inventory_row=row,recovery_inventory=f'tapes/recovered/{capture}/inventory.json',execution_tested=False))
  write(folder/'program.json',metadata);write(folder/'provenance.json',evidence)
  canonical=folder/'original';canonical.mkdir(exist_ok=True)
  for path in [raw,source]:shutil.copyfile(archive/path,canonical/(slug.upper()+path.suffix))
  write(canonical/'provenance.json',evidence['saves'][-1])
  if args.commit:
   git('add',str(folder.relative_to(r)));git('commit','-q','-m',f'Preserve {title} {v}: {capture} save {save}');git('tag',f'{slug}-{v}')
   for path in [raw,source]:
    relative=(canonical/(slug.upper()+path.suffix)).relative_to(r).as_posix()
    assert digest(subprocess.check_output(['git','show',f'HEAD:{relative}'],cwd=r))==digest((archive/path).read_bytes())
 print(slug,len(saves),'complete saves preserved and validated')
# Untouched damaged Ricky Rat recordings are retained outside the playable versions.
partial=r/'programs/rickyrat/partial';partial.mkdir()
files=[]
for source in sorted((archive/'tapes/recovered/tape18b/partial').glob('*RICKY-RAT*')):
 shutil.copyfile(source,partial/source.name);b=source.read_bytes();files.append(dict(path=source.name,archive_path=source.relative_to(archive).as_posix(),bytes=len(b),sha256=digest(b)))
write(partial/'provenance.json',{'status':'Damaged; raw candidates, validated prefixes, and uncertain full listings remain separate. No bytes synthesized. Not playable.','files':files})
(partial/'README.md').write_text('# Damaged Ricky Rat recordings\n\nUntouched recovery artifacts from tape18b saves 15 and 19. Prefix files have\nno synthetic terminator. UNCERTAIN listings are not validated full programs.\nSee provenance.json and the archive report for the original recovery evidence.\n')
