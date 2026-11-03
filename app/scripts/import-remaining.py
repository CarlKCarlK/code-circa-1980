"""Inventory-driven import. Run --plan first; --commit preserves one canonical revision per capture.
No decoding, reconstruction, inventory edits, or historical execution is performed.
"""
import argparse,collections,csv,hashlib,json,re,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('--plan',action='store_true');p.add_argument('--commit',action='store_true');args=p.parse_args()
root=Path(__file__).resolve().parents[2];archive=args.archive.resolve()
def sha(b):return hashlib.sha256(b).hexdigest()
def write(path,data):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(data,indent=2,ensure_ascii=True)+'\n')
def git(*cmd):return subprocess.check_output(['git',*cmd],cwd=root).decode().strip()
def key(row):return row['capture']+':'+row['order'].zfill(2)
rows=list(csv.DictReader((archive/'tape-inventory.tsv').open(encoding='utf-8-sig'),delimiter='\t'))
manifest=json.loads((archive/'clusters/manifest.json').read_text());clusters={x['program_id']:x for x in manifest['files']}
# Explicit capture identity, archive paths, and identical already-preserved source bytes all count.
covered={};paths={};hashes={}
for folder in sorted((root/'programs').iterdir()):
 if not (folder/'program.json').exists():continue
 for f in folder.rglob('*'):
  if not f.is_file() or any(x in f.parts for x in ['target','third_party','website-archive','verification','node_modules']):continue
  if f.suffix.upper() in ['.ASC','.BAS','.ASM','.Z80','.BIN','.TXT','.3BN','.PRG','.IMG','.TAP']:
   hashes.setdefault(sha(f.read_bytes()),folder.name)
 ev=json.loads((folder/'provenance.json').read_text())
 def walk(x):
  if isinstance(x,dict):
   cap=x.get('capture');order=x.get('save',x.get('order'))
   if isinstance(cap,str) and isinstance(order,(str,int)) and str(order).isdigit():covered[cap+':'+str(order).zfill(2)]=folder.name
   for v in x.values():
    if isinstance(v,str) and v.startswith('tapes/recovered/'):paths[v]=folder.name
    walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(ev)
ledger=[];groups=collections.OrderedDict();used={f.name for f in (root/'programs').iterdir()}
nonprogram={'blank','voice','audio','cassette data fragment','numeric data fragment','unknown binary','unidentified binary data','tape marker','animation data','Model 100 text','numbered text (BASIC container)','music notation data','text','BASIC (empty)'}
# Repeated saves on later captures not yet in the similarity manifest.
def later_family(row):
 cap=row['capture'];n=int(row['order']);name=Path(row['source_file']).stem
 if cap in ['tape2a','tape2a2']:
  for nums,title in [([6],'Model 100 strategy game'),([7],'Model 100 study program'),([9,10],'Model 100 traveling salesman'),([11,12,13],'Model 100 transaction simulation'),([14,15],'Model 100 numeric processing'),([16,17,18,19],'Model 100 input reversal'),([20,21,22,23],'Model 100 LIFE backwards')]:
   if n in nums:return title
 if cap=='tape2bpartial':return 'Model 100 JAB'
 name=re.sub(r'^\d+-','',name)
 name=re.sub(r'-(?:EARLY-DRAFT-)?SAVE\d+.*$','',name)
 name=re.sub(r'-(?:DAMAGED|TRUNCATED)(?:-SAVE)?(?:-PREFIX)?$','',name)
 return name.replace('-',' ').title()
for row in rows:
 k=key(row);entry={'capture':row['capture'],'save':row['order'],'archive_source':row['source_file'],'inventory_status':row['status']};ledger.append(entry)
 if 'quarantin' in row['status'].lower() or 'QUARANTIN' in row['source_file']:
  entry.update(disposition='excluded',reason='Quarantined at user request; not imported.');continue
 if not row['source_file'] or row['type'] in nonprogram:
  entry.update(disposition='supporting material',reason='Not an identified program: '+row['type']+'. Retained in recovery archive.');continue
 source=archive/row['source_file'];assert source.is_file(),source
 previous=covered.get(k) or paths.get(row['source_file']) or hashes.get(sha(source.read_bytes()))
 if previous:
  entry.update(disposition='existing program',program=previous,sha256=sha(source.read_bytes()));continue
 cl=clusters.get(k)
 family=cl['folder'] if cl else later_family(row)
 # Exact-title grouping only for later unclustered repeated saves; cluster assignments remain provisional.
 groups.setdefault(family,[]).append(row);entry.update(disposition='new program',family=family)
plans=[]
for family,items in groups.items():
 base=re.sub(r'_p\d+$','',family).replace('_',' ')
 base=re.sub(r'\s*\(inferred title\)','',base,flags=re.I)
 slug=re.sub(r'[^a-z0-9]+','-',base.lower()).strip('-')[:64]
 if slug in used:slug+='-'+items[0]['capture']
 used.add(slug);title=base.title()
 for a,b in [('3D','3-D'),('Trs80','TRS-80'),('Dnd','D&D'),('Io ','I/O '),('Hp41C','HP-41C'),('Model 100 Jab','Model 100 JAB'),('Life','LIFE')]:title=title.replace(a,b)
 plans.append(dict(id=slug,title=title,items=items,cluster=family))
 for entry in ledger:
  if entry.get('family')==family:entry['program']=slug
if args.plan:
 write(root/'docs/remaining-import-plan.json',{'inventory_rows':len(rows),'dispositions':dict(collections.Counter(x['disposition'] for x in ledger)),'programs':plans,'coverage':ledger})
 print(len(plans),'new collections;',collections.Counter(x['disposition'] for x in ledger));raise SystemExit
plan=json.loads((root/'docs/remaining-import-plan.json').read_text())
# The reviewed plan is authoritative: IDs/families and explicit credit overrides may be refined before import.
plans=plan['programs'];ledger=plan['coverage']
for config in plans:
 slug=config['id'];folder=root/'programs'/slug
 if folder.exists():raise SystemExit('Refusing to overwrite '+str(folder))
order='Within each capture, save order is retained. Cross-capture ordering is a presentation guess; tape numbers do not establish development dates. Similarity clusters are provisional, and collected saves are not necessarily revisions of one program.'
for config in plans:
 slug=config['id'];title=config['title'];folder=root/'programs'/slug;folder.mkdir(parents=True)
 meta=dict(id=slug,title=title,description=config.get('description','Recovered '+title.lower()+'. Original sources and repeated saves are preserved.'),kind='Archive',language=config['items'][0]['platform'],gallery='more',archiveImport=True,showWebVersions=False,unsharedWebV1=True,defaultVersion='v01',versionOrder=order,versions=[],listingLabel='Download recovered listing')
 ev=dict(official_title=title,title_authority='Descriptive recovery/inventory title; original text remains unchanged.',import_date='2026-11-03',order_inferred=True,order_evidence=order,cluster=config['cluster'],saves=[],execution_testing='No new BASIC gameplay testing. Website checks exercise JavaScript controls only.',dating={'caution':'Source notices are not save dates. No inferred historical dates are assigned.'})
 if args.commit:git('add',str(folder.relative_to(root)))
 # Any reviewed upstream comparison precedes captured revisions in canonical history.
 for baseline in config.get('upstream',[]):
  src=root/baseline['file'];target=folder/'upstream'/(src.stem.upper()+'.ASC');target.parent.mkdir(exist_ok=True);shutil.copyfile(src,target)
  canonical=folder/'original';canonical.mkdir(exist_ok=True);shutil.copyfile(src,canonical/(slug.upper()+'.ASC'))
  write(folder/'upstream/provenance.json',baseline)
  if args.commit:
   git('add',str(folder.relative_to(root)));git('commit','-q','-m','Preserve published comparison source for '+title);git('tag',slug+'-published')
 for i,row in enumerate(config['items'],1):
  source=archive/row['source_file'];version=f'v{i:02}';dest=folder/'versions'/version;dest.mkdir(parents=True)
  # Preserve all exports/candidates associated with this item, including untouched raw and prefix pairs.
  candidates=sorted(source.parent.glob(row['order'].zfill(2)+'-*'))
  candidates=[x for x in candidates if x.is_file() and x.suffix.lower() in ['.asc','.bas','.bin','.asm','.txt','.z80','.3bn','.prg','.img','.tap','.src']]
  if source not in candidates:candidates.append(source)
  if source.parent.name=='derived':
   best=archive/row['folder']/'best';candidates+=list(best.glob(row['order'].zfill(2)+'-*'))
  candidates=list(dict.fromkeys(candidates));files=[]
  for src in candidates:
   target=dest/src.name;shutil.copyfile(src,target);b=target.read_bytes();assert b==src.read_bytes()
   files.append(dict(path=target.relative_to(folder).as_posix(),archive_path=src.relative_to(archive).as_posix(),bytes=len(b),sha256=sha(b)))
  possible=[source.with_suffix(ext) for ext in ['.BAS','.BIN','.ASM','.3BN','.IMG','.PRG']]
  raw=next((x for x in possible if x in candidates),None)
  if source.parent.name=='derived':raw=next((x for x in candidates if x.parent.name=='best' and x.suffix.upper()=='.BIN'),raw)
  if raw is None:raw=next((x for x in candidates if 'TAPE-BLOCK' in x.name),next((x for x in candidates if x.suffix.upper() in ['.BIN','.BAS','.ASM','.3BN','.IMG','.TAP']),source))
  listing=source if source.suffix.upper() in ['.ASC','.TXT','.Z80'] else next((x for x in candidates if x.suffix.upper() in ['.ASC','.TXT','.Z80']),source)
  b=raw.read_bytes();assessment={'format':row['type'],'sha256':sha(b),'bytes':len(b),'archive_validation':row['validation'],'import_validation':'Exact file hashes; format-specific checks below.'}
  complete=False
  if b[:3]==b'\xd3'*3 and raw.suffix.upper()=='.BAS':
   try:
    o=4;last=-1;lines=0;bases=set()
    while o+4<=len(b) and int.from_bytes(b[o:o+2],'little'):
     ptr=int.from_bytes(b[o:o+2],'little');ln=int.from_bytes(b[o+2:o+4],'little');assert ln>last;end=b.index(0,o+4);bases.add(ptr-end-1);last=ln;lines+=1;o=end+1
    complete=o+2==len(b) and b[o:o+2]==b'\0\0' and len(bases)<=1
    assessment.update(lines=lines,last=last,pointer_bases=sorted(bases),normal_end_marker=complete,parsed_bytes=o)
   except (ValueError,AssertionError):assessment['structure_conflict']=True
  text=listing.read_text(errors='replace');credits=[l for l in text.splitlines() if re.search(r'CREATIVE COMPUT|COPYRIGHT|\bBY.{0,20}CARL|REVISED BY|CODE FROM',l,re.I) and len(l)<500]
  assessment['source_notice_lines']=credits
  unsupported=[]
  if not complete or row['recovery%']!='100':unsupported.append('Incomplete, uncertain, or nonstandard captured payload; see the recovery validation.')
  if raw.suffix.upper()!='.BAS' or 'Model 100' in row['platform'] or 'Pocket' in row['platform'] or 'Commodore' in row['platform'] or 'Level I BASIC' in row['platform']:unsupported.append('This format or machine is not supported by the shared stock Level II BASIC player.')
  if re.search(r'(?:\bLINE\s*\(|GET@|PUT@|\b(?:CLOAD|CSAVE|INPUT|PRINT)\s*#|\bUSR\s*\(|\bDEF\s*FN)',text,re.I):unsupported.append('The source refers to extensions, external cassette data, machine code, or functions unavailable in the stock player.')
  if config.get('sourceOnlyReason'):unsupported.append(config['sourceOnlyReason'])
  playable=not unsupported
  v=dict(id=version,label=row['summary'].split(';')[0],capture=row['capture'],save=int(row['order']),raw=(dest/raw.name).relative_to(folder).as_posix(),listing=(dest/listing.name).relative_to(folder).as_posix(),playable=False,note=row['status']+'. '+row['validation'],unavailableReason=' '.join(unsupported) if unsupported else 'Another recovered save; the site offers one selected player.',loadable=playable,exports=[{'path':x['path'],'label':Path(x['path']).name} for x in files],startupSource='\n'.join(text.splitlines()[:12]),controlSource=[l for l in text.splitlines() if 'INKEY$' in l][:8])
  meta['versions'].append(v)
  ev['saves'].append(dict(version=version,capture=row['capture'],save=int(row['order']),archive_raw=raw.relative_to(archive).as_posix(),archive_listing=listing.relative_to(archive).as_posix(),imported_files=files,recovery_item=assessment,inventory_row=row,recovery_inventory=row['folder']+'/inventory.json',execution_tested=False))
  canonical=folder/'original';canonical.mkdir(exist_ok=True)
  # Stable names also retain raw type. Clear only prior canonical source files owned by this new import.
  for old in canonical.iterdir():old.unlink()
  for src in [raw,listing]:shutil.copyfile(src,canonical/(slug.upper()+src.suffix))
  write(canonical/'provenance.json',ev['saves'][-1]);write(folder/'program.json',meta);write(folder/'provenance.json',ev)
  if args.commit:
   git('add',str(folder.relative_to(root)));git('commit','-q','-m',f'Preserve {title} {version}: {row["capture"]} save {row["order"]}');git('tag',slug+'-'+version)
   for src in [raw,listing]:assert sha(subprocess.check_output(['git','show',f'HEAD:programs/{slug}/original/{slug.upper()+src.suffix}'],cwd=root))==sha(src.read_bytes())
 selected=next((v for v in reversed(meta['versions']) if v.pop('loadable')),None)
 for v in meta['versions']:v.pop('loadable',None)
 if selected:selected.update(playable=True,slug='basic',unavailableReason=None);meta['defaultVersion']=selected['id']
 else:meta.update(sourceOnly=True,actionVerb='View source');meta['defaultVersion']=meta['versions'][-1]['id']
 credit=config.get('attribution')
 if not credit:
  allcredits=' '.join(l for s in ev['saves'] for l in s['recovery_item']['source_notice_lines'])
  if 'CREATIVE COMPUT' in allcredits.upper():credit={'text':'Adapted from a Creative Computing listing. The exact source edition and individual author have not been established.'}
  elif 'AUTOMATED SIMULATIONS' in allcredits.upper():credit={'text':'Starfleet Orion: copyright 1979 Automated Simulations. This is a third-party program; scenario cassette data is required.'}
  elif re.search('CARL.{0,15}KADIE|C[.] KADIE',allcredits,re.I):credit={'text':'The recovered source credits Carl Kadie. Any earlier published sources have not been established.'}
  else:credit={'text':'Original author and any earlier published source have not been established. Preserved here as recovered cassette material.'}
 meta['attribution']=credit;ev['attribution_review']={'visible_credit':credit,'evidence':'Literal source notices are recorded per save; explicit comparison sources, when found, are in upstream/. Unknown authorship is not a claim of original work.'}
 if config.get('upstream'):ev['upstream']=config['upstream']
 write(folder/'program.json',meta);write(folder/'provenance.json',ev)
 (folder/'README.md').write_text(f'# {title}\n\n{credit["text"]}\n\n{order}\n\nReference: {meta["defaultVersion"]}. '+('Source only: '+meta['versions'][-1]['unavailableReason'] if meta.get('sourceOnly') else 'The player loads one complete recovered stock-BASIC payload. Historical bugs remain. No BASIC gameplay testing was performed in this import.')+'\n\nPermanent snapshots are in versions/; canonical files advance per save in Git with program-specific tags. All files and capture identities are in provenance.json.\n')
 (folder/'VERIFICATION.md').write_text('# Verification\n\nArchive files were copied byte for byte and SHA-256 checked. Stock Model I/III BASIC captures were checked for ordered records, pointer consistency, end marker and full length before enabling a player. Other formats retain their recovery validation without claiming Level II compatibility. Prefixes and uncertain listings remain unmodified and labeled. Website browser checks exercise JS controls, downloads, attribution, and navigation only. No new BASIC gameplay tests. See provenance.json.\n')
 print(slug,len(meta['versions']),'source only' if meta.get('sourceOnly') else 'player',flush=True)
write(root/'docs/remaining-coverage.json',{'inventory_sha256':sha((archive/'tape-inventory.tsv').read_bytes()),'rows':ledger})
write(root/'app/site/remaining-programs.json',[c['id'] for c in plans])
