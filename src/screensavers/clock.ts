import { PHOSPHOR } from '../config/phosphor';
import { createStepper, fillCell } from './text';
import type { SaverFactory } from './types';

// 5x7 dot-matrix digits; the colon is one dot wide
const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ':': ['0', '0', '1', '0', '1', '0', '0'],
};
const HEIGHT = 7;
const MOVES_PER_SECOND = 4;

const widthOf = (text: string) => [...text].reduce((sum, char) => sum + GLYPHS[char][0].length, 0) + text.length - 1;
const formatTime = (withSeconds: boolean) => {
  const now = new Date();
  const part = (n: number) => String(n).padStart(2, '0');
  return `${part(now.getHours())}:${part(now.getMinutes())}${withSeconds ? `:${part(now.getSeconds())}` : ''}`;
};

/** A dot-matrix clock drifting around the screen, one text cell at a time. */
const clock: SaverFactory = (grid) => {
  // Seconds only where they fit
  const withSeconds = widthOf(formatTime(true)) + 2 <= grid.cols;
  const width = widthOf(formatTime(withSeconds));
  const maxCol = Math.max(0, grid.cols - width);
  const maxRow = Math.max(0, grid.rows - HEIGHT);
  const step = createStepper(MOVES_PER_SECOND);
  let col = Math.floor(Math.random() * (maxCol + 1));
  let row = Math.floor(Math.random() * (maxRow + 1));
  let dirCol = Math.random() < 0.5 ? -1 : 1;
  let dirRow = Math.random() < 0.5 ? -1 : 1;

  return {
    draw(ctx, time) {
      for (let n = step(time); n > 0; n--) {
        if (col + dirCol < 0 || col + dirCol > maxCol) dirCol = -dirCol;
        if (row + dirRow < 0 || row + dirRow > maxRow) dirRow = -dirRow;
        col += dirCol;
        row += dirRow;
      }

      ctx.fillStyle = PHOSPHOR.foreground;
      let x = col;
      for (const char of formatTime(withSeconds)) {
        const glyph = GLYPHS[char];
        glyph.forEach((line, y) => {
          [...line].forEach((dot, dx) => {
            if (dot === '1') fillCell(ctx, grid, x + dx, row + y, 0.08);
          });
        });
        x += glyph[0].length + 1;
      }
    },
  };
};

export default clock;
