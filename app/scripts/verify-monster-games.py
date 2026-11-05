"""Verify recovered bytes, canonical Git blobs, and the damaged JAB prefix."""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);args=p.parse_args();archive=args.archive.resolve();root=Path(__file__).resolve().parents[2]
sha=lambda b:hashlib.sha256(b).hexdigest()
def saves_of(slug,e):
 # JAB keeps one current file; its recovered saves live in Git tags, which also hold each snapshot.
 return e.get('saves_in_git',e['saves'])
def snapshot(slug,d,save,item):
 if 'git_tag' in save:return subprocess.check_output(['git','show',f"{save['git_tag']}:programs/{slug}/{item['path']}"],cwd=root)
 return (d/item['path']).read_bytes()
for slug in ['jaberwocky','cave','jab']:
 d=root/'programs'/slug;e=json.loads((d/'provenance.json').read_text())
 for save in saves_of(slug,e):
  if save.get('disk'):continue
  for item in save['imported_files']:
   b=snapshot(slug,d,save,item);assert b==(archive/item['archive_path']).read_bytes();assert sha(b)==item['sha256']
   canonical=f'programs/{slug}/original/{slug.upper()}{Path(item["path"]).suffix}'
   committed=subprocess.check_output(['git','show',f'{slug}-{save["version"]}:{canonical}'],cwd=root);assert committed==b
 for upstream in (d/'upstream').glob('provenance.json'):
  u=json.loads(upstream.read_text());b=(upstream.parent/u['artifact']).read_bytes();assert sha(b)==u['sha256']
  tag='jaberwocky-quest-excerpt' if slug=='jaberwocky' else 'jab-amazing';assert subprocess.check_output(['git','show',f'{tag}:programs/{slug}/original/{slug.upper()}.ASC'],cwd=root)==b
 print(slug,len(e['saves']),'complete captures and tagged blobs match archive')
d=root/'programs/jab/partial';e=json.loads((d/'provenance.json').read_text());item=e['recovery_item']
for f in e['files']:
 b=(d/f['path']).read_bytes();assert b==(archive/f['archive_path']).read_bytes() and sha(b)==f['sha256']
b=(d/Path(item['raw_file']).name).read_bytes();assert len(b)==270 and sha(b)==item['sha256'];assert (d/'05-MONSTER-GAME-RAW.BAS').read_bytes().startswith(b)
o=4;last=-1;count=0;bases=set()
while o<len(b):
 ptr=int.from_bytes(b[o:o+2],'little');n=int.from_bytes(b[o+2:o+4],'little');end=b.index(0,o+4);assert ptr and n>last;last=n;count+=1;bases.add(ptr-end-1);o=end+1
assert o==len(b) and count==10 and last==71 and bases=={17125}
variants=set()
for source in item['matching_sources']:
 candidate=archive/'tapes/recovered/tape16a'/source['file'];assert candidate.read_bytes().startswith(b);variants.add(source['variant'])
assert 'right-boosted' in variants and 'left-hp1200' in variants
assert item['validation']['synthetic_end_marker'] is False
print('JAB partial: 270 untouched bytes; ten ordered records through 71; all claimed matching prefixes including independent channels verified')
# Recheck every full-payload match claimed by the source recovery inventory.
for slug in ['jaberwocky','cave','jab']:
 d=root/'programs'/slug;e=json.loads((d/'provenance.json').read_text())
 for save in saves_of(slug,e):
  if save.get('disk'):continue
  source_root=archive/'tapes/recovered'/save['capture'];inv=json.loads((source_root/'inventory.json').read_text());items=inv if isinstance(inv,list) else inv['items'];item=next(i for i in items if i['order']==save['save']);expected=(archive/save['archive_raw']).read_bytes();seen=set()
  for source in item['matching_sources']:
   value=source if isinstance(source,str) else source.get('file',source.get('binary'))
   if not value:raise AssertionError(source)
   path=archive/value if value.startswith('tapes/') else source_root/value
   assert path.read_bytes()==expected,str(path);seen.add(str(path))
  assert seen
  print(save['capture'],save['save'],len(seen),'claimed full-payload matches verified')
# JAB's one source file differs from its recovered tag only at the requested changes.
numbered=lambda data:{int(l.split(b' ',1)[0]):l for l in data.split(b'\n') if l[:1].isdigit()}
before=numbered(subprocess.check_output(['git','show','jab-v04:programs/jab/original/JAB.ASC'],cwd=root));after=numbered((root/'programs/jab/source/JAB.ASC').read_bytes())
changed=sorted(n for n in before.keys()|after.keys() if before.get(n)!=after.get(n));assert changed==[12,14,16,30,40,50,3525,4900],changed
print('JAB source differs from tag jab-v04 only at the maze-size lines, line 3525, and the line 4900 prompt')
