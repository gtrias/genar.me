import { PHOSPHOR } from '../config/phosphor';
import { createStepper, fillCell } from './text';
import type { SaverFactory } from './types';

const STEPS_PER_SECOND = 90;
// How long the finished, solved maze stays up, in steps
const HOLD_STEPS = 270;

type Phase = 'carve' | 'solve' | 'hold';

/** A maze carved by depth-first search, then solved by breadth-first search, then carved again. */
const maze: SaverFactory = (grid) => {
  const odd = (n: number) => Math.max(5, n % 2 ? n : n - 1);
  const w = odd(grid.cols);
  const h = odd(grid.rows);
  const offsetCol = Math.floor((grid.cols - w) / 2);
  const offsetRow = Math.floor((grid.rows - h) / 2);
  const step = createStepper(STEPS_PER_SECOND);
  const at = (x: number, y: number) => y * w + x;

  let walls = new Uint8Array(w * h);
  let stack: [number, number][] = [];
  let path: number[] = [];
  let shown = 0;
  let held = 0;
  let phase: Phase = 'carve';

  const reset = () => {
    walls = new Uint8Array(w * h).fill(1);
    walls[at(1, 1)] = 0;
    stack = [[1, 1]];
    path = [];
    shown = 0;
    held = 0;
    phase = 'carve';
  };
  reset();

  const solve = () => {
    const from = new Int32Array(w * h).fill(-2);
    from[at(1, 1)] = -1;
    const queue = [at(1, 1)];
    const goal = at(w - 2, h - 2);
    for (let i = 0; i < queue.length && from[goal] === -2; i++) {
      const x = queue[i] % w;
      const y = Math.floor(queue[i] / w);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const next = at(x + dx, y + dy);
        if (walls[next] || from[next] !== -2) continue;
        from[next] = queue[i];
        queue.push(next);
      }
    }
    path = [];
    for (let cell = goal; cell >= 0; cell = from[cell]) path.unshift(cell);
  };

  const carve = () => {
    const top = stack[stack.length - 1];
    if (!top) return;
    const [x, y] = top;
    const options = [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      return nx > 0 && ny > 0 && nx < w - 1 && ny < h - 1 && walls[at(nx, ny)];
    });
    if (options.length === 0) {
      stack.pop();
      if (stack.length === 0) {
        solve();
        phase = 'solve';
      }
      return;
    }
    const [dx, dy] = options[Math.floor(Math.random() * options.length)];
    walls[at(x + dx / 2, y + dy / 2)] = 0;
    walls[at(x + dx, y + dy)] = 0;
    stack.push([x + dx, y + dy]);
  };

  return {
    draw(ctx, time) {
      for (let n = step(time); n > 0; n--) {
        if (phase === 'carve') carve();
        else if (phase === 'solve') {
          if (++shown >= path.length) phase = 'hold';
        } else if (++held > HOLD_STEPS) reset();
      }

      ctx.globalAlpha = 0.28;
      ctx.fillStyle = PHOSPHOR.dim;
      for (let i = 0; i < walls.length; i++) {
        if (walls[i]) fillCell(ctx, grid, offsetCol + (i % w), offsetRow + Math.floor(i / w));
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = PHOSPHOR.foreground;
      if (phase === 'carve') {
        const top = stack[stack.length - 1];
        if (top) fillCell(ctx, grid, offsetCol + top[0], offsetRow + top[1], 0.1);
      }
      for (let i = 0; i < shown && i < path.length; i++) {
        fillCell(ctx, grid, offsetCol + (path[i] % w), offsetRow + Math.floor(path[i] / w), 0.15);
      }
    },
  };
};

export default maze;
