import { PHOSPHOR } from '../config/phosphor';
import { createStepper } from './text';
import type { SaverFactory } from './types';

// Headings: 0 right, 1 down, 2 left, 3 up
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
const PIPES = 3;
const STEPS_PER_SECOND = 30;

interface Pipe {
  col: number;
  row: number;
  heading: number;
  tone: number;
}

/** Pipes growing across the screen as thick lines joined cell to cell, until it is full and starts over. */
const pipes: SaverFactory = (grid) => {
  const { cols, rows } = grid;
  const step = createStepper(STEPS_PER_SECOND);
  // Per cell: the headings it connects to, as a bit mask, and the tone of the pipe that made it
  let arms = new Uint8Array(cols * rows);
  let tones = new Float32Array(cols * rows);
  let walkers: Pipe[] = [];
  let placed = 0;

  const spawn = (tone: number): Pipe => ({
    col: Math.floor(Math.random() * cols),
    row: Math.floor(Math.random() * rows),
    heading: Math.floor(Math.random() * 4),
    tone,
  });
  const reset = () => {
    arms = new Uint8Array(cols * rows);
    tones = new Float32Array(cols * rows);
    walkers = Array.from({ length: PIPES }, (_, i) => spawn(1 - i * 0.22));
    placed = 0;
  };
  reset();

  return {
    draw(ctx, time) {
      for (let n = step(time); n > 0; n--) {
        walkers.forEach((pipe, i) => {
          const turn = Math.random() < 0.2;
          const next = turn ? (pipe.heading + (Math.random() < 0.5 ? 1 : 3)) % 4 : pipe.heading;
          const index = pipe.row * cols + pipe.col;
          // Enters from the side opposite its heading, leaves toward the next one
          arms[index] |= (1 << ((pipe.heading + 2) % 4)) | (1 << next);
          tones[index] = pipe.tone;
          placed++;
          pipe.col += DX[next];
          pipe.row += DY[next];
          pipe.heading = next;
          if (pipe.col < 0 || pipe.col >= cols || pipe.row < 0 || pipe.row >= rows) walkers[i] = spawn(pipe.tone);
        });
        if (placed > cols * rows * 1.5) reset();
      }

      ctx.strokeStyle = PHOSPHOR.foreground;
      ctx.lineWidth = Math.max(2, grid.cellWidth * 0.45);
      ctx.lineCap = 'butt';
      for (let index = 0; index < arms.length; index++) {
        if (!arms[index]) continue;
        const cx = ((index % cols) + 0.5) * grid.cellWidth;
        const cy = (Math.floor(index / cols) + 0.5) * grid.cellHeight;
        ctx.globalAlpha = tones[index];
        ctx.beginPath();
        for (let heading = 0; heading < 4; heading++) {
          if (!(arms[index] & (1 << heading))) continue;
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + DX[heading] * grid.cellWidth * 0.5, cy + DY[heading] * grid.cellHeight * 0.5);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
};

export default pipes;
