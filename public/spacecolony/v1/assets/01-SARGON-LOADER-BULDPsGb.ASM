; SARGON loader — standard SYSTEM stage
; Derived static disassembly; code/data classification inferred, no execution test.
; SARGON payload decoded using the captured loader rolling XOR, raw bytes retained separately.
4400  00                         .byte 0x00
4401  53 41 52 47 4F 4E 00       .text "SARGON",0x00
4408  4A A5 99                   .byte 0x4A,0xA5,0x99
440b  53 41 52 47 4F 4E          .text "SARGON"
4411  FF 76 00 4A                .byte 0xFF,0x76,0x00,0x4A
4415  AF                         xor a,a
4416  32 00 44                   ld (0x4400),a
4419  CD 12 02                   call 0x0212
label1:
441c  CD 96 02                   call 0x0296
441f  3E 2A                      ld a,0x2A
4421  32 3E 3C                   ld (0x3C3E),a
4424  32 3F 3C                   ld (0x3C3F),a
label2:
4427  CD 35 02                   call 0x0235
442a  FE 99                      cp 0x99
442c  20 F9                      jr nz,label2
442e  06 06                      ld b,0x06
4430  21 38 3C                   ld hl,0x3C38
label3:
4433  CD 35 02                   call 0x0235
4436  77                         ld (hl),a
4437  23                         inc hl
4438  10 F9                      djnz label3
443a  06 06                      ld b,0x06
443c  21 38 3C                   ld hl,0x3C38
443f  11 01 44                   ld de,0x4401
label4:
4442  1A                         ld a,(de)
4443  BE                         cp (hl)
4444  20 D6                      jr nz,label1
4446  23                         inc hl
4447  13                         inc de
4448  10 F8                      djnz label4
label5:
444a  3A 3F 3C                   ld a,(0x3C3F)
444d  EE 0A                      xor a,0x0A
444f  32 3F 3C                   ld (0x3C3F),a
label6:
4452  CD 35 02                   call 0x0235
4455  FE 78                      cp 0x78
4457  28 33                      jr z,label10
4459  FE 3C                      cp 0x3C
445b  20 F5                      jr nz,label6
445d  CD 35 02                   call 0x0235
4460  47                         ld b,a
4461  CD 35 02                   call 0x0235
4464  6F                         ld l,a
4465  CD 35 02                   call 0x0235
4468  67                         ld h,a
4469  85                         add a,l
446a  4F                         ld c,a
label7:
446b  CD 35 02                   call 0x0235
446e  A9                         xor a,c
446f  77                         ld (hl),a
4470  A9                         xor a,c
4471  23                         inc hl
4472  00                         nop
4473  81                         add a,c
4474  4F                         ld c,a
4475  10 F4                      djnz label7
4477  CD 35 02                   call 0x0235
447a  B9                         cp c
447b  20 07                      jr nz,label9
447d  3E 2A                      ld a,0x2A
label8:
447f  32 3E 3C                   ld (0x3C3E),a
4482  18 C6                      jr label5
label9:
4484  3E 45                      ld a,0x45
4486  21 00 44                   ld hl,0x4400
4489  34                         inc (hl)
448a  18 F3                      jr label8
label10:
448c  CD 35 02                   call 0x0235
448f  6F                         ld l,a
4490  CD 35 02                   call 0x0235
4493  67                         ld h,a
4494  22 13 44                   ld (0x4413),hl
4497  CD F8 01                   call 0x01F8
449a  2A 13 44                   ld hl,(0x4413)
449d  22 07 40                   ld (0x4007),hl
44a0  E9                         jp hl
44a1  00 50 F4 CD 35 02 B9 20 08 .byte 0x00,0x50,0xF4,0xCD,0x35,0x02,0xB9,0x20,0x08
44aa  3E 2A 32 3E 3C             .text ">*2><"
44af  C3 E0 43 3E 45 21 00 43 34 18 F2 CD 35 02 6F CD 35 02 67 22 13 43 CD F8 01 21 00 50 22 06 40 C3 00 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 F1 .byte 0xC3,0xE0,0x43,0x3E,0x45,0x21,0x00,0x43,0x34,0x18,0xF2,0xCD,0x35,0x02,0x6F,0xCD,0x35,0x02,0x67,0x22,0x13,0x43,0xCD,0xF8,0x01,0x21,0x00,0x50,0x22,0x06,0x40,0xC3,0x00,0x50,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xF1
44e1  C3 4A 43 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 .byte 0xC3,0x4A,0x43,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
