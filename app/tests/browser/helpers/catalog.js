import fs from 'node:fs';
export const REMAINING_IDS=JSON.parse(fs.readFileSync(new URL('../../../site/remaining-programs.json',import.meta.url)));
export const DISK_IDS=JSON.parse(fs.readFileSync(new URL('../../../site/disk-programs.json',import.meta.url)));
const merged=id=>JSON.parse(fs.readFileSync(new URL(`../../../../programs/${id}/program.json`,import.meta.url))).mergedInto;
export const MORE_COUNT=34+2+[...REMAINING_IDS,...DISK_IDS].filter(id=>!merged(id)).length;
