import { PHOSPHOR } from '../config/phosphor';
import { LOGO, LOGO_GEOMETRY } from '../config/logo';

type Arms = readonly [up: boolean, right: boolean, down: boolean, left: boolean];

// Arms of the double-line box-drawing characters the logo is made of
const DOUBLE_LINE_ARMS: Record<string, Arms> = {
  '═': [false, true, false, true],
  '║': [true, false, true, false],
  '╔': [false, true, true, false],
  '╗': [false, false, true, true],
  '╚': [true, true, false, false],
  '╝': [true, false, false, true],
  '╠': [true, true, true, false],
  '╣': [true, false, true, true],
  '╦': [false, true, true, true],
  '╩': [true, true, false, true],
  '╬': [true, true, true, true],
};

/**
 * Adds one double-line box-drawing character to the current path: each arm is two lines running from
 * the cell edge to a small square (left/top corner l, t; side `spacing`), and the square's sides
 * without an arm close the outline, which gives the corners, tees and continuous outer lines of the
 * mock's logo.
 */
function traceDoubleLine(
  ctx: CanvasRenderingContext2D,
  [up, right, down, left]: Arms,
  x: number,
  y: number,
  width: number,
  height: number,
  l: number,
  t: number,
  spacing: number,
): void {
  const r = l + spacing;
  const b = t + spacing;
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  };
  if (up) { line(l, y, l, t); line(r, y, r, t); }
  else line(l, t, r, t);
  if (down) { line(l, y + height, l, b); line(r, y + height, r, b); }
  else line(l, b, r, b);
  if (left) { line(x, t, l, t); line(x, b, l, b); }
  else line(l, t, l, b);
  if (right) { line(x + width, t, r, t); line(x + width, b, r, b); }
  else line(r, t, r, b);
}

export interface LogoPlacement {
  /** Column of the logo's first text cell */
  col: number;
  /** Row of the logo's first line; negative while it is partly scrolled off the top */
  top: number;
}

/**
 * Blanks the cells of each banner logo and strokes it with the mock's double lines and proportions.
 */
export function strokeLogos(
  ctx: CanvasRenderingContext2D,
  placements: LogoPlacement[],
  cellWidth: number,
  cellHeight: number,
): void {
  const { cellWidth: logoCell, indent, rowHeight, drop, lineSpacing, stroke } = LOGO_GEOMETRY;
  const glyphWidth = cellWidth * logoCell;
  const glyphHeight = cellHeight * rowHeight;
  // Whole-pixel strokes on the pixel grid, so the thin lines stay crisp and at full brightness
  const lineWidth = Math.max(1, Math.round(stroke * cellWidth));
  const spacing = Math.max(2, Math.round(lineSpacing * cellWidth));
  const offset = (lineWidth % 2) / 2;
  const snap = (v: number) => Math.round(v - offset) + offset;

  ctx.beginPath();
  for (const { col, top } of placements) {
    ctx.fillStyle = PHOSPHOR.background;
    LOGO.forEach((line, i) => {
      ctx.fillRect(col * cellWidth, (top + i) * cellHeight, line.length * cellWidth, cellHeight);
      [...line].forEach((char, j) => {
        const arms = DOUBLE_LINE_ARMS[char];
        if (!arms) return;
        const x = (col + indent + j * logoCell) * cellWidth;
        const y = (top + drop) * cellHeight + i * glyphHeight;
        const l = snap(x + (glyphWidth - spacing) / 2);
        const t = snap(y + (glyphHeight - spacing) / 2);
        traceDoubleLine(ctx, arms, x, y, glyphWidth, glyphHeight, l, t, spacing);
      });
    });
  }
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'square';
  ctx.strokeStyle = PHOSPHOR.logo;
  ctx.stroke();
}
