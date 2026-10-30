import { PHOSPHOR } from '../config/phosphor';
import { createStepper, fillCell, pick, putChar, setupText } from './text';
import type { SaverFactory } from './types';

const STEPS_PER_SECOND = 14;
const DIRECTIONS: readonly (readonly [number, number])[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** A snake that plays itself: heads for the food by the shortest path, restarts when it fills the board. */
const snake: SaverFactory = (grid) => {
  const { cols, rows } = grid;
  const step = createStepper(STEPS_PER_SECOND);
  let body: [number, number][] = [];
  let occupied = new Uint8Array(cols * rows);
  let food: [number, number] = [0, 0];

  const at = (x: number, y: number) => y * cols + x;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;

  const place = () => {
    const free: [number, number][] = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!occupied[at(x, y)]) free.push([x, y]);
    food = free.length ? pick(free) : [-1, -1];
  };
  const reset = () => {
    occupied = new Uint8Array(cols * rows);
    const head: [number, number] = [Math.floor(cols / 2), Math.floor(rows / 2)];
    body = [head];
    occupied[at(head[0], head[1])] = 1;
    place();
  };
  reset();

  // First move of a shortest path from the head to the food, avoiding the body
  const towardFood = (): [number, number] | undefined => {
    const [hx, hy] = body[0];
    const first = new Int8Array(cols * rows).fill(-1);
    const seen = new Uint8Array(cols * rows);
    seen[at(hx, hy)] = 1;
    const queue: [number, number][] = [[hx, hy]];
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      for (let d = 0; d < 4; d++) {
        const nx = x + DIRECTIONS[d][0];
        const ny = y + DIRECTIONS[d][1];
        if (!inside(nx, ny) || seen[at(nx, ny)] || occupied[at(nx, ny)]) continue;
        seen[at(nx, ny)] = 1;
        first[at(nx, ny)] = i === 0 ? d : first[at(x, y)];
        if (nx === food[0] && ny === food[1]) return [hx + DIRECTIONS[first[at(nx, ny)]][0], hy + DIRECTIONS[first[at(nx, ny)]][1]];
        queue.push([nx, ny]);
      }
    }
    return undefined;
  };

  const advance = () => {
    const [hx, hy] = body[0];
    let next = towardFood();
    if (!next) {
      const open = DIRECTIONS.map(([dx, dy]) => [hx + dx, hy + dy] as [number, number]).filter(
        ([x, y]) => inside(x, y) && !occupied[at(x, y)],
      );
      if (open.length === 0) return reset();
      next = pick(open);
    }
    body.unshift(next);
    occupied[at(next[0], next[1])] = 1;
    if (next[0] === food[0] && next[1] === food[1]) {
      if (body.length > cols * rows * 0.35) return reset();
      place();
    } else {
      const tail = body.pop()!;
      occupied[at(tail[0], tail[1])] = 0;
    }
  };

  return {
    draw(ctx, time) {
      for (let n = step(time); n > 0; n--) advance();
      ctx.fillStyle = PHOSPHOR.logo;
      ctx.globalAlpha = 0.75;
      for (let i = 1; i < body.length; i++) fillCell(ctx, grid, body[i][0], body[i][1], 0.1);
      ctx.globalAlpha = 1;
      ctx.fillStyle = PHOSPHOR.foreground;
      fillCell(ctx, grid, body[0][0], body[0][1], 0.05);
      setupText(ctx, grid);
      putChar(ctx, grid, food[0], food[1], '*');
    },
  };
};

export default snake;
