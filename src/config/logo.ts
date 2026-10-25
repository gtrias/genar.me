// Banner logo: "GENAR" drawn three columns per letter in double box-drawing lines, as on the mock.
// It is printed as text (it scrolls, copies and wraps like any output); the texture draws these rows
// itself, because xterm's double lines are 1px strokes a pixel apart.
export const LOGO = [
  '╔═╗╔═╗╔╗╔╔═╗╦═╗',
  '║ ╦║╣ ║║║╠═╣╠╦╝',
  '╚═╝╚═╝╝╚╝╩ ╩╩╚═',
] as const;

// Geometry measured on the mock, in text cells (x) and rows (y). The logo's columns are wider than the
// text grid, start a third of a cell left of it, and the rows are a little tighter; the logo drops half
// a row into the blank line under it. Each stroke is two lines 0.14 cells thick whose centres are 0.38
// cells apart.
export const LOGO_GEOMETRY = {
  cellWidth: 1.225,
  indent: -0.33,
  rowHeight: 0.973,
  drop: 0.407,
  lineSpacing: 0.38,
  stroke: 0.143,
} as const;
