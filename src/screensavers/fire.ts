import { PHOSPHOR } from '../config/phosphor';
import { createStepper, putChar, setupText } from './text';
import type { SaverFactory } from './types';

const MAX_HEAT = 36;
const STEPS_PER_SECOND = 22;
// Glyphs from cold to hot
const RAMP = [' ', '.', ',', ':', ';', '+', '*', '#', '%', '@'];

/** The classic fire effect: heat rises from the bottom row, cooling at random, drawn as glyphs. */
const fire: SaverFactory = (grid) => {
  const { cols, rows } = grid;
  const step = createStepper(STEPS_PER_SECOND);
  const heat = new Uint8Array(cols * rows);
  heat.fill(MAX_HEAT, (rows - 1) * cols);

  const advance = () => {
    for (let y = 1; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const source = y * cols + x;
        const spread = Math.floor(Math.random() * 3);
        const column = Math.min(cols - 1, Math.max(0, x - spread + 1));
        heat[(y - 1) * cols + column] = Math.max(0, heat[source] - (spread & 1));
      }
    }
  };

  return {
    draw(ctx, time) {
      for (let n = step(time); n > 0; n--) advance();
      setupText(ctx, grid);
      ctx.fillStyle = PHOSPHOR.foreground;
      for (let i = 0; i < heat.length; i++) {
        if (!heat[i]) continue;
        const level = heat[i] / MAX_HEAT;
        ctx.globalAlpha = 0.3 + 0.7 * level;
        putChar(ctx, grid, i % cols, Math.floor(i / cols), RAMP[Math.ceil(level * (RAMP.length - 1))]);
      }
      ctx.globalAlpha = 1;
    },
  };
};

export default fire;
