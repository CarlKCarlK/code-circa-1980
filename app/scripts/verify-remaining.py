"""Check inventory coverage, imported artifacts, and canonical Git blobs against the recovery archive."""
import argparse,csv,hashlib,json,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('archive',type=Path);args=p.parse_args();root=Path(__file__).resolve().parents[2];archive=args.archive.resolve()
def sha(b):return hashlib.sha256(b).hexdigest()
coverage=json.loads((root/'docs/remaining-coverage.json').read_text());plan=json.loads((root/'docs/remaining-import-plan.json').read_text())
assert sha((archive/'tape-inventory.tsv').read_bytes())==coverage['inventory_sha256']
rows=list(csv.DictReader((archive/'tape-inventory.tsv').open(encoding='utf-8-sig'),delimiter='\t'));assert len(rows)==len(coverage['rows'])
files=saves=0
removed={r['program'] for r in coverage['rows'] if r['disposition']=='removed'}
for config in plan['programs']:
 if config['id'] in removed:
  assert not (root/'programs'/config['id']).exists();continue
 folder=root/'programs'/config['id'];e=json.loads((folder/'provenance.json').read_text());m=json.loads((folder/'program.json').read_text())
 # Later disk saves are outside this tape plan; docs/disk-programs.md covers them.
 tape_saves=[s for s in e['saves'] if not s.get('disk')]
 assert len(tape_saves)==len(config['items'])==len([v for v in m['versions'] if not v['capture'].startswith('disk:') and not v.get('mergedFrom')]);assert m['attribution']['text']
 for s in tape_saves:
  saves+=1
  for f in s['imported_files']:
   original=(archive/f['archive_path']).read_bytes();copied=(folder/f['path']).read_bytes();assert copied==original and sha(copied)==f['sha256'] and len(copied)==f['bytes'];files+=1
  for field in ['archive_raw','archive_listing']:
   source=archive/s[field];canonical=f'programs/{m["id"]}/original/{m["id"].upper()+source.suffix}'
   b=subprocess.check_output(['git','show',f'{m["id"]}-{s["version"]}:{canonical}'],cwd=root);assert b==source.read_bytes(),canonical
 for up in m.get('upstreamDownloads',[]):
  b=(folder/up['path']).read_bytes();u=json.loads((folder/'upstream/provenance.json').read_text());assert sha(b)==u['sha256']
# Every inventory row has one explicit disposition; unidentified data is not turned into a program.
for row,item in zip(rows,coverage['rows']):
 assert (row['capture'],row['order'],row['source_file'])==(item['capture'],item['save'],item['archive_source'])
 if item['disposition']=='excluded':assert 'quarantin' in row['status'].lower() or 'QUARANTIN' in row['source_file']
 elif item['disposition']=='existing program':assert (root/'programs'/item['program']/'program.json').is_file()
 elif item['disposition']=='new program':assert item['program'] in [c['id'] for c in plan['programs']]
 elif item['disposition']=='removed':assert not (root/'programs'/item['program']).exists()
 else:assert item['disposition']=='supporting material'
for slug in ['poker','spacecolony']:
 folder=root/'programs'/slug;u=json.loads((folder/'upstream/provenance.json').read_text());assert sha(next((folder/'upstream').glob('*.ASC')).read_bytes())==u['sha256']
 # The withdrawn snapshot remains byte-identical to its preserved pre-restoration catalog in Git.
 old=json.loads(subprocess.check_output(['git','show',f'a5eb978:programs/{slug}/web-versions.json'],cwd=root))
 for f in old['versions'][0]['files']:assert sha((folder/'website-archive/v1'/f['path']).read_bytes())==f['sha256']
print(f'Checked {len(rows)} inventory dispositions, {len(plan["programs"])} collections, {saves} captured items, {files} untouched imported files, canonical tags, upstream sources, and withdrawn snapshots.')
