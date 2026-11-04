// Runs the keystrokes and disk swaps that start a program from its original disks,
// as a person at the keyboard would. Each step waits for the previous one to finish.
export function screenText(machine){
  return Array.from({length:16},(_,row)=>String.fromCharCode(...Array.from({length:64},(_,column)=>{
    const code=machine.readMemory(0x3c00+row*64+column);
    return code<32?code+64:code>=128?32:code;
  }))).join('\n');
}
export function runDiskSteps(machine,keyboard,disks,steps,done){
  let index=0,canceled=false;
  const next=delay=>machine.eventScheduler.add(undefined,machine.tStateCount+machine.clockHz*delay,advance);
  function advance(){
    if(canceled)return;
    const step=steps[index];
    if(!step){done?.();return;}
    if(keyboard.keyQueue.length)return next(0.05);
    if(step.wait!==undefined){
      if(!new RegExp(step.wait,'m').test(screenText(machine)))return next(0.05);
    }else if(step.type!==undefined){
      keyboard.simulateKeyboardText(step.type.toLowerCase());
    }else if(step.press!==undefined){
      keyboard.keyEvent(step.press,true);
      machine.eventScheduler.add(undefined,machine.tStateCount+machine.clockHz*0.1,()=>keyboard.keyEvent(step.press,false));
      index++;return next(0.2);
    }else if(step.swap!==undefined){
      machine.loadFloppyDisk(disks[step.swap],0);
    }else if(step.delay!==undefined){
      index++;return next(step.delay);
    }
    index++;next(0.05);
  }
  next(0.05);
  return ()=>{canceled=true;};
}
