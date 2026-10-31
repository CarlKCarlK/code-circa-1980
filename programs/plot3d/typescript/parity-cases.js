// Answers typed at TILT, X SCALE, Y SCALE, SWITCH ON and HOW MANY LINES ('' is Enter),
// and an optional replacement line 200. Recorded by app/scripts/record-plot3d-parity.mjs.
import {formulas} from './formulas.js';

export const cases = [
  {name: 'standard', answers: ['', '', '', '', '']},
  {name: 'side view', answers: ['0', '', '', '', '']},
  {name: 'steep, wide, 11 lines', answers: ['1', '1.5', '', '', '11']},
  {name: 'even lines', answers: ['', '', '', '', '6']},
  {name: 'tall and clipped', answers: ['', '', '2', '', '9']},
  {name: 'switch on', answers: ['', '', '', 'YES', '']},
  {name: 'one line', answers: ['', '', '', '', '1']},
  ...formulas.slice(1).map(f => ({name: f.name, formula: f.line, answers: ['', '', '', '', '11']})),
];

// Converts typed answers to engine settings the way the INPUT statements would.
export function settingsFor({answers, formula}, standard) {
  const number = (text, fallback) => text === '' ? fallback : Number(text);
  return {
    tilt: number(answers[0], standard.tilt), xScale: number(answers[1], standard.xScale),
    yScale: number(answers[2], standard.yScale), switchOn: answers[3] === 'YES',
    lines: number(answers[4], standard.lines), formula: formula ?? standard.formula,
  };
}
