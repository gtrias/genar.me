import { PHOSPHOR } from '../config/phosphor';
import { createStepper, fillCell } from './text';
import type { SaverFactory } from './types';

const GENERATIONS_PER_SECOND = 10;
// Population unchanged this many generations in a row: the colony is dead or settled, so reseed
const SETTLED = 14;

/** Conway's Game of Life on the text grid, wrapping at the edges, reseeded when it settles. */
const life: SaverFactory = (grid) => {
  const { cols, rows } = grid;
  const step = createStepper(GENERATIONS_PER_SECOND);
  let cells = new Uint8Array(cols * rows);
  let born = new Uint8Array(cols * rows);
  let population = 0;
  let unchanged = 0;

  const seed = () => {
    cells = Uint8Array.from({ length: cols * rows }, () => (Math.random() < 0.28 ? 1 : 0));
    born = new Uint8Array(cols * rows);
    unchanged = 0;
  };
  seed();

  const advance = () => {
    const next = new Uint8Array(cols * rows);
    let count = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbours = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) neighbours += cells[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)];
          }
        }
        const index = y * cols + x;
        const alive = cells[index] ? neighbours === 2 || neighbours === 3 : neighbours === 3;
        next[index] = alive ? 1 : 0;
        born[index] = alive && !cells[index] ? 1 : 0;
        count += next[index];
      }
    }
    cells = next;
    unchanged = count === population ? unchanged + 1 : 0;
    population = count;
    if (unchanged >= SETTLED || count === 0) seed();
  };

  return {
    draw(ctx, time) {
      for (let n = step(time); n > 0; n--) advance();
      for (let i = 0; i < cells.length; i++) {
        if (!cells[i]) continue;
        ctx.fillStyle = born[i] ? PHOSPHOR.foreground : PHOSPHOR.logo;
        ctx.globalAlpha = born[i] ? 1 : 0.7;
        fillCell(ctx, grid, i % cols, Math.floor(i / cols), 0.12);
      }
      ctx.globalAlpha = 1;
    },
  };
};

export default life;
