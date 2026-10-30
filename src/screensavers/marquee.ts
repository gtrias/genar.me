import { setupText } from './text';
import type { SaverFactory } from './types';

const MESSAGE = '   GENAR.ME  *  1979 CONSOLE  *  PRESS ANY KEY TO WAKE   ';
// Letters are this many cells wide; the scroll runs this many cells per second
const LETTER_CELLS = 3;
const CELLS_PER_SECOND = 14;

/** A sine scroller: big letters crossing the screen on a wave. */
const marquee: SaverFactory = (grid) => {
  const advance = grid.cellWidth * LETTER_CELLS;
  const loop = MESSAGE.length * advance + grid.width;
  const amplitude = grid.height * 0.22;
  const startTime = { value: 0 };

  return {
    draw(ctx, time) {
      if (!startTime.value) startTime.value = time;
      // Starts a few seconds in, so the message is already crossing the glass
      const elapsed = (time - startTime.value) / 1000 + 4;
      const offset = grid.width - ((elapsed * CELLS_PER_SECOND * grid.cellWidth) % loop);

      setupText(ctx, grid, LETTER_CELLS);
      [...MESSAGE].forEach((char, i) => {
        const x = offset + i * advance;
        if (char === ' ' || x < -advance || x > grid.width + advance) return;
        ctx.fillText(char, x, grid.height / 2 + Math.sin(x / (grid.width * 0.12) + elapsed * 2) * amplitude);
      });
    },
  };
};

export default marquee;
