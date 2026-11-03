"""Verify the imported damaged nuclear prefix against its archive and channels."""
import argparse,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);args=p.parse_args()
r=Path(__file__).resolve().parents[2];folder=r/'programs/nuclear/partial'
e=json.loads((folder/'provenance.json').read_text());archive=args.archive.resolve()
sha=lambda b:hashlib.sha256(b).hexdigest()
for item in e['files']:
 b=(folder/item['path']).read_bytes();assert len(b)==item['bytes'] and sha(b)==item['sha256'];assert b==(archive/item['archive_path']).read_bytes()
raw=(folder/'06-NUCLEAR-EQUATION-COMPLETER-RAW.BAS').read_bytes()
b=(folder/'06-NUCLEAR-EQUATION-COMPLETER-PREFIX.BIN').read_bytes()
assert raw.startswith(b) and sha(raw)==e['raw_sha256'] and sha(b)==e['prefix']['sha256']
assert e['prefix']['byte_range']==[0,len(b)] and e['prefix']['synthetic_end_marker'] is False
line=-1;o=4;count=0;bases=set()
while o<len(b):
 ptr=int.from_bytes(b[o:o+2],'little');n=int.from_bytes(b[o+2:o+4],'little');end=b.index(0,o+4)
 assert ptr and n>line;line=n;count+=1;bases.add(ptr-end-1);o=end+1
assert o==len(b) and count==e['prefix']['lines'] and line==e['prefix']['last'] and bases=={e['prefix']['base']}
source_folder=archive/'tapes/recovered/tape22a'
item=next(x for x in json.loads((source_folder/'inventory.json').read_text())['items'] if x['order']==6)
seen=set();variants=set()
for source in item['prefix']['matching_sources']:
 if source['file'] in seen:continue
 seen.add(source['file']);variants.add(source['variant'])
 candidate=(source_folder/source['file']).read_bytes();assert candidate[:len(b)]==b
assert 'right-boosted' in variants and 'left-hp1200' in variants
print(f'Verified {len(b)} untouched prefix bytes, {count} records through {line}, and {len(seen)} distinct archive candidates including independent left/right evidence.')
