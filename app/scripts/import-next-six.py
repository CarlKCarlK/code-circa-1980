"""Preserve six requested games and experiments, canonical commits, and archive evidence."""
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
 ('worm','Worm One','Watch a rule-driven worm trace a visual pattern.', [('tape3a',n) for n in [11,12,13,14]],4,'Four consecutive tape3a saves. Inferred development order follows save order and additions to the grid bookkeeping and starting-position input. Source credit is July 27, 1980; this does not date every save.'),
 ('peoria','Peoria Grand Prix','Steer through a changing road in a one- or two-driver BASIC race.', [('tape21a',9),('tape21a',10),('tape15b',11),('tape15b',12)],4,'Inferred from source changes: single-driver two-mile race, two-driver fixed-width race, changing-width race, then five-stage Grand Prix. Within-side save order corroborates the two pairs; cross-tape order is uncertain.'),
 ('pendulum','Pendulum','An animated physics experiment with string length and gravity.', [('tape21a',17),('tape22a',5)],2,'Inferred from the added experiment title, validation of half-swings, and final period/time/frequency display. Exact cross-tape chronology is unknown.'),
 ('sentences','Sentence Generator','Generate student-era nonsense from stored names and word groups.', [('tape10b',11),('tape10b',12)],2,'Two consecutive tape10b saves. The later form adds prepositional phrases and clauses and disables adjective/adverb text. The quarantined file8b item is excluded.'),
 ('learningttt','Learning Tic-Tac-Toe','Explore an experimental BASIC opponent that stores feedback between rounds.', [('tape12b',12)]+[('tape8a',n) for n in [6,7,8]],4,'Inferred experimental branches: unfinished string-board/debugging form, two identical numeric-board drafts, then the developed numeric-board form. The tape8a pair precedes its expanded save on that side. Cross-tape chronology and branch relationships are uncertain.'),
 ('spi','Superpower Investing','Replay an early professional program using historical sample share prices.', [('tape20b',n) for n in [1,2,3,7,8]],5,'Five within-side saves retained in capture order. Empty-data templates alternate with data-bearing revisions; these are not five proven successive algorithm versions. The last data-bearing save is the default.')]


for slug,*_ in configs:
 if (r/'programs'/slug/'program.json').exists():raise SystemExit(f'Refusing to overwrite {slug}')
for slug,title,description,saves,selected,order in configs:
 folder=r/'programs'/slug;folder.mkdir(parents=True,exist_ok=True)
 metadata=dict(id=slug,title=title,description=description,kind='Simulation' if slug in ['worm','pendulum'] else 'Experiment' if slug in ['sentences','learningttt'] else 'Finance' if slug=='spi' else 'Game',language='Level II BASIC',gallery='more',showWebVersions=False,unsharedWebV1=True,defaultVersion=f'v{selected:02}',versionOrder=order,versions=[])
 evidence=dict(official_title=title,title_authority='Printed in recovered source' if slug in ['rickyrat','pinball'] else 'User-approved title, supported by the recovered listing or its behavior.',short_name=slug,import_date='2026-11-02',order_inferred=True,order_evidence=order,execution_testing='Recovery validation is separate from website emulator checks; see VERIFICATION.md.',saves=[])
 evidence['dating']={'direct_source_lines': ["30 PRINT\"SEE: SCIENTIFIC AMERICAN, NOVEMBER 1973\"","60 PRINT\"27 JULY 1980"] if slug=='worm' else ["40 REM            COPYRIGHT (C) 1974"] if slug=='spi' else [],'caution':'Source notices and book years do not establish tape-save dates or cross-program chronology.'}
 if slug=='spi':evidence['personal_history']={'source':'User recollection, November 2, 2026','text':'Superpower Investing was my first professional program, unless the bond-amortization program I wrote for my dad came earlier.','chronology':'Unresolved. BOND source on tape31a save 1 has line 20: PRINT\"  (C) 1979 CARL KADIE. SPI line 40 says COPYRIGHT (C) 1974, but that notice does not establish the program or save date. No relative order is asserted.'}
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
 if slug=='life':metadata['language']='Z80 assembly';metadata['format']='EDTASM'
 write(folder/'program.json',metadata)
 (folder/'README.md').write_text(f'# {title}\n\n{description}\n\n{order}\n\nOnly {metadata["defaultVersion"]} is playable. All recovered bytes are preserved unchanged. See provenance.json and VERIFICATION.md.\n')
 print(slug,len(saves),'complete saves preserved and validated')
