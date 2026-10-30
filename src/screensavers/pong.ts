import { PHOSPHOR } from '../config/phosphor';
import { fillCell, setupText } from './text';
import type { SaverFactory } from './types';

const PADDLE = 5;
const PADDLE_SPEED = 16;
const BALL_SPEED = 30;
// The paddles aim this far off the ball's height at most: past half a paddle is a miss
const MAX_AIM_ERROR = 3.6;

/** Two computer paddles playing Pong; the aim error now and then makes one miss. */
const pong: SaverFactory = (grid) => {
  const { cols, rows } = grid;
  const left = 2;
  const right = cols - 3;
  const paddles = [rows / 2, rows / 2];
  const aim = [0, 0];
  const score = [0, 0];
  const ball = { x: cols / 2, y: rows / 2, vx: BALL_SPEED, vy: 10 };
  let last = 0;

  const serve = (direction: number) => {
    ball.x = cols / 2;
    ball.y = 2 + Math.random() * (rows - 4);
    ball.vx = BALL_SPEED * direction;
    ball.vy = (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 8);
    aim[0] = (Math.random() * 2 - 1) * MAX_AIM_ERROR;
    aim[1] = (Math.random() * 2 - 1) * MAX_AIM_ERROR;
  };
  serve(1);

  const move = (side: number, dt: number) => {
    const target = ball.y + aim[side] - paddles[side];
    const limit = PADDLE_SPEED * dt;
    paddles[side] = Math.min(rows - PADDLE / 2, Math.max(PADDLE / 2, paddles[side] + Math.max(-limit, Math.min(limit, target))));
  };

  return {
    draw(ctx, time) {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y < 0 || ball.y > rows - 1) {
        ball.y = Math.min(rows - 1, Math.max(0, ball.y));
        ball.vy = -ball.vy;
      }
      for (const side of [0, 1]) {
        const plane = side === 0 ? left : right;
        const approaching = side === 0 ? ball.vx < 0 : ball.vx > 0;
        const crossed = side === 0 ? ball.x <= plane + 1 : ball.x >= plane - 1;
        if (approaching && crossed && Math.abs(ball.y - paddles[side]) <= PADDLE / 2 + 0.5) {
          ball.vx = -ball.vx;
          ball.vy += (ball.y - paddles[side]) * 3;
          ball.x = side === 0 ? plane + 1 : plane - 1;
          aim[1 - side] = (Math.random() * 2 - 1) * MAX_AIM_ERROR;
        }
      }
      if (ball.x < -2) { score[1]++; serve(1); }
      else if (ball.x > cols + 1) { score[0]++; serve(-1); }
      move(0, dt);
      move(1, dt);

      ctx.fillStyle = PHOSPHOR.dim;
      for (let row = 0; row < rows; row += 2) fillCell(ctx, grid, Math.floor(cols / 2), row, 0.3);
      ctx.fillStyle = PHOSPHOR.foreground;
      [left, right].forEach((x, side) => {
        for (let k = 0; k < PADDLE; k++) fillCell(ctx, grid, x, Math.round(paddles[side] - PADDLE / 2 + k), 0.05);
      });
      fillCell(ctx, grid, Math.round(ball.x), Math.round(ball.y), 0.05);
      setupText(ctx, grid, 3);
      ctx.fillText(String(score[0]), grid.width * 0.4, grid.cellHeight * 2.2);
      ctx.fillText(String(score[1]), grid.width * 0.6, grid.cellHeight * 2.2);
    },
  };
};

export default pong;
