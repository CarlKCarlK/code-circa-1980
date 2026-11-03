"""Verify twelve snapshots, canonical history, upstream sources, and suspect captures."""
import argparse,hashlib,json,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);args=p.parse_args();archive=args.archive.resolve();root=Path(__file__).resolve().parents[2];sha=lambda b:hashlib.sha256(b).hexdigest()
def path_at(capture,path):return archive/path if path.startswith('tapes/') else archive/'tapes/recovered'/capture/path
def items(capture):
 x=json.loads((archive/'tapes/recovered'/capture/'inventory.json').read_text());return x if isinstance(x,list) else x['items']
def check_files(folder,files):
 for f in files:
  b=(folder/f['path']).read_bytes();assert b==(archive/f['archive_path']).read_bytes() and len(b)==f['bytes'] and sha(b)==f['sha256']
for slug in ['whodonnt','dungeon','tutac','tank','ll']:
 d=root/'programs'/slug;e=json.loads((d/'provenance.json').read_text())
 for save in e['saves']:
  check_files(d,save['imported_files'])
  for f in save['imported_files']:
   path=f'programs/{slug}/original/{slug.upper()}{Path(f["path"]).suffix}';assert subprocess.check_output(['git','show',f'{slug}-{save["version"]}:{path}'],cwd=root)==(d/f['path']).read_bytes()
  item=next(i for i in items(save['capture']) if i['order']==save['save']);expected=(archive/save['archive_raw']).read_bytes()
  for source in item.get('matching_sources',[]):
   path=source if isinstance(source,str) else source.get('file',source.get('binary',source.get('path')));assert path,path
   assert path_at(save['capture'],path).read_bytes()==expected,path
  if item.get('matching_variants'):
   source=Path(item['source'])
   for variant in item['matching_variants']:
    candidate=source.parent.parent/variant/source.name
    assert (archive/candidate).read_bytes()==expected,str(candidate)
 print(slug,len(e['saves']),'complete captured snapshots, canonical blobs, and claimed payload matches verified')
for record,tag in [('storer-provenance.json','ll-storer1969'),('provenance.json','ll-basic1978')]:
 d=root/'programs/ll/upstream';e=json.loads((d/record).read_text());b=(d/e['file']).read_bytes();assert sha(b)==e['sha256'];assert subprocess.check_output(['git','show',f'{tag}:programs/ll/original/LL.ASC'],cwd=root)==b
for slug,area in [('tank','partial'),('tutac','review')]:
 d=root/'programs'/slug/area;e=json.loads((d/'provenance.json').read_text());check_files(d,e['files']);item=e['recovery_item']
 if slug=='tutac':
  b=(d/Path(item['binary']).name).read_bytes();assert sha(b)==item['sha256']
  for source in item['matching_sources']:assert path_at('file8b',source).read_bytes()==b
 else:
  pr=item['prefix'];b=(d/Path(pr['raw']).name).read_bytes();assert len(b)==1274 and sha(b)==pr['sha256'];assert (d/Path(item['raw']).name).read_bytes().startswith(b)
  o=4;last=-1;count=0;bases=set()
  while o<len(b):
   ptr=int.from_bytes(b[o:o+2],'little');line=int.from_bytes(b[o+2:o+4],'little');end=b.index(0,o+4);assert ptr and line>last;last=line;count+=1;bases.add(ptr-end-1);o=end+1
  assert o==len(b) and count==34 and last==320 and bases=={17125} and pr['synthetic_end_marker'] is False
  variants=set()
  for source in pr['matching_sources']:assert path_at('tape1a',source['file']).read_bytes().startswith(b);variants.add(source['variant'])
  assert any(v.startswith('left') for v in variants) and any(v.startswith('right') for v in variants)
 print(slug,'suspect capture preserved separately; prefix or matching-source provenance verified')
print('Both full upstream comparison sources match their first canonical commits.')
