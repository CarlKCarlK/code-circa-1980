"""Verify preserved AIM and Space Colony damaged exports against the archive."""
import argparse,json,hashlib
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);args=p.parse_args();root=Path(__file__).resolve().parents[2];archive=args.archive.resolve();sha=lambda b:hashlib.sha256(b).hexdigest();count=0
for slug in ['aim','spacecolony']:
 folder=root/'programs'/slug/'partial';e=json.loads((folder/'provenance.json').read_text())
 for f in e['files']:
  b=(folder/f['path']).read_bytes();assert sha(b)==f['sha256'] and len(b)==f['bytes'] and b==(archive/f['archive_path']).read_bytes()
 for record in e['records']:
  raw=(folder/record['raw']).read_bytes();b=(folder/record['prefix']).read_bytes();assert raw.startswith(b) and sha(b)==record['prefix_sha256'] and record['byte_range']==[0,len(b)] and record['synthetic_end_marker'] is False
  o=4;last=-1;lines=0;bases=set()
  while o<len(b):
   ptr=int.from_bytes(b[o:o+2],'little');line=int.from_bytes(b[o+2:o+4],'little');end=b.index(0,o+4);assert ptr and line>last;last=line;lines+=1;bases.add(ptr-end-1);o=end+1
  assert o==len(b) and lines==record['lines'] and last==record['last_line'] and bases=={record['pointer_base']}
  for source in record['verified_matching_candidates']:
   data=(archive/source['archive_path']).read_bytes();assert sha(data)==source['sha256'] and data[:len(b)]==b
  count+=1
print(f'Verified all exported files, original prefix ranges/structures, and every claimed matching candidate for {count} damaged recordings.')
