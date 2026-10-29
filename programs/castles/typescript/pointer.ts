import type {Castles} from './engine.ts';
export type Tool = 'draw' | 'erase' | 'move';
export type Cell = {x:number; y:number};
/** Includes the CRT padding and non-square pixels; accepts CSS/fullscreen scaling. */
export function screenCell(clientX:number, clientY:number, rect:{left:number;top:number;width:number;height:number}):Cell|null {
  if (rect.width<=0 || rect.height<=0) return null;
  const x=Math.floor(((clientX-rect.left)*532/rect.width-10)/4);
  const y=Math.floor(((clientY-rect.top)*404/rect.height-10)/8);
  return x>=1&&x<=126&&y>=2&&y<=46 ? {x,y} : null;
}
/** Visit every crossed cell in stroke order; never join separate strokes. */
export function strokeCells(from:Cell,to:Cell):Cell[] {
  const cells:Cell[]=[];let {x,y}=from;
  const dx=Math.abs(to.x-x),sx=x<to.x?1:-1,dy=-Math.abs(to.y-y),sy=y<to.y?1:-1;
  let error=dx+dy;
  for(;;){cells.push({x,y});if(x===to.x&&y===to.y)return cells;
    const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}}
}
export function paintStroke(game:Castles,from:Cell,to:Cell,tool:Tool):string {
  if(game.phase!=='building')return 'unavailable';
  let blocked='';
  for(const cell of strokeCells(from,to)){
    if(tool==='move')game.cursor=cell;
    else {const result=game.editAt(cell.x,cell.y,tool);if(result==='unsupported'||result==='protected')blocked=result;}
  }
  return blocked;
}
