import { PHOSPHOR } from '../config/phosphor';
import { pick, putChar, setupText } from './text';
import type { SaverFactory } from './types';

// Glyphs JetBrains Mono has itself: a katakana fallback font is not on every machine
const CHARS = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>=+-*:;|/\\'];

interface Drop {
  head: number;
  speed: number;
  length: number;
}

/** Falling character rain: a bright head and a fading trail in every column. */
const matrix: SaverFactory = (grid) => {
  const { cols, rows } = grid;
  const glyphs = Array.from({ length: cols * rows }, () => pick(CHARS));
  const spawn = (scatter: boolean): Drop => {
    const length = 6 + Math.floor(Math.random() * rows * 0.6);
    return {
      head: scatter ? Math.random() * (rows + length) : -Math.random() * rows,
      speed: 8 + Math.random() * 14,
      length,
    };
  };
  const drops = Array.from({ length: cols }, () => spawn(true));
  let last = 0;

  return {
    draw(ctx, time) {
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;
      setupText(ctx, grid);

      drops.forEach((drop, col) => {
        drop.head += drop.speed * dt;
        if (drop.head - drop.length > rows) drops[col] = spawn(false);
        for (let k = 0; k < drop.length; k++) {
          const row = Math.floor(drop.head) - k;
          if (row < 0 || row >= rows) continue;
          const index = col * rows + row;
          if (Math.random() < 0.02) glyphs[index] = pick(CHARS);
          ctx.fillStyle = k === 0 ? PHOSPHOR.foreground : PHOSPHOR.logo;
          ctx.globalAlpha = k === 0 ? 1 : (1 - k / drop.length) * 0.8;
          putChar(ctx, grid, col, row, glyphs[index]);
        }
      });
      ctx.globalAlpha = 1;
    },
  };
};

export default matrix;
