import { PHOSPHOR } from '../config/phosphor';
import type { SaverFactory } from './types';

const DIVISIONS_X = 10;
const DIVISIONS_Y = 8;
// Points kept in the beam's afterglow, and the time between them in seconds
const TRAIL = 520;
const TRAIL_STEP = 0.006;
// The trail is stroked in this many brightness steps, dimmest first
const TRAIL_BANDS = 12;

/** Oscilloscope trace: a Lissajous figure that slowly drifts, with a fading afterglow on a graticule. */
const scope: SaverFactory = (grid) => {
  const centreX = grid.width / 2;
  const centreY = grid.height / 2;
  const radiusX = grid.width * 0.4;
  const radiusY = grid.height * 0.4;
  const beam = Math.max(1.5, grid.cellWidth * 0.18);
  const startTime = { value: 0 };

  const point = (t: number): [number, number] => {
    const ratio = 2 + 0.25 * Math.sin(t * 0.07);
    return [
      centreX + radiusX * Math.sin(3 * t + t * 0.5),
      centreY + radiusY * Math.sin(ratio * t),
    ];
  };

  const graticule = (ctx: CanvasRenderingContext2D) => {
    const left = centreX - grid.width * 0.45;
    const top = centreY - grid.height * 0.45;
    const width = grid.width * 0.9;
    const height = grid.height * 0.9;
    ctx.strokeStyle = PHOSPHOR.dim;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = Math.max(1, beam * 0.4);
    ctx.beginPath();
    for (let i = 0; i <= DIVISIONS_X; i++) {
      const x = left + (width * i) / DIVISIONS_X;
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
    }
    for (let i = 0; i <= DIVISIONS_Y; i++) {
      const y = top + (height * i) / DIVISIONS_Y;
      ctx.moveTo(left, y);
      ctx.lineTo(left + width, y);
    }
    ctx.stroke();
    // Fine ticks along the centre axes
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    const tick = grid.cellHeight * 0.18;
    for (let i = 0; i <= DIVISIONS_X * 5; i++) {
      const x = left + (width * i) / (DIVISIONS_X * 5);
      ctx.moveTo(x, centreY - tick);
      ctx.lineTo(x, centreY + tick);
    }
    for (let i = 0; i <= DIVISIONS_Y * 5; i++) {
      const y = top + (height * i) / (DIVISIONS_Y * 5);
      ctx.moveTo(centreX - tick, y);
      ctx.lineTo(centreX + tick, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  return {
    draw(ctx, time) {
      if (!startTime.value) startTime.value = time;
      const now = (time - startTime.value) / 1000;
      graticule(ctx);

      ctx.strokeStyle = PHOSPHOR.logo;
      ctx.lineWidth = beam;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const perBand = Math.ceil(TRAIL / TRAIL_BANDS);
      // Oldest band first, so the bright head ends up on top
      for (let band = TRAIL_BANDS - 1; band >= 0; band--) {
        ctx.globalAlpha = Math.pow(1 - band / TRAIL_BANDS, 2);
        ctx.beginPath();
        // One sample of overlap joins the bands
        for (let k = band * perBand; k <= (band + 1) * perBand; k++) {
          const [x, y] = point(now - k * TRAIL_STEP);
          if (k === band * perBand) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
};

export default scope;
