import { Terminal } from '@xterm/xterm';
import * as THREE from 'three';
import { PHOSPHOR } from '../config/phosphor';

const BLINK_MS = 530;
const BOX_DRAWING = /[\u2500-\u257f]/;
// Offsets the box-drawing rows are redrawn at to thicken their strokes
const THICKEN: [number, number][] = [
  [1, 0],
  [0, 1],
  [1, 1],
];

/**
 * three.js texture showing the terminal. The canvas renderer (xterm-addon-canvas) draws text,
 * selection and links on separate stacked canvases, so they are composited into one canvas. Its own
 * cursor layer is left out: it only draws reliably while the hidden xterm DOM has focus, so the block
 * cursor is drawn here from the buffer's cursor position instead. xterm draws box-drawing characters
 * (the banner logo) as 1px lines; those rows are thickened here to the weight of the mock's logo.
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
 * Redraws the layers and the cursor into the texture's canvas and flags it for upload.
 */
export function updateTerminalTexture(texture: THREE.CanvasTexture): void {
  const target = texture.image as HTMLCanvasElement;
  const { layers, terminal } = texture.userData as { layers: HTMLCanvasElement[]; terminal: Terminal };
  const [base] = layers;
  if (target.width !== base.width || target.height !== base.height) {
    target.width = base.width;
    target.height = base.height;
  }
  const ctx = target.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, target.width, target.height);
  for (const layer of layers) ctx.drawImage(layer, 0, 0);

  const buffer = terminal.buffer.active;
  const cellWidth = base.width / terminal.cols;
  const cellHeight = base.height / terminal.rows;

  // Redraw rows holding box-drawing characters shifted by a device pixel, keeping the lighter pixel:
  // the strokes grow, the flat background stays as it is
  const px = Math.max(1, Math.round(window.devicePixelRatio));
  ctx.globalCompositeOperation = 'lighten';
  for (let row = 0; row < terminal.rows; row++) {
    const line = buffer.getLine(buffer.viewportY + row)?.translateToString(true);
    if (!line || !BOX_DRAWING.test(line)) continue;
    const y = Math.round(row * cellHeight);
    const h = Math.round(cellHeight);
    for (const [dx, dy] of THICKEN) ctx.drawImage(base, 0, y, base.width, h, dx * px, y + dy * px, base.width, h);
  }
  ctx.globalCompositeOperation = 'source-over';

  // Blinking block cursor, only while the view is scrolled to the live bottom where the cursor lives
  const blinkOn = Math.floor(performance.now() / BLINK_MS) % 2 === 0;
  if (blinkOn && buffer.viewportY === buffer.baseY && !terminal.options.disableStdin) {
    ctx.fillStyle = PHOSPHOR.cursor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(buffer.cursorX * cellWidth, buffer.cursorY * cellHeight, cellWidth, cellHeight);
    ctx.globalAlpha = 1;
  }
  texture.needsUpdate = true;
}
