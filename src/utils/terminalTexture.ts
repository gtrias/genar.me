import { Terminal } from '@xterm/xterm';
import * as THREE from 'three';
import { PHOSPHOR } from '../config/phosphor';

const BLINK_MS = 530;

/**
 * three.js texture showing the terminal. The canvas renderer (xterm-addon-canvas) draws text,
 * selection and links on separate stacked canvases, so they are composited into one canvas. Its own
 * cursor layer is left out: it only draws reliably while the hidden xterm DOM has focus, so the block
 * cursor is drawn here from the buffer's cursor position instead.
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

  // Blinking block cursor, only while the view is scrolled to the live bottom where the cursor lives
  const buffer = terminal.buffer.active;
  const blinkOn = Math.floor(performance.now() / BLINK_MS) % 2 === 0;
  if (blinkOn && buffer.viewportY === buffer.baseY && !terminal.options.disableStdin) {
    const cellWidth = base.width / terminal.cols;
    const cellHeight = base.height / terminal.rows;
    ctx.fillStyle = PHOSPHOR.cursor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(buffer.cursorX * cellWidth, buffer.cursorY * cellHeight, cellWidth, cellHeight);
    ctx.globalAlpha = 1;
  }
  texture.needsUpdate = true;
}
