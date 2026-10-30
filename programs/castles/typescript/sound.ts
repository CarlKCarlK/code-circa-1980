/** Synthesized retro sound effects for the browser version (the 1982 original was silent). */
const storageKey='cc80.castles.muted';
export type SoundEvent='fire'|'impact'|'fall';

export function createSound(){
  let context:AudioContext|null=null, master:GainNode|null=null, noise:AudioBuffer|null=null, lastFall=0;
  let muted=false;
  try{muted=localStorage.getItem(storageKey)==='1';}catch{}
  const played:Record<SoundEvent,number>={fire:0,impact:0,fall:0};

  /** Browsers allow audio only after a user gesture; call this from one. */
  function unlock(){
    if(!context){
      const Context=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!Context)return;
      context=new Context();master=context.createGain();master.gain.value=.35;master.connect(context.destination);
      noise=context.createBuffer(1,context.sampleRate*.4,context.sampleRate);
      const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    }
    if(context.state==='suspended')void context.resume();
  }
  function envelope(start:number,peak:number,length:number){
    const gain=context!.createGain();gain.gain.setValueAtTime(peak,start);gain.gain.exponentialRampToValueAtTime(.001,start+length);gain.connect(master!);return gain;
  }
  function tone(start:number,from:number,to:number,length:number,peak:number){
    const oscillator=context!.createOscillator();oscillator.type='square';
    oscillator.frequency.setValueAtTime(from,start);oscillator.frequency.exponentialRampToValueAtTime(to,start+length);
    oscillator.connect(envelope(start,peak,length));oscillator.start(start);oscillator.stop(start+length);
  }
  function burst(start:number,frequency:number,length:number,peak:number){
    const source=context!.createBufferSource();source.buffer=noise;
    const filter=context!.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.8;
    source.connect(filter);filter.connect(envelope(start,peak,length));source.start(start);source.stop(start+length);
  }
  function play(event:SoundEvent){
    if(muted||!context||context.state!=='running')return;
    const now=context.currentTime;
    if(event==='fall'){
      // Many blocks can move per frame; one quiet click every 45 ms reads as patter, not buzz.
      if(now-lastFall<.045)return;lastFall=now;
      tone(now,900+Math.random()*700,500,.025,.12);
    }else if(event==='fire'){tone(now,140,45,.16,.5);burst(now,500,.08,.25);}
    else {burst(now,900,.22,.6);tone(now,90,40,.12,.25);}
    played[event]++;
  }
  return {
    unlock,play,
    get muted(){return muted;},
    setMuted(value:boolean){muted=value;try{localStorage.setItem(storageKey,value?'1':'0');}catch{}},
    played:()=>({...played}),
    dispose(){void context?.close();context=null;},
  };
}
