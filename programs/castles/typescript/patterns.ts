/** Presets are ordinary brick maps, independent of input and cannon state. */
export function trestleBridge():Uint8Array {
  const mask=new Uint8Array(128*48);
  const set=(x:number,y:number)=>{if(x>=0&&x<128&&y>=0&&y<47)mask[y*128+x]=1;};
  const deck=24,branchTop=deck+1;
  // A supported path can widen by at most one column per row. Three feet
  // are the minimum for a 128-column deck at this height: each reaches 45 columns.
  function path(x:number,y:number,toX:number,toY:number){
    set(x,y);while(y>toY){y--;x+=Math.sign(toX-x);set(x,y);}
  }
  function branches(targets:number[],fromX:number,fromY:number){
    const lo=targets[0],hi=targets.at(-1)!,x=Math.floor((lo+hi)/2);
    const y=branchTop+Math.max(x-lo,hi-x);
    path(fromX,fromY,x,y);
    if(targets.length===1)return;
    const middle=Math.floor(targets.length/2);
    branches(targets.slice(0,middle),x,y);branches(targets.slice(middle),x,y);
  }
  const endpoints=Array.from({length:43},(_,i)=>i*3);
  for(const [foot,lo,hi] of [[21,0,42],[64,45,84],[107,87,126]])
    branches(endpoints.filter(x=>x>=lo&&x<=hi),foot,46);
  for(let x=0;x<128;x++)set(x,deck);
  // The train spans local columns 6..93 (88 columns), centered at 20..107.
  const trainOffset=14;
  const trainSet=(x:number,y:number)=>set(x+trainOffset,y);
  const fill=(left:number,top:number,width:number,height:number)=>{
    for(let y=top;y<top+height;y++)for(let x=left;x<left+width;x++)trainSet(x,y);
  };
  // The engine faces left, with its cab behind the boiler and chimney.
  for(let x=7;x<=23;x+=4){trainSet(x,23);trainSet(x+1,23);}
  fill(6,20,20,3);fill(20,17,5,3);fill(20,17,6,1);
  fill(10,16,2,4);fill(9,16,4,1);
  mask[18*128+22+trainOffset]=0;
  // Two broad wheels support each solid-sided car under the original rules.
  // One-column gaps let the low couplings rest diagonally on adjacent wheels.
  for(const left of [27,44,61,78]){
    fill(left,18,16,4);
    fill(left,22,7,1);fill(left+9,22,7,1);
    fill(left,23,6,1);fill(left+10,23,6,1);
    trainSet(left-1,22);
  }
  return mask;
}
/** Draws rows of '#' bricks with the bottom row resting on row 46. */
function drawRows(mask:Uint8Array,left:number,rows:string[]){
  const top=47-rows.length;
  rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='#')mask[(top+y)*128+left+x]=1;}));
}
/** Carl's arch on the left and a symmetric goblet tower mirroring it on the right. */
export function archAndTower():Uint8Array {
  const mask=new Uint8Array(128*48);
  drawRows(mask,6,[
    '.........#.........',
    '........#.#........',
    '.......#...#.......',
    '......#.....#......',
    '######.......######',
    '#####....#....#####',
    '####....#.#....####',
    '###...##...##...###',
    '##....#.....#....##',
    '#.....#.....#.....#',
    '#.....#.....#.....#',
    '#.....#.....#.....#',
  ]);
  drawRows(mask,106,[
    '#.#.......#.#',
    '###.......###',
    '.#.........#.',
    '.#.........#.',
    '.#.#.#.#.#.#.',
    '.###########.',
    '.###########.',
    '.###########.',
    '..#########..',
    '...#######...',
    '....#####....',
    '.....###.....',
    ...Array(11).fill('......#......'),
  ]);
  return mask;
}
export const patterns=[
  {id:'arch-tower',label:'Arch and tower',create:archAndTower},
  {id:'trestle',label:'Train trestle bridge',create:trestleBridge},
  {id:'blank',label:'Empty field',create:()=>new Uint8Array(128*48)}
];
