# Third-party software

The browser executes recovered BASIC using Lawrence Kesteloot’s TRS-80 and Z80
emulator libraries, pinned to the published npm releases in package-lock.json.
Upstream: https://github.com/lkesteloot/trs80

`trs80-emulator`, `trs80-emulator-web`, `trs80-base`, `z80-emulator`, `z80-base`,
and their other dependencies retain their own licenses. These components are not
relicensed under this repository’s dual license. The emulator bundle contains the
BASIC ROM images and character fonts supplied by the upstream package; this
project has not substituted or claimed authorship of them.

The MIT notices below are retained for the emulator and web integration. Other
dependency notices are distributed in their npm packages and lockfile graph.

MIT License

Copyright (c) 2019 Lawrence Kesteloot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


MIT License

Copyright (c) 2019 Lawrence Kesteloot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The development-only z80-asm 2.3.0 assembler is also by Lawrence Kesteloot, under the MIT license:

MIT License

Copyright (c) 2021 Lawrence Kesteloot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Recovered Poker listing

The historical Poker heading credits Creative Computing, Morristown, New Jersey
(with original transcription spelling retained). These recovered third-party
source credits remain intact; the collection's license does not replace any
rights associated with the original published listing. No new authorship is
claimed for that listing.

## Cave and monster-game source comparisons

Jaberwocky incorporates dispatcher and room descriptions from Roger Chaffee’s Quest, published in BYTE, July 1979, pp. 176–186. The comparison baseline contains selected source excerpts, not a complete runnable Quest. The published listing credits Chaffee and Peninsula School, copyright 1978, with permission to use, not sell. Preserve that attribution and restriction for borrowed material.

The early JAB maze forms derive from Jack Hauber’s Amazing in BASIC Computer Games (1978), edited by David H. Ahl. The upstream electronic transcription retains its Creative Computing heading and is credited separately in programs/jab/upstream/. This is third-party comparison material; the collection’s general license does not establish rights to these published sources. Neither upstream source was recovered from Carl’s cassettes in this import.

## Lunar Lander and teaching-machine references

Jim Storer’s 1969 Lunar Lander FOCAL listing is preserved from his own archive’s transcription credited to Matthew House. The published BASIC Lunar electronic transcription retains its Creative Computing heading and source text. Source URLs, exact file hashes, and transcription limits are in programs/ll/upstream/. These historical comparison sources have their own authorship; the collection’s general license does not assign new rights to them. TUTAC’s teaching-machine design is credited to Theodore G. Scott’s Basic Computer Programming; no modern Python simulator is incorporated or labeled a historical ancestor.

Visible More-page credits additionally identify Hauber’s Amazing in Ricky Rat’s maze generation, Conway’s LIFE rules, Lichello’s investing methods, Gardner’s cited worm discussion, the book-code notice in Cipher, and John Hartman’s joint authorship for John’s Circle. These credits distinguish code, rules/design, inspiration, and collaboration; they do not assert newly discovered published code where none was identified.

## Comprehensive recovered-program archive

The More archive includes third-party listings and adaptations, with visible
credits and source notices preserved per program. Unknown authorship is labeled
explicitly. The collection’s MIT/Apache license covers Carl Kadie’s code and does
not replace rights in published listings or unidentified third-party material.

Complete electronic BASIC Computer Games comparison transcriptions from the
GReaperEx/bcg mirror of Vintage BASIC are retained in docs/research/published-basic/
and selected programs/upstream/. Their original bytes, Creative Computing
headings, retrieval URLs, and hashes are preserved; exact print transcription
and intermediate source editions are unverified. New canonical histories begin
with the relevant comparison before the recovered saves. Poker and Space Colony
append a comparison and canonical replay, preserving all existing history.

Quest retains Roger Chaffee’s BYTE provenance;
D&D reference material and the Mille Bornes/Monopoly designs are credited
separately from the uncertain origin of their program implementations.

## Software on recovered floppy disks

The disk players boot unchanged images of the owner's disks. On those disks, and
retained with their own notices: MMSFORTH V2.0 and its utilities, © 1981 Miller
Microcomputer Services; LISP 3.72, © 1981 R. L. Nicol, distributed by SuperSoft;
TRSDOS 2.3, © Tandy Corporation; and NEWDOS/80 2.0, Apparat, Inc. They are kept
for small-scale archival use, and their rights stay with their holders.
