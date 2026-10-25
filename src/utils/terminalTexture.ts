import { Terminal } from '@xterm/xterm';
import * as THREE from 'three';
import { PHOSPHOR } from '../config/phosphor';
import { LOGO, LOGO_GEOMETRY } from '../config/logo';

const BLINK_MS = 530;

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
 * three.js texture showing the terminal. The canvas renderer (xterm-addon-canvas) draws text,
 * selection and links on separate stacked canvases, so they are composited into one canvas. Its own
 * cursor layer is left out: it only draws reliably while the hidden xterm DOM has focus, so the block
 * cursor is drawn here from the buffer's cursor position instead. The banner logo is drawn here too.
 */
export function createTerminalTexture(terminal: Terminal): THREE.CanvasTexture {
  const element = terminal.element;
  if (!element) {
    throw new Error('Terminal element not found');
  }
  const layers = Array.from(
    element.querySelectorAll<HTMLCanvasElement>('.xterm-screen canvas:not(.xterm-cursor-layer)'),
  );
  if (layers.length === 0) {
    throw new Error('Terminal canvas not found - make sure xterm-addon-canvas is loaded');
  }

  const texture = new THREE.CanvasTexture(document.createElement('canvas'));
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.userData = { layers, terminal };
  updateTerminalTexture(texture);
  return texture;
}

/**
 * Adds one double-line box-drawing character to the current path: each arm is two lines running from
 * the cell edge to a small square around the centre (cx, cy), and the square's sides without an arm
 * close the outline, which gives the corners, tees and continuous outer lines of the mock's logo.
 */
function traceDoubleLine(
  ctx: CanvasRenderingContext2D,
  [up, right, down, left]: Arms,
  x: number,
  y: number,
  width: number,
  height: number,
  cx: number,
  cy: number,
  halfGap: number,
): void {
  const l = cx - halfGap;
  const r = cx + halfGap;
  const t = cy - halfGap;
  const b = cy + halfGap;
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

/**
 * Redraws every banner logo in the viewport (also one partly scrolled off the top): blanks the cells
 * xterm drew it in and strokes it with the mock's double lines and proportions.
 */
function drawLogos(ctx: CanvasRenderingContext2D, terminal: Terminal, cellWidth: number, cellHeight: number): void {
  const buffer = terminal.buffer.active;
  const text = (row: number) => buffer.getLine(buffer.viewportY + row)?.translateToString(true) ?? '';
  const { cellWidth: logoCell, rowHeight, drop, halfGap, stroke } = LOGO_GEOMETRY;
  const glyphWidth = cellWidth * logoCell;
  const glyphHeight = cellHeight * rowHeight;
  // Whole-pixel strokes on the pixel grid, so the thin lines stay crisp and at full brightness
  const lineWidth = Math.max(1, Math.round(stroke * cellWidth));
  const gap = Math.max(1, Math.round(halfGap * cellWidth));
  const offset = (lineWidth % 2) / 2;
  const snap = (v: number) => Math.round(v - offset) + offset;

  ctx.beginPath();
  for (let top = 1 - LOGO.length; top < terminal.rows; top++) {
    if (buffer.viewportY + top < 0) continue;
    const col = text(top).indexOf(LOGO[0]);
    if (col < 0 || LOGO.some((line, i) => text(top + i).indexOf(line) !== col)) continue;

    ctx.fillStyle = PHOSPHOR.background;
    LOGO.forEach((line, i) => {
      ctx.fillRect(col * cellWidth, (top + i) * cellHeight, line.length * cellWidth, cellHeight);
      [...line].forEach((char, j) => {
        const arms = DOUBLE_LINE_ARMS[char];
        if (!arms) return;
        const x = (col + j * logoCell) * cellWidth;
        const y = (top + drop) * cellHeight + i * glyphHeight;
        const cx = snap(x + glyphWidth / 2);
        const cy = snap(y + glyphHeight / 2);
        traceDoubleLine(ctx, arms, x, y, glyphWidth, glyphHeight, cx, cy, gap);
      });
    });
  }
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'square';
  ctx.strokeStyle = PHOSPHOR.logo;
  ctx.stroke();
}

/**
 * Redraws the layers, the logo and the cursor into the texture's canvas and flags it for upload.
 */
export function updateTerminalTexture(texture: THREE.CanvasTexture): void {
  const target = texture.image as HTMLCanvasElement;
  const { layers, terminal } = texture.userData as { layers: HTMLCanvasElement[]; terminal: Terminal };
  const [text, ...overlays] = layers;
  if (target.width !== text.width || target.height !== text.height) {
    target.width = text.width;
    target.height = text.height;
  }
  const ctx = target.getContext('2d');
  if (!ctx) return;
  const cellWidth = text.width / terminal.cols;
  const cellHeight = text.height / terminal.rows;

  ctx.clearRect(0, 0, target.width, target.height);
  ctx.drawImage(text, 0, 0);
  // Under the selection and link layers, so selecting the logo still shows
  drawLogos(ctx, terminal, cellWidth, cellHeight);
  for (const layer of overlays) ctx.drawImage(layer, 0, 0);

  // Blinking block cursor, only while the view is scrolled to the live bottom where the cursor lives
  const buffer = terminal.buffer.active;
  const blinkOn = Math.floor(performance.now() / BLINK_MS) % 2 === 0;
  if (blinkOn && buffer.viewportY === buffer.baseY && !terminal.options.disableStdin) {
    ctx.fillStyle = PHOSPHOR.cursor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(buffer.cursorX * cellWidth, buffer.cursorY * cellHeight, cellWidth, cellHeight);
    ctx.globalAlpha = 1;
  }
  texture.needsUpdate = true;
}
