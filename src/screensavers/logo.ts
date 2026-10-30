import { LOGO, LOGO_GEOMETRY } from '../config/logo';
import { strokeLogos } from '../utils/logoStroke';
import type { SaverFactory } from './types';

// Cells per second, as a text console would step it
const COLS_PER_SECOND = 7;
const ROWS_PER_SECOND = 3;
// The logo spans its text columns stretched by the mock's wider letters, from a little left of them,
// and its three lines plus the half row it drops
const LOGO_COLS = Math.ceil(LOGO[0].length * LOGO_GEOMETRY.cellWidth + LOGO_GEOMETRY.indent);
const LOGO_ROWS = Math.ceil(LOGO.length * LOGO_GEOMETRY.rowHeight + LOGO_GEOMETRY.drop);
// First column that keeps the logo's left overhang on the screen
const MIN_COL = Math.ceil(-LOGO_GEOMETRY.indent);

/** The banner logo bouncing off the screen edges, one text cell per step. */
const logo: SaverFactory = (grid) => {
  const maxCol = Math.max(MIN_COL, grid.cols - LOGO_COLS);
  const maxTop = Math.max(0, grid.rows - LOGO_ROWS);
  let col = MIN_COL + Math.random() * (maxCol - MIN_COL);
  let top = Math.random() * maxTop;
  let dirCol = Math.random() < 0.5 ? -1 : 1;
  let dirTop = Math.random() < 0.5 ? -1 : 1;
  let last = 0;

  return {
    draw(ctx, time) {
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;

      col += dirCol * COLS_PER_SECOND * dt;
      top += dirTop * ROWS_PER_SECOND * dt;
      if (col <= MIN_COL || col >= maxCol) {
        col = Math.min(maxCol, Math.max(MIN_COL, col));
        dirCol = -dirCol;
      }
      if (top <= 0 || top >= maxTop) {
        top = Math.min(maxTop, Math.max(0, top));
        dirTop = -dirTop;
      }
      strokeLogos(ctx, [{ col: Math.round(col), top: Math.round(top) }], grid.cellWidth, grid.cellHeight);
    },
  };
};

export default logo;
