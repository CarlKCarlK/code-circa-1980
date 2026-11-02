"""Historical initial import method, before xwing was renamed to starwars81.

Retained for provenance; use Git history to reproduce the original import.
"""
import argparse, csv, hashlib, json, shutil, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('--commit',action='store_true');args=p.parse_args()
root=Path(__file__).resolve().parents[2];archive=args.archive.resolve()
if (root/'programs/starwars81').exists():raise SystemExit('Initial import already migrated to starwars81; refusing to reimport.')
rows=list(csv.DictReader((archive/'tape-inventory.tsv').open(encoding='utf-8-sig'),delimiter='\t'))
def digest(b):return hashlib.sha256(b).hexdigest()
def write(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,indent=2)+'\n')
def git(*a):return subprocess.check_output(['git',*a],cwd=root).decode().strip()
def structure(b):
 assert b[:3]==b'\xd3'*3
 o=4;last=-1;lines=0;bases=set()
 while int.from_bytes(b[o:o+2],'little'):
  ptr=int.from_bytes(b[o:o+2],'little');line=int.from_bytes(b[o+2:o+4],'little');assert line>last
  end=b.index(0,o+4);bases.add(ptr-end-1);last=line;lines+=1;o=end+1
 assert o+2==len(b) and len(bases)==1
 return dict(lines=lines,last=last,pointer_base=bases.pop(),normal_end_marker=True,sha256=digest(b))
speech=[('tape20a',n) for n in [4,6,7,8,9,10,11,12]]+[('tape11a',12),('tape11b',7),('tape11b',8)]
configs=[('speech','Speech','Coach a speech team: recruit students, assign events, and plan a tournament season.',speech,'v10',
 'Inferred: eight complete tape20a drafts in save order, then tape11a save 12 (expanded introduction and team assignment), then tape11b saves 7 and 8 (new title animation, event uniqueness check and corrected award lookup). The last two are repeated saves. Tape numbers alone do not establish chronology. Damaged draft 02 and draft 10 remain separate; later malformed material is not treated as a complete version.'),
 ('olympics','Olympics','Coach a nation’s team through invented Olympic events, training, and medal ceremonies.', [('tape3apartial',1),('tape3a',1),('tape3a',2)],'v03',
 'Inferred: tape3apartial save 1 and tape3a save 1 are identical repeated captures of the earlier form; tape3a save 2 adds the 1980 copyright, revised event names and further checks. Capture order alone does not date the program.'),
 ('xwing','X-wing fighter','A tentative match: fly a Star Wars cockpit, evade fighters, and attack the Death Star.', [('tape23b',5),('tape30a',2)],'v01',
 'Inferred: tape23b save 5 uses the digit-key matrix; tape30a save 2 adds an alternate arrow-key read at line 190 and changes line 200. That suggests a later control experiment, not an established date. v01 remains the playable default; v02 contains a suspect expression at line 190. The remembered X-wing identity is unconfirmed; neither listing names an X-wing.')]
for slug, *_ in configs:
 if (root/'programs'/slug).exists():raise SystemExit(f'Refusing to overwrite existing import: {slug}')
for slug,title,description,saves,default,order in configs:
 folder=root/'programs'/slug;folder.mkdir(parents=True,exist_ok=True)
 metadata=dict(id=slug,title=title,description=description,kind='Game',language='Level II BASIC',gallery='more',defaultVersion=default,versionOrder=order,versions=[])
 evidence=dict(official_title=title,title_authority='User request, 2026-11-02; X-wing identity is tentative.' if slug=='xwing' else 'User request, 2026-11-02.',import_date='2026-11-02',order_inferred=True,order_evidence=order,execution_testing='Recovery validation is separate from website execution tests; see VERIFICATION.md.',saves=[])
 evidence['dating']={'direct_date':"5 ' OLYMPICS  -    (C) 1980   CARL KADIE" if slug=='olympics' else None,'context':'Olympics has a direct 1980 copyright. X-wing shares tape23b with Chemistry Balancer II, whose line 10 says COPYRIGHT 1981 C. KADIE. Speech has no confirmed date in these listings. These do not establish save dates.'}
 for i,(capture,save) in enumerate(saves,1):
  row=next(r for r in rows if r['capture']==capture and int(r['order'])==save) if 'order' in rows[0] else next(r for r in rows if r.get('capture')==capture and int(r.get('item',r.get('save',0)))==save)
  listing=Path(row['source_file']);raw=listing.with_suffix('.BAS');version=f'v{i:02}'
  b=(archive/raw).read_bytes();validation=structure(b);dest=folder/'versions'/version;dest.mkdir(parents=True,exist_ok=True)
  files=[]
  for source in [raw,listing]:
   target=dest/source.name;shutil.copyfile(archive/source,target);data=target.read_bytes();assert data==(archive/source).read_bytes()
   files.append(dict(path=target.relative_to(folder).as_posix(),archive_path=source.as_posix(),bytes=len(data),sha256=digest(data)))
  playable=version==default
  metadata['versions'].append(dict(id=version,label=f'{capture} · save {save}',capture=capture,save=save,raw=files[0]['path'],listing=files[1]['path'],playable=playable,**({'slug':'basic'} if playable else {}),note='Untouched recovered payload. '+row.get('validation',''),unavailableReason=None if playable else 'Source only. This site plays the selected complete reference version.'))
  evidence['saves'].append(dict(version=version,capture=capture,save=save,archive_raw=raw.as_posix(),archive_listing=listing.as_posix(),imported_files=files,recovery_item=validation,inventory_row=row,recovery_inventory=f'tapes/recovered/{capture}/inventory.json',execution_tested=False))
  write(folder/'program.json',metadata);write(folder/'provenance.json',evidence)
  canonical=folder/'original';canonical.mkdir(exist_ok=True)
  for source in [raw,listing]:shutil.copyfile(archive/source,canonical/(slug.upper()+source.suffix))
  write(canonical/'provenance.json',evidence['saves'][-1])
  if args.commit:
   git('add',str(folder.relative_to(root)));git('commit','-m',f'Preserve {title} {version}: {capture} save {save}');git('tag',f'{slug}-{version}')
   for source in [raw,listing]:
    path=(canonical/(slug.upper()+source.suffix)).relative_to(root).as_posix()
    blob=subprocess.check_output(['git','show',f'HEAD:{path}'],cwd=root);assert digest(blob)==digest((archive/source).read_bytes())
 print(slug,len(saves),'snapshots verified')
