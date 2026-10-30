/** The control panel, always docked beside the field (below it on narrow screens). Pointer gestures never reach the playfield. */
export function createPalette(host:HTMLElement,body:HTMLElement,title:string,onInteract:()=>void){
  const panel=document.createElement('aside');panel.className='docked-palette';panel.setAttribute('aria-label',`${title} controls`);
  const content=document.createElement('div');content.className='palette-body';content.append(body);panel.append(content);
  host.querySelector('#control-dock')!.append(panel);
  panel.onpointerdown=event=>{event.stopPropagation();onInteract();};
  panel.onpointermove=event=>event.stopPropagation();panel.onpointerup=event=>event.stopPropagation();
  return {element:panel,dispose(){panel.remove();}};
}
