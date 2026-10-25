import { createSignal, For, onCleanup, onMount, Show } from 'solid-js';

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

type Side = keyof Sides;

interface Ring {
  outer: Box;
  inner: Box;
}

interface Geometry {
  width: number;
  height: number;
  k: number; // mock px -> css px
  groove: string; // dark channel around the lip, outer edge
  lip: string; // raised cream lip, outer edge
  lipCrest: [string, string]; // band just inside the lip's outer edge
  slopeCrest: string; // just outside the slope's outer edge (inner side of the lip)
  slope: string; // slope down into the tube, outer edge
  gasket: string; // black rubber gasket, outer edge
  glass: string; // visible glass
  grooveRing: Ring;
  lipRing: Ring;
  slopeRing: Ring;
  gasketRing: Ring;
}

// Band widths measured on the approved mock (retrofuturism-1), whose monitor is 1162x1000 px.
// Thicker at the top than the bottom because the mock is seen slightly from above.
const REF = { w: 1162, h: 1000 };
const GASKET: Sides = { t: 29, r: 25, b: 18, l: 18 };
const SLOPE: Sides = { t: 33, r: 20, b: 21, l: 23 };
const LIP: Sides = { t: 17, r: 18, b: 15, l: 19 };
const GROOVE = 5; // channel between the lip and the housing
const CREST = 3.5; // width of the highlight running along the lip

// The groove sits in the lip's shadow: barely there at the top, deep at the bottom and right
const GROOVE_FILL: Record<Side, string> = {
  t: 'rgba(50, 38, 22, 0.3)',
  r: 'rgba(35, 26, 14, 0.6)',
  b: 'rgba(30, 22, 12, 0.85)',
  l: 'rgba(50, 38, 22, 0.5)',
};

// The mock is lit from above and slightly to the left. Each face of the recess gets the colour
// sampled from the mock: the top slope faces down into shadow, the bottom one faces the light.
const SLOPE_FILL: Record<Side, string> = {
  t: '#3c372a',
  r: 'url(#crt-slope-r)',
  b: 'url(#crt-slope-b)',
  l: 'url(#crt-slope-l)',
};
const GASKET_FILL: Record<Side, string> = {
  t: '#121211',
  r: '#1b1b1a',
  b: 'url(#crt-gasket-b)',
  l: '#181817',
};
// The rounded lip catches the light on whichever side faces up and left: a crisp line along its
// outer edge at the top and left, along its inner edge at the bottom, a faint sheen on the right
const HIGHLIGHT = 'rgba(255, 251, 242, 0.8)';
const LIP_OUTER_HI: Record<Side, string> = { t: HIGHLIGHT, r: 'transparent', b: 'transparent', l: HIGHLIGHT };
const LIP_INNER_HI: Record<Side, string> = {
  t: 'transparent',
  r: 'rgba(255, 251, 242, 0.35)',
  b: 'rgba(255, 251, 242, 0.75)',
  l: 'transparent',
};

const scale = (s: Sides, k: number): Sides => ({ t: s.t * k, r: s.r * k, b: s.b * k, l: s.l * k });
const sum = (a: Sides, b: Sides): Sides => ({ t: a.t + b.t, r: a.r + b.r, b: a.b + b.b, l: a.l + b.l });
const grow = (box: Box, s: Sides): Box => ({ x: box.x - s.l, y: box.y - s.t, w: box.w + s.l + s.r, h: box.h + s.t + s.b });
const even = (n: number): Sides => ({ t: n, r: n, b: n, l: n });

/**
 * Splits a ring into its four faces along the mitre lines joining the corners of its outer and inner
 * boxes. Each face is stretched well past both edges so that blurring the set only softens the
 * mitres (the turn of the moulding around a corner), never the edges, which are clipped anyway.
 */
function faces({ outer, inner }: Ring): Record<Side, string> {
  const corners = (b: Box) => [
    [b.x, b.y],
    [b.x + b.w, b.y],
    [b.x + b.w, b.y + b.h],
    [b.x, b.y + b.h],
  ];
  const o = corners(outer);
  const i = corners(inner);
  const out = o.map(([x, y], n) => [x + (x - i[n][0]) * 3, y + (y - i[n][1]) * 3]);
  const inn = i.map(([x, y], n) => [x - (o[n][0] - x) * 3, y - (o[n][1] - y) * 3]);
  const face = (a: number, b: number) => [out[a], out[b], inn[b], inn[a]].map((p) => p.join(',')).join(' ');
  return { t: face(0, 1), r: face(1, 2), b: face(2, 3), l: face(3, 0) };
}

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
  const crest = CREST * k;
  const groove = GROOVE * k;
  const inset = 1.2 * k; // the crest starts just inside the lip's edge
  // The glass has big corners (radius ~14% of its height) and barely bowed edges; the openings
  // around it get tighter corners as they step outwards.
  const r = Math.max(20, glass.h * 0.14);
  return {
    width,
    height,
    k,
    glass: tubePath(glass, r, glass.w * 0.005, glass.h * 0.0075),
    gasket: tubePath(gasket, r * 0.88, gasket.w * 0.008, gasket.h * 0.011),
    slope: tubePath(slope, r * 0.62, slope.w * 0.004, slope.h * 0.006),
    slopeCrest: tubePath(grow(slope, even(crest)), r * 0.62 + crest, slope.w * 0.004, slope.h * 0.006),
    groove: tubePath(grow(lip, even(groove)), r * 0.55 + groove, 0, 0),
    lip: tubePath(lip, r * 0.55, 0, 0),
    lipCrest: [
      tubePath(grow(lip, even(-inset)), r * 0.55 - inset, 0, 0),
      tubePath(grow(lip, even(-inset - crest)), r * 0.55 - inset - crest, 0, 0),
    ],
    grooveRing: { outer: grow(lip, even(groove)), inner: lip },
    lipRing: { outer: lip, inner: slope },
    slopeRing: { outer: slope, inner: gasket },
    gasketRing: { outer: gasket, inner: glass },
  };
}

/**
 * The four faces of a ring, each in its own fill, blurred together and cut to the ring by a clip
 * path (hard edges) or a mask (soft edges).
 */
const Faces = (props: { ring: Ring; fill: Record<Side, string>; blur: string; clip?: string; mask?: string }) => {
  const f = () => faces(props.ring);
  const ref = (id?: string) => (id ? `url(#${id})` : undefined);
  return (
    <g clip-path={ref(props.clip)} mask={ref(props.mask)}>
      <g filter={`url(#${props.blur})`}>
        <For each={['t', 'r', 'b', 'l'] as Side[]}>{(side) => <polygon points={f()[side]} fill={props.fill[side]} />}</For>
      </g>
    </g>
  );
};

interface CRTFrameProps {
  /** Housing the frame is drawn over; must be the screen's offsetParent. */
  bezel: () => HTMLElement | undefined;
  /** Box the glass occupies. */
  screen: () => HTMLElement | undefined;
}

// Moulded bezel around the tube: cream lip, slope down into the recess, rubber gasket and a shaded
// glass edge. Drawn as SVG over the screen with the glass left as a hole, so the terminal shows through.
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
      {(g) => {
        const slope = () => g().slopeRing.outer;
        const gasket = () => g().slopeRing.inner;
        const glass = () => g().gasketRing.inner;
        const blur = (id: string, std: number) => (
          <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={g().width} height={g().height}>
            <feGaussianBlur stdDeviation={std * g().k} />
          </filter>
        );
        const vertical = (id: string, y1: number, y2: number, stops: [number, string][]) => (
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y1} x2="0" y2={y2}>
            <For each={stops}>{([offset, color]) => <stop offset={offset} stop-color={color} />}</For>
          </linearGradient>
        );
        const ring = (id: string, outer: string, inner: string) => (
          <clipPath id={id}>
            <path d={`${outer} ${inner}`} clip-rule="evenodd" />
          </clipPath>
        );
        return (
          // Filters blur in sRGB: in the default linearRGB, 8-bit precision tints the near-black gasket
          <svg class="crt-frame" width={g().width} height={g().height} color-interpolation-filters="sRGB" aria-hidden="true">
            <defs>
              <pattern id="crt-grime" patternUnits="userSpaceOnUse" width="640" height="640">
                <image href="/textures/grime.svg" width="640" height="640" />
              </pattern>
              {/* Side slopes darken toward the top, the bottom one brightens toward the lip */}
              {vertical('crt-slope-l', slope().y, slope().y + slope().h, [[0, '#6c6352'], [0.45, '#877f6c'], [1, '#837a67']])}
              {vertical('crt-slope-r', slope().y, slope().y + slope().h, [[0, '#998d77'], [0.45, '#aba08c'], [1, '#ada18b']])}
              {vertical('crt-slope-b', gasket().y + gasket().h, slope().y + slope().h, [[0, '#cfbfa6'], [1, '#dccfbd']])}
              {vertical('crt-gasket-b', glass().y + glass().h, gasket().y + gasket().h, [[0, '#1e1e1d'], [1, '#3b3b3b']])}
              {/* The black edge of the gasket fades out along the lit bottom */}
              <linearGradient id="crt-gasket-edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#000" stop-opacity="0.85" />
                <stop offset="0.9" stop-color="#000" stop-opacity="0.85" />
                <stop offset="1" stop-color="#000" stop-opacity="0" />
              </linearGradient>
              {/* Glare: a dark band under the bezel's shadow, then the reflection a little lower */}
              <linearGradient id="crt-glare" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.02" stop-color="#b8ffd0" stop-opacity="0" />
                <stop offset="0.04" stop-color="#b8ffd0" stop-opacity="0.12" />
                <stop offset="0.1" stop-color="#b8ffd0" stop-opacity="0.04" />
                <stop offset="0.2" stop-color="#b8ffd0" stop-opacity="0" />
              </linearGradient>
              {blur('crt-face-blur', 14)}
              {blur('crt-crest-blur', 10)}
              {blur('crt-gasket-blur', 4)}
              {blur('crt-edge-blur', 2.5)}
              <filter id="crt-soft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter id="crt-drop" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx={3 * g().k} dy={7 * g().k} stdDeviation={6 * g().k} flood-color="#2a2014" flood-opacity="0.6" />
              </filter>
              <clipPath id="crt-glass-clip">
                <path d={g().glass} />
              </clipPath>
              {ring('crt-groove-clip', g().groove, g().lip)}
              {ring('crt-lip-outer-clip', ...g().lipCrest)}
              {ring('crt-lip-inner-clip', g().slopeCrest, g().slope)}
              {ring('crt-gasket-clip', g().gasket, g().glass)}
              {/* The slope rounds over into the lip instead of meeting it at a hard line */}
              <mask id="crt-slope-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={g().width} height={g().height}>
                <path d={`${g().slope} ${g().gasket}`} fill-rule="evenodd" fill="#fff" filter="url(#crt-edge-blur)" />
              </mask>
            </defs>

            {/* Raised lip casting a shadow down and right onto the housing, in a groove */}
            <path d={`${g().lip} ${g().glass}`} fill-rule="evenodd" fill="#cdc1ad" filter="url(#crt-drop)" />
            <Faces ring={g().grooveRing} fill={GROOVE_FILL} blur="crt-crest-blur" clip="crt-groove-clip" />
            <path d={`${g().lip} ${g().slope}`} fill-rule="evenodd" fill="url(#crt-grime)" />
            <Faces ring={g().lipRing} fill={LIP_OUTER_HI} blur="crt-crest-blur" clip="crt-lip-outer-clip" />
            <Faces ring={g().lipRing} fill={LIP_INNER_HI} blur="crt-crest-blur" clip="crt-lip-inner-clip" />

            {/* Slope down into the recess */}
            <Faces ring={g().slopeRing} fill={SLOPE_FILL} blur="crt-face-blur" mask="crt-slope-mask" />
            <path d={`${g().slope} ${g().gasket}`} fill-rule="evenodd" fill="url(#crt-grime)" opacity="0.5" />

            {/* Rubber gasket, black along its edges */}
            <Faces ring={g().gasketRing} fill={GASKET_FILL} blur="crt-gasket-blur" clip="crt-gasket-clip" />
            <path d={g().gasket} fill="none" stroke="url(#crt-gasket-edge)" stroke-width={2 * g().k} />

            {/* Glass: the bezel's shadow falls on its upper edge, a glare band along the top */}
            <g clip-path="url(#crt-glass-clip)">
              <path
                d={g().glass}
                fill="none"
                stroke="#000"
                stroke-opacity="0.75"
                stroke-width="30"
                filter="url(#crt-soft)"
                transform={`translate(0 ${6 * g().k})`}
              />
              <path d={g().glass} fill="url(#crt-glare)" />
            </g>
            <path d={g().glass} fill="none" stroke="#000" stroke-width={3.5 * g().k} />
          </svg>
        );
      }}
    </Show>
  );
};

export default CRTFrame;
