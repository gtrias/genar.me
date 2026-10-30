import { PHOSPHOR } from '../config/phosphor';
import type { SaverFactory } from './types';

const STARS = 150;
// Depth units per second; a star is at depth 1 when it spawns and passes the glass at 0
const SPEED = 0.35;
// Glyphs from far to near
const GLYPHS = ['.', '.', ':', '+', '*', '#'];
// JetBrains Mono advance width, in em
const GLYPH_WIDTH = 0.6;

interface Star {
  x: number;
  y: number;
  z: number;
}

const spawn = (depth: number): Star => ({
  x: Math.random() * 2 - 1,
  y: Math.random() * 2 - 1,
  z: depth,
});

/** Text-grid flight through stars: each star is one glyph, snapped to a cell, growing as it nears. */
const starfield: SaverFactory = (grid) => {
  const stars = Array.from({ length: STARS }, () => spawn(Math.random()));
  let last = 0;

  return {
    draw(ctx, time) {
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;

      ctx.font = `300 ${grid.cellWidth / GLYPH_WIDTH}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = PHOSPHOR.foreground;
      const centreX = grid.width / 2;
      const centreY = grid.height / 2;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= SPEED * dt;
        // Same scale on both axes, so the field is round on the non-square screen
        const x = centreX + (star.x / star.z) * centreX;
        const y = centreY + (star.y / star.z) * centreX;
        if (star.z <= 0.03 || x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
          stars[i] = spawn(1);
          continue;
        }
        const near = 1 - star.z;
        const col = Math.floor(x / grid.cellWidth);
        const row = Math.floor(y / grid.cellHeight);
        ctx.globalAlpha = 0.35 + 0.65 * near;
        ctx.fillText(
          GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(near * GLYPHS.length))],
          (col + 0.5) * grid.cellWidth,
          (row + 0.5) * grid.cellHeight,
        );
      }
      ctx.globalAlpha = 1;
    },
  };
};

export default starfield;
