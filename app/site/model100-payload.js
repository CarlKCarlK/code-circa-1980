// Cassette framing is removed only in memory; recovered files stay untouched.
export function model100Payload(block) {
  if (block.length < 27 || block[0] !== 0x8d || block.slice(1).reduce((a,b)=>a+b,0)%256 !== 0)
    throw Error('Invalid Model 100 cassette block/checksum');
  if (!block.slice(-20).every(b=>b===0)) throw Error('Invalid Model 100 cassette trailer');
  const payload=block.slice(1,-21);
  let offset=0,last=-1,base;
  while(offset<payload.length){
    if(offset+5>payload.length)throw Error('Truncated Model 100 record');
    const pointer=payload[offset]|payload[offset+1]<<8, line=payload[offset+2]|payload[offset+3]<<8;
    const end=payload.indexOf(0,offset+4);
    if(end<0||line<=last||!pointer)throw Error('Invalid Model 100 record');
    const nextBase=pointer-(end+1);
    if(base!==undefined&&base!==nextBase)throw Error('Inconsistent Model 100 line pointers');
    base=nextBase;last=line;offset=end+1;
  }
  // VirtualT's host-file loader needs an in-memory zero pointer after the final
  // cassette record. This is a loading adaptation, not recovered tape content.
  const loaded=new Uint8Array(payload.length+2);loaded.set(payload);return loaded;
}
