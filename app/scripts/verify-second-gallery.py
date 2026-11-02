"""Verify imported snapshots, canonical tagged blobs, and untouched partial prefixes."""
import hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
def sha(b):return hashlib.sha256(b).hexdigest()
count=0
for slug in ['speech','olympics','starwars81']:
 folder=root/'programs'/slug;e=json.loads((folder/'provenance.json').read_text())
 history=e.get('canonical_history_id',slug)
 for save in e['saves']:
  for f in save['imported_files']:
   b=(folder/f['path']).read_bytes();assert len(b)==f['bytes'] and sha(b)==f['sha256']
   canonical=f'programs/{history}/original/{history.upper()}{Path(f["path"]).suffix}'
   committed=subprocess.check_output(['git','show',f'{slug}-{save["version"]}:{canonical}'],cwd=root)
   assert sha(committed)==f['sha256'],canonical
  count+=1
 latest=e['saves'][-1]
 for f in latest['imported_files']:
  assert sha((folder/'original'/(slug.upper()+Path(f['path']).suffix)).read_bytes())==f['sha256']
 partial=folder/'partial'
 if partial.exists():
  for f in json.loads((partial/'provenance.json').read_text())['files']:
   b=(partial/f['path']).read_bytes();assert len(b)==f['bytes'] and sha(b)==f['sha256']
  for prefix in partial.glob('*-PREFIX.BIN'):
   raw=partial/(prefix.name.replace('-PREFIX.BIN','-RAW.BAS'))
   assert raw.read_bytes().startswith(prefix.read_bytes()),prefix
print(f'Verified {count} complete snapshots, canonical tags and current originals, plus all partial hashes and raw prefix ranges.')
