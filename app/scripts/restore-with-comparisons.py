"""Append comparison + canonical replay without changing existing history/tags."""
from pathlib import Path
import hashlib,json,shutil,subprocess
root=Path(__file__).resolve().parents[2]
def git(*a):return subprocess.check_output(['git',*a],cwd=root).decode().strip()
for slug,name,title,url in [('poker','poker','Poker','https://www.atariarchives.org/basicgames/showpage.php?page=129'),('spacecolony','king','King / Pollution Game','https://www.cs.brandeis.edu/~storer/LunarLander/PollutionGame/King-101BasicComputerGames.pdf')]:
 folder=root/'programs'/slug;meta=json.loads((folder/'program.json').read_text());ev=json.loads((folder/'provenance.json').read_text());source=root/'docs/research/published-basic'/(name+'.bas');b=source.read_bytes()
 if git('tag','--list',slug+'-comparison-source'):raise SystemExit('Comparison history already exists: '+slug)
 target=folder/'upstream'/(name.upper()+'.ASC');target.parent.mkdir(exist_ok=True);target.write_bytes(b)
 baseline={'title':title,'source_url':f'https://raw.githubusercontent.com/GReaperEx/bcg/master/{name}.bas','publication_url':url,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'note':'Complete electronic anthology transcription. Not a byte-verified print transcription, exact intermediate parent, or recovered cassette. Existing history is preserved; this comparison and canonical replay are appended.'}
 (folder/'upstream/provenance.json').write_text(json.dumps(baseline,indent=2)+'\n')
 canonical=folder/'original';(canonical/(slug.upper()+'.ASC')).write_bytes(b)
 git('add',str(folder.relative_to(root)));git('commit','-q','-m','Append published comparison source for '+meta['title']);git('tag',slug+'-comparison-source')
 for v in meta['versions']:
  for field in ['raw','listing']:
   f=folder/v[field];target=canonical/(slug.upper()+f.suffix);target.write_bytes(f.read_bytes())
  save=next(s for s in ev['saves'] if s['version']==v['id']);(canonical/'provenance.json').write_text(json.dumps(save,indent=2)+'\n')
  git('add',str(canonical.relative_to(root)));git('commit','-q','-m',f'Replay {meta["title"]} canonical {v["id"]} after published comparison');git('tag',slug+'-replayed-'+v['id'])
  for field in ['raw','listing']:
   f=folder/v[field];assert subprocess.check_output(['git','show',f'HEAD:programs/{slug}/original/{slug.upper()+f.suffix}'],cwd=root)==f.read_bytes()
 meta.pop('website',None);meta['websiteRestoration']='Restored November 3, 2026, at the user’s request to include derivative programs with prominent attribution.'
 meta['attribution']={'text':'Adapted from Creative Computing’s published Poker listing. Six recovered saves and the separate documented correction patch are preserved.' if slug=='poker' else 'Space-themed adaptation of James A. Storer’s King / Pollution Game. The authorship of the space adaptation is not established.','url':url}
 ev['restored_comparison_source']=baseline
 for file,value in [('program.json',meta),('provenance.json',ev)]: (folder/file).write_text(json.dumps(value,indent=2)+'\n')
 (folder/'README.md').write_text((folder/'README.md').read_text()+'\nRestored with prominent prior-work attribution on November 3, 2026. Published comparison source is in upstream/. The appended comparison and replay tags preserve the earlier import history without rewriting it. The withdrawn website snapshot remains unchanged in website-archive/v1.\n')
 shutil.copytree(folder/'website-archive/v1',root/'public'/slug/'v1')
 print(slug,'restored; prior snapshot copied byte for byte')
