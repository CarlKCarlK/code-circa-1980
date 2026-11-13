// Presentation for Armatron-80, a new 2026 Level II BASIC program in the More gallery.
// Playback uses the shared hardware emulator; the BASIC reads held keys from the
// keyboard matrix, so fast mode stays on while keys are held.
const lb = 'https://github.com/CarlKCarlK/linkage-blaze';
const excel = 'https://github.com/CarlKCarlK/excel-3d-robot-arm';
const armatron = 'https://en.wikipedia.org/wiki/Armatron';
const keyTable = `<table class="armatron-keys"><thead><tr><th>Keys</th><th>Joint</th></tr></thead><tbody>
<tr><td><kbd>Q</kbd> / <kbd>A</kbd></td><td>Swing the whole arm around its base</td></tr>
<tr><td><kbd>W</kbd> / <kbd>S</kbd></td><td>Raise or lower the arm at the shoulder</td></tr>
<tr><td><kbd>E</kbd> / <kbd>D</kbd></td><td>Bend the elbow</td></tr>
<tr><td><kbd>R</kbd> / <kbd>F</kbd></td><td>Tip the hand up or down at the wrist</td></tr>
<tr><td><kbd>T</kbd> / <kbd>G</kbd></td><td>Twist the hand</td></tr>
<tr><td><kbd>Y</kbd> / <kbd>H</kbd></td><td>Close or open the gripper</td></tr>
<tr><td>Arrow keys</td><td>Orbit (left/right) and tilt (up/down) the camera</td></tr>
<tr><td><kbd>Z</kbd> / <kbd>X</kbd></td><td>Zoom the camera in or out</td></tr>
<tr><td><kbd>Space</kbd></td><td>Auto-reach: let the arm search for the target, or stop it</td></tr>
<tr><td><kbd>N</kbd> / <kbd>P</kbd></td><td>Next or previous target</td></tr>
<tr><td><kbd>0</kbd></td><td>Return the arm to its starting pose</td></tr>
</tbody></table>`;

export const armatronView = {
  art: {src: new URL('../../assets/armatron-gallery.svg', import.meta.url).href},
  aboutOpen: true,
  provenanceLabel: 'Provenance',
  instructions: () => `<section><h2>A robot arm made of turtle steps</h2>
<p>Armatron-80 is new: I wrote it in 2026 with Claude, in the Level II BASIC this collection was written in. It is not a recovered tape. It ports two modern projects of mine back to the TRS-80. One is the Armatron demo from <a href="${lb}" target="_blank" rel="noopener noreferrer">Linkage Blaze</a>, a Rust 3-D turtle-graphics library. The other is the <a href="${excel}" target="_blank" rel="noopener noreferrer">Excel 3-D robot arm</a> workbook. Both model the <a href="${armatron}" target="_blank" rel="noopener noreferrer">Armatron</a>, the six-motion toy arm Radio Shack sold in the 1980s.</p>
<h3>Start here</h3>
<p>Click the screen so it gets your keys. A cross marks the target, with a dotted line down to the floor to show its height. Hold the joint keys to steer the arm until its fingertips touch the cross; the status line shows the distance. Use the camera keys to judge depth. Press <kbd>Space</kbd> to watch the arm find the target by itself, and <kbd>N</kbd> for a new target.</p>
${keyTable}
<h3>How it works</h3>
<p>The arm is a chain of turtle steps, the same chain as in Linkage Blaze and the spreadsheet: swing, rise 2.5, pitch the shoulder, go 3, bend the elbow, go 3, pitch the wrist, go 1, twist, go 0.5, then two fingers. Each turn multiplies a 3×3 orientation matrix held in nine variables, A1 to A9. The camera is a turtle too: it rises, backs away, tilts, and spins, then the scene is drawn in perspective with SET. Auto-reach is a greedy coordinate search, like Linkage Blaze's: nudge one joint (or the elbow and base together), keep any nudge that brings the fingertips closer, and halve the nudge when none does. To place a target where the arm can reach it, the program runs a hidden target pose through the same arm routine with drawing turned off, as Linkage Blaze does. Target numbers make repeatable poses, using the spreadsheet's trick of taking digits from a large multiple of SIN.</p>
<p>Speed starts at Max, as fast as your browser can run the emulator. That is about 60 times a real TRS-80, so the arm moves smoothly. Original (1×) shows the real 1980 pace: each new frame takes several seconds, because Level II BASIC rereads every number in the program text and looks variables up one by one. The listing puts its busiest variables first for this reason. Help pauses and restores the previous pause state, Pause freezes the machine, and Restart starts over. Held keys are released on blur, pause, restart, and navigation.</p>
<p>Simplifications: lines are one pixel wide, the 9×9 floor grid is a 5×5 grid of dots, the joints have no spheres, and auto-reach skips the grip and twist, which don't move the fingertips.</p></section>`,
  quickHelp: () => 'Click the screen. Hold Q/A, W/S, E/D, R/F, T/G, Y/H to move the six joints and touch the target cross. Use the arrow keys and Z/X for the camera, Space for auto-reach, and N for a new target.',
  onScreenKeys: () => [
    {label: 'Arm (hold)', keys: [['q', 'Base ←'], ['a', 'Base →'], ['w', 'Arm up'], ['s', 'Arm down'], ['e', 'Elbow'], ['d', 'Elbow'], ['r', 'Wrist up'], ['f', 'Wrist down'], ['t', 'Twist'], ['g', 'Twist'], ['y', 'Grip'], ['h', 'Release']]},
    {label: 'Camera (hold)', keys: [['ArrowLeft', 'Orbit'], ['ArrowRight', 'Orbit'], ['ArrowUp', 'Tilt'], ['ArrowDown', 'Tilt'], ['z', 'Zoom in'], ['x', 'Zoom out']]},
    {label: 'Commands', keys: [[' ', 'Auto-reach'], ['n', 'Next target'], ['p', 'Previous'], ['0', 'Reset pose']]},
  ],
  decoratePlayer: (instance, context) => {
    instance.setFastWhileHeld(true);
    instance.setSpeed(100);
    const label = document.createElement('label'); label.textContent = 'Speed ';
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Emulator speed');
    for (const [value, text] of [[100, 'Max'], [20, 'Fast (20×)'], [1, 'Original (1×)']]) {
      const option = document.createElement('option'); option.value = String(value); option.textContent = text; select.append(option);
    }
    select.value = String(instance.speed); select.onchange = () => instance.setSpeed(Number(select.value));
    label.append(select); context.dock.append(label);
  },
};
