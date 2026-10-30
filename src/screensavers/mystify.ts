import { PHOSPHOR } from '../config/phosphor';
import type { SaverFactory } from './types';

const VERTICES = 4;
const POLYGONS = 2;
// Copies of each polygon kept behind the leading one, one every SAMPLE_MS
const TRAIL = 12;
const SAMPLE_MS = 70;

interface Vertex {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Polygons bouncing around the glass, leaving a trail of copies behind. */
const mystify: SaverFactory = (grid) => {
  const speed = grid.width * 0.22;
  const polygons = Array.from({ length: POLYGONS }, () =>
    Array.from({ length: VERTICES }, (): Vertex => {
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * grid.width,
        y: Math.random() * grid.height,
        vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.6),
        vy: Math.sin(angle) * speed * (0.6 + Math.random() * 0.6),
      };
    }),
  );
  const history: { x: number; y: number }[][][] = [];
  const beam = Math.max(1.5, grid.cellWidth * 0.14);
  let last = 0;
  let sampled = 0;

  return {
    draw(ctx, time) {
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;
      for (const polygon of polygons) {
        for (const v of polygon) {
          v.x += v.vx * dt;
          v.y += v.vy * dt;
          if (v.x < 0 || v.x > grid.width) { v.vx = -v.vx; v.x = Math.min(grid.width, Math.max(0, v.x)); }
          if (v.y < 0 || v.y > grid.height) { v.vy = -v.vy; v.y = Math.min(grid.height, Math.max(0, v.y)); }
        }
      }
      if (time - sampled >= SAMPLE_MS) {
        sampled = time;
        history.push(polygons.map((polygon) => polygon.map(({ x, y }) => ({ x, y }))));
        if (history.length > TRAIL) history.shift();
      }

      ctx.lineWidth = beam;
      ctx.lineJoin = 'round';
      history.forEach((snapshot, age) => {
        ctx.globalAlpha = Math.pow((age + 1) / history.length, 2);
        snapshot.forEach((points, index) => {
          ctx.strokeStyle = index === 0 ? PHOSPHOR.foreground : PHOSPHOR.logo;
          ctx.beginPath();
          points.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
          ctx.closePath();
          ctx.stroke();
        });
      });
      ctx.globalAlpha = 1;
    },
  };
};

export default mystify;
