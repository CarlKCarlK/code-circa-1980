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

export type Direction = 'vertical' | 'horizontal' | 'diagonal-up' | 'diagonal-down';
/** Direction assist works in logical grid units, never screen angles. */
export class StrokeGuide {
  private anchor:Cell;
  private last:Cell;
  direction:Direction|null=null;
  private readonly diagonalOnly:boolean;
  constructor(start:Cell,diagonalOnly=false){this.diagonalOnly=diagonalOnly;this.anchor={...start};this.last={...start};}
  private choose(dx:number,dy:number):Direction {
    if(!this.diagonalOnly&&Math.abs(dy)>2*Math.abs(dx))return 'vertical';
    if(!this.diagonalOnly&&Math.abs(dx)>2*Math.abs(dy))return 'horizontal';
    return dx*dy<0?'diagonal-up':'diagonal-down';
  }
  private project(raw:Cell,direction:Direction):Cell {
    const dx=raw.x-this.anchor.x,dy=raw.y-this.anchor.y;
    if(direction==='vertical')return {x:this.anchor.x,y:raw.y};
    if(direction==='horizontal')return {x:raw.x,y:this.anchor.y};
    const slope=direction==='diagonal-up'?-1:1;
    let distance=Math.round((dx+slope*dy)/2);
    // Keep the whole projected diagonal inside the original editable area.
    const low=Math.max(1-this.anchor.x,slope===1?2-this.anchor.y:this.anchor.y-46);
    const high=Math.min(126-this.anchor.x,slope===1?46-this.anchor.y:this.anchor.y-2);
    distance=Math.max(low,Math.min(high,distance));
    return {x:this.anchor.x+distance,y:this.anchor.y+slope*distance};
  }
  update(raw:Cell,finish=false):Cell {
    const dx=raw.x-this.anchor.x,dy=raw.y-this.anchor.y;
    if(!this.direction){
      if(Math.max(Math.abs(dx),Math.abs(dy))<3&&!finish)return {...this.last};
      if(dx===0&&dy===0)return {...this.last};
      this.direction=this.choose(dx,dy);
    }
    let target=this.project(raw,this.direction);
    if(!this.diagonalOnly&&Math.max(Math.abs(raw.x-target.x),Math.abs(raw.y-target.y))>=3){
      const next=this.choose(raw.x-this.last.x,raw.y-this.last.y);
      if(next!==this.direction){this.anchor={...this.last};this.direction=next;target=this.project(raw,next);}
    }
    this.last=target;return {...target};
  }
}
