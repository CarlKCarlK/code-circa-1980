// Web versions freeze the whole player, independently of recovered source versions.
export const defaultEdition = program => program.defaultImplementation && program.modern ? program.modern : program.versions.find(v=>v.id===program.defaultVersion);
export const releasePath = (program, release) => release.path??`experiences/${program}/${release.id}/`;

export function routeParts(hash, webProgram, search='') {
  const parts=hash.slice(1).split('/').filter(Boolean);
  // Accept old shared routes, but never generate them in deployed pages.
  if(parts[0]==='program')return parts;
  const params=new URLSearchParams(search);
  if(webProgram)return ['program',webProgram,params.get('source')??params.get('lang')??undefined,'play',params.get('scene')??undefined];
  return params.has('program')?['program',params.get('program')]:parts;
}

export function editionSearch(program, edition=defaultEdition(program), scene, search='') {
  const params=new URLSearchParams(search);
  for(const name of ['program','lang','source','scene'])params.delete(name);
  if(edition.id!==defaultEdition(program).id)params.set(edition.playable?'lang':'source',edition.slug??edition.id);
  if(scene && scene!==program.playSuffix?.slice(1))params.set('scene',scene);
  const query=params.toString();
  return query?`?${query}`:'';
}

export function releaseSearch(program, parts, search='') {
  const edition=!parts[2]?defaultEdition(program):[program.modern,...program.versions].find(v=>v && ((v.slug??v.id)===parts[2]||v.id===parts[2]));
  if(!edition)throw new Error(`Unknown edition: ${parts[2]}`);
  return editionSearch(program,edition,parts[4],search);
}
