// Banner logo: figlet "Calvin S" redrawn four cells wide in double box-drawing lines, as on the mock.
// It is printed as text (it scrolls, copies and wraps like any output); the texture draws these rows
// itself, because xterm's double lines are 1px strokes a pixel apart.
export const LOGO = [
  '╔══╗╔══╗╔═╗╔╔══╗╦══╗',
  '║ ═╦║═╣ ║ ║║╠══╣╠═╦╝',
  '╚══╝╚══╝╝ ╚╝╩  ╩╩ ╚═',
] as const;

// Geometry measured on the mock, in text cells (x) and rows (y). The logo is set a little narrower and
// tighter than the text grid and drops half a row into the blank line under it; each stroke is two
// lines 0.14 cells thick whose centres are 0.35 cells apart.
export const LOGO_GEOMETRY = {
  cellWidth: 0.889,
  rowHeight: 0.937,
  drop: 0.5,
  halfGap: 0.175,
  stroke: 0.143,
} as const;
