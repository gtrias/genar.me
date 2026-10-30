import { Terminal } from '@xterm/xterm';
import * as THREE from 'three';
import { PHOSPHOR } from '../config/phosphor';
import { LOGO } from '../config/logo';
import type { SaverName } from '../config/screensavers';
import { createSaver } from '../screensavers';
import type { SaverGrid, SaverInstance } from '../screensavers/types';
import { strokeLogos, type LogoPlacement } from './logoStroke';

const BLINK_MS = 530;

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
 * Redraws every banner logo in the viewport (also one partly scrolled off the top).
 */
function drawLogos(ctx: CanvasRenderingContext2D, terminal: Terminal, cellWidth: number, cellHeight: number): void {
  const buffer = terminal.buffer.active;
  const text = (row: number) => buffer.getLine(buffer.viewportY + row)?.translateToString(true) ?? '';
  const placements: LogoPlacement[] = [];
  for (let top = 1 - LOGO.length; top < terminal.rows; top++) {
    if (buffer.viewportY + top < 0) continue;
    const col = text(top).indexOf(LOGO[0]);
    if (col < 0 || LOGO.some((line, i) => text(top + i).indexOf(line) !== col)) continue;
    placements.push({ col, top });
  }
  strokeLogos(ctx, placements, cellWidth, cellHeight);
}

/**
 * Draws a screensaver instead of the terminal into the texture's canvas and flags it for upload.
 * The terminal underneath is untouched; the instance lives in the texture and is rebuilt when the
 * grid changes (a resize recreates the texture, so it starts over then too).
 */
export function renderScreensaver(texture: THREE.CanvasTexture, name: SaverName, time: number): void {
  const target = texture.image as HTMLCanvasElement;
  const data = texture.userData as {
    layers: HTMLCanvasElement[];
    terminal: Terminal;
    saver?: { key: string; instance: SaverInstance };
  };
  const [text] = data.layers;
  if (target.width !== text.width || target.height !== text.height) {
    target.width = text.width;
    target.height = text.height;
  }
  const ctx = target.getContext('2d');
  if (!ctx) return;
  const { cols, rows } = data.terminal;
  const grid: SaverGrid = {
    width: target.width,
    height: target.height,
    cols,
    rows,
    cellWidth: target.width / cols,
    cellHeight: target.height / rows,
  };
  const key = `${name}:${grid.width}x${grid.height}:${cols}x${rows}`;
  if (data.saver?.key !== key) data.saver = { key, instance: createSaver(name, grid) };

  ctx.fillStyle = PHOSPHOR.background;
  ctx.fillRect(0, 0, target.width, target.height);
  data.saver.instance.draw(ctx, time);
  texture.needsUpdate = true;
}

/**
 * Redraws the layers, the logo and the cursor into the texture's canvas and flags it for upload.
 */
export function updateTerminalTexture(texture: THREE.CanvasTexture): void {
  const target = texture.image as HTMLCanvasElement;
  const { layers, terminal } = texture.userData as { layers: HTMLCanvasElement[]; terminal: Terminal };
  delete texture.userData.saver;
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
