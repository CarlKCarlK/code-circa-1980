// The Model I Expansion Interface reaches its disk controller through memory
// (0x37E0-0x37EF), where the emulator library only provides the Model III's ports.
export function withModel1Disks(Base){
  return class extends Base {
    // A disk system turns on the timer interrupt that a stock Level II machine leaves unused.
    reset(){super.reset();this.setIrqMask(0x80);}
    // The Model I's WD1771 reports a directory sector's 0xFA data mark in its status.
    // The library's WD1793 model reports only 0xF8, so TRSDOS would never see its directory.
    loadFloppyDisk(disk,drive){
      if(disk?.tracks&&!disk.reportsDirectoryMark){
        const readSector=disk.readSector.bind(disk);
        disk.reportsDirectoryMark=true;
        disk.readSector=(track,side,number)=>{
          const data=readSector(track,side,number);
          if(data&&number!==undefined){
            const sector=disk.tracks.find(t=>t.trackNumber===track&&t.side===side)?.sectors.find(s=>s.getSectorNumber()===number);
            if(sector&&sector.getByte(sector.dataIndex-1)===0xfa)data.deleted=true;
          }
          return data;
        };
      }
      super.loadFloppyDisk(disk,drive);
    }
    readMemory(address){
      switch(address){
        // Reading the interrupt latch also acknowledges the 40 Hz timer.
        case 0x37e0: return this.interruptLatchRead();
        case 0x37ec: return this.fdc.readStatus();
        case 0x37ed: return this.fdc.readTrack();
        case 0x37ee: return this.fdc.readSector();
        case 0x37ef: return this.fdc.readData();
        default: return super.readMemory(address);
      }
    }
    writeMemory(address,value){
      switch(address){
        case 0x37e0: case 0x37e1: case 0x37e2: case 0x37e3: this.fdc.writeSelect(value&0x0f); break;
        // 0xFE and 0xFF select single or double density on a doubler board, not the controller.
        case 0x37ec: if(value<0xfe)this.fdc.writeCommand(value); break;
        case 0x37ed: this.fdc.writeTrack(value); break;
        case 0x37ee: this.fdc.writeSector(value); break;
        case 0x37ef: this.fdc.writeData(value); break;
        default: super.writeMemory(address,value);
      }
    }
  };
}
