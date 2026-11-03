"""Preserve five requested science and game programs, canonical commits, and archive evidence."""
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
 ('trigectior','Trigectior','Plot a projectile from its speed, launch angle, and screen scale.', [('tape21a',13),('tape22a',4)],2,'Inferred from the added screen-scale input, wrapping logic, and flight summary. Both sources credit October 24, 1978; exact save dates and cross-tape chronology are unknown.'),
 ('relativity','Relativity','Explore moving rods, length-contraction graphs, and ship/Earth clocks.', [('tape22a',10)],1,'One complete captured save. The source credit says May 9, 1979; this is a source date, not a tape-save date.'),
 ('reflex','Reflex Tests','Try hand-eye reaction, interval estimation, and a keyboard gunfight.', [('tape9b',7),('tape9b',8)],2,'Two consecutive, byte-identical saves retained separately in capture order. No development difference or save date is inferred.'),
 ('nuclear','Nuclear Equation Completer','Use historical BASIC to find a missing isotope or particle.', [('tape14a',8)],1,'One complete captured source; a separately preserved damaged tape22a recording is not promoted to a complete version. Their relative chronology is unknown.'),
 ('johnscircle','John’s Circle','Draw circles and ellipses with two adjustable radii.', [('tape21b',13)],1,'One complete captured source credited jointly to John Hartman and Carl Kadie. No source or tape-save date is established.')]


for slug,*_ in configs:
 if (r/'programs'/slug/'program.json').exists():raise SystemExit(f'Refusing to overwrite {slug}')
for slug,title,description,saves,selected,order in configs:
 folder=r/'programs'/slug;folder.mkdir(parents=True,exist_ok=True)
 metadata=dict(id=slug,title=title,description=description,kind='Game' if slug=='reflex' else 'Graphics' if slug=='johnscircle' else 'Science',language='Level II BASIC',gallery='more',showWebVersions=False,unsharedWebV1=True,defaultVersion=f'v{selected:02}',versionOrder=order,versions=[])
 evidence=dict(official_title=title,title_authority='Printed in recovered source' if slug in ['rickyrat','pinball'] else 'User-approved title, supported by the recovered listing or its behavior.',short_name=slug,import_date='2026-11-02',order_inferred=True,order_evidence=order,execution_testing='Recovery validation is separate from website emulator checks; see VERIFICATION.md.',saves=[])
 evidence['dating']={'direct_source_lines':[],'caution':'Source dates do not establish tape-save dates. Attribution is preserved in the listings.'}
 for i,(capture,save) in enumerate(saves,1):
  row=next(x for x in rows if x['capture']==capture and int(x['order'])==save)
  source=Path(row['source_file']);raw=source.with_suffix('.BAS');v=f'v{i:02}';dest=folder/'versions'/v;dest.mkdir(parents=True)
  paths=[raw,source]
  b=(archive/raw).read_bytes()
  assessment=structure(b)
  files=[]
  for path in paths:
   target=dest/path.name;shutil.copyfile(archive/path,target);data=target.read_bytes();assert data==(archive/path).read_bytes()
   files.append(dict(path=target.relative_to(folder).as_posix(),archive_path=path.as_posix(),bytes=len(data),sha256=digest(data)))
  (dest/'README.md').write_text(f'# {title} {v}\n\nUntouched {capture} save {save}. The raw payload and listing are copied byte for byte. See ../../provenance.json.\n')
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
 write(folder/'program.json',metadata)
 (folder/'README.md').write_text(f'# {title}\n\n{description}\n\n{order}\n\nOnly {metadata["defaultVersion"]} is playable. All recovered bytes are preserved unchanged. See provenance.json and VERIFICATION.md.\n')
 print(slug,len(saves),'complete saves preserved and validated')
