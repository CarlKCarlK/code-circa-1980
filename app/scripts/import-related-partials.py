"""Copy and verify AIM/Space Colony fragments; never synthesize terminators."""
import argparse,json,hashlib,shutil
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);args=p.parse_args();archive=args.archive.resolve();root=Path(__file__).resolve().parents[2]
sha=lambda b:hashlib.sha256(b).hexdigest()
for slug,captures in [('aim',[('tape20b',[9,11])]),('spacecolony',[('tape14a',[1]),('tape14b',[11,12])])]:
 dest=root/'programs'/slug/'partial';dest.mkdir()
 files=[];records=[]
 for capture,orders in captures:
  source_root=archive/'tapes/recovered'/capture;j=json.loads((source_root/'inventory.json').read_text());items=j if isinstance(j,list) else j['items']
  for order in orders:
   item=next(i for i in items if i['order']==order)
   for path in sorted((source_root/'partial').glob(f'{order:02}-*')):
    shutil.copyfile(path,dest/path.name);b=path.read_bytes();files.append({'path':path.name,'archive_path':path.relative_to(archive).as_posix(),'bytes':len(b),'sha256':sha(b)})
   if isinstance(item.get('prefix'),dict):
    pr=item['prefix'];raw_path=source_root/item['raw_file'];prefix_path=source_root/pr['file'];matches=[source_root/x['file'] for x in pr['matching_sources']];expected=pr['sha256']
   else:
    raw_path=archive/item['binary'];prefix_path=archive/item['prefix_binary'];matches=[archive/x for x in item['prefix_matching_sources']];expected=item['prefix_sha256']
   raw=raw_path.read_bytes();prefix=prefix_path.read_bytes();assert raw.startswith(prefix) and sha(prefix)==expected
   o=4;last=-1;count=0;bases=set()
   while o<len(prefix):
    ptr=int.from_bytes(prefix[o:o+2],'little');line=int.from_bytes(prefix[o+2:o+4],'little');end=prefix.index(0,o+4);assert ptr and line>last;last=line;count+=1;bases.add(ptr-end-1);o=end+1
   assert o==len(prefix) and len(bases)==1
   confirmed=[]
   for path in sorted(set(matches)):
    b=path.read_bytes();assert b[:len(prefix)]==prefix;confirmed.append({'archive_path':path.relative_to(archive).as_posix(),'sha256':sha(b)})
   records.append({'capture':capture,'save':order,'raw':raw_path.name,'prefix':prefix_path.name,'byte_range':[0,len(prefix)],'prefix_sha256':sha(prefix),'lines':count,'last_line':last,'pointer_base':bases.pop(),'synthetic_end_marker':False,'verified_matching_candidates':confirmed,'execution_tested':False})
 (dest/'provenance.json').write_text(json.dumps({'files':files,'records':records,'note':'All exports copied unchanged; damaged candidates and prefixes are source only, and no bytes are filled from complete saves.'},indent=2)+'\n')
 (dest/'README.md').write_text('# Damaged recordings\n\nAll exports retain the archive bytes. Raw candidates, ordered prefixes without added terminators, and UNCERTAIN listings remain separate. No damaged recording is playable. See provenance.json for exact ranges, hashes, and independently verified matching candidates.\n')
 print(slug,len(records),'damaged recordings and',len(files),'exports preserved')
