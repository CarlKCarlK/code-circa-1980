// Surfaces to try, written as Level II BASIC line 200 so they work in both versions.
// X and Z run from -1 to 1; keep Y roughly between -1 and 1. PI and E are set by line 180.
export const formulas = [
  {name: 'Funnel (original)', line: 'IF X<>0 OR Z<>0 THEN Y=-1/SQR(X^2*18+Z^2*18)+1 ELSE Y=-1'},
  {name: 'Ripples', line: 'Y=COS(3*PI*SQR(X*X+Z*Z))/2'},
  {name: 'Saddle', line: 'Y=X^2-Z^2'},
  {name: 'Hill', line: 'Y=1.5*E^(-5*(X*X+Z*Z))-.5'},
  {name: 'Egg crate', line: 'Y=SIN(PI*X)*SIN(PI*Z)/2'},
  {name: 'Sombrero', line: 'R=3*PI*SQR(X*X+Z*Z):IF R=0 THEN Y=1 ELSE Y=SIN(R)/R'},
  {name: 'Cone', line: 'Y=SQR(X*X+Z*Z)-.7'},
];

// Keys that replace line 200 in the running original: BREAK, the line (^ is the ↑ key), Enter, RUN.
export const line200Keys = line => ['Escape', ...`200 ${line.trim().toUpperCase()}`].map(c => '^[↑'.includes(c) ? 'ArrowUp' : c)
  .concat('Enter', ...'RUN', 'Enter');
