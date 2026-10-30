import { PHOSPHOR } from '../config/phosphor';
import type { SaverGrid } from './types';

// JetBrains Mono advance width, in em
const GLYPH_WIDTH = 0.6;

/** Sets the terminal's font at a multiple of the cell, centred on the point given to fillText. */
export const setupText = (ctx: CanvasRenderingContext2D, grid: SaverGrid, scale = 1): void => {
  ctx.font = `300 ${(grid.cellWidth * scale) / GLYPH_WIDTH}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PHOSPHOR.foreground;
};

/** Draws one glyph in the middle of a text cell. */
export const putChar = (ctx: CanvasRenderingContext2D, grid: SaverGrid, col: number, row: number, char: string): void => {
  ctx.fillText(char, (col + 0.5) * grid.cellWidth, (row + 0.5) * grid.cellHeight);
};

/** Fills a text cell, `inset` cell-widths in from each edge. */
export const fillCell = (
  ctx: CanvasRenderingContext2D,
  grid: SaverGrid,
  col: number,
  row: number,
  inset = 0,
): void => {
  const dx = inset * grid.cellWidth;
  const dy = inset * grid.cellWidth;
  ctx.fillRect(col * grid.cellWidth + dx, row * grid.cellHeight + dy, grid.cellWidth - 2 * dx, grid.cellHeight - 2 * dy);
};

/** Counts whole steps of a fixed rate between calls, given performance.now() times. */
export const createStepper = (perSecond: number) => {
  let last = 0;
  let owed = 0;
  return (time: number): number => {
    if (last) owed += (Math.min(time - last, 250) / 1000) * perSecond;
    last = time;
    const steps = Math.floor(owed);
    owed -= steps;
    return steps;
  };
};

export const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
