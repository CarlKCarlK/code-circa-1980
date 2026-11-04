import fs from 'node:fs';
export const REMAINING_IDS=JSON.parse(fs.readFileSync(new URL('../../../site/remaining-programs.json',import.meta.url)));
export const DISK_IDS=JSON.parse(fs.readFileSync(new URL('../../../site/disk-programs.json',import.meta.url)));
export const MORE_COUNT=34+2+REMAINING_IDS.length+DISK_IDS.length;
