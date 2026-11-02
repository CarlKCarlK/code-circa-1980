// Unshared second-gallery programs stay at v1 until the user changes that policy.
export function planRelease(metadata,catalog,{refreshUnshared=false}={}){
 const versions=catalog.versions;
 if(refreshUnshared){
  if(metadata.gallery!=='more'||metadata.unsharedWebV1!==true||versions.length!==1||versions[0].id!=='v1'||versions[0].path!==`${metadata.id}/v1/`)throw Error('Only an explicitly marked, unshared second-gallery v1 may be refreshed.');
  return {version:'v1',replace:true};
 }
 if(metadata.unsharedWebV1===true&&versions.length)throw Error('This unshared program stays at v1 until the user says otherwise. Use --refresh-unshared-v1 for local iterations.');
 return {version:`v${versions.length+1}`,replace:false};
}
