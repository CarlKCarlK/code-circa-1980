# Calibrating Castles against v05

The first port used one 20ms interval for all bombardment work. It made projectile
motion too fast and visible falling-block motion too slow. These speeds are now
separate and measured against the emulator's Model III clock (2,027,520 Hz).

| Work | Initial TypeScript | Measured v05 / calibrated TypeScript |
| --- | --- | --- |
| Projectile step | 20ms | about 117ms |
| Per-shot setup | No separate budget | about 118ms |
| Exit/next-shot overhead | No separate budget | about 99ms |
| Each of nine impact attempts | 20ms only for changed pairs | about 101ms for every attempt |
| Individual falling moves | 20ms | about 1–2ms, varying with row and path |
| Empty-cell scan work | Instantaneous | about 0.2–0.4ms per cell |

## Method

`npm run calibrate:castles` regenerates `timing-calibration.json`. It steps the
unchanged v05 BASIC and derived FALL v6 through the real Z80 emulator and converts
CPU cycles to milliseconds. It measures emulated time, not the host CPU's speed.
The BASIC current-line number at 0x40A2 marks flight, setup, exit, and impact
boundaries. The retained run samples 29 completed flight steps, 30 shot setups,
and three complete impacts. Medians supply BASIC timing budgets.

The assembly measurements isolate TEST/RESET and falling-loop paths. Their
budgets account for row-dependent addressing loops, odd/even columns, each
support configuration, starting/stopping a fall, and full-screen scan overhead.
Unchanged game rules still determine the screen; these costs only schedule work.
The renderer can advance multiple fast assembly operations in one browser frame.

## Validation and limits

Five settling fixtures (empty field, isolated block, diagonal support, stacked
blocks, and edge blocks) have total budgets matching the executed Z80 routine to
floating-point tolerance. Eight seeded scattered-block fixtures match within
0.1 percent, including identical final screen bytes. Existing construction,
projectile, impact/debris, and archive comparisons still pass.

A browser check measures actual TypeScript simulation steps across 600ms of
flight to verify that the renderer honors the new budgets rather than continuing
to use the old 20ms interval. Pause/restart and original-version tests remain.

Visible falling is much quicker, but a complete settling pass still includes the
original scan time: scanning rows 30 through zero takes roughly 1.1 seconds even
with no falling blocks. This preserves the gap before the next shot rather than
making all collision processing instantaneous.

BASIC arithmetic/branches vary slightly between shots and impacts, so their
median budgets remain approximate. The existing random-sequence, numerical, and
out-of-VRAM differences are recorded in PARITY.md. Browser frames are not CPU
cycles; this calibration targets the foreground play speed of the existing
Model III emulator, not every physical TRS-80 model.
