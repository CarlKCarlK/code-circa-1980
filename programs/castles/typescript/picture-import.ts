import {brickPngPolarity,filterPicture,hasBrickPixelAspect,pictureGeometry,placePicture} from './bricks.ts';

/** Preview a picture without changing the game. Returns the chosen brick map. */
export async function previewPicture(file:File,host:HTMLElement,field:HTMLCanvasElement,signal:AbortSignal,background:string):Promise<Uint8Array|null> {
  const bitmap=await createImageBitmap(file);
  try {
    const bytes=new Uint8Array(await file.arrayBuffer());
    const polarity=brickPngPolarity(bytes),savedFormat=polarity!==null;
    if(signal.aborted)return null;
    const geometry=pictureGeometry(bitmap.width,bitmap.height,hasBrickPixelAspect(bytes),savedFormat);
    const dialog=document.createElement('dialog');dialog.className='picture-import';
    dialog.setAttribute('aria-labelledby','picture-import-title');
    dialog.style.setProperty('--field-width',`${field.getBoundingClientRect().width}px`);
    dialog.innerHTML=`<h2 id="picture-import-title">Load any image</h2>
      <p>This is how the image will look as blocks. Adjust the colors, then choose OK.</p>
      <canvas width="532" height="404" aria-label="Image preview in game field"></canvas>
      <div class="picture-channels"></div>
      <p class="small">Negative values subtract that color. Unsupported blocks fall after loading.</p>
      <div class="picture-actions"><button type="button" data-action="cancel">Cancel</button><button type="button" data-action="ok">OK</button></div>`;
    const channels=dialog.querySelector('.picture-channels')!;
    const weights=[0.21,0.72,0.07];
    for(const [index,name] of ['Red','Green','Blue'].entries()) {
      const label=document.createElement('label');label.textContent=name+' ';
      const input=document.createElement('input');input.type='range';input.min='-1';input.max='1';input.step='0.01';input.value=String(weights[index]);input.setAttribute('aria-label',`${name} cutoff`);
      const output=document.createElement('output');output.textContent=input.value;
      label.append(input,output);channels.append(label);
      input.oninput=()=>{weights[index]=Number(input.value);output.textContent=Number(input.value).toFixed(2);render();};
    }
    const preview=dialog.querySelector<HTMLCanvasElement>('canvas')!,ctx=preview.getContext('2d')!;
    const sample=document.createElement('canvas'),sampleCtx=sample.getContext('2d',{willReadFrequently:true})!;
    let mask:Uint8Array=new Uint8Array(128*48);
    function sampleImage() {
      const {width,height}=geometry;
      sample.width=width;sample.height=height;sampleCtx.imageSmoothingEnabled=false;sampleCtx.drawImage(bitmap,0,0,width,height);
      return {width,height,pixels:sampleCtx.getImageData(0,0,width,height).data};
    }
    function render() {
      const {pixels,width,height}=sampleImage();mask=placePicture(filterPicture(pixels,width,height,weights,polarity!=='black'),geometry);
      ctx.fillStyle=background;ctx.fillRect(0,0,532,404);ctx.fillStyle='#e6e7fc';
      for(let y=0;y<47;y++)for(let x=0;x<128;x++)if(mask[y*128+x])ctx.fillRect(10+x*4,10+y*8,4,8);
      ctx.fillRect(10,10+47*8,512,8);
    }
    render();host.append(dialog);
    return await new Promise<Uint8Array|null>((resolve)=>{
      let finished=false;
      const finish=(result:Uint8Array|null)=>{
        if(finished)return;finished=true;signal.removeEventListener('abort',abort);
        if(dialog.open)dialog.close();dialog.remove();resolve(result);
      };
      const abort=()=>finish(null);
      signal.addEventListener('abort',abort,{once:true});
      dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});
      dialog.querySelector<HTMLButtonElement>('[data-action="cancel"]')!.onclick=()=>finish(null);
      dialog.querySelector<HTMLButtonElement>('[data-action="ok"]')!.onclick=()=>finish(mask);
      dialog.showModal();
      if(signal.aborted)finish(null);
    });
  } finally {bitmap.close();}
}
