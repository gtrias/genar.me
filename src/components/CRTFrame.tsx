import { createSignal, onCleanup, onMount, Show } from 'solid-js';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Sides {
  t: number;
  r: number;
  b: number;
  l: number;
}

interface Geometry {
  width: number;
  height: number;
  lip: string; // raised cream lip, outer edge
  slope: string; // slope down into the tube, outer edge
  gasket: string; // black rubber gasket, outer edge
  glass: string; // visible glass
}

// Band widths measured on the approved mock (retrofuturism-1), whose monitor is 1162x1000 px.
// Thicker at the top than the bottom because the mock is seen slightly from above.
const REF = { w: 1162, h: 1000 };
const GASKET: Sides = { t: 29, r: 29, b: 18, l: 29 };
const SLOPE: Sides = { t: 33, r: 20, b: 21, l: 23 };
const LIP: Sides = { t: 17, r: 18, b: 15, l: 19 };

const scale = (s: Sides, k: number): Sides => ({ t: s.t * k, r: s.r * k, b: s.b * k, l: s.l * k });
const sum = (a: Sides, b: Sides): Sides => ({ t: a.t + b.t, r: a.r + b.r, b: a.b + b.b, l: a.l + b.l });
const grow = (box: Box, s: Sides): Box => ({ x: box.x - s.l, y: box.y - s.t, w: box.w + s.l + s.r, h: box.h + s.t + s.b });

/**
 * Rounded rectangle whose edges bow outward by `bx` (sides) and `by` (top/bottom), like the face of a
 * CRT tube. With zero bow it is a plain rounded rectangle. The bow peaks touch the box edges.
 */
function tubePath({ x, y, w, h }: Box, r: number, bx: number, by: number): string {
  const k = 0.5523; // cubic approximation of a quarter circle
  const left = x + bx;
  const top = y + by;
  const right = x + w - bx;
  const bottom = y + h - by;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return [
    `M ${left + r} ${top}`,
    `Q ${cx} ${y - by} ${right - r} ${top}`,
    `C ${right - r + r * k} ${top} ${right} ${top + r - r * k} ${right} ${top + r}`,
    `Q ${x + w + bx} ${cy} ${right} ${bottom - r}`,
    `C ${right} ${bottom - r + r * k} ${right - r + r * k} ${bottom} ${right - r} ${bottom}`,
    `Q ${cx} ${y + h + by} ${left + r} ${bottom}`,
    `C ${left + r - r * k} ${bottom} ${left} ${bottom - r + r * k} ${left} ${bottom - r}`,
    `Q ${x - bx} ${cy} ${left} ${top + r}`,
    `C ${left} ${top + r - r * k} ${left + r - r * k} ${top} ${left + r} ${top}`,
    'Z',
  ].join(' ');
}

function geometry(width: number, height: number, glass: Box): Geometry {
  const k = Math.min(width / REF.w, height / REF.h);
  const gasket = grow(glass, scale(GASKET, k));
  const slope = grow(glass, scale(sum(GASKET, SLOPE), k));
  const lip = grow(glass, scale(sum(sum(GASKET, SLOPE), LIP), k));
  // The glass has big corners (radius ~14% of its height) and barely bowed edges; the openings
  // around it get tighter corners as they step outwards.
  const r = Math.max(20, glass.h * 0.14);
  return {
    width,
    height,
    glass: tubePath(glass, r, glass.w * 0.005, glass.h * 0.0075),
    gasket: tubePath(gasket, r * 0.88, gasket.w * 0.008, gasket.h * 0.011),
    slope: tubePath(slope, r * 0.62, slope.w * 0.004, slope.h * 0.006),
    lip: tubePath(lip, r * 0.55, 0, 0),
  };
}

interface CRTFrameProps {
  /** Housing the frame is drawn over; must be the screen's offsetParent. */
  bezel: () => HTMLElement | undefined;
  /** Box the glass occupies. */
  screen: () => HTMLElement | undefined;
}

// Moulded bezel around the tube: cream lip, slope lit from above, rubber gasket and a shaded glass
// edge. Drawn as SVG over the screen with the glass left as a hole, so the terminal shows through.
const CRTFrame = (props: CRTFrameProps) => {
  const [geo, setGeo] = createSignal<Geometry>();

  onMount(() => {
    const bezel = props.bezel();
    const screen = props.screen();
    if (!bezel || !screen) return;
    const measure = () =>
      setGeo(
        geometry(bezel.clientWidth, bezel.clientHeight, {
          x: screen.offsetLeft,
          y: screen.offsetTop,
          w: screen.offsetWidth,
          h: screen.offsetHeight,
        }),
      );
    const observer = new ResizeObserver(measure);
    observer.observe(bezel);
    measure();
    onCleanup(() => observer.disconnect());
  });

  return (
    <Show when={geo()}>
      {(g) => (
        <svg class="crt-frame" width={g().width} height={g().height} aria-hidden="true">
          <defs>
            <pattern id="crt-grime" patternUnits="userSpaceOnUse" width="320" height="320">
              <image href="/textures/grime.svg" width="320" height="320" />
            </pattern>
            <linearGradient id="crt-lip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#f1ebdd" />
              <stop offset="0.5" stop-color="#ddd4c0" />
              <stop offset="1" stop-color="#cfc5ae" />
            </linearGradient>
            {/* The slope is the same pale plastic as the lip, lit from above: brighter along the
                bottom face that looks up, darkening into the recess toward the gasket (crt-ao) */}
            <linearGradient id="crt-slope" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#b3ab9b" />
              <stop offset="0.5" stop-color="#c2baab" />
              <stop offset="0.93" stop-color="#ddd6c8" />
              <stop offset="1" stop-color="#ece6d9" />
            </linearGradient>
            <linearGradient id="crt-ao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#1f1a12" stop-opacity="0.85" />
              <stop offset="0.5" stop-color="#1f1a12" stop-opacity="0.55" />
              <stop offset="1" stop-color="#1f1a12" stop-opacity="0.3" />
            </linearGradient>
            <linearGradient id="crt-slope-side" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#000" stop-opacity="0.1" />
              <stop offset="1" stop-color="#fff" stop-opacity="0.12" />
            </linearGradient>
            <linearGradient id="crt-rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#fff" stop-opacity="0.85" />
              <stop offset="0.5" stop-color="#fff" stop-opacity="0.2" />
              <stop offset="1" stop-color="#fff" stop-opacity="0.5" />
            </linearGradient>
            <linearGradient id="crt-glare" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#b8ffd0" stop-opacity="0.14" />
              <stop offset="0.1" stop-color="#b8ffd0" stop-opacity="0.04" />
              <stop offset="0.2" stop-color="#b8ffd0" stop-opacity="0" />
            </linearGradient>
            <filter id="crt-soft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="crt-drop" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#2a2014" flood-opacity="0.4" />
            </filter>
            <clipPath id="crt-glass-clip">
              <path d={g().glass} />
            </clipPath>
            <clipPath id="crt-slope-clip">
              <path d={`${g().slope} ${g().gasket}`} clip-rule="evenodd" />
            </clipPath>
          </defs>

          {/* Raised lip with a groove where it meets the housing */}
          <path d={`${g().lip} ${g().glass}`} fill-rule="evenodd" fill="url(#crt-lip)" filter="url(#crt-drop)" />
          <path d={`${g().lip} ${g().glass}`} fill-rule="evenodd" fill="url(#crt-grime)" />
          <path d={g().lip} fill="none" stroke="#3a2e1f" stroke-opacity="0.45" stroke-width="2.5" />
          <path d={g().lip} fill="none" stroke="url(#crt-rim)" stroke-width="1.5" transform="translate(0 1.5)" />

          {/* Slope down to the tube */}
          <path d={`${g().slope} ${g().glass}`} fill-rule="evenodd" fill="url(#crt-slope)" />
          <path d={`${g().slope} ${g().glass}`} fill-rule="evenodd" fill="url(#crt-slope-side)" />
          <path d={`${g().slope} ${g().glass}`} fill-rule="evenodd" fill="url(#crt-grime)" opacity="0.35" />
          <g clip-path="url(#crt-slope-clip)">
            <path d={g().gasket} fill="none" stroke="url(#crt-ao)" stroke-width="34" filter="url(#crt-soft)" />
          </g>
          <path d={g().slope} fill="none" stroke="url(#crt-rim)" stroke-width="2" />

          {/* Rubber gasket */}
          <path d={`${g().gasket} ${g().glass}`} fill-rule="evenodd" fill="#1b1c19" />
          <path d={g().gasket} fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="1.5" />

          {/* Glass: edges sink into shadow, a glare band along the top */}
          <g clip-path="url(#crt-glass-clip)">
            <path d={g().glass} fill="none" stroke="#000" stroke-opacity="0.75" stroke-width="30" filter="url(#crt-soft)" />
            <path d={g().glass} fill="url(#crt-glare)" />
          </g>
          <path d={g().glass} fill="none" stroke="#000" stroke-width="2.5" />
        </svg>
      )}
    </Show>
  );
};

export default CRTFrame;
